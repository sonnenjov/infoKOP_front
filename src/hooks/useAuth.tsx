import { createContext, useContext, useState, ReactNode } from "react"

export interface User {
  email: string
  role: 'user' | 'company' | 'admin' | 'reporter'
  access: string  
}

type AuthContextType = {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  isAuthenticated: boolean
}

type AuthProviderProps = {
  children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null
    const savedUser = localStorage.getItem("infokop_auth")
    return savedUser ? JSON.parse(savedUser) : null
  })

  const login = (userData: User) => {
    localStorage.setItem("infokop_auth", JSON.stringify(userData))
    setUser(userData)
    console.log(userData)
  }

  const logout = () => {
    localStorage.removeItem("infokop_auth")
    setUser(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth se mora koristiti unutar AuthProvider-a")
  }
  return context
}
