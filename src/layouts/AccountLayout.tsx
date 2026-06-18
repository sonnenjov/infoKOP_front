import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useTranslation } from "react-i18next"
import { Season } from "../hooks/useSeason"
import "../styles/account-layout.css"
import { useEffect, useState } from "react"
import { apiReq } from "../hooks/api"
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

type UserAcc = {
  first_name?: string
  last_name?: string
  email?: string
  role?: string
  phone?: string
  avatar_url?: string
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
      <span className="material-symbols-outlined mobile-nav-label">logout</span>
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
  const [userAcc, setUserAcc] = useState<UserAcc>({})
  const isDesktop = useMediaQuery("(min-width: 900px)")

  const handleLogout = () => {
    logout()
    navigate("/account/login")
  }

  // 🔹 Refresh user profile from server
  const refreshUser = async () => {
    try {
      const response = await apiReq.get('/users/me/')
      setUserAcc(response.data)
      // Optionally update localStorage cache for avatar
      if (response.data.avatar_url) {
        localStorage.setItem('user_avatar', response.data.avatar_url)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  // Fetch user on initial mount
  useEffect(() => {
    refreshUser()
  }, [])

  // Scroll hide/show for mobile logo
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
                {userAcc?.avatar_url ? (
                  <img
                    src={userAcc.avatar_url}
                    alt="Avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                    }}
                  />
                ) : (
                  userAcc?.first_name?.[0]?.toUpperCase() ?? "U"
                )}
              </div>
              <div>
                <p className="sidebar-user-name">
                  {userAcc?.first_name && userAcc?.last_name
                    ? `${userAcc.first_name} ${userAcc.last_name}`
                    : "Korisnik"}
                </p>
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
                  <span className="material-symbols-outlined sidebar-link-icon">
                    {icon}
                  </span>
                  <span>{t(labelKey)}</span>
                </NavLink>
              ))}
            </nav>

            <div className="sidebar-footer">
              <button className="sidebar-logout" onClick={handleLogout}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  logout
                </span>
              </button>
            </div>
          </aside>

          <main className="account-main">
            <Outlet context={{ userAcc, activeSeason, refreshUser }} />
          </main>
        </div>
      ) : (
        <div className="mobile-account-shell">
          <div className={`toplogo ${!showLogo ? 'hide' : ''}`}>
            <div className="inner" />
            <img src={logo} alt="" />
          </div>
          <main className="mobile-account-main">
            <Outlet context={{ userAcc, activeSeason, refreshUser }} />
          </main>
          <MobileBottomNav handleLogout={handleLogout} />
        </div>
      )}
    </>
  )
}