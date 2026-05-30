export const LOCALE_MAP = { pt: 'pt-BR', en: 'en-US', fr: 'fr-FR', es: 'es-ES' }

export function formatMatchDate(isoString, lang) {
  if (!isoString) return null
  const d      = new Date(isoString)
  const locale = LOCALE_MAP[lang]
  return {
    date: d.toLocaleDateString(locale,  { day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString(locale,  { hour: '2-digit', minute: '2-digit' }),
  }
}

export function formatRoundDate(isoDate, lang) {
  const d = new Date(isoDate + 'T00:00:00Z')
  return d.toLocaleDateString(LOCALE_MAP[lang], { day: 'numeric', month: 'short' })
}
