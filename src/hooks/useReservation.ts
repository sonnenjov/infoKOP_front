import { useState } from 'react'
import { apiFetch } from './useApi'
import { Season } from './useSeason'

export function useSmestajReservation() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function reserve(payload: {
    smestaj: number; check_in: string; check_out: string
    broj_odraslih: number; broj_dece: number; napomena?: string
  }) {
    setLoading(true); setError(null); setSuccess(false)
    try {
      await apiFetch('/smestaj/reservations/create/', { method: 'POST', body: JSON.stringify(payload) })
      setSuccess(true)
    } catch (e: any) {
      setError(e?.detail ?? 'Greška pri rezervaciji.')
    } finally {
      setLoading(false)
    }
  }

  return { reserve, loading, error, success }
}

export function useDogadjajReservation(filters: { kategorija: string; season: Season | undefined; od_datuma: string | undefined; page: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [reservationData, setReservationData] = useState<any>(null) // Add this line

  async function reserve(payload: {
    dogadjaj: number; broj_karata: number; napomena?: string
  }) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const data = await apiFetch('api/dogadjaji/reservations/create/', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
      })
      
      setReservationData(data) 
      setSuccess(true)
      
    } catch (err: any) {
      setError(err?.detail ?? err?.message ?? 'Greska pri rezervaciji.')
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return { reserve, loading, error, success, reservationData } 
}