// import { useAppData } from './hooks/useAppData.tsx'
import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import { Season } from './hooks/useSeason'
import { useAuth } from './hooks/useAuth.tsx'
import AccountLayout from './layouts/AccountLayout.tsx'
import LoadingPage from './components/LoadingPage.tsx'

import Pocetna from './pages/Pocetna'
import OKopaoniku from './pages/OKopaoniku'
import Aktivnosti from './pages/Aktivnosti'
import Smestaj from './pages/Smestaj'
import Ugostitelji from './pages/Ugostitelji'
import Dogadjaji from './pages/Dogadjaji'
import Kontakt from './pages/Kontakt'
import Vreme from './pages/Vreme'
import Kamere from './pages/Kamere'
import Mape from './pages/Mape'
import Usluge from './pages/Usluge.tsx'

import Login from './pages/services/Login.tsx'
import AdminLayout from './layouts/AdminLayout.tsx'


import PartnerLayout from './layouts/PartnerLayout.tsx'
import PartnerRezervacije from './pages/company/PartnerRezervacije.tsx'
import PartnerAnalitika from './pages/company/PartnerAnalitika.tsx'
import PartnerSettings from './pages/company/PartnerSettings.tsx'
import RegisterPartner from './pages/company/RegisterPartner.tsx'
import PartnerUsluge from './pages/company/PartnerUsluge.tsx'




import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import AdminPartners from './pages/admin/AdminPartners.tsx'
import AdminUsers from './pages/admin/AdminUsers.tsx'
import AdminSettings from './pages/admin/AdminSettings.tsx'
import AdminApprovals from './pages/admin/AdminApprovals.tsx'


import ReporterNews from './pages/reporter/ReporterNews.tsx'
import ReporterDashboard from './pages/reporter/ReporterDashboard.tsx'
import ReporterEditNews from './pages/reporter/ReporterEditNews.tsx'
import ReporterCategories from './pages/reporter/ReporterCategories.tsx'



import UserDashboard from './pages/user/UserDashboard.tsx'
import UserReservations from './pages/user/UserReservations.tsx'
import UserSettings from './pages/user/UserSettings.tsx'
import UserSkiPass from './pages/user/UserSkiPass.tsx'
import RegisterUser from './pages/user/RegisterUser.tsx'
import PartnerSmestaj from './pages/company/PartnerSmestaj.tsx'
import PartnerMeni from './pages/company/PartnerMeni.tsx'
import PartnerInventar from './pages/company/PartnerInventar.tsx'
import VerifyEmail from './pages/services/VerifyEmail.tsx'
import CheckEmail from './pages/services/CheckEmail.tsx'
import Vesti from './pages/Vesti.tsx'
import VestSingle from './pages/VestSingle.tsx'
import ForgotPasswordPage from './pages/user/user_components/ForgotPasswordpage.tsx'
import ResetPasswordPage from './pages/user/user_components/ResetPasswordpage.tsx'






type Role = 'user' | 'company' | 'admin' | 'reporter'

interface Props {
  activeSeason: Season
  onSwitch: (s: Season) => void
  children?: React.ReactNode
}


export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth()
  const user = auth?.user
  return user
    ? <>{children}</>
    : <Navigate to={`/account/login`} replace />
}

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth()
  const user = auth?.user
  if (!user) return <>{children}</>
  if (user.role === 'company') return <Navigate to="/partner/analitika" replace />
  if (user.role === 'reporter') return <Navigate to="/reporter/dashboard" replace />
  if (user.role === 'admin')   return <Navigate to="/admin" replace />
  return <Navigate to="/account/dashboard" replace />
}

const RoleRoute = ({
  children,
  allowed,
}: {
  children: React.ReactNode
  allowed: Role[]
}) => {
  const auth = useAuth()
  const user = auth?.user
  const location = useLocation()

  if (!user) {
    return <Navigate to={`/account/login?next=${location.pathname}`} replace />
  }

  if (!allowed.includes(user.role as Role)) {
    if (user.role === 'company') return <Navigate to="/partner/analitika" replace />
    if (user.role === 'reporter') return <Navigate to="/reporter/dashboard" replace />
    if (user.role === 'admin')   return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/account/dashboard" replace />
  }

  return <>{children}</>
}

function PublicLayout({ activeSeason, onSwitch, children }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Nav activeSeason={activeSeason} onSwitch={onSwitch} />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer activeSeason={activeSeason} onSwitch={onSwitch} />
    </div>
  )
}



export default function App_Routes({ activeSeason, onSwitch }: Props) {
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  if (!appReady) return <LoadingPage activeSeason={activeSeason}/>

 
  return (
    <Routes>

      <Route path="/" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <Pocetna activeSeason={activeSeason} />
        </PublicLayout>
      } />
      <Route path="/okopaoniku" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <OKopaoniku activeSeason={activeSeason} />
        </PublicLayout>
      } />
      <Route path="/aktivnosti" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <Aktivnosti activeSeason={activeSeason} />
        </PublicLayout>
      } />
      <Route path="/smestaj" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <Smestaj activeSeason={activeSeason} />
        </PublicLayout>
      } />
      <Route path="/ugostitelji" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <Ugostitelji activeSeason={activeSeason} />
        </PublicLayout>
      } />
      <Route path="/usluge" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <Usluge activeSeason={activeSeason} />
        </PublicLayout>
      } />
      <Route path="/dogadjaji" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <Dogadjaji activeSeason={activeSeason} />
        </PublicLayout>
      } />
      <Route path="/contact" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <Kontakt activeSeason={activeSeason} />
        </PublicLayout>
      } />
      <Route path="/weather" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <Vreme activeSeason={activeSeason} />
        </PublicLayout>
      } />
      <Route path="/cameras" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <Kamere activeSeason={activeSeason} />
        </PublicLayout>
      } />
      <Route path="/maps" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <Mape activeSeason={activeSeason} />
        </PublicLayout>
      } />

      <Route path="/vesti" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <Vesti activeSeason={activeSeason} />
        </PublicLayout>
      } />

      <Route path="/vesti/:id" element={
        <PublicLayout activeSeason={activeSeason} onSwitch={onSwitch}>
          <VestSingle activeSeason={activeSeason} />
        </PublicLayout>
      } />


      <Route path="/account/login" element={
        <GuestRoute><Login/></GuestRoute>
      } />
      <Route path="/partner/register" element={
        <GuestRoute><RegisterPartner activeSeason={activeSeason} /></GuestRoute>
      } />
        <Route path="/user/register" element={
        <GuestRoute><RegisterUser activeSeason={activeSeason} /></GuestRoute>
      } />


      <Route path="/check-email"   element={<CheckEmail />} />
      <Route path="/verify-email"  element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/account" element={
        <RoleRoute allowed={['user']}>
          <AccountLayout activeSeason={activeSeason}  />
        </RoleRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={
          <UserDashboard />
        } />
        <Route path="rezervacije" element={<UserReservations />} />
        <Route path="skipass"   element={<UserSkiPass />} />
        <Route path="podesavanja"    element={<UserSettings />} /> 
      </Route>

      <Route path="/partner" element={
        <RoleRoute allowed={['company']}>
          <PartnerLayout activeSeason={activeSeason} />
        </RoleRoute>
      }>
        <Route index element={<Navigate to="analitika" replace />} />
        <Route path="analitika"   element={<PartnerAnalitika/>} />
        <Route path="rezervacije" element={<PartnerRezervacije />} />
        <Route path="usluge"      element={<PartnerUsluge />} />
        <Route path="podesavanja" element={<PartnerSettings />} />
        <Route path="register"    element={<RegisterPartner activeSeason={'summer'} />} />
        <Route path="smestaj"    element={<PartnerSmestaj />} />
        <Route path="meni"    element={<PartnerMeni />} />
        <Route path="inventar"    element={<PartnerInventar/>} />
      </Route> 
 
        <Route path="/admin" element={
          <RoleRoute allowed={['admin']}>
            <AdminLayout activeSeason={activeSeason} />
          </RoleRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="partneri"  element={<AdminPartners />} />
          <Route path="korisnici"     element={<AdminUsers />} />
          <Route path="podesavanja"  element={<AdminSettings />} />
        </Route>



     <Route path="/reporter" element={
  <RoleRoute allowed={['reporter']}>
    <AdminLayout activeSeason={activeSeason} />
  </RoleRoute>
}>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<ReporterDashboard />} />
  <Route path="vesti" element={<ReporterNews />} />
  <Route path="vestisredjivanje" element={<ReporterEditNews />} />
  <Route path="vestisredjivanje/:id/edit" element={<ReporterEditNews />} />
  <Route path="kategorije" element={<ReporterCategories />} />
</Route>

<Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}