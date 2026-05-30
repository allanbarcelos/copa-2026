/**
 * matchMapper.js
 * Converte a resposta da football-data.org (/competitions/WC/matches) para os
 * formatos usados pelo App.
 *
 * Retorna:
 *   scores      — { [grp]: [[h,a]|null, ...] }  placares (só FINISHED)
 *   groupDates  — { [grp]: [isoString|null, ...] }  utcDate de cada partida
 *   roundDates  — { r32, r16, qf, sf, final }  primeira data de cada fase KO
 */

import { GROUPS, GROUP_SCHEDULE } from './data.js'

// Normaliza string: minúsculas, apenas letras a-z
const norm = s => s.toLowerCase().replace(/[^a-z]/g, '')

// Lookup: norm(nome) → { grp, idx }
const TEAM_LOOKUP = new Map()
for (const [grp, teams] of Object.entries(GROUPS)) {
  teams.forEach((team, idx) => {
    for (const name of Object.values(team.names)) {
      const key = norm(name)
      if (!TEAM_LOOKUP.has(key)) TEAM_LOOKUP.set(key, { grp, idx })
    }
  })
}

// Aliases para nomes da football-data.org que diferem dos nossos
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

// Mapeamento de stage da API → chave interna
const STAGE_MAP = {
  'ROUND_OF_32':    'r32',
  'ROUND_OF_16':    'r16',
  'QUARTER_FINALS': 'qf',
  'SEMI_FINALS':    'sf',
  'FINAL':          'final',
}

function lookupTeam(apiName) {
  if (!apiName) return null
  const n = norm(apiName)
  return TEAM_LOOKUP.get(ALIASES.get(n) ?? n) ?? null
}

const LIVE_STATUSES     = new Set(['IN_PLAY', 'PAUSED', 'HALFTIME', 'EXTRA_TIME', 'PENALTY'])
const FINISHED_STATUSES = new Set(['FINISHED', 'FULL_TIME', 'AWARDED'])

function toMatchStatus(apiStatus) {
  if (LIVE_STATUSES.has(apiStatus))     return 'live'
  if (FINISHED_STATUSES.has(apiStatus)) return 'finished'
  return 'upcoming'
}

export function mapMatches(data) {
  const scores       = {}
  const groupDates   = {}
  const groupStatuses = {}
  for (const grp of Object.keys(GROUPS)) {
    scores[grp]        = Array(6).fill(null)
    groupDates[grp]    = Array(6).fill(null)
    groupStatuses[grp] = Array(6).fill(null)
  }
  const roundDates = { r32: null, r16: null, qf: null, sf: null, final: null }

  if (!data?.matches) return { scores, groupDates, groupStatuses, roundDates }

  for (const match of data.matches) {
    const utcDate = match.utcDate ?? null

    // ── Fase de grupos ──────────────────────────────────────────────────────
    if (match.group) {
      const grpLetter = match.group.replace('GROUP_', '')
      if (scores[grpLetter] === undefined) continue

      const homeInfo = lookupTeam(match.homeTeam?.shortName ?? match.homeTeam?.name ?? '')
      if (!homeInfo || homeInfo.grp !== grpLetter) continue

      const schedIdx = GROUP_SCHEDULE.findIndex(
        s => s.round === match.matchday && s.home === homeInfo.idx
      )
      if (schedIdx === -1) continue

      if (utcDate) groupDates[grpLetter][schedIdx] = utcDate
      groupStatuses[grpLetter][schedIdx] = toMatchStatus(match.status)

      if (FINISHED_STATUSES.has(match.status)) {
        const h = match.score?.fullTime?.home
        const a = match.score?.fullTime?.away
        if (h != null && a != null) scores[grpLetter][schedIdx] = [h, a]
      }

      continue
    }

    // ── Fase eliminatória — registra a primeira data de cada fase ───────────
    const roundKey = STAGE_MAP[match.stage]
    if (roundKey && utcDate) {
      if (!roundDates[roundKey] || utcDate < roundDates[roundKey]) {
        roundDates[roundKey] = utcDate
      }
    }
  }

  return { scores, groupDates, groupStatuses, roundDates }
}
