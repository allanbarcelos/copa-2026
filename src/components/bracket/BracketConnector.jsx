import { TOTAL_H, CONN_W } from '../../constants/bracket.js'

const COLOR = '#2a3f58'

export default function BracketConnector({ matchCount, slotPx }) {
  const pairs = matchCount / 2
  return (
    <svg width={CONN_W} height={TOTAL_H} style={{ flexShrink: 0, display: 'block' }}>
      {Array.from({ length: pairs }, (_, i) => {
        const y1  = (i * 2 + 0.5) * slotPx
        const y2  = (i * 2 + 1.5) * slotPx
        const mid = (y1 + y2) / 2
        const x   = CONN_W / 2
        return (
          <g key={i}>
            <line x1={0} y1={y1}  x2={x}      y2={y1}  stroke={COLOR} strokeWidth="2" />
            <line x1={x} y1={y1}  x2={x}      y2={y2}  stroke={COLOR} strokeWidth="2" />
            <line x1={0} y1={y2}  x2={x}      y2={y2}  stroke={COLOR} strokeWidth="2" />
            <line x1={x} y1={mid} x2={CONN_W} y2={mid} stroke={COLOR} strokeWidth="2" />
          </g>
        )
      })}
    </svg>
  )
}
