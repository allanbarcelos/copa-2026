import Flag from '../Flag.jsx'
import { formatMatchDate } from '../../services/dateFormat.js'

const STATUS_LABEL = {
  upcoming: { pt: 'Em breve',   en: 'Upcoming', fr: 'À venir',    es: 'Próximo'    },
  live:     { pt: 'Ao vivo',    en: 'Live',      fr: 'En direct',  es: 'En vivo'    },
  finished: { pt: 'Encerrado',  en: 'Final',     fr: 'Terminé',    es: 'Finalizado' },
}

function winPct(prediction, i) {
  if (!prediction) return null
  return i === 0 ? prediction.home : prediction.away
}

export default function GroupMatchCard({ teams, scores, matchStatus, prediction, onChange, lang, dateISO, t }) {
  const [s0, s1] = scores
  const hasResult = s0 !== null && s1 !== null
  const winner    = hasResult ? (s0 > s1 ? 0 : s0 < s1 ? 1 : null) : null
  const fmt       = formatMatchDate(dateISO, lang)

  return (
    <div className={`gm-card ${hasResult ? 'gm-done' : ''}`}>
      <div className="match-date">
        {fmt ? (
          <>
            <span className="match-date-day">{fmt.date}</span>
            <span className="match-date-time">{fmt.time}</span>
          </>
        ) : (
          <span className="match-date-tbd">{t.tbd}</span>
        )}
        {matchStatus && (
          <span className={`match-status-badge match-status-${matchStatus}`}>
            {STATUS_LABEL[matchStatus][lang]}
          </span>
        )}
      </div>

      {[0, 1].map(i => {
        const team = teams[i]
        const won  = winner === i
        const lost = winner !== null && winner !== i
        const pct  = winPct(prediction, i)
        return (
          <div key={i} className={`gm-row${won ? ' won' : ''}${lost ? ' lost' : ''}`}>
            <Flag code={team.code} className="gm-flag" />
            <span className="gm-name">{team.names[lang]}</span>
            {pct != null && <span className="gm-prob">{pct}%</span>}
            <input
              className="gm-score"
              type="number" min="0" max="99"
              value={scores[i] ?? ''}
              placeholder="–"
              disabled={matchStatus === 'finished'}
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
