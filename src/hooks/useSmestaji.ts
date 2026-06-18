import { useState, useEffect } from 'react'
import { apiFetch } from './useApi'

interface SmestajItem {
    id: number;
    naziv: string;
    cena_po_nocenju: number;
    kapacitet: number;
    company?: number | { id: number; company_name: string };  // ← fix this
    company_name?: string;  // ← add this
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

    apiFetch<PaginatedResponse<Smestaj>>(`/api/smestaj/?${params}`)
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [filters.tip, filters.season, filters.checkIn, filters.checkOut, filters.page])

  return { data, loading, error }
}