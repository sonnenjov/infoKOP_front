import { NavLink } from "react-router-dom"
import logo_summer from '../branding/images/logos/2Asset 1.png'
import logo_winter from '../branding/images/logos/2Asset 2.png'
import '../styles/footer.css'
import { SeasonToggle } from "./SeasonToggle"
import { Season } from "../hooks/useSeason"

interface Props {
  activeSeason: Season
  onSwitch: (season: Season) => void;
}

export default function Footer({ activeSeason, onSwitch }: Props) {
  return (
    <footer className="footer">
      <div className="logoDiv">
        <div className="logo">
          <img src={activeSeason === "summer" ? logo_summer : logo_winter} alt="" />
        </div>
        <div className="tekst">
          <p className="logo_p">Vaš prozor u svet Kopaonika. Sve informacije na jednom mestu od 2026. godine. </p>
        </div>
      </div>
      <div className="infoDiv">
        <h4>INFO</h4>
        <ul className="info_ul">
        <NavLink className="info_li_element" to="/contact">Kontakt</NavLink>
        </ul>
      </div>
      <div className="linkDiv">
        <h4>LINKOVI</h4>
        <ul className="link_ul">
        <NavLink className="link_li_element" target="_blank" to="https://www.skijalistasrbije.rs/sr">Skijališta Srbije</NavLink>
        <NavLink className="link_li_element" target="_blank" to="https://www.gss.rs/">GSS</NavLink>
        <NavLink className="link_li_element" target="_blank" to="https://raskaturizam.rs/">Turistička Org</NavLink>
        <NavLink className="link_li_element" target="_blank" to="https://kopinfo.kopaonik.rs/prevoz-autobusom/">Red Vožnje</NavLink>
        </ul>
      </div>
      
        <p className="copyright">© 2026 infoKOP Mountain Resort. Sva prava zadržana.</p>
    </footer>
  )
}