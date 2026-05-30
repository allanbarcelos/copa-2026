import { useState, useMemo } from 'react'
import { GROUPS, GROUP_KEYS, GROUP_SCHEDULE, GROUP_DATES, KO_DATES, R32_PAIRINGS } from './data'
import { useI18n, LanguageSelector } from './i18n.jsx'
import './App.css'

// ─── Date formatting ────────────────────────────────────────────────────────
const LOCALE_MAP = { pt: 'pt-BR', en: 'en-US', fr: 'fr-FR', es: 'es-ES' }

function formatMatchDate(isoString, lang) {
  if (!isoString) return null
  const d = new Date(isoString)
  const locale = LOCALE_MAP[lang]
  const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function formatRoundDate(isoDate, lang) {
  const d = new Date(isoDate + 'T00:00:00Z')
  return d.toLocaleDateString(LOCALE_MAP[lang], { day: 'numeric', month: 'short' })
}

// ─── Bracket constants ──────────────────────────────────────────────────────
const BASE_SLOT = 140
const TOTAL_H   = 16 * BASE_SLOT
const CONN_W    = 28

// ─── Flag component ─────────────────────────────────────────────────────────
function Flag({ code, className = '' }) {
  if (!code) return <span className={`fi fi-placeholder ${className}`} />
  return <span className={`fi fi-${code} fis ${className}`} />
}

// ═══════════════════════════════════════════════════════════════════════════
// GROUP STAGE LOGIC
// ═══════════════════════════════════════════════════════════════════════════

function calcGroupStats(g, scores) {
  const stats = GROUPS[g].map((t, i) => ({
    ...t, idx: i,
    pts: 0, w: 0, d: 0, l: 0,
    gf: 0, ga: 0, gd: 0, played: 0,
  }))

  GROUP_SCHEDULE.forEach((m, mi) => {
    const [hs, as] = scores[mi]
    if (hs === null || as === null) return
    const H = stats[m.home], A = stats[m.away]
    H.played++; A.played++
    H.gf += hs; H.ga += as; H.gd += hs - as
    A.gf += as; A.ga += hs; A.gd += as - hs
    if      (hs > as) { H.pts += 3; H.w++; A.l++ }
    else if (hs < as) { A.pts += 3; A.w++; H.l++ }
    else              { H.pts += 1; H.d++; A.pts += 1; A.d++ }
  })

  return stats
}

function h2hStats(tiedIdxs, scores) {
  const h = {}
  tiedIdxs.forEach(i => { h[i] = { pts: 0, gd: 0, gf: 0 } })
  GROUP_SCHEDULE.forEach((m, mi) => {
    const [hs, as] = scores[mi]
    if (hs === null || as === null) return
    if (!tiedIdxs.includes(m.home) || !tiedIdxs.includes(m.away)) return
    h[m.home].gf += hs; h[m.home].gd += hs - as
    h[m.away].gf += as; h[m.away].gd += as - hs
    if      (hs > as) h[m.home].pts += 3
    else if (hs < as) h[m.away].pts += 3
    else              { h[m.home].pts += 1; h[m.away].pts += 1 }
  })
  return h
}

function sortStandings(stats, scores) {
  return [...stats].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.gd  !== a.gd)  return b.gd  - a.gd
    if (b.gf  !== a.gf)  return b.gf  - a.gf
    const h = h2hStats([a.idx, b.idx], scores)
    if (h[b.idx].pts !== h[a.idx].pts) return h[b.idx].pts - h[a.idx].pts
    if (h[b.idx].gd  !== h[a.idx].gd)  return h[b.idx].gd  - h[a.idx].gd
    return h[b.idx].gf - h[a.idx].gf
  })
}

function buildQualifiers(groupScores) {
  const q = {}
  GROUP_KEYS.forEach(g => {
    const raw    = calcGroupStats(g, groupScores[g])
    const ranked = sortStandings(raw, groupScores[g])
    const hasData = groupScores[g].some(([hs]) => hs !== null)
    q[g] = {
      first:  hasData ? ranked[0] : null,
      second: hasData ? ranked[1] : null,
      third:  hasData ? ranked[2] : null,
      ranked,
    }
  })
  return q
}

function buildBestThirds(q) {
  return GROUP_KEYS
    .filter(g => q[g].third !== null)
    .map(g => ({ group: g, ...q[g].third }))
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.gd  !== a.gd)  return b.gd  - a.gd
      return b.gf - a.gf
    })
    .slice(0, 8)
}

// ═══════════════════════════════════════════════════════════════════════════
// KNOCKOUT LOGIC
// ═══════════════════════════════════════════════════════════════════════════

function matchWinner(teams, scores) {
  const [s0, s1] = scores
  if (s0 === null || s1 === null || s0 === s1) return null
  return s0 > s1 ? teams[0] : teams[1]
}

function initKOScores(counts) {
  const s = {}
  Object.entries(counts).forEach(([r, n]) => {
    s[r] = Array.from({ length: n }, () => [null, null])
  })
  return s
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS — Group stage
// ═══════════════════════════════════════════════════════════════════════════

function GroupMatchCard({ teams, scores, onChange, lang, dateISO }) {
  const [s0, s1] = scores
  const hasResult = s0 !== null && s1 !== null
  const winner = hasResult ? (s0 > s1 ? 0 : s0 < s1 ? 1 : null) : null
  const fmt = formatMatchDate(dateISO, lang)

  return (
    <div className={`gm-card ${hasResult ? 'gm-done' : ''}`}>
      {fmt && (
        <div className="match-date">
          <span className="match-date-day">{fmt.date}</span>
          <span className="match-date-time">{fmt.time}</span>
        </div>
      )}
      {[0, 1].map(i => {
        const t    = teams[i]
        const won  = winner === i
        const lost = winner !== null && winner !== i
        return (
          <div key={i} className={`gm-row${won ? ' won' : ''}${lost ? ' lost' : ''}`}>
            <Flag code={t.code} className="gm-flag" />
            <span className="gm-name">{t.names[lang]}</span>
            <input
              className="gm-score"
              type="number" min="0" max="99"
              value={scores[i] ?? ''}
              placeholder="–"
              onChange={e => {
                const v = e.target.value
                onChange(i, v === '' ? null : Math.max(0, parseInt(v) || 0))
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

function GroupStandings({ stats, lang, t }) {
  const s = t.standings
  const hasAny = stats.some(st => st.played > 0)
  return (
    <div className="g-standings">
      <div className="g-standings-head">
        <span className="gs-pos">#</span>
        <span className="gs-team">{s.team}</span>
        <span className="gs-stat">{s.played}</span>
        <span className="gs-stat">{s.won}</span>
        <span className="gs-stat">{s.drawn}</span>
        <span className="gs-stat">{s.lost}</span>
        <span className="gs-stat bold">{s.points}</span>
        <span className="gs-stat">{s.gd}</span>
        <span className="gs-stat">{s.gf}</span>
      </div>
      {stats.map((st, pos) => {
        const cls = hasAny
          ? pos < 2 ? 'adv' : pos === 2 ? 'third' : ''
          : ''
        return (
          <div key={st.idx} className={`g-standings-row ${cls}`}>
            <span className={`gs-pos gs-pos-${pos + 1}`}>{pos + 1}</span>
            <span className="gs-team">
              <Flag code={st.code} className="gs-flag" />
              <span className="gs-tname">{st.names[lang]}</span>
            </span>
            <span className="gs-stat">{st.played}</span>
            <span className="gs-stat">{st.w}</span>
            <span className="gs-stat">{st.d}</span>
            <span className="gs-stat">{st.l}</span>
            <span className="gs-stat bold">{st.pts}</span>
            <span className="gs-stat">{st.gd > 0 ? `+${st.gd}` : st.gd}</span>
            <span className="gs-stat">{st.gf}</span>
          </div>
        )
      })}
      {hasAny && (
        <div className="g-standings-legend">
          <span className="leg adv">■</span> {t.qualified} &nbsp;
          <span className="leg third">■</span> {t.possibleThird}
        </div>
      )}
    </div>
  )
}

function GroupPanel({ g, scores, onScore, lang, t }) {
  const teams  = GROUPS[g]
  const raw    = useMemo(() => calcGroupStats(g, scores),  [g, scores])
  const ranked = useMemo(() => sortStandings(raw, scores), [raw, scores])

  return (
    <div className="group-panel">
      <div className="gp-header">
        <span className="gp-badge">{g}</span>
        <span className="gp-title">{t.groupLabel} {g}</span>
        <div className="gp-flags">
          {teams.map(tm => <Flag key={tm.code} code={tm.code} className="gp-team-flag" />)}
        </div>
      </div>

      <div className="gp-rounds">
        {[1, 2, 3].map(r => {
          const matchesInRound = GROUP_SCHEDULE
            .map((m, mi) => ({ ...m, mi }))
            .filter(m => m.round === r)
          return (
            <div key={r} className="gp-round-col">
              <div className="gp-round-label">{t.rounds[r]}</div>
              <div className="gp-round-matches">
                {matchesInRound.map(({ home, away, mi }) => (
                  <GroupMatchCard
                    key={mi}
                    teams={[teams[home], teams[away]]}
                    scores={scores[mi]}
                    lang={lang}
                    dateISO={GROUP_DATES[g][mi]}
                    onChange={(ti, val) => onScore(g, mi, ti, val)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <GroupStandings stats={ranked} lang={lang} t={t} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS — Knockout bracket
// ═══════════════════════════════════════════════════════════════════════════

function BracketConnector({ matchCount, slotPx }) {
  const color = '#2a3f58'
  const pairs  = matchCount / 2
  return (
    <svg width={CONN_W} height={TOTAL_H} style={{ flexShrink: 0, display: 'block' }}>
      {Array.from({ length: pairs }, (_, i) => {
        const y1  = (i * 2 + 0.5) * slotPx
        const y2  = (i * 2 + 1.5) * slotPx
        const mid = (y1 + y2) / 2
        const x   = CONN_W / 2
        return (
          <g key={i}>
            <line x1={0} y1={y1}  x2={x}      y2={y1}  stroke={color} strokeWidth="2" />
            <line x1={x} y1={y1}  x2={x}      y2={y2}  stroke={color} strokeWidth="2" />
            <line x1={0} y1={y2}  x2={x}      y2={y2}  stroke={color} strokeWidth="2" />
            <line x1={x} y1={mid} x2={CONN_W} y2={mid} stroke={color} strokeWidth="2" />
          </g>
        )
      })}
    </svg>
  )
}

function KOMatchCard({ match, onScore, lang, t, roundKey }) {
  const { teams, scores } = match
  const winner = matchWinner(teams, scores)
  const fmt = formatRoundDate(KO_DATES[roundKey], lang)
  return (
    <div className={`ko-card ${winner ? 'ko-done' : ''}`}>
      <div className="match-date ko-date">
        <span className="match-date-day">{fmt}</span>
      </div>
      {[0, 1].map(i => {
        const team   = teams[i]
        const isWin  = winner && teams[i] === winner
        const isLose = winner && team && teams[i] !== winner
        return (
          <div key={i} className={`ko-row${isWin ? ' won' : ''}${isLose ? ' lost' : ''}`}>
            <Flag code={team?.code} className="ko-flag" />
            <span className={`ko-name${!team ? ' tbd' : ''}`}>
              {team ? team.names[lang] : t.tbd}
            </span>
            <input
              className="ko-score"
              type="number" min="0" max="99"
              value={scores[i] ?? ''}
              placeholder="–"
              disabled={!team}
              onChange={e => {
                const v = e.target.value
                onScore(i, v === '' ? null : Math.max(0, parseInt(v) || 0))
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

function RoundColumn({ label, matches, slotPx, roundKey, onScore, lang, t }) {
  return (
    <div className="ko-col">
      <div className="ko-col-label">{label}</div>
      {matches.map((m, mi) => (
        <div key={mi} className="ko-slot" style={{ height: slotPx }}>
          <KOMatchCard
            match={m}
            lang={lang}
            t={t}
            roundKey={roundKey}
            onScore={(ti, val) => onScore(roundKey, mi, ti, val)}
          />
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════

export default function App() {
  const { lang, t } = useI18n()

  const [groupScores, setGroupScores] = useState(() => {
    const s = {}
    GROUP_KEYS.forEach(g => {
      s[g] = Array(6).fill(null).map(() => [null, null])
    })
    return s
  })

  const [koScores, setKoScores] = useState(() =>
    initKOScores({ r32: 16, r16: 8, qf: 4, sf: 2, final: 1 })
  )

  // ── Derived ──────────────────────────────────────────────────────────────
  const qualifiers = useMemo(() => buildQualifiers(groupScores), [groupScores])
  const bestThirds = useMemo(() => buildBestThirds(qualifiers),  [qualifiers])

  const koBracket = useMemo(() => {
    const q = qualifiers, th = bestThirds
    const r32 = R32_PAIRINGS.map((fn, i) => ({ teams: fn(q, th), scores: koScores.r32[i] }))

    function next(prev, sc) {
      return Array.from({ length: prev.length / 2 }, (_, i) => ({
        teams:  [matchWinner(prev[i*2].teams,     prev[i*2].scores),
                 matchWinner(prev[i*2+1].teams,   prev[i*2+1].scores)],
        scores: sc[i],
      }))
    }

    const r16   = next(r32, koScores.r16)
    const qf    = next(r16, koScores.qf)
    const sf    = next(qf,  koScores.sf)
    const final = next(sf,  koScores.final)
    const champion = matchWinner(final[0].teams, final[0].scores)
    return { r32, r16, qf, sf, final, champion }
  }, [qualifiers, bestThirds, koScores])

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleGroupScore(g, mi, ti, val) {
    setGroupScores(prev => ({
      ...prev,
      [g]: prev[g].map((s, i) =>
        i === mi ? s.map((v, j) => j === ti ? val : v) : s
      ),
    }))
  }

  function handleKoScore(round, mi, ti, val) {
    setKoScores(prev => ({
      ...prev,
      [round]: prev[round].map((s, i) =>
        i === mi ? s.map((v, j) => j === ti ? val : v) : s
      ),
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
        <h1>{t.appTitle}</h1>
        <p>{t.appSubtitle}</p>
      </header>

      {/* ── Groups ── */}
      <section className="copa-section">
        <h2 className="sec-title"><span>🏟️ {t.groupStageTitle}</span></h2>
        <div className="groups-grid">
          {GROUP_KEYS.map(g => (
            <GroupPanel
              key={g}
              g={g}
              scores={groupScores[g]}
              onScore={handleGroupScore}
              lang={lang}
              t={t}
            />
          ))}
        </div>
      </section>

      {/* ── Best Thirds ── */}
      <section className="copa-section">
        <h2 className="sec-title"><span>🥉 {t.thirdsTitle}</span></h2>
        <div className="thirds-bar">
          {Array.from({ length: 8 }, (_, i) => {
            const tm = bestThirds[i]
            return tm ? (
              <div key={i} className="third-chip filled">
                <Flag code={tm.code} />
                <strong>{tm.names[lang]}</strong>
                <em>Gr.{tm.group} · {tm.pts}pts · {tm.gd > 0 ? `+${tm.gd}` : tm.gd} {t.standings.gd}</em>
              </div>
            ) : (
              <div key={i} className="third-chip">{t.slot} {i + 1}</div>
            )
          })}
        </div>
      </section>

      {/* ── Knockout Bracket ── */}
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
            {/* Trophy */}
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
    </div>
  )
}
