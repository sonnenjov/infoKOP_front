import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { apiReq } from "../hooks/api"
import { useMediaQuery } from "../hooks/useMediaQueries"
import { useTranslation } from "react-i18next"
import "../styles/partner-layout.css"
import logo from "../branding/images/logos/2Asset 1.png"
import { useAuth } from "../hooks/useAuth"

const navItems = [
  { to: "/partner/analitika",   labelKey: "Analitika",   icon: "analytics",       roles: ['all'] },
  { to: "/partner/smestaj",     labelKey: "Smestaj",     icon: "bed",             roles: ['hotel', 'apartman'] },
  { to: "/partner/meni",        labelKey: "Meni",        icon: "restaurant_menu", roles: ['restoran', 'kafic', 'apres_ski'] },
  { to: "/partner/usluge",      labelKey: "Usluge",      icon: "apps",            roles: ['aktivnost', 'ski_skola', 'dogadjaj', 'servis_iznajmljivanje'] },
  { to: "/partner/inventar",    labelKey: "Inventar",    icon: "inventory_2",     roles: ['hotel', 'apartman', 'aktivnost', 'ski_skola', 'servis_iznajmljivanje'] },
  { to: "/partner/rezervacije", labelKey: "Rezervacije", icon: "calendar_month",  roles: ['all'] },
  { to: "/partner/podesavanja", labelKey: "Podesavanja", icon: "settings",        roles: ['all'] },
]

const MobileBottomNav = ({ handleLogout, visibleNav }: { handleLogout: () => void, visibleNav: typeof navItems }) => (
  <div className="mobile-bottom-nav">

    {visibleNav.map(({ to, labelKey, icon }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `mobile-nav-link ${isActive ? "mobile-nav-link--active" : ""}`
        }
      >
        <span className="material-symbols-outlined mobile-nav-icon">{icon}</span>
        <span className="mobile-nav-label">{labelKey}</span>
      </NavLink>
    ))}
    <button className="mobile-nav-link mobile-logout-btn" onClick={handleLogout}>
      <span className="material-symbols-outlined mobile-nav-icon">logout</span>
      <span className="mobile-nav-label">Odjava</span>
    </button>
  </div>
)

export default function PartnerLayout() {
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showLogo, setShowLogo] = useState(true)
  const [companyAcc, setCompanyAcc] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery("(min-width: 900px)")
  const auth = useAuth()
  const { user, logout } = auth ?? { user: undefined, logout: () => {} }

  const fetchCompanyProfile = async () => {
    try {
      // Try the correct endpoint for company profile
      const response = await apiReq.get('/users/company/profile/')
      console.log("Company data:", response.data)
      setCompanyAcc(response.data)
    } catch (error: any) {
      console.error("Error fetching company profile:", error)
      // Try alternative endpoint if the first one fails
      if (error.response?.status === 404) {
        try {
          const response = await apiReq.get('/users/company/my-profile/')
          console.log("Company data (alternative):", response.data)
          setCompanyAcc(response.data)
        } catch (err) {
          console.error("Error fetching company profile from alt endpoint:", err)
          setCompanyAcc(null)
        }
      } else {
        setCompanyAcc(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanyProfile()
  }, [])

  const visibleNav = loading || !companyAcc
    ? []
    : navItems.filter(item =>
        item.roles.includes('all') || 
        (companyAcc.type && item.roles.includes(companyAcc.type))
      )

  const handleLogout = () => {
    logout()
    navigate("/account/login")
  }

  useEffect(() => {
    const controlLogo = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 10) {
          setShowLogo(false)
        } else {
          setShowLogo(true)
        }
        setLastScrollY(window.scrollY)
      }
    }

    if (!isDesktop) {
      window.addEventListener('scroll', controlLogo)
      return () => window.removeEventListener('scroll', controlLogo)
    }
  }, [lastScrollY, isDesktop])

  if (loading) {
    return (
      <div className="partner-loading">
        <div className="loading-spinner"></div>
        <p>Učitavanje...</p>
      </div>
    )
  }

  if (!companyAcc) {
    return (
      <div className="partner-error">
        <h2>Nema pristupa</h2>
        <p>Niste povezani sa kompanijom.</p>
        <button onClick={() => navigate("/partner/connect")}>
          Poveži kompaniju
        </button>
      </div>
    )
  }

  return (
    <>
      {isDesktop ? (
        <div className="partner-shell">
          <aside className="partner-sidebar">
            <div className="sidebar-logo">
              <img src={logo} alt="" />
            </div>
            <div className="sidebar-logo">
  <img src={companyAcc?.logo || logo} alt={companyAcc?.company_name || ""} />
</div>
            
            <nav className="sidebar-nav">
              {visibleNav.map(({ to, labelKey, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "sidebar-link--active" : ""}`
                  }
                >
                  <span className="material-symbols-outlined sidebar-link-icon">{icon}</span>
                  <span>{t(labelKey)}</span>
                </NavLink>
              ))}
            </nav>

            <div className="sidebar-footer">
              <button className="sidebar-logout" onClick={handleLogout}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
                {t("logout")}
              </button>
            </div>
          </aside>

          <main className="partner-main">
            <Outlet context={{ companyAcc }} />
          </main>
        </div>
      ) : (
        <div className="mobile-partner-shell">
          <div className={`toplogo ${!showLogo ? 'hide' : ''}`}>
            <div className="inner" />
            <img src={logo} alt="" />
          </div>
          
          <main className="mobile-partner-main">
            <Outlet context={{ companyAcc }} />
          </main>
          
          <MobileBottomNav handleLogout={handleLogout} visibleNav={visibleNav} />
        </div>
      )}
    </>
  )
}