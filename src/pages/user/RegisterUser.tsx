import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import '../../styles/user_reg.css'
import { Season } from "../../hooks/useSeason";
import logo_leto from "../../branding/images/logos/2Asset 1.png"
import { Link } from "react-router-dom";

interface Props {
  activeSeason: Season;
}

const registerUserAPI = async (formData: any) => {
  try {
    const response = await fetch('http://192.168.1.6:8000/api/users/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw data; 
    }
    
    return data;

  } catch (err) {
    console.error("Greška na mreži:", err);
    throw err; // Propagate error back to handleRegister so you can set your UI errors
  }
};


export default function RegisterUser({activeSeason}: Props) {
  const navigate = useNavigate();
  const [error, setError] = useState<Record<string, string>>({}); 
  const [email, setEmail] = useState(''); 
  const [phone, setPhone] = useState(''); 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agreed, setAgreed] = useState(false); 
  const [activeEye, setActiveEye] = useState<'closed' | 'open'>("closed")
  const [activeEye2, setActiveEye2] = useState<'closed' | 'open'>("closed")
  const {login} = useAuth()
  const [password, setPassword] = useState(''); 
  const [password2, setPassword2] = useState(''); 
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')



  const handleToggleEye = () => {
    setActiveEye(prev => prev === 'closed' ? 'open' : 'closed');
  };

  const handleToggleEye2 = () => {
    setActiveEye2(prev => prev === 'closed' ? 'open' : 'closed');
  };

  const validate = () => {
    const e: Record<string, string> = {}

    if (!firstName) e.firstName = "Ime je obavezno";
    if (!lastName) e.lastName = "Prezime je obavezno";

    if (!email) e.email = "Email je obavezan"
    else if (!email.includes('@')) e.email = "Unesite validan email"

    if (!password) {
      e.password = "Lozinka je obavezna"
    } else {
      if (password.length < 8)
        e.password = "Minimalno 8 karaktera"
      else if (!/[0-9]/.test(password))
        e.password = "Lozinka mora sadržati broj"
      else if (!/[A-Z]/.test(password))
        e.password = "Lozinka mora sadržati veliko slovo"
    }

    if (password !== password2)
      e.password2 = "Lozinke se ne poklapaju"


    if (!agreed)
      e.agreed = "Morate prihvatiti uslove"

    return e
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  const err = validate();
  
  if (Object.keys(err).length > 0) {
    setError(err);
    return;
  }

  const form = {
    username: email, 
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    password,
  }

  try {
    await registerUserAPI(form);
    navigate('/check-email')  // 
  } catch (backendErrors: any) {
    console.log("Greške sa bekenda:", backendErrors);
    
    if (typeof backendErrors === 'object' && backendErrors !== null) {
      setError({
        ...backendErrors,
        submit: "Podaci nisu validni. Proverite polja iznad."
      });
    } else {
      setError({ submit: "Greška pri registraciji. Pokušajte ponovo." });
    }
  }
}




  return (
    <>
      <div className="main_partner_reg">
        <div className={`logo ${activeSeason}`}>
          
        <Link to={"/"}>
          <img src={logo_leto} alt="" />
        </Link>
          <p className="login-brand-tagline">VRHUNSKI DOŽIVLJAJ PLANINE</p>
        </div>
        <div className="inner_block_user">
          <header className='login_header'>
            <p>Registruj svoju kompaniju</p>
          </header>

          <form autoComplete="off" className="partner_register_form" onSubmit={handleSubmit}>
             <div className="login_field">
            <label className="label_caps">IME</label>
            <div className="login_input_wrap">
              <span className="material-symbols-outlined login_icon">person</span>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            {error.firstName && <span className="error-message">{error.firstName}</span>}
          </div>

          <div className="login_field">
            <label className="label_caps">PREZIME</label>
            <div className="login_input_wrap">
              <span className="material-symbols-outlined login_icon">person</span>
              <input  type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            {error.lastName && <span className="error-message">{error.lastName}</span>}
          </div>

            <div className="login_field">
              <label className="label_caps">EMAIL ADRESA</label>
              <div className="login_input_wrap">
                <span className="material-symbols-outlined login_icon">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              {error.email && <span className="error-message">{error.email}</span>}
            </div>

            <div className="login_field">
              <label className="label_caps">BROJ TELEFONA</label>
              <div className="login_input_wrap">
                <span className="material-symbols-outlined login_icon">phone</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

        

            <div className="login_field">
              <label className="label_caps">LOZINKA</label>
              <div className="login_input_wrap">
                <span className="material-symbols-outlined login-icon">lock</span>
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
              {error.password && <span className="error-message">{error.password}</span>}
              {password && (
                <div className="password_requirements" style={{ marginTop: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: password.length >= 8 ? '#76b817' : '#B83516', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      {password.length >= 8 ? 'check_circle' : 'cancel'}
                    </span>
                    Najmanje 8 znakova
                  </span>

                  <span style={{ color: /[0-9]/.test(password) ? '#76b817' : '#B83516', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      {/[0-9]/.test(password) ? 'check_circle' : 'cancel'}
                    </span>
                    Najmanje jedan broj
                  </span>

                  <span style={{ color: /[A-Z]/.test(password) ? '#76b817' : '#B83516', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      {/[A-Z]/.test(password) ? 'check_circle' : 'cancel'}
                    </span>
                    Najmanje jedno veliko slovo
                  </span>
                </div>
              )}
            </div>

            <div className="login_field">
              <label className="label_caps">PONOVITE LOZINKU</label>
              <div className="login_input_wrap">
                <span className="material-symbols-outlined login-icon">lock</span>
                <input
                  autoComplete="new-password" 
                  type={activeEye2 === 'closed' ? 'password' : 'text'} 
                  placeholder="••••••••"
                  value={password2}
                  onChange={e => setPassword2(e.target.value)}
                  required
                />
                <div onClick={handleToggleEye2} style={{ cursor: 'pointer' }}> 
                  <span className="material-symbols-outlined login_icon">
                    {activeEye2 === 'closed' ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </div>
              {error.password2 && <span className="error-message">{error.password2}</span>}
              {password2 && (
                <div className="validation_message" style={{ marginTop: '5px', fontSize: '14px' }}>
                  {password === password2 ? (
                    <span style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                      Lozinke se podudaraju
                    </span>
                  ) : (
                    <span style={{ color: 'red', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                      Lozinke se ne podudaraju
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="login_field">
              <label className="label_caps">
                <input
                  type="checkbox"
                  checked={agreed}
                  className="checkbox"
                  onChange={e => setAgreed(e.target.checked)}
                />
                Prihvatam uslove korišćenja
              </label>
              {error.agreed && <span className="error-message">{error.agreed}</span>}
            </div>

            {error.submit && (
              <p className="login-error">
                <span className="error" style={{ fontSize: "16px" }}>error</span>
                {error.submit}
              </p>
            )}

            <button type="submit" className="login_submit_btn">
              Registrujte se
            </button>
          </form>

          <div className="login_divider">
            <span className="label_caps_last">
              IMATE NALOG?
            </span>
            <div className="login_switch">
              <Link to='/account/login'>
                Prijavite se
              </Link>
            </div>
          </div>
        </div>
        <footer className="login-footer">
          © 2026 INFOKOP • Sva prava zadržana • Kopaonik
        </footer>
      </div>
    </>
  )
}