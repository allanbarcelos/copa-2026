import Flag from '../Flag.jsx'

export default function GroupStandings({ stats, lang, t }) {
  const s      = t.standings
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
