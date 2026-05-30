const LABELS = {
  connecting:   { pt: 'Conectando…',  en: 'Connecting…',   fr: 'Connexion…',    es: 'Conectando…'  },
  live:         { pt: 'Ao vivo',      en: 'Live',           fr: 'En direct',     es: 'En vivo'      },
  disconnected: { pt: 'Desconectado', en: 'Disconnected',  fr: 'Déconnecté',    es: 'Desconectado' },
  error:        { pt: 'Erro de rede', en: 'Network error', fr: 'Erreur réseau', es: 'Error de red' },
}

export default function LiveBadge({ status, lang }) {
  return (
    <span className={`live-badge ${status}`}>
      {LABELS[status]?.[lang] ?? status}
    </span>
  )
}
