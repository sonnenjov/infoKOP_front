import { useState, useEffect, useRef } from "react"
import { Season } from "../hooks/useSeason"
import "../styles/smestaj.css"
import pozadina from "../branding/images/495383880_10068310603230041_6109019548355046752_n.jpg"
import Mapa from "../components/Mapa"
import { useSmestaji, type SmestajFilters } from '../hooks/useSmestaji'
import { useSmestajReservation } from '../hooks/useReservation'
import CompanyFilter from '../components/CompanyFilter'
import SmestajReservationModal from '../components/SmestajReservationModal'  // Removed .tsx extension

interface Props { activeSeason: Season }

interface SmestajItem {
    id: number;
    naziv: string;
    slug: string;
    opis: string;
    tip: string;
    cena_po_nocenju: number;
    udaljenost_od_staza: number;
    kapacitet: number;
    image_url: string | null;
    tags: string[];
    company: {
        id: number;
        company_name: string;
        slug: string;
    };
    ima_spa: boolean;
    ima_bazen: boolean;
    ski_in_ski_out: boolean;
    ima_restoran: boolean;
    ima_parking: boolean;
    ima_wifi: boolean;
}

export default function Smestaj({ activeSeason }: Props) {
  const [openMap, setOpenMap] = useState(false)
  const [destination, setDestination] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [showGuests, setShowGuests] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const suggestionTimeout = useRef<NodeJS.Timeout>()

  const [tipFilter, setTipFilter] = useState<string[]>([])
  const [maxUdaljenost, setMaxUdaljenost] = useState(1500)
  const [minCena, setMinCena] = useState("")
  const [maxCena, setMaxCena] = useState("")
  const [page, setPage] = useState(1)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  
  const [selectedSmestaj, setSelectedSmestaj] = useState<SmestajItem | null>(null)
  const [showReservationModal, setShowReservationModal] = useState(false)

  useEffect(() => {
    if (destination.length < 2) {
      setSuggestions([])
      return
    }

    clearTimeout(suggestionTimeout.current)
    setLoadingSuggestions(true)

    suggestionTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/smestaj/suggestions/?q=${encodeURIComponent(destination)}`
        )
        
        if (!response.ok) throw new Error('Failed to fetch suggestions')
        
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setLoadingSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(suggestionTimeout.current)
  }, [destination])

  function toggleTip(tip: string, checked: boolean) {
    setTipFilter(prev =>
      checked ? [...prev, tip] : prev.filter(t => t !== tip)
    )
    setPage(1)
  }

  const filters: SmestajFilters = {
    tip: tipFilter.length === 1 ? tipFilter[0] : undefined,
    season: activeSeason === 'all' ? undefined : activeSeason,
    checkIn, checkOut, adults, children, page,
    companyId: selectedCompany?.id,
  }

  const { data, loading, error } = useSmestaji(filters)
  const { reserve, loading: reserving, success, error: reserveError } = useSmestajReservation()

  const handleReservationClick = (smestaj: SmestajItem) => {
    const auth = localStorage.getItem('infokop_auth')
    if (!auth) {
      window.location.href = '/account/login?from=smestaj'
      return
    }
    
    if (!checkIn || !checkOut) {
      alert('Molimo vas da odaberete datume pre rezervacije.')
      return
    }
    
    setSelectedSmestaj(smestaj)
    setShowReservationModal(true)
  }

  const handleReservationSuccess = () => {
    setShowReservationModal(false)
    setSelectedSmestaj(null)
    alert('Rezervacija je uspešno kreirana!')
  }

  const visibleResults = data?.results.filter(s => {
    const distOk = s.udaljenost_od_staza <= maxUdaljenost
    const minOk = minCena === "" || s.cena_po_nocenju >= Number(minCena)
    const maxOk = maxCena === "" || s.cena_po_nocenju <= Number(maxCena)
    return distOk && minOk && maxOk
  }) ?? []

  return (
    <main>
      <div className={`smestaj ${activeSeason}`}>
        <div className={`block_smestaj_inner ${activeSeason}`}>
          <h1>PRONAĐITE IDEALAN SMEŠTAJ</h1>
          <p>Najbolji hoteli i apartmani na Kopaoniku</p>
          <div className={`search_bar ${activeSeason}`}>
            <div className="search_field destinacija">
              <label className="search_label">DESTINACIJA</label>
              <input
                type="text"
                className="search_input"
                placeholder="Kuda idete?"
                value={destination}
                onChange={e => { setDestination(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              {showSuggestions && (
                <div className="search_dropdown">
                  {loadingSuggestions ? (
                    <div className="search_dropdown_item loading">Učitavanje...</div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map(s => (
                      <div
                        key={s}
                        className="search_dropdown_item"
                        onMouseDown={() => { setDestination(s); setShowSuggestions(false) }}
                      >
                        {s}
                      </div>
                    ))
                  ) : destination.length >= 2 ? (
                    <div className="search_dropdown_item">Nema rezultata</div>
                  ) : null}
                </div>
              )}
            </div>

            <div className={`razmak ${activeSeason}`} />

            <div className="search_field datumi">
              <label className="search_label">DATUMI</label>
              <div className="datumi_inputs">
                <input
                  type="date"
                  className="search_input date_input"
                  value={checkIn}
                  onChange={e => { setCheckIn(e.target.value); setPage(1) }}
                />
                <span className="date_arrow">→</span>
                <input
                  type="date"
                  className="search_input date_input"
                  value={checkOut}
                  onChange={e => { setCheckOut(e.target.value); setPage(1) }}
                />
              </div>
            </div>

            <div className={`razmak ${activeSeason}`} />

            <div className="search_field gosti">
              <label className="search_label">GOSTI</label>
              <div className="gosti_display" onClick={() => setShowGuests(v => !v)}>
                {adults} Odraslih, {children} Dece
              </div>
              {showGuests && (
                <div className="search_dropdown gosti_dropdown">
                  <div className="guest_row">
                    <div>
                      <p className="guest_label">Odrasli</p>
                      <p className="guest_sub">13+ godina</p>
                    </div>
                    <div className="guest_counter">
                      <button onClick={() => setAdults(a => Math.max(1, a - 1))}>−</button>
                      <span>{adults}</span>
                      <button onClick={() => setAdults(a => a + 1)}>+</button>
                    </div>
                  </div>
                  <div className="guest_row">
                    <div>
                      <p className="guest_label">Deca</p>
                      <p className="guest_sub">0–12 godina</p>
                    </div>
                    <div className="guest_counter">
                      <button onClick={() => setChildren(c => Math.max(0, c - 1))}>−</button>
                      <span>{children}</span>
                      <button onClick={() => setChildren(c => c + 1)}>+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className={`search_btn ${activeSeason}`} onClick={() => setPage(1)}>
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </div>
        <div className="gradient" />
      </div>

      <div className={`grid_smestaj ${activeSeason}`}>
        <div className="sidebar">
          <CompanyFilter 
            activeSeason={activeSeason}
            onCompanySelect={setSelectedCompany}
            filterType="smestaj"
          />

          <div className="sidebar-section">
            <div className="sidebar-section-title">Mapa Smestaja</div>
            <div className="map-wrapper">
              {openMap && (
                <div className="map-modal">
                  <span onClick={() => setOpenMap(false)} className="material-symbols-outlined close_map">close</span>
                  <Mapa />
                </div>
              )}
              <button onClick={() => setOpenMap(true)} className="map-expand">
                <span className="material-symbols-outlined">open_in_full</span>
              </button>
              <Mapa />
              <div className="map-overlay">
                <span className="material-symbols-outlined">map</span>
                MAPA SMESTAJA
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Tip Smestaja</div>
            <div className="checkbox-group">
              <label htmlFor="hoteli">
                <input
                  type="checkbox"
                  id="hoteli"
                  checked={tipFilter.includes('hotel')}
                  onChange={e => toggleTip('hotel', e.target.checked)}
                />
                Hoteli
              </label>
              <label htmlFor="apartmani">
                <input
                  type="checkbox"
                  id="apartmani"
                  checked={tipFilter.includes('apartman')}
                  onChange={e => toggleTip('apartman', e.target.checked)}
                />
                Apartmani
              </label>
              <label htmlFor="vile-brvnare">
                <input
                  type="checkbox"
                  id="vile-brvnare"
                  checked={tipFilter.includes('vila')}
                  onChange={e => toggleTip('vila', e.target.checked)}
                />
                Vile &amp; Brvnare
              </label>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Udaljenost Od Staza</div>
            <div className="range-slider">
              <input
                type="range"
                id="range"
                min={0}
                max={1500}
                step={50}
                value={maxUdaljenost}
                onChange={e => { setMaxUdaljenost(Number(e.target.value)); setPage(1) }}
              />
            </div>
            <div className="range-labels">
              <p>0m (Ski-in)</p>
              <p>{maxUdaljenost}m</p>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Cenovni Rang</div>
            <div className="price-inputs">
              <div className="price-input">
                <label>MIN</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minCena}
                  onChange={e => { setMinCena(e.target.value); setPage(1) }}
                  min={0}
                />
              </div>
              <div className="price-input">
                <label>MAX</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={maxCena}
                  onChange={e => { setMaxCena(e.target.value); setPage(1) }}
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mainbar">
          <div className="results-header">
            {!loading && data && (
              <p className="results-count">{data.count} smeštaja pronađeno</p>
            )}
            <div className="sort-wrapper" />
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Učitavanje...</p>
            </div>
          )}

          {error && <div className="error-message">Greška: {error}</div>}
          {reserveError && <div className="error-message">{reserveError}</div>}
          {success && <div className="success-message">Rezervacija uspešno poslata!</div>}

          {!loading && visibleResults.length === 0 && !error && (
            <div className="empty-state">
              <span className="material-symbols-outlined">search_off</span>
              <p>Nema smeštaja koji odgovaraju filterima.</p>
            </div>
          )}

          <div className="results-list">
            {visibleResults.map(smestaj => (
              <div className="result-card" key={smestaj.id}>
                <div className="card-image-wrapper">
                  <div
                    className="card-image"
                    style={{
                      backgroundImage: smestaj.image_url
                        ? `url(${smestaj.image_url})`
                        : `url(${pozadina})`
                    }}
                  />
                  <div className="card-badge">{smestaj.tip}</div>
                </div>
                <div className="card-content">
                  <div className="card-header">
                    <h2 className="card-title">{smestaj.naziv}</h2>
                    <div className="card-price">
                      <p className="price-amount">{smestaj.cena_po_nocenju}€</p>
                      <p className="price-period">po noćenju</p>
                    </div>
                  </div>
                  <p className="card-description">{smestaj.opis}</p>
                  {smestaj.company && (
                    <p className="card-company">
                      <span className="material-symbols-outlined">business</span>
                      {smestaj.company.company_name}
                    </p>
                  )}
                  <div className="card-tags">
                    {smestaj.tags.map(tag => (
                      <span key={tag} className="card-tag">{tag}</span>
                    ))}
                  </div>
                  <button
                    className="card-button"
                    disabled={reserving || !checkIn || !checkOut}
                    onClick={() => handleReservationClick(smestaj)}
                  >
                    {reserving ? 'Slanje...' : 'REZERVIŠI'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {data && (data.previous || data.next) && (
            <div className="pagination">
              <button disabled={!data.previous} onClick={() => setPage(p => p - 1)}>
                ← Prethodna
              </button>
              <span>Strana {page} od {Math.ceil(data.count / 10)}</span>
              <button disabled={!data.next} onClick={() => setPage(p => p + 1)}>
                Sledeća →
              </button>
            </div>
          )}
        </div>
      </div>

      {showReservationModal && selectedSmestaj && (
        <SmestajReservationModal
          smestaj={selectedSmestaj}
          onClose={() => {
            setShowReservationModal(false)
            setSelectedSmestaj(null)
          }}
          onSuccess={handleReservationSuccess}
          season={activeSeason}
          defaultCheckIn={checkIn}
          defaultCheckOut={checkOut}
          defaultAdults={adults}
          defaultChildren={children}
        />
      )}
    </main>
  )
}