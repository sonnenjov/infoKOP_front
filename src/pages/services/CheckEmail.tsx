import { useNavigate } from "react-router-dom"
import "../../styles/check_email.css"
export default function CheckEmail() {
  const navigate = useNavigate()

  return (
    <div className="check-email-page">
      <div className="check-email-card">
        <span className="material-symbols-outlined check-email-icon">mark_email_unread</span>
        <h1>Proverite vaš email</h1>
        <p>
          Poslali smo vam link za potvrdu registracije. 
          Kliknite na link u emailu da aktivirate nalog.
        </p>
        <p className="check-email-sub">
          Nije stigao email? Proverite spam folder.
        </p>
        <button onClick={() => navigate('/login')}>
          Nazad na prijavu
        </button>
      </div>
    </div>
  )
}