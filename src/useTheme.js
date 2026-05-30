/**
 * useTheme — gerencia o tema claro/escuro.
 *
 * Prioridade:
 *  1. Preferência manual do usuário (salva em localStorage)
 *  2. Horário do dia: 7h–19h → claro, fora desse intervalo → escuro
 *
 * Retorna:
 *   theme       — 'dark' | 'light'
 *   toggleTheme — alterna e salva manualmente
 *   isAuto      — true se ainda seguindo horário (sem override manual)
 *   clearAuto   — remove o override e volta ao automático
 */

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'copa-theme'
const DAY_START   = 7   // 07:00
const DAY_END     = 19  // 19:00

function timeBasedTheme() {
  const h = new Date().getHours()
  return h >= DAY_START && h < DAY_END ? 'light' : 'dark'
}

function msUntilNextHour() {
  const now = new Date()
  return (60 - now.getMinutes()) * 60_000 - now.getSeconds() * 1_000
}

export function useTheme() {
  const [manual, setManual] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [auto,   setAuto]   = useState(timeBasedTheme)

  // Recalcula automaticamente a cada hora cheia
  useEffect(() => {
    const tick = () => setAuto(timeBasedTheme())
    const id = setTimeout(function schedule() {
      tick()
      setTimeout(schedule, 60 * 60_000)  // repete a cada 1h
    }, msUntilNextHour())
    return () => clearTimeout(id)
  }, [])

  const theme = manual ?? auto

  // Aplica classe no <html> para que o CSS :root[data-theme] funcione
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setManual(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  function clearAuto() {
    setManual(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return { theme, toggleTheme, isAuto: manual === null, clearAuto }
}
