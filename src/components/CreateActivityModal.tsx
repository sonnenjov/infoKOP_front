import { useState } from "react";
import { Season } from "../hooks/useSeason";
import { getToken } from "../hooks/auth";
import { API_URL } from "../config" 
interface Props {
  onClose: () => void;
  onSuccess: () => void;
  season: Season;
}

export default function CreateActivityModal({ onClose, onSuccess, season }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    season: 'all_year',
    price: '',
    duration_minutes: '',
    max_capacity: 1,
    location: '',
    image: null as File | null,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        formDataToSend.append(key, value as string | Blob);
      }
    });
    const token = getToken()

    try {
      const response = await fetch(`${API_URL}/api/aktivnosti/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(Object.values(data).flat().join(' '));
      }
    } catch (err) {
      setError('Došlo je do greške. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content large ${season}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-text">
            <span className="modal-eyebrow">Nova aktivnost</span>
            <h2>Kreiraj Aktivnost</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Zatvori">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Naziv *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Npr. Skijanje na Kopaoniku"
              />
            </div>
            <div className="form-group">
              <label>Sezona</label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              >
                <option value="all_year">Ceo godinu</option>
                <option value="summer">Leto</option>
                <option value="winter">Zima</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Opis</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detaljan opis aktivnosti..."
              rows={4}
            />
          </div>

          <div className="form-row three">
            <div className="form-group">
              <label>Cena (€) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Trajanje (min)</label>
              <input
                type="number"
                min="0"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                placeholder="60"
              />
            </div>
            <div className="form-group">
              <label>Max kapacitet *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Lokacija</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Npr. Kopaonik, centar"
              />
            </div>
            <div className="form-group">
              <label>Slika</label>
              <label className="file-input">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({
                    ...formData,
                    image: e.target.files ? e.target.files[0] : null
                  })}
                />
                <span className="material-symbols-outlined">upload</span>
                <span>{formData.image ? formData.image.name : 'Izaberi sliku'}</span>
              </label>
            </div>
          </div>

          <label className="form-group checkbox">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <span>Aktivna odmah po kreiranju</span>
          </label>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Otkaži
            </button>
            <button type="submit" className={`submit-btn ${season}`} disabled={loading}>
              {loading ? 'Kreiram...' : 'Kreiraj Aktivnost'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}