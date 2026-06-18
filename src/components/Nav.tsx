import { NavLink } from "react-router-dom"
import logo_summer from '../branding/images/logos/2Asset 1.png'
import logo_winter from '../branding/images/logos/2Asset 2.png'
import aboutIcon from '../assets/nav_icons/info.png'
import homeIcon from '../assets/nav_icons/home.png'
import activeIcon from '../assets/nav_icons/snowboarding.png'
import bedIcon from '../assets/nav_icons/bed-empty.png'
import foodIcon from '../assets/nav_icons/utensils.png'
import serviceIcon from '../assets/nav_icons/layout-fluid.png'
import eventIcon from '../assets/nav_icons/calendar-days.png'
import profileIcon from '../assets/nav_icons/user.png'
import newsIcon from '../assets/nav_icons/81460.png'
import '../styles/nav.css'
import { SeasonToggle } from "./SeasonToggle"
import { Season } from "../hooks/useSeason"
import { createPortal } from "react-dom"
import { useMediaQuery } from "../hooks/useMediaQueries"
import Icon_image from "./Icon_image"
import {useAuth} from "../hooks/useAuth"

const staticLinks = [
  { to: "/", label: "POČETNA", icon: homeIcon },
  { to: "/okopaoniku", label: "O KOPAONIKU", icon: aboutIcon },
  { to: "/aktivnosti", label: "AKTIVNOSTI", icon: activeIcon },
  { to: "/smestaj", label: "SMEŠTAJ", icon: bedIcon },
  { to: "/ugostitelji", label: "UGOSTITELJI", icon: foodIcon },
  { to: "/dogadjaji", label: "DOGAĐAJI", icon: eventIcon },
  { to: "/vesti", label: "VESTI", icon: newsIcon },
]

interface NavLinksProps {
  activeSeason: Season
  links: typeof staticLinks
}

const NavLinks = ({ activeSeason, links }: NavLinksProps) => {
  const isDesktop = useMediaQuery("(min-width: 1290px)")
  const { user } = useAuth()
  
  const profileLink = !user
    ? '/account/login'
    : user.role === 'company'
    ? '/partner/analitika'
    : user.role === 'admin'
    ? '/admin/dashboard'
    : '/account/dashboard'

  const allLinks = [...links, { to: profileLink, label: "PROFIL", icon: profileIcon }]

  return (
    <ul className={`main_nav_template_ul ${activeSeason}`}>
      {allLinks.map(({ to, label, icon }) => (
        <NavLink key={to} className="nav_link_template_li" to={to}>
          {({ isActive }) => isDesktop
            ? label
            : <Icon_image icon={icon} active={isActive} activeSeason={activeSeason} />
          }
        </NavLink>
      ))}
    </ul>
  )
}

interface Props {
  activeSeason: Season
  onSwitch: (season: Season) => void;
}

export default function Nav({ activeSeason, onSwitch }: Props) {
  return (
    <>
      <nav className="main_nav_all_template">
        <div className="navLogoDiv">
          <img className="navLogo" src={activeSeason === "summer" ? logo_summer : logo_winter} alt="Logo" />
        </div>
        <NavLinks activeSeason={activeSeason} links={staticLinks} />
        <div className="leto-zima">
          <SeasonToggle activeSeason={activeSeason} onSwitch={onSwitch} />
        </div>
      </nav>
      {createPortal(<NavLinks activeSeason={activeSeason} links={staticLinks} />, document.body)}
    </>
  )
}