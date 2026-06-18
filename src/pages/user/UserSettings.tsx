import { FormEvent, useEffect, useRef, useState } from "react"
import "../../styles/user/settings_user.css"
import { useOutletContext } from "react-router-dom"
import { getToken } from "../../hooks/auth";
import { Season } from "../../hooks/useSeason";
import TwoFactorSetup from "../../hooks/TwoFactorSetup";

type OutletContext = {
  userAcc: {
    first_name?: string
    last_name?: string
    email?: string
    role?: string
    phone?: string
    avatar_url?: string  
  },
  activeSeason: Season
}

const options = {
  jezik: [
    { value: "srpski", label: "Srpski" },
    { value: "english", label: "English" },
    { value: "deutsch", label: "Deutsch" },
  ],
  valuta: [
    { value: "eur", label: "EUR (Euro)" },
    { value: "rsd", label: "RSD (Srpski dinar)" },
    { value: "usd", label: "USD (US Dollar)" },
  ],
};

function CustomSelect({ label, items, defaultValue }: { label: string; items: { value: string; label: string }[]; defaultValue: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = items.find((i) => i.value === value);

  return (
    <div className="lang-field">
      <label>{label}</label>
      <div className="select-wrapper" ref={ref}>
        <div className="select-trigger" onClick={() => setOpen(!open)}>
          <span>{selected?.label}</span>
          <svg
            className={`chevron ${open ? "open" : ""}`}
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="#5cb85c" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {open && (
          <ul className="options-list">
            {items.map((item) => (
              <li
                key={item.value}
                className={item.value === value ? "active" : ""}
                onClick={() => { setValue(item.value); setOpen(false); }}
              >
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function UserSettings() {
  const { userAcc, activeSeason } = useOutletContext<OutletContext>();
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)
  const [activeEye, setActiveEye] = useState<'closed' | 'open'>("closed")
  const [activeEyeNew, setActiveEyeNew] = useState<'closed' | 'open'>("closed")
  const [localAvatar, setLocalAvatar] = useState<string | null>(() => {
    const saved = localStorage.getItem('user_avatar')
    return saved || userAcc?.avatar_url || null
  })
  const [previewImage, setPreviewImage] = useState<string | null>(localAvatar)
  const [rawFile, setRawFile] = useState<File | null>(null);

  useEffect(() => {
    if (previewImage) {
      localStorage.setItem('user_avatar', previewImage)
    }
  }, [previewImage])

  useEffect(() => {
    if (userAcc?.avatar_url) {
      setPreviewImage(userAcc.avatar_url)
      localStorage.setItem('user_avatar', userAcc.avatar_url)
    }
  }, [userAcc?.avatar_url])

  const handleActiveEye = () => {
    setActiveEye(prev => prev === 'closed' ? 'open' : 'closed');
  };

  const handleActiveEyeNew = () => {
    setActiveEyeNew(prev => prev === 'closed' ? 'open' : 'closed');
  };

  useEffect(() => {
    const token = getToken()
    fetch('http://192.168.1.6:8000/api/users/2fa/status/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setTwoFaEnabled(d.enable))
  }, [])

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    try {
      const token = getToken()
      const res = await fetch('http://192.168.1.6:8000/api/users/me/change-password/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      })
      const data = await res.json()

      if (res.ok) {
        setPasswordSuccess("Lozinka uspešno promenjena!")
        setPasswordData({ current_password: '', new_password: '' })
      } else {
        setPasswordError(data.error || "Greška pri promeni lozinke")
      }
    } catch {
      setPasswordError("Mrežna greška")
    }
  }

  const [formData, setFormData] = useState(() => ({
    name: `${userAcc?.first_name || ""} ${userAcc?.last_name || ""}`.trim(),
    email: userAcc?.email || "",
    tel: userAcc?.phone || ""
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const dataToSend = new FormData()

    if (formData.name.trim()) {
      const [firstName, ...rest] = formData.name.trim().split(" ")
      dataToSend.append("first_name", firstName)
      dataToSend.append("last_name", rest.join(" "))
    }
    if (formData.email.trim()) dataToSend.append("email", formData.email.trim())
    if (formData.tel.trim()) dataToSend.append("phone", formData.tel.trim())
    if (rawFile) dataToSend.append("avatar", rawFile)

    try {
      const token = getToken()
      const response = await fetch("http://192.168.1.6:8000/api/users/me/update/", {
        method: "PATCH",
        body: dataToSend,
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("result:", result)

        if (result.avatar_url) {
          setPreviewImage(result.avatar_url)
          setLocalAvatar(result.avatar_url)
          localStorage.setItem('user_avatar', result.avatar_url)
        }

        alert("Profil uspešno ažuriran!");
      } else {
        console.error("Greška pri čuvanju:");
      }
    } catch (error) {
      console.error("Mrežna greška:", error);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setRawFile(file);
            setPreviewImage(URL.createObjectURL(file));
          }
        }}
        style={{ display: "none" }}
        id="image-upload"
      />

      <div className="settings_main">
        <h1>PODESAVANJE NALOGA</h1>
        <p>Upravljajte svojim podacima, bezbednošću i obaveštenjima na jednom mestu.</p>
        <div className="inner_grid">

          <form
            style={{ gridArea: "box--1" }}
            className="profile_box boxs"
            onSubmit={handleProfileSubmit}
          >
            <div className="profile">
              <div style={{ gridArea: "a1" }} className="first">
                <div className="up">
                  <span className="material-symbols-outlined">person</span> Profilne informacije
                </div>
                <div className="profile_pic">
                  <div
                    onClick={() => document.getElementById("image-upload")?.click()}
                    style={{ gridArea: "a" }}
                    className="pic"
                  >
                    <div className="arrow">
                      <span className="material-symbols-outlined">photo_camera</span>
                    </div>
                    <div className="overlay">
                      <span className="material-symbols-outlined">photo_camera</span>
                    </div>
                    {previewImage ? (
                      <img className="avatarPic" src={previewImage} alt="Avatar" />
                    ) : (
                      <span className="material-symbols-outlined avatar">person</span>
                    )}
                  </div>
                  <div style={{ gridArea: "b" }} className="info">
                    <h4>{userAcc?.first_name} {userAcc?.last_name}</h4>
                    <p>Vaša profilna slika će biti vidljiva na recenzijama i prilikom rezervacija.</p>
                  </div>
                </div>
              </div>

              <div style={{ gridArea: "a2" }} className="down">
                <label style={{ gridArea: "b1" }}>
                  IME I PREZIME
                  <input
                    type="text"
                    name="name"
                    placeholder={`${userAcc?.first_name} ${userAcc?.last_name}`}
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </label>
                <label style={{ gridArea: "b2" }}>
                  EMAIL ADRESA
                  <input
                    type="email"
                    name="email"
                    placeholder={userAcc?.email}
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </label>
                <label style={{ gridArea: "b3" }}>
                  BROJ TELEFONA
                  <input
                    type="tel"
                    name="tel"
                    placeholder={userAcc?.phone}
                    value={formData.tel}
                    onChange={handleInputChange}
                  />
                </label>
                <button type="submit" style={{ gridArea: "b4" }}>
                  SACUVAJ IZMENE
                </button>
              </div>
            </div>
          </form>

          <form
            onSubmit={handlePasswordSubmit}
            autoComplete="new-password"
            style={{ gridArea: "box--3" }}
            className="security_box boxs"
          >
            <div className="frst">
              <span className="material-symbols-outlined">security</span> Bezbednost
            </div>
            <div className="psswrds">
              <label
                style={{ gridArea: "1a" }}
                className="current_password"
                htmlFor="current-password"
              >
                Trenutna lozinka
                <input
                  autoComplete="new-password"
                  value={passwordData.current_password}
                  onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  type={activeEye === 'closed' ? 'password' : 'text'}
                  name="current_password"
                  id="current-password"
                  required
                />
                <div onClick={handleActiveEye} style={{ cursor: 'pointer' }}>
                  <span className="material-symbols-outlined login_icon">
                    {activeEye === 'closed' ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </label>
              <label
                className="new_password"
                style={{ gridArea: "2a" }}
                htmlFor="new-password"
              >
                Nova lozinka
                <input
                  value={passwordData.new_password}
                  onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  autoComplete="new-password"
                  type={activeEyeNew === 'closed' ? 'password' : 'text'}
                  name="new_password"
                  id="new-password"
                  required
                />
                <div onClick={handleActiveEyeNew} style={{ cursor: 'pointer' }}>
                  <span className="material-symbols-outlined login_icon">
                    {activeEyeNew === 'closed' ? 'visibility_off' : 'visibility'}
                  </span>
                </div>
              </label>
              <button style={{ gridArea: "3a" }} type="submit">Promeni lozinku</button>
            </div>
            <div className="two-fa">
              <div className="twofaleft">
                <span className="material-symbols-outlined">fingerprint</span>
                <div className="two-fa_text">
                  <h4>Dvofaktorska autentifikacija</h4>
                  <p>Dodajte dodatni nivo sigurnosti vašem nalogu.</p>
                </div>
              </div>
              <TwoFactorSetup
                isEnabled={twoFaEnabled}
                onStatusChange={() => setTwoFaEnabled(prev => !prev)}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  )
}