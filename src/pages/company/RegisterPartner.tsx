import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import '../../styles/partner_reg.css'
import { Season } from "../../hooks/useSeason";
import logo_leto from "../../branding/images/logos/2Asset 1.png"
import { Link } from "react-router-dom";
import { API_URL } from "../../config";

interface Props {
  activeSeason: Season;
}

const registerCompanyApi = async (formData: { email: string; phone: string; password: string; password2: string; pib: string; company_name: string; address: string; type: string; }) => {
  try {
    console.log("Šaljem podatke:", formData);
    
    const response = await fetch(`${API_URL}/api/users/register/company/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    let data;
    const textResponse = await response.text();
    
    try {
      data = JSON.parse(textResponse);
    } catch {
      console.error("Server nije vratio JSON:", textResponse);
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
      throw { 
        status: response.status, 
        errors: data.errors || data,
        message: data.message || "Registracija neuspešna"
      };
    }
    
    return data;

  } catch (err) {
    console.error("Greška na mreži:", err);
    throw err;
  }
};

export default function RegisterPartner({activeSeason}: Props) {
  const navigate = useNavigate();
  const [error, setError] = useState<Record<string, string>>({}); 
  const [email, setEmail] = useState(''); 
  const [phone, setPhone] = useState(''); 
  const [agreed, setAgreed] = useState(false); 
  const [activeEye, setActiveEye] = useState<'closed' | 'open'>("closed")
  const [activeEye2, setActiveEye2] = useState<'closed' | 'open'>("closed")
  const [adresa, setAdresa] = useState(''); 
  const [pib, setPib] = useState(''); 
  const [companyName, setCompanyName] = useState(''); 
  const [type, setType] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [password2, setPassword2] = useState(''); 
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next')

  const typeOptions = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'apartman', label: 'Apartman / Konaci' },
    { value: 'restoran', label: 'Restoran' },
    { value: 'kafic', label: 'Kafić' },
    { value: 'apres_ski', label: 'Après-ski bar' },
    { value: 'aktivnost', label: 'Aktivnost / Atrakcija' },
    { value: 'ski_skola', label: 'Ski škola' },
    { value: 'dogadjaj', label: 'Organizator događaja' },
    { value: 'servis_iznajmljivanje', label: 'Servis i iznajmljivanje opreme' },
    { value: 'prevoz', label: 'Prevoz i transfer' },
  ]

  const handleToggleEye = () => {
    setActiveEye(prev => prev === 'closed' ? 'open' : 'closed');
  };

  const handleToggleEye2 = () => {
    setActiveEye2(prev => prev === 'closed' ? 'open' : 'closed');
  };

  const validate = () => {
    const e: Record<string, string> = {}

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

    if (!pib) {
      e.pib = "PIB je obavezan"
    } else if (pib.length !== 9 || isNaN(Number(pib)))
      e.pib = "PIB mora imati 9 cifara"

    if (!type)
      e.type = "Izaberite tip objekta"

    if (!adresa)
      e.adresa = "Adresa je obavezna"

    if (!companyName)
      e.companyName = "Ime kompanije je obavezno"

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
        email: email,
        phone: phone,
        password: password,
        password2: password2,  
        pib: pib,
        company_name: companyName,  
        address: adresa,           
        type: type               
    }
    
    console.log("Šaljem podatke:", form); 
    
    try {
        await registerCompanyApi(form);
        navigate(next || '/partner/analitika');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError({ submit: "Greška pri registraciji. Pokušajte ponovo.",
                   error: errorMessage
        })
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
        <div className="inner_block">
          <header className='login_header'>
            <p>Registruj svoju kompaniju</p>
          </header>

          <form className="partner_register_form" onSubmit={handleSubmit}>
            <div className="login_field">
              <label className="label_caps">TIP KOMPANIJE</label>
              <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="login_input_wrap" 
              id="types" 
              name="types"
              style={{
                fontFamily: "'Jakarta Bold', 'Plus Jakarta Sans', sans-serif",
                fontWeight: 'bold'
              }}
            >
              <option value="" style={{ backgroundColor: '#222222', color: 'white', fontFamily: "'Jakarta Bold', 'Plus Jakarta Sans', sans-serif", fontWeight: 'bold' }}>
                Izaberite tip
              </option>
              {typeOptions.map((option, index) => (
                <option 
                  key={index} 
                  className="option" 
                  value={option.value}
                  style={{
                    backgroundColor: '#222222',
                    color: 'white',
                    fontFamily: "'Jakarta Bold', 'Plus Jakarta Sans', sans-serif",
                    fontWeight: 'bold',
                    padding: '10px'
                  }}
                >
                  {option.label}
                </option>
              ))}
            </select>
              {error.type && <span className="error-message">{error.type}</span>}
            </div>

            <div className="login_field">
              <label className="label_caps">IME KOMPANIJE</label>
              <div className="login_input_wrap">
                <span className="material-symbols-outlined login_icon">label</span>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  required
                />
              </div>
              {error.companyName && <span className="error-message">{error.companyName}</span>}
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
              <label className="label_caps">ADRESA</label>
              <div className="login_input_wrap">
                <span className="material-symbols-outlined login_icon">location_on</span>
                <input
                  type="text"
                  value={adresa}
                  onChange={e => setAdresa(e.target.value)}
                  required
                />
              </div>
              {error.adresa && <span className="error-message">{error.adresa}</span>}
            </div>

            <div className="login_field">
              <label className="label_caps">PIB</label>
              <div className="login_input_wrap">
                <span className="material-symbols-outlined login_icon">fingerprint</span>
                <input
                  type="text"
                  value={pib}
                  onChange={e => setPib(e.target.value)}
                  required
                />
              </div>
              {error.pib && <span className="error-message">{error.pib}</span>}
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