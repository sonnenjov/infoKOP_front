import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useTranslation } from "react-i18next"
import { Season } from "../hooks/useSeason"
import "../styles/admin-layout.css"
import logo from "../branding/images/logos/2Asset 1.png"
import infoKop from '../branding/images/logos/2Asset 1.png'
import { useMediaQuery } from "../hooks/useMediaQueries"
import { useEffect, useState } from "react"
const navItemsAdmin = [
  { to: "/admin/dashboard",   labelKey: "Dashboard",      icon: "grid_view"       },
  { to: "/admin/korisnici",   labelKey: "Korisnici",      icon: "group"           },
  { to: "/admin/partneri",   labelKey: "Partneri",      icon: "handshake"           },
  { to: "/admin/podesavanja", labelKey: "Podešavanja",    icon: "settings"        },
]

const navItemsReporter = [
  { to: "/reporter/dashboard",    labelKey: "dashboard",     icon: "dashboard"        },

  { to: "/reporter/vesti",    labelKey: "Vesti",     icon: "News"        },
  
  { to: "/reporter/vestisredjivanje",    labelKey: "Uredi/Objavi vest",     icon: "edit"        },
  
  { to: "/reporter/kategorije",    labelKey: "Menadzment kategorija",     icon: "category"        },
  
]


interface Props {
  activeSeason: Season
}

const MobileBottomNavReporter = ({ handleLogout }: { handleLogout: () => void }) => (
  <div className="mobile-bottom-nav">
    {navItemsReporter.map(({ to,  icon }) => (
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

const MobileBottomNavAdmin = ({ handleLogout }: { handleLogout: () => void }) => (
  <div className="mobile-bottom-nav">
    {navItemsAdmin.map(({ to, icon }) => (
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

export default function AdminLayout({ activeSeason }: Props) {
  const isDesktop = useMediaQuery("(min-width: 900px)")
  const [lastScrollY, setLastScrollY] = useState(0)
    const [showLogo, setShowLogo] = useState(true)
  useEffect(() => {
      const controlLogo = () => {
        if (window.scrollY > lastScrollY && window.scrollY > 10) {
          setShowLogo(false)
        } else {
          setShowLogo(true)
        }
        setLastScrollY(window.scrollY)
      }
      window.addEventListener('scroll', controlLogo)
      return () => window.removeEventListener('scroll', controlLogo)
    }, [lastScrollY])





  const auth = useAuth()
  const { user, logout } = auth ?? { user: undefined, logout: () => {} }
  const { t } = useTranslation()
  const admin    = user?.role === 'admin'
  const reporter = user?.role === 'reporter'
  const navigate = useNavigate()


  const handleLogout = () => {
    logout()
    navigate("/account/login")
  }

  return (
    isDesktop ? (
      <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <img src={infoKop} alt="" />
          
        </div>


      <nav className="sidebar-nav-admin">
  {admin && 
    navItemsAdmin.map(({ to, labelKey, icon }) => (
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
    ))
  }
  {reporter && 
    navItemsReporter.map(({ to, labelKey, icon }) => (
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
    ))
  }
</nav>

        <div className="sidebar-footer">
         
          
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
            {t("logout")}
          </button>
        </div>
      </aside>

      <main className="account-main">
        <Outlet context={{ activeSeason }} />
      </main>
      </div>

) : (
 <div className="admin-shell">
        <main className="account-main">
          <div  className={`toplogo ${!showLogo ? 'hide' : ''}`}>
          <div className="inner" />
            <img src={logo} alt="" />
        </div>
          <Outlet context={{ activeSeason }} />
        </main>
        {admin && <MobileBottomNavAdmin handleLogout={handleLogout} />}
        {reporter && <MobileBottomNavReporter handleLogout={handleLogout} />}
      </div>
)
  )
}