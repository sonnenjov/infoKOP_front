// hooks/useUgostitelji.ts
import { useState, useEffect } from 'react'
import { apiReq } from './api'

interface Ugostitelj {
    id: number
    name: string
    category: string
    address: string
    phone: string
}

interface UgostiteljFilters {
    category?: string
    search?: string
}

export function useUgostitelji(filters: UgostiteljFilters) {
    const [data, setData] = useState<Ugostitelj[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const fetchUgostitelji = async () => {
            if (!isMounted) return
            
            setLoading(true)
            setError(null)
            
            try {
                const params = new URLSearchParams()
                if (filters.category && filters.category !== 'Svi') {
                    params.append('category', filters.category)
                }
                if (filters.search) {
                    params.append('search', filters.search)
                }
                
                const response = await apiReq.get(`/users/companies/public/?${params.toString()}`)
                const result = response.data
                
                if (isMounted) {
                    setData(Array.isArray(result) ? result : [])
                }
            } catch (err) {
                console.error('useUgostitelji error:', err)
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Greška pri učitavanju podataka')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchUgostitelji()

        return () => {
            isMounted = false
        }
    }, [filters.category, filters.search])

    return { data, loading, error }
}