import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Season } from "../hooks/useSeason";
import { apiReq } from "../hooks/api";
import "../styles/reservation_card.css"
interface SmestajItem {
    id: number;
    naziv: string;
    cena_po_nocenju: number;
    kapacitet: number;
    company?: {
        id: number;
        company_name: string;
    };
}

interface Props {
    smestaj: SmestajItem;
    onClose: () => void;
    onSuccess: () => void;
    season: Season;
    defaultCheckIn?: string;
    defaultCheckOut?: string;
    defaultAdults?: number;
    defaultChildren?: number;
}

export default function SmestajReservationModal({ 
    smestaj, 
    onClose, 
    onSuccess, 
    season,
    defaultCheckIn = '',
    defaultCheckOut = '',
    defaultAdults = 2,
    defaultChildren = 0
}: Props) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        check_in: defaultCheckIn,
        check_out: defaultCheckOut,
        broj_odraslih: defaultAdults,
        broj_dece: defaultChildren,
        napomena: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isLoggedIn = () => {
        const auth = localStorage.getItem('infokop_auth');
        if (!auth) return false;
        try {
            const data = JSON.parse(auth);
            return !!data?.access;
        } catch {
            return false;
        }
    };

    const calculateNights = () => {
        if (!formData.check_in || !formData.check_out) return 0;
        const from = new Date(formData.check_in);
        const to = new Date(formData.check_out);
        const diffTime = Math.abs(to.getTime() - from.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const nights = calculateNights();
    const totalPrice = smestaj.cena_po_nocenju * nights;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isLoggedIn()) {
            navigate('/account/login', { state: { from: '/smestaj' } });
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            // -- Use the same pattern as the working ReservationModal --
           const companyId = typeof smestaj.company === 'number' 
                ? smestaj.company 
                : smestaj.company?.id ?? null;

            const payload = {
                company: companyId,                          // numeric ID or null
                service_name: smestaj.naziv,
                service_type: 'smestaj',                    // matches SOURCE_META key
                company_name: smestaj.company?.company_name || '',
                date_from: formData.check_in,
                date_to: formData.check_out,
                guests: formData.broj_odraslih + formData.broj_dece,
                amount: totalPrice,                          // number
                notes: formData.napomena,
                source: 'InfoKOP',
                channel: 'infokop',
                status: 'pending',
            };

            const response = await apiReq.post('/rezervacije/reservations/', payload);
            
            if (response.status === 200 || response.status === 201) {
                onSuccess();
            }
        } catch (err: any) {
            console.error('Reservation error:', err);
            setError(err.response?.data?.detail || err.response?.data?.message || 'Došlo je do greške.');
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content ${season}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-header-text">
                        <span className="modal-eyebrow">Rezervacija smeštaja</span>
                        <h2>{smestaj.naziv}</h2>
                        {smestaj.company && (
                            <p className="company-name">{smestaj.company.company_name}</p>
                        )}
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Zatvori">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Datum prijave (check-in)</label>
                            <input
                                type="date"
                                required
                                min={today}
                                value={formData.check_in}
                                onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Datum odjave (check-out)</label>
                            <input
                                type="date"
                                required
                                min={formData.check_in || today}
                                value={formData.check_out}
                                onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Broj odraslih</label>
                            <input
                                type="number"
                                min="1"
                                max={smestaj.kapacitet || 10}
                                value={formData.broj_odraslih}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    broj_odraslih: parseInt(e.target.value) || 1 
                                })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Broj dece</label>
                            <input
                                type="number"
                                min="0"
                                max={smestaj.kapacitet || 10}
                                value={formData.broj_dece}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    broj_dece: parseInt(e.target.value) || 0 
                                })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Napomena</label>
                        <textarea
                            value={formData.napomena}
                            onChange={(e) => setFormData({ ...formData, napomena: e.target.value })}
                            placeholder="Specijalni zahtevi, alergije, itd."
                            rows={3}
                        />
                    </div>

                    {nights > 0 && (
                        <div className="reservation-summary">
                            <div className="summary-row">
                                <span>Cena po noći</span>
                                <strong>{smestaj.cena_po_nocenju} €</strong>
                            </div>
                            <div className="summary-row">
                                <span>Broj noći</span>
                                <strong>{nights}</strong>
                            </div>
                            <div className="summary-row total">
                                <span>Ukupno</span>
                                <strong>{totalPrice.toFixed(2)} €</strong>
                            </div>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Otkaži
                        </button>
                        <button 
                            type="submit" 
                            className={`submit-btn ${season}`} 
                            disabled={loading || !formData.check_in || !formData.check_out}
                        >
                            {loading ? 'Rezervišem...' : 'Potvrdi rezervaciju'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}