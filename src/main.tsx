// main.tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App_Routes from './routes.tsx'
import { Season, useSeason } from './hooks/useSeason.ts'
import { JSX } from 'react'
import './i18n'
import {AuthProvider}  from './hooks/useAuth.tsx'
import { AppDataProvider } from './hooks/useAppData.tsx'
import "./styles/vesti.css"
import "./styles/vest_single.css"
export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppDataProvider>
        <AppInner />
        </AppDataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function AppInner(): JSX.Element {
  const { season, setSeason } = useSeason()

  return (
    <App_Routes
      activeSeason={season}
      onSwitch={(s: Season) => setSeason(s)}
    />
  )
}

createRoot(document.getElementById('root')!).render(<App />)