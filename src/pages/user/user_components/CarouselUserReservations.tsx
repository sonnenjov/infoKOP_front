import { useEffect, useRef, useState } from "react"
import { apiReq } from "../../../hooks/api"

interface Reservation {
  id: number
  service_name: string
  service_type: string
  date_from: string
  date_to: string | null
  status: string
  amount: string
  company_name: string
  guests: number
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Potvrđeno",  color: "#76b817" },
  pending:   { label: "Na čekanju", color: "#facc15" },
  cancelled: { label: "Otkazano",   color: "#f87171" },
  completed: { label: "Završeno",   color: "#94a3b8" },
  checkedin: { label: "Check-in",   color: "#60a5fa" },
}

function formatDate(iso: string) {
  if (!iso) return "—"
  const [, m, d] = iso.split("-")
  const months = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Avg","Sep","Okt","Nov","Dec"]
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`
}

export default function Carousel() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [items, setItems]   = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    apiReq.get("/reservations/")
      .then(res => {
        const upcoming = res.data.filter((r: Reservation) =>
          r.status !== "cancelled" && r.status !== "completed"
        )
        setItems(upcoming)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const prev = () => setCurrentIndex(i => Math.max(0, i - 1))
  const next = () => setCurrentIndex(i => Math.min(items.length - 1, i + 1))

  if (loading) return (
    <div className="carousel-loading">
      <span className="material-symbols-outlined" style={{ color: "var(--weather-inactive-summer)" }}>hourglass_top</span>
    </div>
  )

  if (error) return (
    <div className="carousel-empty">Greška pri učitavanju rezervacija.</div>
  )

  if (!items.length) return (
    <div className="carousel-empty">
      <span className="material-symbols-outlined" style={{ fontSize: "2rem", opacity: 0.3 }}>calendar_month</span>
      <p>Nema predstojećih rezervacija.</p>
    </div>
  )

  const item = items[currentIndex]
  const s = STATUS_META[item.status] ?? { label: item.status, color: "#888" }

  return (
    <div className="carousel-container" ref={carouselRef}>
      <div className="carousel-track">
        <div className="carousel-item">
          <div className="item-content">
            <span className="carousel-badge" style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}44` }}>
              {s.label}
            </span>

            <h3>{item.service_name}</h3>
            <p className="carousel-company">{item.company_name}</p>

            <div className="carousel-meta">
              <div className="carousel-meta-item">
                <span className="material-symbols-outlined">calendar_month</span>
                <span>{formatDate(item.date_from)}{item.date_to ? ` – ${formatDate(item.date_to)}` : ""}</span>
              </div>
              <div className="carousel-meta-item">
                <span className="material-symbols-outlined">group</span>
                <span>{item.guests} gost{item.guests === 1 ? "" : "a"}</span>
              </div>
              <div className="carousel-meta-item">
                <span className="material-symbols-outlined">payments</span>
                <span>{Number(item.amount).toLocaleString("sr-RS")} RSD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <div className="carousel-nav">
          <button onClick={prev} disabled={currentIndex === 0} className="carousel-btn">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <span className="carousel-counter">{currentIndex + 1} / {items.length}</span>
          <button onClick={next} disabled={currentIndex === items.length - 1} className="carousel-btn">
            <span className="material-symbols-outlined">arrow_forward_ios</span>
          </button>
        </div>
      )}
    </div>
  )
}