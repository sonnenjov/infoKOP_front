import "../styles/main.css"
import "../styles/okopaoniku.css"
import { Season } from "../hooks/useSeason"
import sunIcon from '../styles/icons_weather/weather-icons-master/svg/wi-day-sunny.svg'
import planina from '../assets/nav_icons/mountains.png'
import pancic from "../assets/o_kopaoniku/PancicevaOmorika_07.jpg"
import nasledje from "../assets/o_kopaoniku/Istorijat-Kopaonika-3.jpg"
import turizam from "../assets/o_kopaoniku/NP_Kopaonik_NP02_-_Nebeske_Stolice_02-1280x960.jpg"
import mis from '../assets/nav_icons/paw.png'
import voda from '../assets/nav_icons/dewpoint.png'
import pesak from '../assets/nav_icons/hiking.png'
import stiklirano from '../assets/nav_icons/check-circle.png'
import treeIcon from  '../assets/nav_icons/trees.png'
import mountain from  '../branding/images/495383880_10068310603230041_6109019548355046752_n.jpg'
interface Props {
  activeSeason: Season;
}

export default function OKopaoniku({ activeSeason }: Props) {
  return (
    <main >
       <div className={activeSeason === 'summer' ? 'hero_okopaoniku_summer' : 'hero_okopaoniku_winter'}>

      <div className={activeSeason === 'summer' ? 'block_okopaoniku_summer' : 'block_okopaoniku_winter'}>
      <div className="header_okopaoniku">
        <h1>Otkrijte Kopaonik: Najveći planinski masiv u Srbiji</h1>
        <p>Veličanstvena priroda, bogata istorija i vrhunski skijaški tereni čine Kopaonik destinacijom bez premca na Balkanu.</p>
      </div>
      <div className="gradient">

      </div>
      </div>
    </div>
    <div className={`info_cards ${activeSeason}`}>
          <div className="geografija"> 
              <p className="podnaslov">
                GEOGRAFIJA
              </p>
              <h2 className="naslov">Pančićev vrh</h2>
              <p className="tekst">
                  Najviši vrh Kopaonika sa visinom od 2.017 metara nadmorske visine, gde se nalaze ostaci mauzoleja čuvenog srpskog prirodnjaka Josifa Pančića.
              </p>
              <div className="visina">
                <p>2.017</p> metara
              </div>
          </div>
          <div className="suncani_dani">
            <div className="icon_sun">
          <img src={sunIcon} alt="" style={{width:'50px'}} />
            </div>
            <div className="tekst_dani">
              <p>200+</p>
              <p className="dani">Sunčanih dana</p>
            </div>
          </div>
          <div className="povrsina">
            <div className="icon_sun">
          <img src={treeIcon} alt="" style={{width:'40px'}} />

            </div>
            <div className="tekst_dani">
              <p>11.8k</p>
              <p className="dani">hektara nacionalnog parka</p>
            </div>
          </div>
    </div>
    <div className={`climate ${activeSeason}`}>
      <div className="left">
        <p className={`podnaslov ${activeSeason}`}>
          KLIMA I GEOLOGIJA
        </p>
        <h1 className="naslov">PLANINA SUNCA</h1>
        <p className="tekst"> Zbog svog povoljnog položaja i preko 200 sunčanih dana godišnje, Kopaonik nosi epitet "Planina sunca". Snežni pokrivač se zadržava od kraja novembra do maja, što stvara idealne uslove za zimski turizam. </p>
        <div className="temp">
          <div className="snezni">
               <div className={`line ${activeSeason}`}></div>

              <div className="info">
                <h6 className="tekstualni">snezni dani</h6>
                <p className="tekstualni">159</p>
              </div>
          </div>
          <div className={`prosecna_temp ${activeSeason}`}>
               <div className={`line ${activeSeason}`}></div>
              <div className="info">
                <h6 className="tekstualni">prosecna temp</h6>
                <p className="tekstualni">~3.4</p>
              </div>
          </div>
        </div>
      </div>
      <div className="right">
        <img src={mountain} alt="planina_sunca" className="planina_sunca" />
      </div>
    </div>
    <div className={`istorijsko_nasledje ${activeSeason}`}>
      <div className="tekstovi">
        <p className="podnaslov">ISTORIJSKO NASLEĐE</p>
        <h3 className="naslov">Od Srebrne Planine do Skijaskog Centra</h3>
        <p className="subtext">Kopaonik je bio značajan rudarski centar još u srednjem veku, a ime je dobio po "kopanju" ruda (gvožđe, olovo, cink, srebro i zlato).</p>
      </div>
      <div className="cards">
        <div className="card">
          <img className="card_image" src={nasledje} alt="" />
          <h6>Srednji vek</h6>
          <p>Zlatno doba rudarstva u državi Nemanjića, kada su ovde radili čuveni rudari Sasi. </p>
        </div>
        <div className="card">
          <img className="card_image" src={pancic} alt="" />
          <h6>Naučni rad</h6>
          <p>Josif Pančić je čitav svoj naučni rad posvetio proučavanju flore i faune ove planine.</p>
        </div>
        <div className="card">
          <img className="card_image" src={turizam} alt="" />
          <h6>Turizam</h6>
          <p>Prvi planinarski dom izgrađen je 1935. godine, čime počinje moderna era planinskog turizma.</p>
        </div>
      </div>
    </div>
    <div className={`biodiverzitet ${activeSeason}`}>
      <div className="left">
        <p className="info">
          <img src={stiklirano} className="check" alt="" />NACIONALNI PARK</p>
        <h3>Bogatstvo Biodiverziteta</h3>
        <p className="tekst">
           Proglašen za nacionalni park 1981. godine, Kopaonik je dom za preko 1.600 biljnih vrsta, od kojih su 91 endemične. Čuvena Kopaonička čuvarkuća i Pančićeva potočarka rastu samo ovde. 
        </p>
        <div className="checks">
          <h6>
          <img src={stiklirano} className="check" alt="" />
           Strogo zaštićeni rezervati prirode (Samokovska reka, Metođe) </h6>
          <h6> 
          <img src={stiklirano} className="check" alt="" />
          Preko 170 vrsta ptica uključujući surog orla </h6>
          <h6> 
          <img src={stiklirano} className="check" alt="" />  
          Jedinstvene geološke formacije i termalne vode  </h6>
        </div>
      </div>
      <div className="right">
        <div className={`izvori ${activeSeason} `}>
          <img src={voda} alt="" className="icon" />
          <h3 className="naslov">
            Termalni Izvori
          </h3>
          <h2 className="tema">
            Bansjki krug
          </h2>
        </div>
        <div className={`izvori ${activeSeason} `}>
          <img src={mis} alt="" className="icon" />
          <h3 className="naslov">
              Retke Vrste
          </h3> 
          <h2 className="tema">
            Slepo Kuče
          </h2>
        </div>
        <div className={`izvori ${activeSeason} `}>
          <img src={planina} alt="" className="icon" />
          <h3 className="naslov">
              Vrhovi
          </h3>
          <h2 className="tema">
            Bećirovac
          </h2>
        </div>
        <div className={`izvori ${activeSeason} `}>
          <img src={pesak  } alt="" className="icon" />
          <h3 className="naslov">
              Staze
          </h3>
          <h2 className="tema">
            Markirane Rute
          </h2>
        </div>
      </div>
    </div>
    </main>
  )
}