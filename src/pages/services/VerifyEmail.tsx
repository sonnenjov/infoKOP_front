import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const uid   = searchParams.get('uid')
    const token = searchParams.get('token')

    fetch(`http://192.168.1.6:8000/api/users/verify-email/?uid=${uid}&token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.detail === 'Email potvrđen! Čekajte odobrenje administratora.') {
          setStatus('success')
          setTimeout(() => navigate('/account/login'), 3000)
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="check-email-page">
      <div className="check-email-card">
        {status === 'loading' && (
          <>
            <span className="material-symbols-outlined check-email-icon">hourglass_top</span>
            <h1>Verifikacija u toku...</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <span className="material-symbols-outlined check-email-icon" style={{ color: '#7ebf3f' }}>verified</span>
            <h1>Email potvrđen!</h1>
            <p>Vaš nalog je aktiviran. Preusmeravamo vas na prijavu...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <span className="material-symbols-outlined check-email-icon" style={{ color: '#bf3f3f' }}>error</span>
            <h1>Link je nevažeći</h1>
            <p>Link je istekao ili je već iskorišćen. Registrujte se ponovo.</p>
            <button onClick={() => navigate('/register')}>Nazad na registraciju</button>
          </>
        )}
      </div>
    </div>
  )
}