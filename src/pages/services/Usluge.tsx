import { Season } from "../../hooks/useSeason"
import "../styles/usluge.css"

import { useTranslation } from 'react-i18next'

interface Props { activeSeason: Season }

const mainServices = [
  {
    id: 1,
    icon: "downhill_skiing",
    titleKey: "usluge.ski_school_title",
    descKey: "usluge.ski_school_desc",
    tag: "SKI ŠKOLA",
    cta: "usluge.cta_reserve",
    highlight: true,
    details: ["Grupni i individualni časovi", "Za sve uzraste", "Iznajmljivanje opreme"],
  },
  {
    id: 2,
    icon: "medical_services",
    titleKey: "usluge.medical_title",
    descKey: "usluge.medical_desc",
    tag: "MEDICINSKA POMOĆ",
    cta: "usluge.cta_info",
    highlight: true,
    details: ["24/7 dežurna služba", "Hitna sanitetska pomoć", "Planinska reševačka služba"],
  },
  {
    id: 3,
    icon: "local_taxi",
    titleKey: "usluge.transfer_title",
    descKey: "usluge.transfer_desc",
    tag: "TRANSFER",
    cta: "usluge.cta_book",
    highlight: false,
    details: ["Beograd–Kopaonik", "Niš–Kopaonik", "Po dogovoru"],
  },
  {
    id: 4,
    icon: "inventory_2",
    titleKey: "usluge.equipment_title",
    descKey: "usluge.equipment_desc",
    tag: "IZNAJMLJIVANJE OPREME",
    cta: "usluge.cta_reserve",
    highlight: false,
    details: ["Skije i snowboard", "Kacige i zaštita", "Kompletni paketi"],
  },
  {
    id: 5,
    icon: "local_parking",
    titleKey: "usluge.parking_title",
    descKey: "usluge.parking_desc",
    tag: "PARKING",
    cta: "usluge.cta_info",
    highlight: false,
    details: ["VIP parking uz ski pass", "P1, P2, P3 zone", "Čuvan parking 24h"],
  },
  {
    id: 6,
    icon: "wifi",
    titleKey: "usluge.wifi_title",
    descKey: "usluge.wifi_desc",
    tag: "INTERNET",
    cta: "usluge.cta_info",
    highlight: false,
    details: ["Besplatan WiFi u centru", "Pokrivenost staza", "Hotspot mreža"],
  },
]


export default function Usluge({ activeSeason }: Props) {
const { t } = useTranslation()

  return (
    <main className={`usluge ${activeSeason}`}>
      <div className="usluge-hero">
        <div className="usluge-hero-overlay" />
        <div className="usluge-hero-content">
          <p className="label-caps usluge-hero-label">{t("usluge.hero_label")}</p>
          <h1 className="usluge-hero-title">{t("usluge.hero_title")}</h1>
          <p className="usluge-hero-desc">{t("usluge.hero_desc")}</p>
        </div>
      </div>

     
      <div className="usluge-services-section">
        <div className="usluge-section-header">
          <p className="label-caps usluge-section-label">{t("usluge.services_label")}</p>
          <h2 className="usluge-section-title">{t("usluge.services_title")}</h2>
        </div>

        <div className="usluge-services-grid">
          {mainServices.map(s => (
            <div
              key={s.id}
              className={`usluge-service-card ${s.highlight ? "usluge-service-card--highlight" : ""}`}
            >
              <div className="usluge-service-top">
                <div className={`usluge-service-icon-wrap ${s.highlight ? "usluge-service-icon-wrap--highlight" : ""}`}>
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <span className="chip-open usluge-service-tag" style={{ fontSize: "9px" }}>{s.tag}</span>
              </div>

              <h3 className="usluge-service-title">{t(s.titleKey)}</h3>
              <p className="usluge-service-desc">{t(s.descKey)}</p>

              <ul className="usluge-service-details">
                {s.details.map((d, i) => (
                  <li key={i} className="usluge-service-detail">
                    <span className="material-symbols-outlined usluge-check-icon">check_circle</span>
                    {d}
                  </li>
                ))}
              </ul>

              <button className={s.highlight ? "btn-primary usluge-cta" : "btn-ghost usluge-cta"}>
                {t(s.cta)}
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Emergency contact banner ── */}
      <div className="usluge-emergency">
        <div className="usluge-emergency-icon">
          <span className="material-symbols-outlined">emergency</span>
        </div>
        <div className="usluge-emergency-text">
          <h3>{t("usluge.emergency_title")}</h3>
          <p>{t("usluge.emergency_desc")}</p>
        </div>
        <div className="usluge-emergency-contacts">
          <a href="tel:+38136547000" className="usluge-emergency-number">
            <span className="material-symbols-outlined">phone</span>
            +381 36 547 000
          </a>
          <a href="tel:194" className="usluge-emergency-number usluge-emergency-number--alt">
            <span className="material-symbols-outlined">emergency_home</span>
            194 — Reševanje
          </a>
        </div>
      </div>

    </main>
  )
}
