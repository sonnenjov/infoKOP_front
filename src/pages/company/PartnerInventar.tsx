
import { useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Season } from "../../hooks/useSeason"
import "../../styles/partner/inventar_partner.css"

interface OutletContext {
  companyAcc: {
    company_name: string
    address?: string
    email?: string
    role?: string
    phone?: string
    type?: string
    pib: string
  }
  activeSeason: Season
}

const DAYS = ["PON", "UTO", "SRE", "ČET", "PET", "SUB", "NED"]

const CALENDAR_DATA: Record<number, { status: "available" | "limited" | "sold" | "closed"; rooms: number; ski: number; act: number }> = {
  1:  { status: "available", rooms: 40, ski: 22, act: 18 },
  2:  { status: "available", rooms: 38, ski: 20, act: 15 },
  3:  { status: "available", rooms: 35, ski: 18, act: 14 },
  4:  { status: "available", rooms: 37, ski: 21, act: 16 },
  5:  { status: "available", rooms: 30, ski: 15, act: 12 },
  6:  { status: "available", rooms: 42, ski: 24, act: 19 },
  7:  { status: "available", rooms: 40, ski: 23, act: 17 },
  8:  { status: "available", rooms: 36, ski: 19, act: 14 },
  9:  { status: "available", rooms: 34, ski: 18, act: 13 },
  10: { status: "available", rooms: 38, ski: 20, act: 16 },
  11: { status: "limited",   rooms: 12, ski: 8,  act: 5  },
  12: { status: "available", rooms: 28, ski: 14, act: 11 },
  13: { status: "available", rooms: 33, ski: 17, act: 13 },
  14: { status: "sold",      rooms: 0,  ski: 0,  act: 0  },
  15: { status: "sold",      rooms: 0,  ski: 0,  act: 0  },
  16: { status: "sold",      rooms: 0,  ski: 2,  act: 1  },
  17: { status: "available", rooms: 25, ski: 12, act: 10 },
  18: { status: "limited",   rooms: 8,  ski: 5,  act: 3  },
  19: { status: "available", rooms: 32, ski: 16, act: 12 },
  20: { status: "sold",      rooms: 0,  ski: 0,  act: 0  },
  21: { status: "sold",      rooms: 0,  ski: 0,  act: 0  },
  22: { status: "available", rooms: 29, ski: 15, act: 11 },
  23: { status: "available", rooms: 35, ski: 18, act: 14 },
  24: { status: "available", rooms: 38, ski: 20, act: 16 },
  25: { status: "limited",   rooms: 10, ski: 6,  act: 4  },
  26: { status: "available", rooms: 31, ski: 16, act: 12 },
  27: { status: "available", rooms: 36, ski: 19, act: 15 },
  28: { status: "available", rooms: 40, ski: 22, act: 18 },
}

const LOGS = [
  { icon: "check_circle", color: "var(--weather-inactive-summer)", text: "Dostupnost postavljena na Rasprodato za Feb 14–16.", time: "SISTEM AUTO • 2h ago" },
  { icon: "person", color: "#60a5fa", text: "Marko N. ažurirao +5 mesta za ski opremu.", time: "KORISNIK AKCIJA • 1h ago" },
  { icon: "sync", color: "#a78bfa", text: "Bulk sinhronizacija sa Channel Managerom završena.", time: "SISTEM AUTO • 45min ago" },
]

const STATUS_BARS = [
  { label: "Standardne Ski Setas", current: 140, total: 200, color: "var(--weather-inactive-summer)" },
  { label: "Snowboards (Svi Nivoi)", current: 12, total: 80, color: "#facc15" },
]

const BOOKING_BARS = [
  { label: "Premium Suites", current: 5, total: 8, color: "var(--weather-inactive-summer)" },
  { label: "Standard Double", current: 38, total: 45, color: "var(--weather-inactive-summer)" },
]

const statusLabel: Record<string, string> = {
  available: "DOSTUPNO",
  limited: "OGRANIČENO",
  sold: "RASPRODATO",
  closed: "ZATVORENO",
}

type DayStatus = "available" | "limited" | "sold" | "closed"

export default function PartnerInventar() {
  const { companyAcc } = useOutletContext<OutletContext>()
  const [month, setMonth] = useState(0) // 0 = Feb, 1 = Mar
  const [myStatus, setMyStatus] = useState<DayStatus>("open" as any)
  const [serviceType, setServiceType] = useState("Sve Usluge")
  const [capacity, setCapacity] = useState(10)
  const [updateMsg, setUpdateMsg] = useState("")

  const monthName = month === 0 ? "Feb 2026" : "Mar 2026"
  const offset = 2 // Feb 1 starts on Wednesday (index 2)

  const handleApply = () => {
    setUpdateMsg("Promene primenjene!")
    setTimeout(() => setUpdateMsg(""), 2500)
  }

  return (
    <main className="inventar_partner">
      <div className="titlepart">
        <div className="leftpart">
          <h1>Inventory Management</h1>
          <p>
            Monitor and adjust your resort's seasonal capacity. Keep your availability accurate to maximize booking efficiency.
          </p>
        </div>
        <div className="rightpart">
          <button className="exportreport">
            EXPORT REPORT
          </button>
        </div>
      </div>
      <div className="inv_alert">
        <span className="material-symbols-outlined">warning</span>
        <span><strong>Kritično niska zaliha opreme!</strong> Ski Setas nivo 2 i 3 ispod 10% za vikend Feb 14–16.</span>
        <button className="inv_alert_link">Pogledaj Detalje</button>
      </div>

      <div className="inv_titlerow">
        <div>
          <h1>Upravljanje Inventarom</h1>
          <p>Pratite i podešavajte sezonski kapacitet. Održavajte tačnu dostupnost.</p>
        </div>
        <div className="inv_title_btns">
          <button className="inv_btn_outline">
            <span className="material-symbols-outlined">download</span>
            Izvoz izveštaja
          </button>
          <button className="inv_btn_green">
            <span className="material-symbols-outlined">bolt</span>
            Bulk Akcije
          </button>
        </div>
      </div>
      <div className="inv_grid">
        <div className="inv_card inv_calendar" style={{ gridArea: "cal" }}>
          <div className="inv_card_header">
            <span>Kalendar Dostupnosti</span>
            <div className="inv_month_nav">
              <button onClick={() => setMonth(m => Math.max(0, m - 1))}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span>{monthName}</span>
              <button onClick={() => setMonth(m => Math.min(1, m + 1))}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="inv_cal_legend">
            {(["available","limited","sold"] as DayStatus[]).map(s => (
              <span key={s} className={`inv_legend_dot inv_dot_${s}`}>{statusLabel[s]}</span>
            ))}
          </div>

          <div className="inv_cal_days_header">
            {DAYS.map(d => <span key={d}>{d}</span>)}
          </div>

          <div className="inv_cal_grid">
            {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} />)}
            {Object.entries(CALENDAR_DATA).map(([day, data]) => (
              <div key={day} className={`inv_cal_cell inv_cal_${data.status}`}>
                <div className="inv_cal_cell_top">
                  <span className={`inv_cal_badge inv_badge_${data.status}`}>{statusLabel[data.status]}</span>
                  <span className="inv_cal_daynum">{day}</span>
                </div>
                <div className="inv_cal_cell_stats">
                  <span>Sobe: {data.rooms}</span>
                  <span>Ski: {data.ski}</span>
                  <span>Akt: {data.act}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="inv_card inv_quickupdate" style={{ gridArea: "quick" }}>
          <div className="inv_card_header">
            <span className="material-symbols-outlined">calendar_month</span>
            <span>Brzo Ažuriranje</span>
          </div>
          <div className="inv_form">
            <label>Datumski Opseg</label>
            <input type="text" defaultValue="Feb 14, 2026 – Feb 16, 2026" className="inv_input" />

            <label>Tip Usluge</label>
            <select className="inv_input" value={serviceType} onChange={e => setServiceType(e.target.value)}>
              <option>Sve Usluge</option>
              <option>Sobe</option>
              <option>Ski Oprema</option>
              <option>Aktivnosti</option>
            </select>

            <label>Moj Status</label>
            <div className="inv_status_btns">
              {(["open","limited","closed"] as any[]).map(s => (
                <button
                  key={s}
                  className={`inv_status_btn inv_status_${s}${myStatus === s ? " active" : ""}`}
                  onClick={() => setMyStatus(s)}
                >
                  {s === "open" ? "OTVORENO" : s === "limited" ? "OGRANIČENO" : "ZATVORENO"}
                </button>
              ))}
            </div>

            <label>Kapacitet Kapaciteta</label>
            <div className="inv_capacity_row">
              <input
                type="number"
                className="inv_input inv_capacity_input"
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
              />
              <span className="inv_capacity_unit">Jedinica</span>
            </div>

            {updateMsg && <p className="inv_success_msg">{updateMsg}</p>}

            <button className="inv_btn_apply" onClick={handleApply}>
              Primeni Promene
            </button>
          </div>
        </div>

        {/* LOGS */}
        <div className="inv_card inv_logs" style={{ gridArea: "logs" }}>
          <div className="inv_card_header">
            <span>Evidencija Inventara</span>
          </div>
          <div className="inv_log_list">
            {LOGS.map((log, i) => (
              <div key={i} className="inv_log_item">
                <span className="material-symbols-outlined inv_log_icon" style={{ color: log.color }}>{log.icon}</span>
                <div>
                  <p className="inv_log_text">{log.text}</p>
                  <p className="inv_log_time">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="inv_link_btn">Prikaži Sve Evidencije</button>
        </div>

        {/* STATUS BARS */}
        <div className="inv_card inv_statusbars" style={{ gridArea: "status" }}>
          <div className="inv_card_header">
            <span>Status Opreme za Iznajmljivanje</span>
          </div>
          {STATUS_BARS.map((bar, i) => (
            <div key={i} className="inv_bar_item">
              <div className="inv_bar_label_row">
                <span>{bar.label}</span>
                <span>{bar.current}/{bar.total}</span>
              </div>
              <div className="inv_bar_track">
                <div className="inv_bar_fill" style={{ width: `${(bar.current / bar.total) * 100}%`, background: bar.color }} />
              </div>
            </div>
          ))}

          <div className="inv_card_header" style={{ marginTop: "1.2rem" }}>
            <span>Dostupnost Smeštaja</span>
          </div>
          {BOOKING_BARS.map((bar, i) => (
            <div key={i} className="inv_bar_item">
              <div className="inv_bar_label_row">
                <span>{bar.label}</span>
                <span>{bar.current}/{bar.total}</span>
              </div>
              <div className="inv_bar_track">
                <div className="inv_bar_fill" style={{ width: `${(bar.current / bar.total) * 100}%`, background: bar.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="inv_card inv_storm" style={{ gridArea: "storm" }}>
          <div className="inv_storm_header">
            <span className="material-symbols-outlined">ac_unit</span>
            <span>Upozorenje na Oluju</span>
            <span className="material-symbols-outlined inv_storm_icon">severe_cold</span>
          </div>
          <p className="inv_storm_title">Predviđena Jaka Snežna Oluja</p>
          <p className="inv_storm_desc">
            Feb 15–17: očekuje se 40cm+ svežeg snega. Može doći do povećane potražnje i potencijalnih zatvaranja puteva.
          </p>
          <button className="inv_btn_green inv_storm_btn">
            <span className="material-symbols-outlined">groups</span>
            Povećaj Osoblje
          </button>
        </div>

      </div>
    </main>
  )
}