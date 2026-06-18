import { useState, useEffect } from 'react'
import { apiFetch } from './useApi'

export interface Smestaj {
  id: number; slug: string; naziv: string; opis: string
  tip: 'hotel' | 'apartman' | 'vila'; season: string
  cena_po_nocenju: number; udaljenost_od_staza: number; kapacitet: number
  image_url: string | null; tags: string[]
  company_name: string; company_slug: string
}

interface PaginatedResponse<T> { count: number; next: string | null; previous: string | null; results: T[] }

export interface SmestajFilters {
  tip?: string; season?: string
  checkIn?: string; checkOut?: string
  adults?: number; children?: number
  page?: number
}

export function useSmestaji(filters: SmestajFilters) {
  const [data, setData]       = useState<PaginatedResponse<Smestaj> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.tip)      params.set('tip', filters.tip)
    if (filters.season)   params.set('season', filters.season)
    if (filters.checkIn)  params.set('check_in', filters.checkIn)
    if (filters.checkOut) params.set('check_out', filters.checkOut)
    if (filters.page)     params.set('page', String(filters.page))

    apiFetch<PaginatedResponse<Smestaj>>(`/smestaj/?${params}`)
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [filters.tip, filters.season, filters.checkIn, filters.checkOut, filters.page])

  return { data, loading, error }
}