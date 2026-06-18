import { useState, useEffect } from "react"
import { getToken } from "../hooks/auth"

type Step = 'idle' | 'qr' | 'verify' | 'backup' | 'done'

interface Props {
  isEnabled: boolean
  onStatusChange: () => void
}

export default function TwoFactorSetup({ isEnabled, onStatusChange }: Props) {
  const [step, setStep]               = useState<Step>(() => {
    return (sessionStorage.getItem('2fa_step') as Step) || 'idle'
  })
  const [qrCode, setQrCode]           = useState<string>(() => sessionStorage.getItem('2fa_qr') || '')
  const [secret, setSecret]           = useState<string>(() => sessionStorage.getItem('2fa_secret') || '')
  const [code, setCode]               = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('2fa_backup')
    return saved ? JSON.parse(saved) : []
  })
  const [error, setError]             = useState<string>('')
  const [password, setPassword]       = useState<string>('')
  const [activeEye2fa, setActiveEye2fa] = useState<'closed' | 'open'>("closed")
  const token = getToken()

  const handleToggleEye = () => {
    setActiveEye2fa(prev => prev === 'closed' ? 'open' : 'closed');
  };





  const goToStep = (s: Step) => {
    setStep(s)
    sessionStorage.setItem('2fa_step', s)
  }

  const clearSession = () => {
    sessionStorage.removeItem('2fa_step')
    sessionStorage.removeItem('2fa_qr')
    sessionStorage.removeItem('2fa_secret')
    sessionStorage.removeItem('2fa_backup')
  }




    useEffect(() => {
  if (isEnabled) {
    clearSession()
    setStep('idle')
  }
}, [isEnabled])

  const handleEnable = async () => {
    const res = await fetch('http://192.168.1.6:8000/api/users/2fa/enable/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) {
      setQrCode(data.qr_code)
      setSecret(data.secret)
      sessionStorage.setItem('2fa_qr', data.qr_code)
      sessionStorage.setItem('2fa_secret', data.secret)
      goToStep('qr')
    }
  }

  const handleVerify = async () => {
    setError('')
    const res = await fetch('http://192.168.1.6:8000/api/users/2fa/verify/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    })
    const data = await res.json()
    if (data.success) {
      const codes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).slice(2, 8).toUpperCase()
      )
      setBackupCodes(codes)
      sessionStorage.setItem('2fa_backup', JSON.stringify(codes))
      goToStep('backup')
      onStatusChange()
    } else {
      setError(data.error || 'Pogrešan kod. Pokušajte ponovo.')
    }
  }

  const handleDisable = async () => {
    setError('')
    const res = await fetch('http://192.168.1.6:8000/api/users/2fa/disable/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    })
    const data = await res.json()
    if (data.success) {
      clearSession()
      goToStep('idle')
      setPassword('')
      onStatusChange()
    } else {
      setError(data.error || 'Pogrešna lozinka.')
    }
  }

  const downloadBackupCodes = () => {
    const content = `infoKOP — 2FA Backup Codes\n...\n${backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'infokop-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isEnabled && step === 'idle') {
    return (
      <div className="twofa-section">
        <div className="twofa-status twofa-status--on">
          <span className="material-symbols-outlined">verified_user</span>
          <div>
            <h4>Dvofaktorska autentifikacija je aktivna</h4>
            <p>Vaš nalog je zaštićen Google Authenticator-om.</p>
          </div>
        </div>
        <div className="twofa-disable">
          <label>Unesite lozinku da isključite 2FA

          <input
            type={activeEye2fa === 'closed' ? 'password' : 'text'}
            placeholder="Vaša lozinka"
            value={password}
            onChange={e => setPassword(e.target.value)}
            />
            <div onClick={handleToggleEye} style={{ cursor: 'pointer' }}> 
                  <span className="material-symbols-outlined login_icon">
                    {activeEye2fa === 'closed' ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
            </label>
          {error && <p className="twofa-error">{error}</p>}
          <button className="twofa-btn twofa-btn--danger" onClick={handleDisable}>
            Isključi 2FA
          </button>
        </div>
      </div>
    )
  }

  if (step === 'idle') {
    return (
      <div className="twofa-section">
        <div className="twofa-status twofa-status--off">
          <span className="material-symbols-outlined">shield</span>
          <div>
            <h4>Dvofaktorska autentifikacija</h4>
            <p>Dodajte dodatni nivo zaštite vašem nalogu.</p>
          </div>
        </div>
        <button className="twofa-btn" onClick={handleEnable}>
          <span className="material-symbols-outlined">qr_code_2</span>
          Uključi 2FA
        </button>
      </div>
    )
  }

  if (step === 'qr') {
    return (
      <div className="twofa-section">
        <h4>Skenirajte QR kod</h4>
        <p>Otvorite <strong>Google Authenticator</strong> i skenirajte kod ispod.</p>
        <div className="twofa-qr">
          <img src={qrCode} alt="QR kod" />
        </div>
        <p className="twofa-manual">
          Ili unesite ručno: <code>{secret}</code>
        </p>
        <label>Unesite 6-cifreni kod iz aplikacije</label>
        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
        />
        {error && <p className="twofa-error">{error}</p>}
        <div className="twofa-actions">
          <button className="twofa-btn--ghost" onClick={() => setStep('idle')}>Otkaži</button>
          <button className="twofa-btn" onClick={handleVerify}>Potvrdi</button>
        </div>
      </div>
    )
  }

  if (step === 'backup') {
    return (
      <div className="twofa-section">
        <span className="material-symbols-outlined twofa-success-icon">check_circle</span>
        <h4>2FA je uspešno aktiviran!</h4>
        <p>Sačuvajte ove rezervne kodove. Svaki može biti iskorišćen samo jednom ako izgubite pristup aplikaciji.</p>
        <div className="twofa-backup-grid">
          {backupCodes.map((c, i) => (
            <span key={i} className="twofa-backup-code">{c}</span>
          ))}
        </div>
        <div className="twofa-actions">
          <button className="twofa-btn--ghost" onClick={downloadBackupCodes}>
            <span className="material-symbols-outlined">download</span>
            Preuzmi kodove
          </button>
          <button className="twofa-btn" onClick={() => {
            setStep('done')
            clearSession()
            goToStep('done') 
            }}>
            Završi
          </button>
        </div>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="twofa-section">
        <div className="twofa-status twofa-status--on">
          <span className="material-symbols-outlined">verified_user</span>
          <div>
            <h4>2FA je aktivan</h4>
            <p>Vaš nalog je zaštićen.</p>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}