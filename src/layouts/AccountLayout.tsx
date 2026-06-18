import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useTranslation } from "react-i18next"
import { Season } from "../hooks/useSeason"
import "../styles/account-layout.css"
import { useEffect, useState } from "react"
import { apiReq } from "../hooks/api"; 
import { useMediaQuery } from "../hooks/useMediaQueries"
import logo from "../branding/images/logos/2Asset 1.png"
const navItems = [
  { to: "/account/dashboard",   labelKey: "Dashboard",     icon: "grid_view"       },
  { to: "/account/rezervacije", labelKey: "Rezervacije", icon: "bed"             },
  { to: "/account/skipass",  labelKey: "Ski Pass",   icon: "downhill_skiing" },
  { to: "/account/podesavanja",    labelKey: "Podesavanja",     icon: "settings"        },
]

interface Props {
  activeSeason: Season
}





const MobileBottomNav = ({ handleLogout }: { handleLogout: () => void }) => (
  <div className="mobile-bottom-nav">
    {navItems.map(({ to, labelKey, icon }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `mobile-nav-link ${isActive ? "mobile-nav-link--active" : ""}`
        }
      >
        <span className="material-symbols-outlined">{icon}</span>
      </NavLink>
    ))}
    <button className="mobile-nav-link mobile-logout-btn" onClick={handleLogout}>
      <span onClick={handleLogout}className="material-symbols-outlined mobile-nav-label">logout</span>
    </button>
  </div>
)

export default function AccountLayout({ activeSeason }: Props) {
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showLogo, setShowLogo] = useState(true)
  const auth = useAuth()
  const { user, logout } = auth ?? { user: undefined, logout: () => {} }
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [userAcc,setUserAcc] = useState({})
  const handleLogout = () => {
    logout()
    navigate("/account/login")
  }
  const isDesktop = useMediaQuery("(min-width: 900px)") 
 useEffect(() => {
    apiReq.get('/users/me/')
      .then((response) => {
        setUserAcc(response.data) 
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error)

      })
  }, [])



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

  window.addEventListener('scroll', controlLogo)
  return () => window.removeEventListener('scroll', controlLogo)
}, [lastScrollY])


  return (
    <>
  {isDesktop ? (
    <div className="account-shell">
      <aside className="account-sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="" />
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {userAcc?.first_name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="sidebar-user-name"> {userAcc?.first_name && userAcc?.last_name 
        ? `${userAcc.first_name} ${userAcc.last_name}` 
        : "Korisnik"}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, labelKey, icon }) => (
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

      <main className="account-main">
        <Outlet context={{ userAcc, activeSeason }} />
      </main>
    </div>)
    :
    (
        // Mobile layout - main content + bottom nav
        <div className="mobile-account-shell">
          <div  className={`toplogo ${!showLogo ? 'hide' : ''}`}>
            <div className="inner" />
            <img src={logo} alt="" />
          </div>
          <main className="mobile-account-main">
            <Outlet context={{ userAcc, activeSeason }} />
          </main>
          <MobileBottomNav handleLogout={handleLogout} />
        </div>
      )
    }
  </>
  )
}