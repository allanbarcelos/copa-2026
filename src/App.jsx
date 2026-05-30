import { useState, useMemo, useEffect } from 'react'
import { GROUP_KEYS, GROUP_DATES, KO_DATES } from './data.js'
import { useI18n, LanguageSelector } from './i18n.jsx'
import { useMatchData } from './useMatchData.js'
import { buildQualifiers, buildBestThirds } from './services/groupStats.js'
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
        <LanguageSelector />
        <LiveBadge status={status} lastSync={lastSync} lang={lang} />
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
        <p>{t.appSubtitle}</p>
      </header>

      {/* ── Fase de Grupos ── */}
      <section className="copa-section">
        <h2 className="sec-title"><span>🏟️ {t.groupStageTitle}</span></h2>
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
        <h2 className="sec-title"><span>🥉 {t.thirdsTitle}</span></h2>
        <BestThirds bestThirds={bestThirds} lang={lang} t={t} />
      </section>

      {/* ── Fase Eliminatória ── */}
      <section className="copa-section">
        <h2 className="sec-title"><span>🏆 {t.knockoutTitle}</span></h2>
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
        <span>© {new Date().getFullYear()} Barcelos.Dev</span>
      </footer>

    </div>
  )
}
