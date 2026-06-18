// hooks/useAppData.tsx
import { createContext, useContext, useState, useEffect } from 'react'

interface AppDataContextType {
  ready: boolean
}

const AppDataContext = createContext<AppDataContextType>({ ready: false })

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([
        fetch('/api/smestaj'),
        fetch('/api/dogadjaji'),
        fetch('/api/aktivnosti'),
        fetch('/api/users'),
        fetch('/api/weather'),
        fetch('/api/vesti'),
      ])
      setReady(true)
    }
    fetchAll()
  }, [])

  return (
    <AppDataContext.Provider value={{ ready }}>
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppData = () => useContext(AppDataContext)