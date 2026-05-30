import { createContext, useContext, useState } from 'react'

// ─── Translations ───────────────────────────────────────────────────────────
export const translations = {
  pt: {
    appTitle:         'Copa do Mundo 2026',
    appSubtitle:      'Preencha os placares · classificação e chaveamento automáticos',
    groupStageTitle:  'Fase de Grupos — 12 grupos · 6 jogos cada',
    thirdsTitle:      'Melhores Terceiros Colocados — 8 vagas',
    knockoutTitle:    'Chaveamento Eliminatório',
    groupLabel:       'Grupo',
    rounds:           { 1: 'Rodada 1', 2: 'Rodada 2', 3: 'Rodada 3' },
    standings: {
      team: 'Seleção', played: 'J', won: 'V', drawn: 'E',
      lost: 'D', points: 'Pts', gd: 'SG', gf: 'GP',
    },
    qualified:        'Classificado',
    possibleThird:    'Possível 3º',
    tbd:              'A definir',
    slot:             'Vaga',
    champion:         'Campeão',
    koRounds: {
      r32: 'Rodada de 32', r16: 'Oitavas',
      qf: 'Quartas', sf: 'Semifinais', final: 'Final',
    },
  },
  en: {
    appTitle:         'FIFA World Cup 2026',
    appSubtitle:      'Fill in the scores · standings and bracket update automatically',
    groupStageTitle:  'Group Stage — 12 groups · 6 matches each',
    thirdsTitle:      'Best Third-Place Teams — 8 spots',
    knockoutTitle:    'Knockout Bracket',
    groupLabel:       'Group',
    rounds:           { 1: 'Matchday 1', 2: 'Matchday 2', 3: 'Matchday 3' },
    standings: {
      team: 'Team', played: 'P', won: 'W', drawn: 'D',
      lost: 'L', points: 'Pts', gd: 'GD', gf: 'GF',
    },
    qualified:        'Qualified',
    possibleThird:    'Possible 3rd',
    tbd:              'TBD',
    slot:             'Spot',
    champion:         'Champion',
    koRounds: {
      r32: 'Round of 32', r16: 'Round of 16',
      qf: 'Quarter-finals', sf: 'Semi-finals', final: 'Final',
    },
  },
  fr: {
    appTitle:         'Coupe du Monde 2026',
    appSubtitle:      'Remplissez les scores · classements et tableau mis à jour automatiquement',
    groupStageTitle:  'Phase de Groupes — 12 groupes · 6 matchs chacun',
    thirdsTitle:      'Meilleurs Troisièmes — 8 places',
    knockoutTitle:    'Tableau Éliminatoire',
    groupLabel:       'Groupe',
    rounds:           { 1: 'Journée 1', 2: 'Journée 2', 3: 'Journée 3' },
    standings: {
      team: 'Équipe', played: 'J', won: 'V', drawn: 'N',
      lost: 'D', points: 'Pts', gd: '+/-', gf: 'BP',
    },
    qualified:        'Qualifié',
    possibleThird:    '3e possible',
    tbd:              'À définir',
    slot:             'Place',
    champion:         'Champion',
    koRounds: {
      r32: 'Tour de 32', r16: 'Huitièmes',
      qf: 'Quarts', sf: 'Demi-finales', final: 'Finale',
    },
  },
  es: {
    appTitle:         'Copa del Mundo 2026',
    appSubtitle:      'Ingresa los marcadores · clasificación y llaves actualizadas automáticamente',
    groupStageTitle:  'Fase de Grupos — 12 grupos · 6 partidos cada uno',
    thirdsTitle:      'Mejores Terceros — 8 plazas',
    knockoutTitle:    'Llave Eliminatoria',
    groupLabel:       'Grupo',
    rounds:           { 1: 'Jornada 1', 2: 'Jornada 2', 3: 'Jornada 3' },
    standings: {
      team: 'Selección', played: 'J', won: 'G', drawn: 'E',
      lost: 'P', points: 'Pts', gd: 'DG', gf: 'GF',
    },
    qualified:        'Clasificado',
    possibleThird:    'Posible 3ro',
    tbd:              'Por definir',
    slot:             'Plaza',
    champion:         'Campeón',
    koRounds: {
      r32: 'Ronda de 32', r16: 'Octavos',
      qf: 'Cuartos', sf: 'Semifinales', final: 'Final',
    },
  },
}

const SUPPORTED = ['pt', 'en', 'fr', 'es']

function detectLang() {
  const nav = (navigator.language || navigator.userLanguage || 'pt').slice(0, 2).toLowerCase()
  return SUPPORTED.includes(nav) ? nav : 'pt'
}

// ─── Context ────────────────────────────────────────────────────────────────
const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(detectLang)
  const t = translations[lang]
  return (
    <I18nContext.Provider value={{ lang, setLang, t, SUPPORTED }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}

// ─── Language selector component ─────────────────────────────────────────────
const LANG_META = {
  pt: { code: 'br',  label: 'PT' },
  en: { code: 'gb',  label: 'EN' },
  fr: { code: 'fr',  label: 'FR' },
  es: { code: 'es',  label: 'ES' },
}

export function LanguageSelector() {
  const { lang, setLang, SUPPORTED } = useI18n()
  return (
    <div className="lang-selector">
      {SUPPORTED.map(l => {
        const { code, label } = LANG_META[l]
        return (
          <button
            key={l}
            className={`lang-btn ${l === lang ? 'active' : ''}`}
            onClick={() => setLang(l)}
            title={label}
          >
            <span className={`fi fi-${code} fis lang-flag`} />
            <span className="lang-label">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
