import { useMemo } from 'react'
import { GROUPS, GROUP_SCHEDULE } from '../../data.js'
import { calcGroupStats, sortStandings } from '../../services/groupStats.js'
import Flag from '../Flag.jsx'
import GroupMatchCard from './GroupMatchCard.jsx'
import GroupStandings from './GroupStandings.jsx'

export default function GroupPanel({ g, scores, groupDates, groupStatuses, predictions, onScore, lang, t }) {
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
                    matchStatus={groupStatuses?.[mi]}
                    prediction={predictions?.[mi]}
                    lang={lang}
                    dateISO={groupDates?.[mi]}
                    t={t}
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
