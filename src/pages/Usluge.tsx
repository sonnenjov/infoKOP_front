import "../styles/main.css"
import "../styles/usluge.css"
import { Season } from "../hooks/useSeason"

interface Props {
  activeSeason: Season;
}

export default function Usluge({ activeSeason }: Props) {
  return (
    <main >
      <div className={activeSeason === 'summer' ? 'usluge_summer' : 'usluge_winter'}>
        <div className={activeSeason === 'summer' ? 'block_summer' : 'block_winter'}>
          <div className="header_usluge">
            <p className="podnaslov">
              ESSENTIAL GUIDE
            </p>
            <h1>
              Usluge i Informacije
            </h1>
            <p>
             Sve što vam je potrebno za bezbedan i ugodan boravak na planini, od ski škola do hitnih medicinskih službi.
            </p>
          </div>
          <div className="gradient_ugostitelji"></div>
        </div>
      </div>

      <div className="grid_usluge">
        <div 
        className={`ski_skole ${activeSeason}`}
        style={{gridArea: "box1"}}>
              <div className="ski_skole_divs usluge_divs">
                <span className="material-symbols-outlined usluge_icon">downhill_skiing</span>
                  <h1 className="ski">
                  Ski Skole i iznajmljivanje opreme
                </h1>
                <p className="ski">
                  Licencirani instruktori za sve uzraste i najmodernija oprema vodećih svetskih brendova. Rezervišite unapred i ostvarite popust.
                </p>
                <div className="button_ski">
                  <div className="prosecna_cena">

                  </div>
                  <div className="lokacije">
                      <p>prosecna cena</p>
                      35/sat
                  </div>
                </div>
                <button>Lista skola {'->'}</button>
              </div>
        </div>
        <div 
        className={`medicinska ${activeSeason}`}
        style={{gridArea: "box2"}}>
          <div className="medicinska_pomoc_divs usluge_divs">
              <span className="material-symbols-outlined usluge_icon">medical_services</span>
              <h1 className="ski">Medicinska pomoc</h1>
              <p className="ski">
                Dežurne ambulante i Gorska Služba Spasavanja (GSS) su dostupni 24/7.
                
              </p>
              
              <br />
              <br />
              <hr className="divider" />
              <p className="gss">
                hitni pozivi(gss)
              </p>
              <p className="gss_broj">
                063 466 466
              </p>
              <hr className="divider" />
              <p className="amb">
                ambulanta

              </p>
              <p className="amb_broj">
                037 471 094
              </p>
          </div>
        </div>
        <div 
        className={`prevoz ${activeSeason}`}
        style={{gridArea: "box3"}}>
             <div className="prevoz_taxi_divs usluge_divs">
                   <span className="material-symbols-outlined usluge_icon">local_taxi</span>
                   <h1 className="taxi_prevoz">
                    Prevoz i Taxi
                   </h1>
                   <p className="taxi_prevoz">
                      Lokalni taxi prevoz, transferi od/do aerodroma i redovne autobuske linije tokom cele sezone.
                   </p>
                   <div className="taxi_kop_br">
                    <span className="material-symbols-outlined">check_circle</span>
                    Taxi Kopaonik: 064 123 456
                   </div>
                    <div className="airport_transf__br">
                    <span className="material-symbols-outlined">check_circle</span>
                    Airport transfer: evro120+
                   </div>
              </div> 
        </div>
        <div 
        className={`bankomati ${activeSeason}`}
        style={{gridArea: "box4"}}>
          <div className="bankomati_menjacnice_divs usluge_divs">
            <span className="material-symbols-outlined usluge_icon">local_atm</span>
            <h1 className="bankomati_menjacnice">
                    bankomati i menjacnice
                   </h1>
                   <p className="bank_menj">
                    Većina banaka ima ispostave i bankomate u samom centru, u krugu Konaka i hotela Grand.
                   </p>
                   <div className="grid_bank">
                      <p>
                        Banka intesa
                      </p>
                      <p>
                        OTP Banka
                      </p>
                      <p>
                        AIK Banka
                      </p>
                      <p>
                        Raiffeisen
                      </p>
                      <p>
                        NLB Banka
                      </p>
                   </div>
          </div>
        </div>

          <div 
        className={`apoteka ${activeSeason}`}
        style={{gridArea: "box5"}}>
          <div className="apoteka_divs usluge_divs">
                <span className="material-symbols-outlined usluge_icon">local_pharmacy</span>
                <h1 className="apoteka_header">
                  APOTEKA
                </h1>
                <p className="apoteka_header">
                  Dobro snabdevena apoteka nalazi se u krugu Konaka Sunčani vrhovi.
                </p>
          </div>
        </div>
        <div 
        className={`parking ${activeSeason}`}
        style={{gridArea: "box6"}}>
          <div className="parking_divs usluge_divs">
                <span className="material-symbols-outlined usluge_icon">local_parking</span>
                <h1 className="parking_header">
                  PARKING I GARAZE
                </h1>
                <p className="parking_par">
                  Informacije o javnim parkinzima i modernoj višeetažnoj garaži.
                </p>
          </div>
        </div>
      </div>
    </main>
  )
}