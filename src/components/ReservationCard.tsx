import { Reservation } from '../types';
import '../styles/reservation_card.css';

interface Props {
  reservation: Reservation;
  onViewDetails: (reservation: Reservation) => void;
}

export default function ReservationCard({ reservation, onViewDetails }: Props) {
  const getIcon = () => {
    switch (reservation.reservation_type) {
      case 'activity': return 'sports_score';
      case 'accommodation': return 'hotel';
      case 'event': return 'event';
      default: return 'confirmation_number';
    }
  };

  const getTitle = () => {
    switch (reservation.reservation_type) {
      case 'activity': return reservation.activity?.name || 'Aktivnost';
      case 'accommodation': return reservation.accommodation?.name || 'Smestaj';
      case 'event': return reservation.event?.name || 'Event';
      default: return 'Rezervacija';
    }
  };

  const getStatusColor = () => {
    switch (reservation.status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="reservation-card" onClick={() => onViewDetails(reservation)}>
      <div className="reservation-card-icon">
        <span className="material-symbols-outlined">{getIcon()}</span>
      </div>
      <div className="reservation-card-content">
        <div className="reservation-card-header">
          <h4>{getTitle()}</h4>
          <span className={`status-badge status-${reservation.status}`}>
            {reservation.status === 'confirmed' && 'Potvrđeno'}
            {reservation.status === 'pending' && 'Na čekanju'}
            {reservation.status === 'cancelled' && 'Otkazano'}
            {reservation.status === 'completed' && 'Završeno'}
          </span>
        </div>
        <div className="reservation-card-dates">
          <span>{formatDate(reservation.date_from)}</span>
          <span>→</span>
          <span>{formatDate(reservation.date_to)}</span>
        </div>
        <div className="reservation-card-price">
          {reservation.total_price}€
          {reservation.people_count && ` • ${reservation.people_count} osoba`}
        </div>
      </div>
      <div className="reservation-card-arrow">
        <span className="material-symbols-outlined">chevron_right</span>
      </div>
    </div>
  );
}