import { useState, useEffect, useRef } from 'react'

const LABELS = {
  connecting:   { pt: 'Conectando…',  en: 'Connecting…',   fr: 'Connexion…',    es: 'Conectando…'  },
  disconnected: { pt: 'Desconectado', en: 'Disconnected',  fr: 'Déconnecté',    es: 'Desconectado' },
  error:        { pt: 'Erro de rede', en: 'Network error', fr: 'Erreur réseau', es: 'Error de red' },
}

const AGO = {
  pt: (s) => `Ao vivo · ${s}s atrás`,
  en: (s) => `Live · ${s}s ago`,
  fr: (s) => `En direct · ${s}s`,
  es: (s) => `En vivo · ${s}s`,
}

export default function LiveBadge({ status, lastSync, lang }) {
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (status !== 'live' || !lastSync) { setElapsed(0); return }
    const tick = () => setElapsed(Math.floor((Date.now() - lastSync) / 1000))
    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => clearInterval(timerRef.current)
  }, [status, lastSync])

  if (status === 'live') {
    return <span className="live-badge live">{AGO[lang]?.(elapsed)}</span>
  }

  return (
    <span className={`live-badge ${status}`}>
      {LABELS[status]?.[lang] ?? status}
    </span>
  )
}
