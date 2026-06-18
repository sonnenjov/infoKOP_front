// PartnerSettings.tsx
import { useOutletContext } from 'react-router-dom'
import { Season } from '../../hooks/useSeason'
import Weather_accounts from '../../layouts/Weather_accounts'
import '../../styles/partner/settings_partner.css'
import logo from "../../branding/images/logos/2Asset 1.png"
import TwoFactorSetup from '../../hooks/TwoFactorSetup'
import { useState, useEffect } from 'react'
import { apiReq } from '../../hooks/api'

interface OutletContext {
  companyAcc: {
    company_name: string
    address?: string
    email?: string
    role?: string
    phone?: string
    type?: string
    pib: string
    cover_photo?: string
    logo?: string
  },
  activeSeason: Season
}

export default function PartnerSettings() {
  const { companyAcc, activeSeason } = useOutletContext<OutletContext>()
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    address: ''
  })

  // Load existing data into form
  useEffect(() => {
    if (companyAcc) {
      setFormData({
        company_name: companyAcc.company_name || '',
        email: companyAcc.email || '',
        phone: companyAcc.phone || '',
        address: companyAcc.address || ''
      })
    }
  }, [companyAcc])

  // Load existing images
  useEffect(() => {
    if (companyAcc?.logo) {
      setLogoPreview(companyAcc.logo)
    }
    if (companyAcc?.cover_photo) {
      setCoverPreview(companyAcc.cover_photo)
    }
  }, [companyAcc])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    
    try {
      const response = await apiReq.patch('/users/company/update/', formData)
      // Optionally update the context or show success message
      console.log('Profile updated successfully:', response.data)
      alert('Profil je uspešno ažuriran!')
    } catch (err: any) {
      console.error('Profile update failed:', err.response?.data || err.message)
      alert('Greška pri ažuriranju profila.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return
    setUploading(true)
    const form = new FormData()
    form.append('logo', logoFile)
    try {
      const res = await apiReq.patch('/users/company/update/', form)
      if (res.data.logo) {
        setLogoPreview(res.data.logo)
        setLogoFile(null)
      }
    } catch (err: any) {
      console.error('Logo upload failed:', err.response?.data || err.message)
      alert('Greška pri otpremanju logoa.')
    } finally {
      setUploading(false)
    }
  }

  const handleLogoDelete = async () => {
    setUploading(true)
    try {
      await apiReq.patch('/users/company/update/', { logo: null })
      setLogoPreview(null)
      setLogoFile(null)
    } catch (err: any) {
      console.error('Logo delete failed:', err.response?.data || err.message)
      alert('Greška pri brisanju logoa.')
    } finally {
      setUploading(false)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleCoverUpload = async () => {
    if (!coverFile) return
    setUploading(true)
    const form = new FormData()
    form.append('cover_photo', coverFile)
    try {
      const res = await apiReq.patch('/users/company/update/', form)
      if (res.data.cover_photo) {
        setCoverPreview(res.data.cover_photo)
        setCoverFile(null)
      }
    } catch (err: any) {
      console.error('Cover upload failed:', err.response?.data || err.message)
      alert('Greška pri otpremanju naslovne fotografije.')
    } finally {
      setUploading(false)
    }
  }

  const handleCoverDelete = async () => {
    setUploading(true)
    try {
      await apiReq.patch('/users/company/update/', { cover_photo: null })
      setCoverPreview(null)
      setCoverFile(null)
    } catch (err: any) {
      console.error('Cover delete failed:', err.response?.data || err.message)
      alert('Greška pri brisanju naslovne fotografije.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="settings_partner_main">
      <h1>Podsevanje portala</h1>
      <p>
        Upravljajte svojim biznis profilom, brendiranjem i sigurnosnim postavkama vašeg naloga na Kopaoniku.
      </p>
      <div className="inner_grid_settings_partner">
        <div 
          style={{gridArea:"profil"}}
          className="profil_partner boxp">
          <div className="toptitle">
            <span className="material-symbols-outlined">
              corporate_fare
            </span>
            Profil Biznisa
          </div>
          <form className='change-form_partner' onSubmit={handleFormSubmit}>
            <div className="labels">
              <label className='label_partner lab' htmlFor="company_name">
                NAZIV BIZNISA
                <input 
                  value={formData.company_name}
                  onChange={handleInputChange}
                  type="text" 
                  id="company_name" 
                  placeholder="Unesite naziv biznisa"
                />
              </label>

              <label className='label_partner lab' htmlFor="email">
                EMAIL
                <input
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email" 
                  id="email" 
                  placeholder="Unesite email adresu"
                />
              </label>

              <label className='label_partner lab' htmlFor="phone">
                TELEFON
                <input 
                  value={formData.phone}
                  onChange={handleInputChange}
                  type="tel" 
                  id="phone" 
                  placeholder="Unesite broj telefona"
                />
              </label>

              <label className='label_partner lab' htmlFor="address">
                ADRESA
                <input
                  value={formData.address}
                  onChange={handleInputChange}
                  type="text" 
                  id="address" 
                  placeholder="Unesite adresu"
                />
              </label>
            </div>
            <button 
              type="submit" 
              className='submit_form_partner'
              disabled={isUpdating}
            >
              {isUpdating ? 'ČUVANJE...' : 'SAČUVAJ IZMENE'}
            </button>
          </form>
        </div>

        <div 
          style={{gridArea:"branding"}}
          className="branding_partner boxp">
          <div className="toptitle">
            <span className="material-symbols-outlined">
              brush
            </span>
            Brendiranje
          </div>
          
          <div className="cover_photo_section">
            <p className="section_label">NASLOVNA FOTOGRAFIJA</p>
            <div className="cover_photo_wrapper">
              <div 
                className="cover_photo_container"
                style={{ 
                  backgroundImage: coverPreview ? `url(${coverPreview})` : 'url(../../branding/images/649545020_26431358533165322_3304444365875728851_n.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="cover_photo_overlay">
                  <input
                    type="file"
                    accept="image/*"
                    id="cover-upload"
                    style={{ display: 'none' }}
                    onChange={handleCoverChange}
                  />
                  <div className="cover_photo_actions">
                    <button 
                      type="button"
                      className="cover_action_btn"
                      onClick={() => document.getElementById('cover-upload')?.click()}
                    >
                      <span className="material-symbols-outlined">photo_camera</span>
                      <span>Promeni naslovnu</span>
                    </button>
                    {coverFile && (
                      <button 
                        type="button"
                        className="cover_action_btn cover_save"
                        onClick={handleCoverUpload}
                        disabled={uploading}
                      >
                        <span className="material-symbols-outlined">save</span>
                        <span>{uploading ? '...' : 'Sačuvaj'}</span>
                      </button>
                    )}
                    {coverPreview && !coverFile && (
                      <button 
                        type="button"
                        className="cover_action_btn cover_delete"
                        onClick={handleCoverDelete}
                        disabled={uploading}
                      >
                        <span className="material-symbols-outlined">delete</span>
                        <span>Ukloni</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <p className="upload_hint">Preporučena veličina: 1920x400px. Podržani formati: JPG, PNG.</p>
          </div>

          <div className="logochange">
            <div className="leftlogo" onClick={() => document.getElementById('logo-upload')?.click()} style={{ cursor: 'pointer' }}>
              <div className="logo_inner">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
                ) : (
                  <img src={logo} alt="Logo" />
                )}
              </div>
            </div>
            <div className="rightlogo">
              <h6>Logo Biznisa</h6>
              <p>Preporučena veličina: 512x512px. Podržani formati: PNG, SVG.</p>
              <div className="bttns">
                <input
                  type="file"
                  accept="image/*"
                  id="logo-upload"
                  style={{ display: 'none' }}
                  onChange={handleLogoChange}
                />
                <button 
                  type="button"
                  className='newLogo' 
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  Otpremi novi logo
                </button>
                {logoFile && (
                  <button 
                    type="button"
                    className='newLogo' 
                    onClick={handleLogoUpload} 
                    style={{ borderColor: '#5cb85c' }} 
                    disabled={uploading}
                  >
                    {uploading ? '...' : 'Sačuvaj logo'}
                  </button>
                )}
                <button 
                  type="button"
                  className='deleteLogo' 
                  onClick={handleLogoDelete} 
                  disabled={uploading}
                >
                  Ukloni logo
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ gridArea: "payout" }} className="payout_partner boxp">
          <div className="toptitle">
            <span className="material-symbols-outlined">payments</span>
            Isplata
          </div>

          <div className="bank_card">
            <div className="payout_up">
              <span className="material-symbols-outlined">account_balance</span>
              <div className="text">
                <p className="bank">Banca Intesa AD</p>
                <p className="bank_number">160-0000000012345-67</p>
              </div>
              <span className="bank_badge">Aktivan</span>
            </div>

            <div className="payout_down">
              <label htmlFor="valuta">
                VALUTA ISPLATE
                <input type="text" id='valuta' defaultValue="RSD" />
              </label>
              <label htmlFor="ucestalost">
                UČESTALOST ISPLATE
                <input type="text" id='ucestalost' defaultValue="Mesečno" />
              </label>
            </div>

            <button type="button" className="edit_bank_btn">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
              Izmeni podatke bankovnog računa
            </button>
          </div>
        </div>
        
        <div 
          style={{gridArea:"info"}}
          className="info_partner boxp">
          <div className="toptitle">
            <span className="material-symbols-outlined">
              notifications_active
            </span>
            Obavestenja
          </div>
        </div>
        
        <div 
          style={{gridArea:"security"}}
          className="security_partner boxp">
          <div className="toptitle">
            <span className="material-symbols-outlined">
              security
            </span>
            Sigurnost
          </div>
          <div className="sec">
            <TwoFactorSetup
              isEnabled={twoFaEnabled}
              onStatusChange={() => setTwoFaEnabled(prev => !prev)}
            />
          </div>
        </div>
        
        <div 
          style={{gridArea:"weather"}}
          className="weather_partner boxp">
          <Weather_accounts/>
        </div>
        
        <div 
          style={{gridArea:"empty"}}
          className="empty_partner boxp">
        </div>
      </div>
    </main>
  )
}