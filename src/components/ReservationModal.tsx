import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Activity } from "../types";
import { Season } from "../hooks/useSeason";
import { apiReq } from "../hooks/api";

interface Props {
  activity: Activity;
  onClose: () => void;
  onSuccess: () => void;
  season: Season;
  serviceType?: 'aktivnost' | 'smestaj' | 'dogadjaj' | 'ugostitelj';
}

export default function ReservationModal({ 
  activity, 
  onClose, 
  onSuccess, 
  season,
  serviceType = 'aktivnost' 
}: Props) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date_from: '',
    date_to: '',
    time: '',
    number_of_people: 1,
    note: '',
    amount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Morate biti prijavljeni da biste rezervisali');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const reservationData = {
          company: activity.company_id ?? (typeof activity.company === 'object' ? activity.company?.id : activity.company),
        service_name: activity.title || activity.service_name || activity.name,
        service_type: serviceType,
        date_from: formData.date_from,
        date_to: formData.date_to || null,
        guests: formData.number_of_people,
        notes: formData.note,
        amount: formData.amount || Number(activity.price) * formData.number_of_people || 0,
        source: 'InfoKOP',
        channel: 'infokop',
        status: 'pending'
      };
      console.log('activity object:', JSON.stringify(activity));
console.log('reservationData:', JSON.stringify(reservationData));
      console.log('API base:', apiReq.defaults.baseURL);
console.log('Full URL will be:', apiReq.defaults.baseURL + '/rezervacije/reservations/');
      const response = await apiReq.post('/rezervacije/reservations/', reservationData);
      
      if (response.status === 200 || response.status === 201) {
        onSuccess();
        setFormData({
          date_from: '',
          date_to: '',
          time: '',
          number_of_people: 1,
          note: '',
          amount: 0
        });
      }
    } catch (err: any) {
      console.error('Reservation error:', err);
      setError(err.response?.data?.message || err.response?.data?.detail || 'Došlo je do greške. Pokušajte ponovo.');
      console.error('Full error data:', JSON.stringify(err.response?.data));
  setError(JSON.stringify(err.response?.data));  // show raw error in UI
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const totalPrice = (Number(activity.price) || 0) * formData.number_of_people;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${season}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-text">
            <span className="modal-eyebrow">Rezervacija</span>
            <h2>{activity.title || activity.service_name || activity.name}</h2>
            {activity.company_name && (
              <p className="company-name">{activity.company_name}</p>
            )}
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Zatvori">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Datum od</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.date_from}
                onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
              />
            </div>
            {serviceType === 'smestaj' && (
              <div className="form-group">
                <label>Datum do</label>
                <input
                  type="date"
                  min={formData.date_from}
                  value={formData.date_to}
                  onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                />
              </div>
            )}
            {(serviceType === 'aktivnost' || serviceType === 'ugostitelj') && (
              <div className="form-group">
                <label>Vreme</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>
              {serviceType === 'dogadjaj' ? 'Broj karata' : 'Broj osoba'}
            </label>
            <input
              type="number"
              min="1"
              max={activity.max_capacity || 50}
              value={formData.number_of_people}
              onChange={(e) => setFormData({ 
                ...formData, 
                number_of_people: parseInt(e.target.value) || 1 
              })}
            />
            {activity.max_capacity && (
              <small>Maksimalno {activity.max_capacity} osoba</small>
            )}
          </div>

          <div className="form-group">
            <label>Napomena</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Dodatne napomene..."
              rows={3}
            />
          </div>

          {(activity.price || activity.amount) && (
            <div className="reservation-summary">
              <div className="summary-row">
                <span>Cena po {serviceType === 'dogadjaj' ? 'karti' : 'osobi'}</span>
                <strong>{activity.price || activity.amount}€</strong>
              </div>
              <div className="summary-row total">
                <span>Ukupno</span>
                <strong>{totalPrice.toFixed(2)}€</strong>
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
              disabled={loading || !formData.date_from}
            >
              {loading ? 'Rezervišem...' : 'Potvrdi rezervaciju'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}