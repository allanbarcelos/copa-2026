import { R32_PAIRINGS } from '../data.js'

export function matchWinner(teams, scores) {
  const [s0, s1] = scores
  if (s0 === null || s1 === null || s0 === s1) return null
  return s0 > s1 ? teams[0] : teams[1]
}

export function initKOScores(counts) {
  const s = {}
  Object.entries(counts).forEach(([r, n]) => {
    s[r] = Array.from({ length: n }, () => [null, null])
  })
  return s
}

export function buildKOBracket(qualifiers, bestThirds, koScores) {
  const r32 = R32_PAIRINGS.map((fn, i) => ({
    teams:  fn(qualifiers, bestThirds),
    scores: koScores.r32[i],
  }))

  function next(prev, sc) {
    return Array.from({ length: prev.length / 2 }, (_, i) => ({
      teams:  [
        matchWinner(prev[i * 2].teams,     prev[i * 2].scores),
        matchWinner(prev[i * 2 + 1].teams, prev[i * 2 + 1].scores),
      ],
      scores: sc[i],
    }))
  }

  const r16     = next(r32,  koScores.r16)
  const qf      = next(r16,  koScores.qf)
  const sf      = next(qf,   koScores.sf)
  const final   = next(sf,   koScores.final)
  const champion = matchWinner(final[0].teams, final[0].scores)

  return { r32, r16, qf, sf, final, champion }
}
