import { useEffect, useState } from "react"
import { apiReq } from "../../hooks/api"
import { useNavigate } from "react-router-dom"
import "../../styles/user/reservations_user.css"

interface Reservation {
  id: number
  source: string
  service_name: string
  company_name: string
  date_from: string | null
  date_to: string | null
  status: string
  amount: string | null
  guests: number | null
  notes: string
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Potvrđeno",  color: "#76b817" },
  pending:   { label: "Na čekanju", color: "#facc15" },
  cancelled: { label: "Otkazano",   color: "#f87171" },
  completed: { label: "Završeno",   color: "#94a3b8" },
  checkedin: { label: "Check-in",   color: "#60a5fa" },
}

const SOURCE_META: Record<string, { icon: string; label: string }> = {
  smestaj:     { icon: "hotel",           label: "Smeštaj" },
  aktivnost:   { icon: "downhill_skiing", label: "Aktivnost" },
  dogadjaj:    { icon: "event",           label: "Događaj" },
  ugostitelj:  { icon: "restaurant",      label: "Ugostitelj" },
  ugostitelji: { icon: "restaurant",      label: "Ugostitelj" },
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  const [, m, d] = iso.split("-")
  const months = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Avg","Sep","Okt","Nov","Dec"]
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`
}

function formatFullDate(iso: string | null) {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  const months = ["Januar","Februar","Mart","April","Maj","Jun","Jul","Avgust","Septembar","Oktobar","Novembar","Decembar"]
  return `${parseInt(d)}. ${months[parseInt(m) - 1]} ${y}.`
}

export default function UserReservations() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  useEffect(() => {
    apiReq.get('/rezervacije/reservations/')
      .then(res => {
        const data = res.data
        const list: any[] = Array.isArray(data) ? data : data.results ?? []

        const all: Reservation[] = list.map(r => ({
          id: r.id,
          source: r.service_type ?? '',
          service_name: r.service_name ?? '',
          company_name: r.company_name ?? '',
          date_from: r.date_from ?? null,
          date_to: r.date_to ?? null,
          status: r.status ?? 'pending',
          amount: r.amount ?? null,
          guests: r.guests ?? null,
          notes: r.notes ?? '',
        }))

        all.sort((a, b) => {
          if (!a.date_from && !b.date_from) return 0
          if (!a.date_from) return 1
          if (!b.date_from) return -1
          return b.date_from.localeCompare(a.date_from)
        })

        setReservations(all)
      })
      .catch(err => {
        if (err.response?.status === 401) navigate('/account/login')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowDetailModal(true)
  }

  const handleCancelReservation = async () => {
  if (!selectedReservation) return

  const reservationId = selectedReservation.id
  const reservationSource = selectedReservation.source

  setCancelling(true)
  setConfirmingCancel(false)
  try {
    await apiReq.patch(`/rezervacije/reservations/${reservationId}/update_status/`, {
      status: 'cancelled'
    })
    setReservations(prev => prev.map(r =>
      r.id === reservationId && r.source === reservationSource
        ? { ...r, status: "cancelled" }
        : r
    ))
    setSelectedReservation(prev => prev ? { ...prev, status: "cancelled" } : null)
  } catch (error: any) {
    console.error("Error cancelling reservation:", error)
    alert(`Greška pri otkazivanju: ${error.response?.data?.error || error.message}`)
  } finally {
    setCancelling(false)
  }
}

  const BOOKING_TYPES = [
    { key: "smestaj",    icon: "hotel",           label: "Smeštaj",    description: "Hoteli, apartmani, vile",              path: "/smestaj" },
    { key: "dogadjaji",  icon: "event",            label: "Događaji",   description: "Koncerti, festivali, manifestacije",   path: "/dogadjaji" },
    { key: "aktivnosti", icon: "downhill_skiing",  label: "Aktivnosti", description: "Ski škole, ture, sport",               path: "/aktivnosti" },
    { key: "ugostitelji",icon: "restaurant",       label: "Ugostitelji",description: "Restorani, kafici",                    path: "/ugostitelji" },
  ]

  return (
    <>
      <div className="main_reservations">
        <div style={{ gridArea: "box-1" }} className="box_reservations firstres">
          <h1>Moje Rezervacije</h1>
          <p>Upravljajte svojim planinskim avanturama i smeštajem</p>
        </div>
        <div style={{ gridArea: "box-3" }} className="box_reservations thrdres">
          <h6>ISTORIJA AKTIVNOSTI</h6>
          <hr className="rezervacije" />
          <div className="history_activity_user">
            {loading && (
              <div className="newres">
                <span className="material-symbols-outlined" style={{ color: "var(--weather-inactive-summer)" }}>hourglass_top</span>
              </div>
            )}

            {!loading && reservations.length === 0 && (
              <div className="newres" onClick={() => setShowModal(true)} style={{ cursor: "pointer" }}>
                <span className="material-symbols-outlined">add</span>
                <h1>Nova Rezervacija</h1>
                <p>istraži ponudu</p>
              </div>
            )}

            {!loading && reservations.map(r => {
              const s = STATUS_META[r.status] ?? { label: r.status, color: "#888" }
              const src = SOURCE_META[r.source] ?? { icon: "calendar_today", label: r.source }
              return (
                <div
                  key={`${r.source}-${r.id}`}
                  className="history_item_user"
                  onClick={() => handleReservationClick(r)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="history_item_left">
                    <span className="history_service">
                      <span className="material-symbols-outlined" style={{ fontSize: "14px", verticalAlign: "middle", marginRight: "4px", color: "var(--color-text-secondary)" }}>
                        {src.icon}
                      </span>
                      {r.service_name}
                    </span>
                    <span className="history_company">{r.company_name}</span>
                    <span className="history_date">
                      {formatDate(r.date_from)}{r.date_to ? ` – ${formatDate(r.date_to)}` : ""}
                    </span>
                  </div>
                  <div className="history_item_right">
                    <span className="history_amount">
                      {r.amount ? `${Number(r.amount).toLocaleString("sr-RS")} RSD` : (r.guests ? `${r.guests} ${r.source === "dogadjaj" ? "karte" : "osoba"}` : "—")}
                    </span>
                    <span className="history_badge" style={{ background: `${s.color}22`, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                </div>
              )
            })}

            {!loading && reservations.length > 0 && (
              <button
                onClick={() => setShowModal(true)}
                className="newres_btn"
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  marginTop: "12px", padding: "10px 16px",
                  background: "transparent", border: "1px dashed var(--color-border-secondary)",
                  borderRadius: "8px", cursor: "pointer", width: "100%",
                  color: "var(--color-text-secondary)", fontSize: "14px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                Nova rezervacija
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "linear-gradient(145deg, #1a2e0f 0%, #0f1f08 100%)",
              borderRadius: "20px",
              padding: "28px",
              width: "min(420px, 90vw)",
              border: "1px solid rgba(115, 185, 30, 0.25)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(115,185,30,0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "white", fontFamily: "Jakarta Bold" }}>
                Nova rezervacija
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", cursor: "pointer", padding: "4px 6px",
                  display: "flex", alignItems: "center",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>close</span>
              </button>
            </div>
            <p style={{ margin: "0 0 22px", fontSize: "13px", color: "rgba(255,255,255,0.4)", fontFamily: "JetBrain Mono", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Izaberi tip ponude
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {BOOKING_TYPES.map(type => (
                <button
                  key={type.key}
                  onClick={() => { setShowModal(false); navigate(type.path) }}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(115, 185, 30, 0.15)",
                    borderRadius: "12px", cursor: "pointer",
                    textAlign: "left", width: "100%",
                    transition: "background 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(115,185,30,0.1)"
                    e.currentTarget.style.borderColor = "rgba(115,185,30,0.5)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)"
                    e.currentTarget.style.borderColor = "rgba(115,185,30,0.15)"
                  }}
                >
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: "rgba(115,185,30,0.12)",
                    border: "1px solid rgba(115,185,30,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "var(--weather-inactive-summer, #76b817)" }}>
                      {type.icon}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "white", fontFamily: "Jakarta Bold" }}>{type.label}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px", fontFamily: "JakartaReg" }}>{type.description}</div>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "rgba(115,185,30,0.5)" }}>chevron_right</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedReservation && (
        <div
          onClick={() => { if (!cancelling) setShowDetailModal(false) }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "linear-gradient(145deg, #1a2e0f 0%, #0f1f08 100%)",
              borderRadius: "20px",
              padding: "32px",
              width: "min(520px, 90vw)",
              maxHeight: "80vh",
              overflow: "auto",
              border: "1px solid rgba(115, 185, 30, 0.25)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(115,185,30,0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--weather-inactive-summer, #76b817)", fontSize: "24px" }}>
                    {SOURCE_META[selectedReservation.source]?.icon ?? "calendar_today"}
                  </span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontFamily: "JetBrain Mono", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {SOURCE_META[selectedReservation.source]?.label ?? selectedReservation.source}
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "white", fontFamily: "Jakarta Bold" }}>
                  {selectedReservation.service_name}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "rgba(255,255,255,0.5)", fontFamily: "JakartaReg" }}>
                  {selectedReservation.company_name}
                </p>
              </div>
              <button
                onClick={() => { if (!cancelling) setShowDetailModal(false) }}
                style={{
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", cursor: "pointer", padding: "4px 6px",
                  display: "flex", alignItems: "center", flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>close</span>
              </button>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
              background: "rgba(0,0,0,0.2)", borderRadius: "12px",
              padding: "16px", marginBottom: "20px"
            }}>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "JetBrain Mono", textTransform: "uppercase", letterSpacing: "0.04em" }}>Status</div>
                <div style={{ marginTop: "4px" }}>
                  <span className="history_badge" style={{
                    background: `${STATUS_META[selectedReservation.status]?.color || "#888"}22`,
                    color: STATUS_META[selectedReservation.status]?.color || "#888",
                    padding: "4px 12px", borderRadius: "20px", fontSize: "13px", display: "inline-block"
                  }}>
                    {STATUS_META[selectedReservation.status]?.label || selectedReservation.status}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "JetBrain Mono", textTransform: "uppercase", letterSpacing: "0.04em" }}>Datum</div>
                <div style={{ marginTop: "4px", fontSize: "14px", color: "white", fontFamily: "JakartaReg" }}>
                  {selectedReservation.date_from ? formatFullDate(selectedReservation.date_from) : "—"}
                  {selectedReservation.date_to && ` — ${formatFullDate(selectedReservation.date_to)}`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "JetBrain Mono", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {selectedReservation.source === "dogadjaj" ? "Broj karata" : "Broj gostiju"}
                </div>
                <div style={{ marginTop: "4px", fontSize: "14px", color: "white", fontFamily: "JakartaReg" }}>
                  {selectedReservation.guests ? `${selectedReservation.guests} ${selectedReservation.source === "dogadjaj" ? "karte" : "osoba"}` : "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "JetBrain Mono", textTransform: "uppercase", letterSpacing: "0.04em" }}>Iznos</div>
                <div style={{ marginTop: "4px", fontSize: "14px", color: "white", fontFamily: "JakartaReg" }}>
                  {selectedReservation.amount ? `${Number(selectedReservation.amount).toLocaleString("sr-RS")} RSD` : "—"}
                </div>
              </div>
            </div>

            {selectedReservation.notes && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontFamily: "JetBrain Mono", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>Napomena</div>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", fontFamily: "JakartaReg", background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: "8px" }}>
                  {selectedReservation.notes}
                </div>
              </div>
            )}

            {selectedReservation.status !== "cancelled" && selectedReservation.status !== "completed" && (
  <>
    {!confirmingCancel ? (
      <button
        onClick={() => setConfirmingCancel(true)}
        style={{
          width: "100%", padding: "12px",
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "12px", cursor: "pointer",
          color: "#ef4444", fontSize: "14px", fontWeight: 600,
          fontFamily: "Jakarta Bold", display: "flex",
          alignItems: "center", justifyContent: "center", gap: "8px",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>cancel</span>
        Otkaži rezervaciju
      </button>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: 0 }}>
          Da li ste sigurni?
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setConfirmingCancel(false)}
            style={{
              flex: 1, padding: "10px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", cursor: "pointer",
              color: "rgba(255,255,255,0.5)", fontSize: "14px",
            }}
          >
            Ne
          </button>
          <button
            onClick={handleCancelReservation}
            disabled={cancelling}
            style={{
              flex: 1, padding: "10px",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "10px", cursor: cancelling ? "not-allowed" : "pointer",
              color: "#ef4444", fontSize: "14px", fontWeight: 600,
            }}
          >
            {cancelling ? "Otkazivanje..." : "Da, otkaži"}
          </button>
        </div>
      </div>
    )}
  </>
)}
            {selectedReservation.status === "cancelled" && (
              <div style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "14px", fontFamily: "JakartaReg" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px", verticalAlign: "middle", marginRight: "6px" }}>check_circle</span>
                Ova rezervacija je otkazana
              </div>
            )}

            {selectedReservation.status === "completed" && (
              <div style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "14px", fontFamily: "JakartaReg" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px", verticalAlign: "middle", marginRight: "6px" }}>check_circle</span>
                Ova rezervacija je završena
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}