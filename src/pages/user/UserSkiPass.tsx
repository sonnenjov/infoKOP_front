import { useState, useEffect } from "react"
import "../../styles/user/skipass_user.css"
import { Season } from "../../hooks/useSeason"
import { useOutletContext } from "react-router-dom"
import { getToken } from "../../hooks/auth"
import { apiReq } from "../../hooks/api"

interface OutletContext {
  userAcc: {
    first_name: string
    last_name: string
    id: string
    email?: string
  }
  activeSeason: Season
}

interface SkiPass {
  id: number
  code: string
  pass_type: string
  valid_from: string
  valid_until: string
  is_used: boolean
  is_valid: boolean
  price_paid: string
  qr_code: string
}

export default function UserSkiPass() {
  const [activePass, setActivePass] = useState<SkiPass | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { userAcc } = useOutletContext<OutletContext>()
  const token = getToken()

  const packages = [
    { id: 1, name: "1 Dan", description: "Savršeno za jednodnevni izlet", price: "€42", priceDetail: "/dan", popular: false, passType: "daily", pricePaid: 42 },
    { id: 2, name: "3 Dana", description: "Produženi vikend sa popustom", price: "€115", priceDetail: "/ukupno", popular: true, passType: "daily3", pricePaid: 115 },
    { id: 3, name: "7 Dana", description: "Kompletna nedelja skijanja", price: "€240", priceDetail: "/nedelja", popular: false, passType: "weekly", pricePaid: 240 },
    { id: 4, name: "Sezonski", description: "Neograničeno skijanje tokom sezone", price: "€580", priceDetail: "/sezona", popular: false, passType: "seasonal", pricePaid: 580 },
  ]

  const fetchPasses = async () => {
    try {
      const { data } = await apiReq.get('/skipass/my-passes/')
      const valid = data.find((p: SkiPass) => p.is_valid) ?? null
      setActivePass(valid)
    } catch {
      setError('Greška pri učitavanju propusnice.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPasses()
  }, [])

  const handleBuy = async (passType: string, pricePaid: number) => {
    setPurchasing(true)
    setError(null)
    try {
      const { data } = await apiReq.post('/skipass/purchase/', {
        pass_type: passType,
        price_paid: pricePaid
      })
      setActivePass(data)
    } catch {
      setError('Kupovina nije uspela. Pokušajte ponovo.')
    } finally {
      setPurchasing(false)
    }
  }

  const handleDelete = async () => {
    if (!activePass) return
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovu propusnicu? Ova akcija je nepovratna.')) return

    setDeleting(true)
    setError(null)
    try {
      await apiReq.delete(`/skipass/delete/${activePass.id}/`)
      setActivePass(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Brisanje nije uspelo.')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: '2-digit' })

  return (
    <div className="ski_pass_main">
      <div style={{ gridArea: "box_1" }} className="skipass_left_column">
        <div className="box_skipass">
          <div className="box_skipass_inner" />
          <div className="box_skipass_content">
            <div className="skipass">
              {loading ? (
                <div className="skipass_inactive">
                  <div className="inactive-content">
                    <p>Učitavanje...</p>
                  </div>
                </div>
              ) : activePass ? (
                <div className="skipass_active">
                  <div className="upper">
                    <div>
                      <p>SKIJALIŠTA SRBIJE</p>
                      <span className="material-symbols-outlined">contactless</span>
                    </div>
                    <h1>Tvoj SKIPASS</h1>
                  </div>
                  <div className="middle">
                    <div className="middle_inner">
                      <div className="pass">
                        <img
                          src={activePass.qr_code}
                          alt="Ski pass QR code"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="down">
                    <h1>{userAcc?.first_name} {userAcc?.last_name}</h1>
                    <div className="pass-details">
                      <div className="detail-item">
                        <span className="detail-label">ID:</span>
                        <span className="detail-value">{activePass.code}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">VALID:</span>
                        <span className="detail-value">{formatDate(activePass.valid_until)}</span>
                      </div>
                    </div>
                    <button
                      className="delete-pass-btn"
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        marginTop: '12px',
                        padding: '6px 16px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        cursor: deleting ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      {deleting ? 'Brisanje...' : 'Obriši propusnicu'}
                    </button>
                    {error && <p style={{ color: '#ef4444', marginTop: '8px', fontSize: '14px' }}>{error}</p>}
                  </div>
                </div>
              ) : (
                <div className="skipass_inactive">
                  <div className="inactive-content">
                    <span className="material-symbols-outlined">block</span>
                    <h2>SEZONSKA PROPUSNICA NIJE AKTIVNA</h2>
                  </div>
                </div>
              )}
            </div>

            <div className="textspass">
              <h1>Dobrodošli na sneg</h1>
              <p>
                Vaša sezonska propusnica je{" "}
                {activePass
                  ? "aktivna. Uživajte u 54km uređenih staza i sunčanom danu na Kopaoniku."
                  : "neaktivna, kupite i uživajte u 54km uređenih staza i sunčanom danu na Kopaoniku."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ gridArea: "box_2" }} className="skipass_right_column">
        <div className="packages-section">
          <div className="packages-header">
            <h2>PRIPREMI SE ZA STAZU</h2>
          </div>

          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

          <div className="packages-grid">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`package-card ${pkg.popular ? 'popular' : ''}`}>
                {pkg.popular && <div className="popular-badge">POPULARNO</div>}
                <h3>{pkg.name}</h3>
                <p>{pkg.description}</p>
                <div className="package-price">
                  <span className="price">{pkg.price}</span>
                  <span className="price-detail">{pkg.priceDetail}</span>
                </div>
                <button
                  className="buy-btn"
                  disabled={purchasing || !!activePass}
                  onClick={() => handleBuy(pkg.passType, pkg.pricePaid)}
                  title={activePass ? 'Već imate aktivan ski pass' : ''}
                >
                  {purchasing ? 'Obrada...' : activePass ? 'PASS AKTIVAN' : 'KUPI ODMAH'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}