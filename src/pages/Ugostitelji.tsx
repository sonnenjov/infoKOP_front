import { useState } from "react"
import { Season } from "../hooks/useSeason"
import '../styles/ugostitelji.css'
import { useUgostitelji } from '../hooks/useUgostitelji'
import { useNavigate } from 'react-router-dom'
import { apiReq } from "../hooks/api"
import ReservationModal from "../components/ReservationModal"
import image from "../branding/images/biciklizam_070617_tw1024.jpg"

interface Props {
    activeSeason: Season;
}

interface Ugostitelj {
    id: number;
    name: string;
    category: string;
    address: string;
    phone: string;
}

export default function Ugostitelji({ activeSeason }: Props) {
    const navigate = useNavigate()
    const [activeFilter, setActiveFilter] = useState('Svi')
    const [searchQuery, setSearchQuery] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedUgostitelj, setSelectedUgostitelj] = useState<Ugostitelj | null>(null)
    const [showReservationModal, setShowReservationModal] = useState(false)
    const [loading, setLoading] = useState(false)
    
    const { data: ugostitelji, loading: loadingData, error } = useUgostitelji({
        category: activeFilter,
        search: searchQuery
    })
    
    const filterOptions = ['Svi', 'Restorani', 'Kafici', 'Nocni Zivot', 'Apres-SKI']
    
    // Check if user is logged in
    const isLoggedIn = () => {
        const auth = localStorage.getItem('infokop_auth')
        if (!auth) return false
        try {
            const data = JSON.parse(auth)
            return !!data?.access
        } catch {
            return false
        }
    }

    const handleReservationClick = (ugostitelj: Ugostitelj) => {
        if (!isLoggedIn()) {
            navigate('/account/login', { 
                state: { 
                    from: '/ugostitelji',
                    returnUrl: '/profile',
                    reservationData: { 
                        companyId: ugostitelj.id, 
                        companyName: ugostitelj.name 
                    }
                } 
            });
            return;
        }
        
            setSelectedUgostitelj(ugostitelj);
            setShowReservationModal(true);
    };

    const handleReservationSuccess = () => {
        setShowReservationModal(false);
        setSelectedUgostitelj(null);
        alert('Rezervacija je uspešno kreirana!');
        navigate('/account/rezervacije');
    };

    const suggestions = ugostitelji.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Convert Ugostitelj to Activity format for the modal
    const convertToActivity = (ugostitelj: Ugostitelj): any => ({
        id: ugostitelj.id,
        title: ugostitelj.name,
        service_name: ugostitelj.name,
        company_name: ugostitelj.name,
        company_id: ugostitelj.id,
        company: { id: ugostitelj.id },
        price: 0,
        max_capacity: 20,
        category: ugostitelj.category
    });

    return (
        <main>
            <div className={activeSeason === 'summer' ? 'ugostitelji_summer' : 'ugostitelji_winter'}>
                <div className={activeSeason === 'summer' ? 'block_summer' : 'block_winter'}>
                    <div className="header_ugostitelji">
                        <p className="podnaslov">Vodič kroz planinske ukuse</p>
                        <h1>Ugostitelji Kopaonika</h1>
                        <p>
                            Od autentičnih brvnara sa domaćom hranom do modernih barova i klubova 
                            za vrhunski noćni provod na vrhu planine.
                        </p>
                    </div>
                    <div className="gradient_ugostitelji"></div>
                </div>
            </div>

            <div className="filteri">
                <div className="filteri_opcije">
                    {filterOptions.map((filter) => (
                        <p
                            key={filter}
                            className={activeFilter === filter ? 'active' : ''}
                            onClick={() => {
                                setActiveFilter(filter)
                                setSearchQuery("")
                            }}
                        >
                            {filter}
                        </p>
                    ))}
                </div>

                <div className="pretrazi">
                    <div className="search_wrapper">
                        <input
                            type="text"
                            placeholder="Pretraži ugostitelje..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setShowSuggestions(true)
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            className="search_input"
                        />
                        {showSuggestions && searchQuery.length > 0 && suggestions.length > 0 && (
                            <ul className="suggestions_dropdown">
                                {suggestions.slice(0, 5).map((item) => (
                                    <li
                                        key={item.id}
                                        onMouseDown={() => {
                                            setSearchQuery(item.name)
                                            setShowSuggestions(false)
                                        }}
                                    >
                                        <span className="suggestion_name">{item.name}</span>
                                        <span className="suggestion_category">{item.category}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {loadingData && (
                <div className="loading_container">
                    <div className="loader"></div>
                    <p>Učitavanje ugostitelja...</p>
                </div>
            )}
            
            {error && (
                <div className="error_container">
                    <span className="material-symbols-outlined">error_outline</span>
                    <p>Greška pri učitavanju: {error}</p>
                    <button onClick={() => window.location.reload()}>Pokušaj ponovo</button>
                </div>
            )}

            {!loadingData && !error && (
                <div className="grid_ugostitelji">
                    {ugostitelji.length === 0 ? (
                        <div className="no-results">
                            <span className="material-symbols-outlined">search_off</span>
                            <p>Nema pronađenih ugostitelja</p>
                            <p className="no-results-sub">Pokušajte promeniti filtere ili pretragu</p>
                        </div>
                    ) : (
                        <div className="ugostitelji_list">
                            {ugostitelji.map((item, index) => (
                                <div key={item.id} className="company_card">
                                    <div className="company_card_top">
                                        <span className="material-symbols-outlined">
                                            {item.category === 'Restorani' && 'restaurant'}
                                            {item.category === 'Kafici' && 'local_cafe'}
                                            {item.category === 'Nocni Zivot' && 'nightlife'}
                                            {item.category === 'Apres-SKI' && 'sports_bar'}
                                        </span>
                                        <span className="company_category">{item.category}</span>
                                        {index === 0 && (
                                            <span className="featured_badge">
                                                <span className="material-symbols-outlined">recommend</span>
                                                Preporuka
                                            </span>
                                        )}
                                    </div>
                                    <h3>{item.name}</h3>
                                    {item.address && (
                                        <p className="company_address">
                                            <span className="material-symbols-outlined">location_on</span>
                                            {item.address}
                                        </p>
                                    )}
                                    {item.phone && (
                                        <p className="company_phone">
                                            <span className="material-symbols-outlined">phone</span>
                                            {item.phone}
                                        </p>
                                    )}
                                    <button 
                                        className="btn_reserve_small"
                                        onClick={() => handleReservationClick(item)}
                                    >
                                        Rezerviši
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showReservationModal && selectedUgostitelj && (
                <ReservationModal
                    activity={convertToActivity(selectedUgostitelj)}
                    onClose={() => {
                        setShowReservationModal(false);
                        setSelectedUgostitelj(null);
                    }}
                    onSuccess={handleReservationSuccess}
                    season={activeSeason}
                    serviceType="ugostitelj"
                />
            )}
        </main>
    )
}