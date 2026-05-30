import { useState, useMemo, useEffect } from 'react'
import { FaTrophy, FaFutbol, FaMedal, FaMugHot } from 'react-icons/fa6'
import { GROUP_KEYS, GROUP_DATES, KO_DATES } from './data.js'
import { useI18n, LanguageSelector } from './i18n.jsx'
import { useMatchData } from './useMatchData.js'
import { useTheme } from './useTheme.js'
import ThemeToggle from './components/ThemeToggle.jsx'
import { buildQualifiers, buildBestThirds } from './services/groupStats.js'
import { LOCALE_MAP } from './services/dateFormat.js'
import { initKOScores, buildKOBracket } from './services/bracket.js'
import { BASE_SLOT, TOTAL_H } from './constants/bracket.js'
import Flag from './components/Flag.jsx'
import LiveBadge from './components/LiveBadge.jsx'
import GroupPanel from './components/group/GroupPanel.jsx'
import BestThirds from './components/bracket/BestThirds.jsx'
import BracketConnector from './components/bracket/BracketConnector.jsx'
import RoundColumn from './components/bracket/RoundColumn.jsx'
import './App.css'

export default function App() {
  const { lang, t } = useI18n()
  const { theme, toggleTheme, isAuto } = useTheme()

  // ── Estado dos placares ───────────────────────────────────────────────────
  const [groupScores, setGroupScores] = useState(() => {
    const s = {}
    GROUP_KEYS.forEach(g => { s[g] = Array(6).fill(null).map(() => [null, null]) })
    return s
  })

  const [koScores, setKoScores] = useState(() =>
    initKOScores({ r32: 16, r16: 8, qf: 4, sf: 2, final: 1 })
  )

  // ── Sincronização com API em tempo real ───────────────────────────────────
  const { apiScores, groupDates: apiGroupDates, groupStatuses, roundDates: apiRoundDates, predictions, status, lastSync } = useMatchData()

  useEffect(() => {
    if (!apiScores) return
    setGroupScores(prev => {
      const next = {}
      for (const g of GROUP_KEYS) {
        next[g] = prev[g].map((manual, i) => apiScores[g]?.[i] ?? manual)
      }
      return next
    })
  }, [apiScores])

  // Datas da API com fallback nos dados hardcoded
  const groupDates = useMemo(() => {
    if (!apiGroupDates) return GROUP_DATES
    const merged = {}
    for (const g of GROUP_KEYS) {
      merged[g] = GROUP_DATES[g].map((hardcoded, i) => apiGroupDates[g]?.[i] ?? hardcoded)
    }
    return merged
  }, [apiGroupDates])

  const roundDates = useMemo(() => ({
    r32:   apiRoundDates?.r32   ?? KO_DATES.r32,
    r16:   apiRoundDates?.r16   ?? KO_DATES.r16,
    qf:    apiRoundDates?.qf    ?? KO_DATES.qf,
    sf:    apiRoundDates?.sf    ?? KO_DATES.sf,
    final: apiRoundDates?.final ?? KO_DATES.final,
  }), [apiRoundDates])

  // ── Derivados ─────────────────────────────────────────────────────────────
  const qualifiers = useMemo(() => buildQualifiers(groupScores), [groupScores])
  const bestThirds = useMemo(() => buildBestThirds(qualifiers),  [qualifiers])
  const koBracket  = useMemo(
    () => buildKOBracket(qualifiers, bestThirds, koScores),
    [qualifiers, bestThirds, koScores]
  )

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleGroupScore(g, mi, ti, val) {
    setGroupScores(prev => ({
      ...prev,
      [g]: prev[g].map((s, i) => i === mi ? s.map((v, j) => j === ti ? val : v) : s),
    }))
  }

  function handleKoScore(round, mi, ti, val) {
    setKoScores(prev => ({
      ...prev,
      [round]: prev[round].map((s, i) => i === mi ? s.map((v, j) => j === ti ? val : v) : s),
    }))
  }

  const koRoundDefs = [
    { key: 'r32',   label: t.koRounds.r32,   count: 16, mult: 1  },
    { key: 'r16',   label: t.koRounds.r16,   count: 8,  mult: 2  },
    { key: 'qf',    label: t.koRounds.qf,    count: 4,  mult: 4  },
    { key: 'sf',    label: t.koRounds.sf,    count: 2,  mult: 8  },
    { key: 'final', label: t.koRounds.final, count: 1,  mult: 16 },
  ]

  const { champion } = koBracket

  return (
    <div className="copa-app">

      {/* ── Header ── */}
      <header className="copa-header">
        <div className="header-glow" />
        <div className="header-top-right">
          <LanguageSelector />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <LiveBadge status={status} lang={lang} />
        <h1>
          {(() => {
            const m = t.appTitle.match(/^(.*?)(\d{4})$/)
            return m ? (
              <>
                <span className="title-event">{m[1].trim()}</span>
                <span className="title-year">{m[2]}</span>
              </>
            ) : t.appTitle
          })()}
        </h1>
        <div className="title-hosts">
          <Flag code="us" className="host-flag" />
          <Flag code="ca" className="host-flag" />
          <Flag code="mx" className="host-flag" />
        </div>
        <div className="title-dates">
          {new Date('2026-06-11').toLocaleDateString(LOCALE_MAP[lang], { day: 'numeric', month: 'short' })}
          {' – '}
          {new Date('2026-07-19').toLocaleDateString(LOCALE_MAP[lang], { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
        <p>{t.appSubtitle}</p>
        <div className="header-links">
          <a className="header-link" href="https://github.com/allanbarcelos/copa-2026" target="_blank" rel="noreferrer">
            <svg className="header-link-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            copa-2026
          </a>
          <a className="header-link" href="https://github.com/allanbarcelos/copa-2026-api" target="_blank" rel="noreferrer">
            <svg className="header-link-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            copa-2026-api
          </a>
          <a className="header-link header-link-coffee" href="https://www.buymeacoffee.com/allanbarcelos" target="_blank" rel="noreferrer">
            <FaMugHot /> Buy me a coffee
          </a>
        </div>
      </header>

      {/* ── Fase de Grupos ── */}
      <section className="copa-section">
        <h2 className="sec-title"><span><FaFutbol /> {t.groupStageTitle}</span></h2>
        <div className="groups-grid">
          {GROUP_KEYS.map(g => (
            <GroupPanel
              key={g}
              g={g}
              scores={groupScores[g]}
              groupDates={groupDates[g]}
              groupStatuses={groupStatuses?.[g]}
              predictions={predictions?.[g]}
              onScore={handleGroupScore}
              lang={lang}
              t={t}
            />
          ))}
        </div>
      </section>

      {/* ── Melhores Terceiros ── */}
      <section className="copa-section">
        <h2 className="sec-title"><span><FaMedal /> {t.thirdsTitle}</span></h2>
        <BestThirds bestThirds={bestThirds} lang={lang} t={t} />
      </section>

      {/* ── Fase Eliminatória ── */}
      <section className="copa-section">
        <h2 className="sec-title"><span><FaTrophy /> {t.knockoutTitle}</span></h2>
        <div className="bracket-scroll">
          <div className="bracket" style={{ height: TOTAL_H + 32 }}>
            {koRoundDefs.map((rd, ri) => {
              const slotPx = BASE_SLOT * rd.mult
              const isLast = ri === koRoundDefs.length - 1
              return (
                <div key={rd.key} style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <RoundColumn
                    label={rd.label}
                    matches={koBracket[rd.key]}
                    slotPx={slotPx}
                    roundKey={rd.key}
                    roundDate={roundDates[rd.key]}
                    onScore={handleKoScore}
                    lang={lang}
                    t={t}
                  />
                  {!isLast && (
                    <div style={{ paddingTop: 28 }}>
                      <BracketConnector matchCount={rd.count} slotPx={slotPx} />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Troféu + Campeão */}
            <div className="trophy-col" style={{ paddingTop: 28, height: TOTAL_H }}>
              <img src="/trophy.png" className="trophy-icon" alt="trophy" />
              {champion && <Flag code={champion.code} className="champion-flag" />}
              <div className="champion-name">
                {champion ? champion.names[lang] : t.champion}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="copa-footer">
        <div className="footer-links">
          <a className="footer-link" href="https://github.com/allanbarcelos/copa-2026" target="_blank" rel="noreferrer">
            <svg className="footer-link-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            copa-2026
          </a>
          <a className="footer-link" href="https://github.com/allanbarcelos/copa-2026-api" target="_blank" rel="noreferrer">
            <svg className="footer-link-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            copa-2026-api
          </a>
          <a className="footer-link footer-link-coffee" href="https://www.buymeacoffee.com/allanbarcelos" target="_blank" rel="noreferrer">
            <FaMugHot /> Buy me a coffee
          </a>
        </div>
        <span>© {new Date().getFullYear()} Barcelos.Dev</span>
      </footer>

    </div>
  )
}
