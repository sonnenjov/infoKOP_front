import { useState, useEffect } from 'react'
import { apiFetch } from './useApi'

export interface Dogadjaj {
  id: number
  slug: string
  naziv: string
  opis: string
  kategorija: string
  season: string
  datum_pocetka: string
  datum_zavrsetka: string | null
  vreme: string | null
  lokacija: string
  cena: number | null
  max_kapacitet: number | null
  image_url: string | null
  je_besplatan: boolean
  company: {
    id: number
    company_name: string
    slug: string
  }
  is_active: boolean
  created_at: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface DogadjajFilters {
  kategorija?: string
  season?: string
  od_datuma?: string
  do_datuma?: string
  kompanija?: number
  page?: number
}

export function useDogadjaji(filters: DogadjajFilters) {
  const [data, setData] = useState<PaginatedResponse<Dogadjaj> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    
    if (filters.kategorija && filters.kategorija !== 'svi') {
      params.set('kategorija', filters.kategorija)
    }
    if (filters.season) {
      params.set('season', filters.season)
    }
    if (filters.od_datuma) {
      params.set('od_datuma', filters.od_datuma)
    }
    if (filters.do_datuma) {
      params.set('do_datuma', filters.do_datuma)
    }
    if (filters.kompanija) {
      params.set('kompanija', String(filters.kompanija))
    }
    if (filters.page) {
      params.set('page', String(filters.page))
    }

    const queryString = params.toString()
    const url = `/dogadjaji/${queryString ? `?${queryString}` : ''}`

    apiFetch<PaginatedResponse<Dogadjaj>>(url)
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [
    filters.kategorija,
    filters.season,
    filters.od_datuma,
    filters.do_datuma,
    filters.kompanija,
    filters.page
  ])

  return { data, loading, error }
}