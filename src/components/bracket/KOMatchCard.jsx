import { matchWinner } from '../../services/bracket.js'
import { formatRoundDate } from '../../services/dateFormat.js'
import Flag from '../Flag.jsx'

export default function KOMatchCard({ match, onScore, lang, t, roundDate }) {
  const { teams, scores } = match
  const winner = matchWinner(teams, scores)
  const fmt    = roundDate ? formatRoundDate(roundDate, lang) : null

  return (
    <div className={`ko-card ${winner ? 'ko-done' : ''}`}>
      <div className="match-date ko-date">
        {fmt
          ? <span className="match-date-day">{fmt}</span>
          : <span className="match-date-tbd">{t.tbd}</span>
        }
      </div>
      {[0, 1].map(i => {
        const team    = teams[i]
        const isWin   = winner && teams[i] === winner
        const isLose  = winner && team && teams[i] !== winner
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
