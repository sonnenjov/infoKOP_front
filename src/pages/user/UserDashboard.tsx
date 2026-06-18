import { useOutletContext, useNavigate } from "react-router-dom"
import { Season } from "../../hooks/useSeason"
import "../../styles/user/dashboard_user.css"
import Weather_accounts from "../../layouts/Weather_accounts"
import { useState, useEffect } from "react"
import { apiReq } from "../../hooks/api"

interface OutletContext {
  userAcc: {
    first_name?: string
    last_name?: string
    email?: string
    role?: string
  }
  activeSeason: Season
}

interface SkiPass {
  id: number
  code: string
  pass_type: string
  valid_from: string
  valid_until: string
  is_valid: boolean
  qr_code: string
}

interface ActivityLog {
  action: string
  description: string
  created_at: string
}

const ACTION_ICONS: Record<string, string> = {
  login:       'login',
  reservation: 'calendar_month',
  skipass:     'confirmation_number',
  profile:     'person',
  password:    'lock',
  other:       'info',
}

const ACTION_LABELS: Record<string, string> = {
  login:       'Prijava',
  reservation: 'Rezervacija',
  skipass:     'Ski pass',
  profile:     'Profil',
  password:    'Lozinka',
  other:       'Ostalo',
}

export default function UserDashboard() {
  const { userAcc, activeSeason } = useOutletContext<OutletContext>()
  const [activeSkiPass, setActiveSkiPass] = useState<SkiPass | null>(null)
  const navigate = useNavigate()
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])

  useEffect(() => {
    apiReq.get('/users/me/activity_user/')
        .then(res => setActivityLogs(res.data))
        .catch(() => {})
  }, [])

  useEffect(() => {
    apiReq.get('/skipass/my-passes/')
      .then(res => {
        const valid = res.data.find((p: SkiPass) => p.is_valid) ?? null
        setActiveSkiPass(valid)
      })
      .catch(() => setActiveSkiPass(null))
  }, [])

  const getRemainingDays = (validUntil: string) => {
    const diff = new Date(validUntil).getTime() - new Date().getTime()
    console.log(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))))
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const getPassLabel = (pass_type: string) => ({
    daily: 'DNEVNI',
    weekly: 'NEDELJNI',
    seasonal: 'SEZONSKI',
  }[pass_type] ?? pass_type.toUpperCase())

  const toVocative = (name: string): string => {
    if (!name) return "korisniče"
    const n = name.toLowerCase()
    if (n.endsWith("ica")) return name.slice(0, -1) + "e"
    if (n.endsWith("ca")) return name.slice(0, -1) + "e"
    if (n.endsWith("ana")) return name
    if (n.endsWith("ina")) return name
    if (n.endsWith("a")) return name.slice(0, -1) + "o"
    if (n.endsWith("an")) return name + "e"
    if (n.endsWith("ar")) return name + "e"
    if (n.endsWith("ko")) return name
    if (n.endsWith("o")) return name
    if (n.endsWith("e")) return name
    return name + "e"
  }

  const formatActivityTime = (iso: string) => {
    if (!iso) return "—"
    const date = new Date(iso)
    const months = ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Avg","Sep","Okt","Nov","Dec"]
    return `${date.getDate()} ${months[date.getMonth()]}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  return (
    <main>
      <div className="main_user_bar grid_container">
        <div style={{ gridArea: 'box1' }} className="welcome_user_div box">
          <div className="welcome_user_inner" />
          <div className="welcome_user_content">
            <p className="info">
              <span className="material-symbols-outlined">check_circle</span>
              DOBRODOSLI NAZAD
            </p>
            <p className="welcome">
              Dobrodošli nazad, {userAcc?.first_name ? toVocative(userAcc.first_name) : "korisniče"}!
            </p>
          </div>
        </div>

        {activeSkiPass ? (
          <div style={{ gridArea: 'box2' }} className="active_skipass box">
            <div className="skipass_info">
              <p className="title">AKTIVAN SKI PASS</p>
              <div className="ticket">
                <span className="material-symbols-outlined ticket">confirmation_number</span>
              </div>
            </div>
            <h1>{getPassLabel(activeSkiPass.pass_type)} KOPAONIK {activeSeason?.name}</h1>
            <div className="vazenje_tiketa">
              <div className="vazido" />
              <div className="status_skistaza" />
            </div>
            <div className="remainingdays">
              <div className="remaining">
                Preostalo dana: {getRemainingDays(activeSkiPass.valid_until)}
              </div>
              <div className="detalji" onClick={() => navigate("/account/skipass")} style={{ cursor: 'pointer' }}>
                Prikazi detalje
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ gridArea: 'box2' }} className="inactive_skipass box">
            <div className="skipass_info">
              <p className="title">SKI PASS</p>
              <div className="ticket">
                <span className="material-symbols-outlined ticket" style={{ opacity: 0.3 }}>
                  confirmation_number
                </span>
              </div>
            </div>
            <p className="no-skipass-text">Nemate aktivan ski pass</p>
            <button className="buy-skipass-btn" onClick={() => navigate("/account/skipass")}>
              <span className="material-symbols-outlined">add</span>
              Kupi ski pass
            </button>
          </div>
        )}

        <div style={{ gridArea: 'box3' }} className="weath_acc box">
          <Weather_accounts />
        </div>

       

        <div style={{ gridArea: 'box5' }} className="recent-activities box">
          <h3 className="section-title">NEDAVNE AKTIVNOSTI</h3>
          <div className="activity-list">
            {activityLogs.length === 0 && (
              <div className="activity-item-empty">
                <span className="material-symbols-outlined">inbox</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'JakartaReg', fontSize: '0.85rem' }}>
                  Nema aktivnosti
                </span>
              </div>
            )}
            {activityLogs.slice(0, 5).map((log, i) => (
              <div key={i} className="activity-item">
                <div className="activity-item-left">
                  <span className="material-symbols-outlined activity-icon">
                    {ACTION_ICONS[log.action] ?? 'info'}
                  </span>
                  <div className="activity-info">
                    <div className="activity-name">{log.description}</div>
                    <div className="activity-time">{formatActivityTime(log.created_at)}</div>
                  </div>
                </div>
                <div className="activity-badge">
                  {ACTION_LABELS[log.action] ?? log.action}
                </div>
              </div>
            ))}
          </div>
         
        </div>
      </div>
    </main>
  )
}