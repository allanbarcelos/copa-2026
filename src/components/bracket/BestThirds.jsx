import Flag from '../Flag.jsx'

export default function BestThirds({ bestThirds, lang, t }) {
  return (
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
  )
}
