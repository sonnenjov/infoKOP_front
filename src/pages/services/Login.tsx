import { Season } from '../../hooks/useSeason';
import '../../styles/log_reg.css'
import logo_leto from "../../branding/images/logos/2Asset 1.png"
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { API_URL } from '../../config';

type LoginType = 'user' | 'company' | 'admin' | 'reporter';

interface Props {
  activeSeason: Season;
}


const loginApi = async (type: LoginType, credentials: { email: string; password: string }) => {
  const endpoints = {
    user:     `${API_URL}/api/users/token/`,
    company:  `${API_URL}/api/users/token/`,
    admin:    `${API_URL}/api/users/token/`,
    reporter: `${API_URL}/api/users/token/`,
  }
  const response = await fetch(endpoints[type], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  return { data, status: response.status, ok: response.ok }
}

export default function Login({activeSeason}:Props) {
  const navigate = useNavigate();
  const [type,setType]         = useState<LoginType>('user'); 
  const [error,setError]       = useState(''); 
  const [email,setEmail]       = useState(''); 
  const {login}                = useAuth()
  const [password,setPassword] = useState(''); 
  const [searchParams]         = useSearchParams()
  const next                   = searchParams.get('next')
  const [activeEye, setActiveEye] = useState<'closed' | 'open'>("closed")
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
   const handleToggleEye = () => {
    setActiveEye(prev => prev === 'closed' ? 'open' : 'closed');
  };
 
  const handleBackToMain = () => {
    navigate('/')
  };


const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");

  try {
    const { data: tokenData, status, ok } = await loginApi(type, { email, password });

    if (status === 403 && tokenData.error === 'pending_approval') {
      setError("Vaš nalog je trenutno na pregledu. Bićete obavešteni kada bude odobren.")
      return
    }

    if (!ok) {
      setError("Pogrešan email ili lozinka")
      return
    }

    if (tokenData.requires_2fa) {
      setTempToken(tokenData.temp_token);
      setShow2FA(true);
      return;
    }

    const effectiveType = type === 'admin' && tokenData.role === 'reporter'
      ? 'reporter'
      : type;

    if (tokenData.role !== effectiveType) {
      setError(
        type === 'company' ? "Ovaj nalog nije registrovan kao kompanija" :
        type === 'admin'   ? "Nemate administratorski pristup" :
                             "Ovaj nalog je registrovan kao kompanija ili admin"
      );
      return;
    }

    localStorage.setItem('access_token', tokenData.access);
    localStorage.setItem('refresh_token', tokenData.refresh);
    login(tokenData);

    if (tokenData.role === 'company')       navigate('/partner/analitika');
    else if (tokenData.role === 'admin')    navigate('/admin/dashboard');
    else if (tokenData.role === 'reporter') navigate('/reporter/dashboard');
    else                                    navigate('/account/dashboard');

  } catch {
    setError("Pogrešan email ili lozinka");
  }
};
 
const handle2FASubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setError("")

  try {
    const res = await fetch(`${API_URL}/api/users/2fa/login/verify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: otpCode, temp_token: tempToken })
    })

    const data = await res.json()

    if (!res.ok) {
      if (data.error?.includes('istekao') || data.error?.includes('nevažeći')) {
        sessionStorage.removeItem('2fa_temp_token')
        sessionStorage.removeItem('2fa_type')
        setShow2FA(false)
        setTempToken('')
        setOtpCode('')
        setError("Sesija je istekla. Prijavite se ponovo.")
        return
      }
      setError("Pogrešan kod, pokušajte ponovo")
      return
    }

    sessionStorage.removeItem('2fa_temp_token')
    sessionStorage.removeItem('2fa_type')

    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    login(data)

    if (data.role === 'company')       navigate('/partner/analitika')
    else if (data.role === 'admin')    navigate('/admin/dashboard')
    else if (data.role === 'reporter') navigate('/reporter/dashboard')
    else                               navigate('/account/dashboard')

  } catch {
    setError("Greška, pokušajte ponovo")
  }
}
 
if (show2FA) {
  return (
    <div className="main_log_reg">
      <div className={`log_reg ${activeSeason}`}>
        <header className="login_header">
          <h2>Dvofaktorska verifikacija</h2>
          <p>Unesite 6-cifreni kod iz Google Authenticator aplikacije</p>
        </header>

        <form onSubmit={handle2FASubmit} className="login_form">
          <div className="login_field">
            <label className="label_caps">KOD</label>
            <div className="login_input_wrap">
              <span className="material-symbols-outlined login_icon">pin</span>
              <input
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                maxLength={6}
                required
                autoComplete="off"
              />
            </div>
          </div>

          {error && (
            <p className="login-error">
              <span className="error material-symbols-outlined" style={{ fontSize: "16px" }}>error</span>
              {error}
            </p>
          )}

          <button type="submit" className="login_submit_btn">
            POTVRDI
          </button>

          <button 
            type="button" 
            onClick={() => { setShow2FA(false); setOtpCode(''); setError(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', color: '#888' }}
          >
            ← Nazad na prijavu
          </button>
        </form>
      </div>
    </div>
  );
} 



  return (
    <>
    <div
    onClick={handleBackToMain} 
    className="backtomain">
      <span className="material-symbols-outlined">
        arrow_back
      </span>
      
    </div>
    <div className="main_log_reg">
      <div className={`logo ${activeSeason}`}>
        <Link to={"/"}>
          <img src={logo_leto} alt="" />
        </Link>
            <p className="login-brand-tagline">VRHUNSKI DOŽIVLJAJ PLANINE</p>
      </div>
      <div className={`log_reg ${activeSeason}`}>

          <div className="login_tabs">
            <button
            className={`login_tab ${type === 'user' ? 'login_tab__active' : ''}`}
            onClick={() => {
              setType('user');
              setError('')
            }}
            >
                Korisnik
            </button>

            <button
            className={`login_tab ${type === 'company' ? 'login_tab__active' : ''}`}
            onClick={() => {
              setType('company');
              setError('')
            }}
            >
                Partner
            </button>
            
            <button
            className={`login_tab ${type === 'admin' ? 'login_tab__active' : ''}`}
            onClick={() => {
              setType('admin');
              setError('')
            }}
            >
                Admin
            </button>
          </div>


            <header className='login_header'>
              {
                type === 'user'  && <h2>Dobrodosli nazad</h2>
              }
              {
                type === 'company'  && <h2>Partner prijava</h2>
              }
              {
                type === 'admin'  && <h2>Admin pristup</h2>
              }
              <p>
                {
                type === 'user'  && "Pristupite svom infoKOP nalogu"
              }
              {
                type === 'company'  && "Upravljajte svojim objektima na kopaoniku"
              }
              {
                type === 'admin'  && "Samo za ovlašćeno osoblje"
              }
              </p>
            </header>


          <form autoComplete='off' onSubmit={handleLogin} className="login_form">

            <div className="login_field">
              <label className="label_caps">EMAIL ADRESA</label>
              <div className="login_input_wrap">
                <span className="material-symbols-outlined   login_icon">mail</span>
                <input
                  autoComplete='off'
                  type="email"
                  placeholder={
                    type === 'company' ? "hotel@kopaonik.rs" :
                    type === 'admin'   ? "admin@infokop.rs"  :
                    "vas@email.com"
                  }
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>




              <div className="login_field">
              <label className="label_caps">LOZINKA</label>
              <div className="login_input_wrap">
                <span className="material-symbols-outlined  login-icon">lock</span>
                <input
                  autoComplete="new-password" 
                  type={activeEye === 'closed' ? 'password' : 'text'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                 <div onClick={handleToggleEye} style={{ cursor: 'pointer' }}> 
                  <span className="material-symbols-outlined login_icon">
                    {activeEye === 'closed' ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
            </div>
             {type === 'user' && (
              <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.8rem', color: '#888', textDecoration: 'none' }}
                >
                  Zaboravili ste lozinku?
                </Link>
              </div>
            )}

            {error && (
              <p className="login-error">
                <span className="error material-symbols-outlined" style={{ fontSize: "16px" }}>error</span>
                {error}
              </p>
)}       
            {error && (
              <p className="login-error">
                <span className="error material-symbols-outlined" style={{ fontSize: "16px" }}>error</span>
                {error}
              </p>
            )}

            <button type="submit" className="login_submit_btn">
              {type === 'user'    && "PRIJAVI SE"}
              {type === 'company' && "PRIJAVI SE KAO PARTNER"}
              {type === 'admin'   && "ADMIN PRIJAVA"}
            </button>


          </form>



          {type !== 'admin' && (
            <>
              <div className="login_divider">
                <span className="label_caps_last">
                  NEMATE NALOG?
                </span>
              </div>


              <div className="login_switch">
                {type === 'user' && (
                  <Link to='/user/register' >
                    Kreirajte Korisnicki Nalog
                  </Link>
                )}
                 {type === 'company' && (
                  <Link to='/partner/register' >
                    Registrujte svoju kompaniju
                  </Link>
                )}
              </div>
            </>
          )}
      </div>
      <footer className="login-footer">
          © 2026 INFOKOP • Sva prava zadržana • Kopaonik
        </footer>
    </div>
    </>
  )
}