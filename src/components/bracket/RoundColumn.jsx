import KOMatchCard from './KOMatchCard.jsx'

export default function RoundColumn({ label, matches, slotPx, roundKey, roundDate, onScore, lang, t }) {
  return (
    <div className="ko-col">
      <div className="ko-col-label">{label}</div>
      {matches.map((m, mi) => (
        <div key={mi} className="ko-slot" style={{ height: slotPx }}>
          <KOMatchCard
            match={m}
            lang={lang}
            t={t}
            roundDate={roundDate}
            onScore={(ti, val) => onScore(roundKey, mi, ti, val)}
          />
        </div>
      ))}
    </div>
  )
}
