const BASE = import.meta.env.VITE_API_URL ?? 'http://192.168.1.6:8000/api'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const savedUserString = localStorage.getItem('infokop_auth')
  let token: string | null = null
  
  if (savedUserString) {
    try {
      token = JSON.parse(savedUserString)?.access ?? null
    } catch { /* empty */ }
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

 if (res.status === 401 || res.status === 403) {
    window.location.href = '/account/login'
    throw await res.json()
}

  if (!res.ok) throw await res.json()
  return res.json()
}