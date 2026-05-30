/**
 * useMatchData — conecta ao servidor Socket.IO e expõe os dados da API.
 *
 * Eventos recebidos:
 *   'matches'     — payload completo da football-data.org
 *   'predictions' — cache de predictions da api-football
 *   'error'       — erro no servidor
 *
 * Retorna:
 *   apiScores   — { [grupo]: [[h,a]|null, ...] }
 *   groupDates  — { [grupo]: [isoString|null, ...] }
 *   roundDates  — { r32, r16, qf, sf, final }
 *   predictions — { [grupo]: [{ home, draw, away }|null, ...] }
 *   status      — 'connecting' | 'live' | 'disconnected' | 'error'
 *   lastSync    — timestamp ms do último 'matches' recebido
 */

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { mapMatches } from './matchMapper.js'
import { mapPredictions } from './predictionsMapper.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function useMatchData() {
  const [apiScores,      setApiScores]      = useState(null)
  const [groupDates,     setGroupDates]     = useState(null)
  const [groupStatuses,  setGroupStatuses]  = useState(null)
  const [roundDates,     setRoundDates]     = useState(null)
  const [predictions,    setPredictions]    = useState(null)
  const [status,         setStatus]         = useState('connecting')
  const [lastSync,       setLastSync]       = useState(null)

  useEffect(() => {
    const socket = io(API_URL, {
      reconnectionDelay:    2_000,
      reconnectionDelayMax: 15_000,
    })

    socket.on('connect',       () => setStatus('live'))
    socket.on('disconnect',    () => setStatus('disconnected'))
    socket.on('connect_error', () => setStatus('error'))

    socket.on('matches', (data) => {
      const { scores, groupDates, groupStatuses, roundDates } = mapMatches(data)
      setApiScores(scores)
      setGroupDates(groupDates)
      setGroupStatuses(groupStatuses)
      setRoundDates(roundDates)
      setLastSync(Date.now())
      setStatus('live')
    })

    socket.on('predictions', (data) => {
      setPredictions(mapPredictions(data))
    })

    socket.on('error', (err) => {
      console.error('[socket] erro da API:', err)
    })

    return () => socket.disconnect()
  }, [])

  return { apiScores, groupDates, groupStatuses, roundDates, predictions, status, lastSync }
}
