/**
 * predictionsMapper.js
 * Converte o cache de predictions da copa-2026-api para o formato do App:
 *   { [grp]: [{ home, draw, away } | null, ...] }  — índice = schedIdx (0-5)
 */

import { GROUPS, GROUP_SCHEDULE } from './data.js'

const norm = s => s.toLowerCase().replace(/[^a-z]/g, '')

const TEAM_LOOKUP = new Map()
for (const [grp, teams] of Object.entries(GROUPS)) {
  teams.forEach((team, idx) => {
    for (const name of Object.values(team.names)) {
      const key = norm(name)
      if (!TEAM_LOOKUP.has(key)) TEAM_LOOKUP.set(key, { grp, idx })
    }
  })
}

const ALIASES = new Map([
  [norm('United States'),             norm('USA')],
  [norm('Korea Republic'),            norm('South Korea')],
  [norm('Bosnia and Herzegovina'),    norm('Bosnia-Herz.')],
  [norm('Turkiye'),                   norm('Turkey')],
  [norm('Türkiye'),                   norm('Turkey')],
  [norm("Côte d'Ivoire"),             norm('Ivory Coast')],
  [norm('Cote dIvoire'),              norm('Ivory Coast')],
  [norm('Democratic Republic Congo'), norm('DR Congo')],
  [norm('Congo DR'),                  norm('DR Congo')],
])

function lookupTeam(name) {
  if (!name) return null
  const n = norm(name)
  return TEAM_LOOKUP.get(ALIASES.get(n) ?? n) ?? null
}

/**
 * @param {Record<string, { homeTeam, awayTeam, home, draw, away }>} data
 * @returns {{ [grp: string]: ({ home: number, draw: number, away: number } | null)[] }}
 */
export function mapPredictions(data) {
  const result = {}
  for (const grp of Object.keys(GROUPS)) {
    result[grp] = Array(6).fill(null)
  }

  if (!data) return result

  for (const pred of Object.values(data)) {
    const homeInfo = lookupTeam(pred.homeTeam)
    const awayInfo = lookupTeam(pred.awayTeam)
    if (!homeInfo || !awayInfo || homeInfo.grp !== awayInfo.grp) continue

    let schedIdx = GROUP_SCHEDULE.findIndex(
      s => s.home === homeInfo.idx && s.away === awayInfo.idx
    )
    let flipped = false
    if (schedIdx === -1) {
      schedIdx = GROUP_SCHEDULE.findIndex(
        s => s.home === awayInfo.idx && s.away === homeInfo.idx
      )
      flipped = true
    }
    if (schedIdx === -1) continue

    result[homeInfo.grp][schedIdx] = flipped
      ? { home: pred.away, draw: pred.draw, away: pred.home }
      : { home: pred.home, draw: pred.draw, away: pred.away }
  }

  return result
}
