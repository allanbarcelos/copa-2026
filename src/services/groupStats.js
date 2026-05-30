import { GROUPS, GROUP_KEYS, GROUP_SCHEDULE } from '../data.js'

export function calcGroupStats(g, scores) {
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

export function sortStandings(stats, scores) {
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

export function buildQualifiers(groupScores) {
  const q = {}
  GROUP_KEYS.forEach(g => {
    const raw     = calcGroupStats(g, groupScores[g])
    const ranked  = sortStandings(raw, groupScores[g])
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

export function buildBestThirds(q) {
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
