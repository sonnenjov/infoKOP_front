import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { apiReq } from "../../hooks/api"
import "../../styles/partner/reservations_partner.css"

interface OutletContext {
  companyAcc?: {
    company_name: string
    address?: string
    email?: string
    role?: string
    phone?: string
    type?: string
    pib: string
  } | null
}

interface Reservation {
  id: number
  guest: number
  guest_name: string
  guest_email: string
  company: number
  company_name: string
  service_name: string
  service_type: string
  date_from: string | null
  date_to: string | null
  guests: number
  notes: string
  status: string
  amount: string
  source: string
  created_at: string
  updated_at: string
}

const STATUS_META: Record<string, { label: string; cls: string; icon: string }> = {
  confirmed: { label: "Potvrđeno",  cls: "status_confirmed", icon: "check_circle" },
  pending:   { label: "Na čekanju", cls: "status_pending",   icon: "hourglass_top" },
  cancelled: { label: "Otkazano",   cls: "status_cancelled", icon: "cancel" },
  completed: { label: "Završeno",   cls: "status_confirmed", icon: "task_alt" },
  checkedin: { label: "Check-in",   cls: "status_confirmed", icon: "login" },
}

export default function PartnerRezervacije() {
  const context = useOutletContext<OutletContext>()
  const companyAcc = context?.companyAcc || null

  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filter, setFilter]           = useState("all")
  const [searchTerm, setSearchTerm]   = useState("")
  const [confirming, setConfirming]   = useState<number | null>(null)

  useEffect(() => { fetchReservations() }, [])

  const fetchReservations = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiReq.get('/rezervacije/reservations/')
      const data = response.data
      const list = Array.isArray(data) ? data : data.results ?? []
      setReservations(list)
    } catch (err: any) {
      console.error("Error fetching reservations:", err)
      if (err.response?.status === 403) {
        setError("Nemate dozvolu za pristup rezervacijama.")
      } else {
        setError(err.response?.data?.error || err.message || "Greška pri učitavanju rezervacija")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (id: number) => {
    setConfirming(id)
    try {
      await apiReq.patch(`/rezervacije/reservations/${id}/update_status/`, {
        status: 'confirmed'
      })
      setReservations(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'confirmed' } : r
      ))
    } catch (err: any) {
      console.error("Error confirming reservation:", err)
      alert(`Greška: ${err.response?.data?.error || err.message}`)
    } finally {
      setConfirming(null)
    }
  }

  const filteredReservations = reservations.filter(res => {
    const matchesFilter = filter === "all" || res.status === filter
    const term = searchTerm.toLowerCase()
    const matchesSearch = term === ""
      || res.guest_name?.toLowerCase().includes(term)
      || res.guest_email?.toLowerCase().includes(term)
      || res.service_name?.toLowerCase().includes(term)
      || String(res.id).includes(term)
    return matchesFilter && matchesSearch
  })

  const totalReservations = reservations.length
  const confirmedCount    = reservations.filter(r => r.status === 'confirmed').length
  const pendingCount      = reservations.filter(r => r.status === 'pending').length
  const cancelledCount    = reservations.filter(r => r.status === 'cancelled').length
  const totalRevenue      = reservations.reduce((sum, r) => sum + Number(r.amount || 0), 0)

  const getStatusBadge = (status: string) => {
    const meta = STATUS_META[status] || STATUS_META.pending
    return (
      <span className={`status-badge ${meta.cls}`}>
        <span className="material-symbols-outlined">{meta.icon}</span>
        {meta.label}
      </span>
    )
  }

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('sr-RS') : "—"

  const calcNights = (from: string | null, to: string | null) => {
    if (!from || !to) return 1
    return Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000))
  }

  if (loading) return (
    <div className="rezervacije-loading">
      <div className="loading-spinner"></div>
      <p>Učitavanje rezervacija...</p>
    </div>
  )

  if (error) return (
    <div className="rezervacije-error">
      <h3>Greška pri učitavanju</h3>
      <p>{error}</p>
      <button onClick={fetchReservations}>Pokušaj ponovo</button>
    </div>
  )

  return (
    <div className="partner-rezervacije">
      <div className="rezervacije-header">
        <h1>Rezervacije</h1>
        <p>Pregled svih rezervacija za {companyAcc?.company_name || "vašu kompaniju"}</p>
      </div>

      <div className="rezervacije-stats">
        <div className="stat-card total">
          <div className="stat-icon"><span className="material-symbols-outlined">receipt_long</span></div>
          <div className="stat-info">
            <span className="stat-label">Ukupno rezervacija</span>
            <span className="stat-value">{totalReservations}</span>
          </div>
        </div>
        <div className="stat-card confirmed">
          <div className="stat-icon"><span className="material-symbols-outlined">check_circle</span></div>
          <div className="stat-info">
            <span className="stat-label">Potvrđene</span>
            <span className="stat-value">{confirmedCount}</span>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon"><span className="material-symbols-outlined">hourglass_top</span></div>
          <div className="stat-info">
            <span className="stat-label">Na čekanju</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
        </div>
        <div className="stat-card cancelled">
          <div className="stat-icon"><span className="material-symbols-outlined">cancel</span></div>
          <div className="stat-info">
            <span className="stat-label">Otkazane</span>
            <span className="stat-value">{cancelledCount}</span>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon"><span className="material-symbols-outlined">payments</span></div>
          <div className="stat-info">
            <span className="stat-label">Ukupan prihod</span>
            <span className="stat-value">{totalRevenue.toLocaleString("sr-RS")} RSD</span>
          </div>
        </div>
      </div>

      <div className="rezervacije-filters">
        <div className="filter-tabs">
          {["all", "confirmed", "pending", "cancelled"].map(f => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {{ all: "Sve", confirmed: "Potvrđene", pending: "Na čekanju", cancelled: "Otkazane" }[f]}
            </button>
          ))}
        </div>
        <div className="search-box">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Pretraži rezervacije..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rezervacije-table-wrapper">
        {filteredReservations.length > 0 ? (
          <table className="rezervacije-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Gost</th>
                <th>Usluga</th>
                <th>Datum od</th>
                <th>Datum do</th>
                <th>Gostiju</th>
                <th>Iznos</th>
                <th>Status</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map(res => (
                <tr key={res.id}>
                  <td className="res-id">#{res.id}</td>
                  <td className="res-guest">
                    <div className="guest-info">
                      <span className="guest-name">{res.guest_name || "—"}</span>
                      <span className="guest-email">{res.guest_email || "—"}</span>
                    </div>
                  </td>
                  <td>{res.service_name || "N/A"}</td>
                  <td>{formatDate(res.date_from)}</td>
                  <td>{formatDate(res.date_to)}</td>
                  <td>{res.guests ?? 1}</td>
                  <td className="res-amount">{Number(res.amount || 0).toLocaleString("sr-RS")} RSD</td>
                  <td>{getStatusBadge(res.status)}</td>
                  <td className="res-actions">
                    <button className="action-btn view" title="Prikaži detalje">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                    {res.status === 'pending' && (
                      <button
                        className="action-btn confirm"
                        title="Potvrdi"
                        disabled={confirming === res.id}
                        onClick={() => handleConfirm(res.id)}
                      >
                        <span className="material-symbols-outlined">
                          {confirming === res.id ? "hourglass_top" : "check"}
                        </span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-reservations">
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#c1cab2' }}>event_busy</span>
            <p>Nema rezervacija</p>
            <span className="sub-text">Nema rezervacija koje odgovaraju vašim filterima</span>
          </div>
        )}
      </div>
    </div>
  )
}