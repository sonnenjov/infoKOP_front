import { Activity } from "../types";
import { Season } from "../hooks/useSeason";

interface Props {
  activity: Activity;
  index: number;
  onReserve: (activity: Activity) => void;
  season: Season;
  viewMode: 'list' | 'grid';
}

export default function ActivityCard({ activity, onReserve, season }: Props) {
  const badgeClass =
    activity.season === 'all_year' ? 'badge-all' :
    activity.season === 'summer' ? 'badge-summer' : 'badge-winter';

  const badgeLabel =
    activity.season === 'all_year' ? 'Ceo godinu' :
    activity.season === 'summer' ? 'Leto' : 'Zima';

  return (
    <div className="activity-card">
      {activity.image && (
        <div className="card-image">
          <img src={activity.image} alt={activity.title} />
          <div className={`card-badge ${badgeClass}`}>{badgeLabel}</div>
        </div>
      )}

      <div className="card-content">
        <div className="card-title-group">
          <h3 className="card-title">{activity.title}</h3>
          {activity.company_name && (
            <span className="company-name">{activity.company_name}</span>
          )}
        </div>

        {activity.description && (
          <p className="card-description">{activity.description}</p>
        )}

        <div className="card-details">
          <div className="detail-item">
            <span className="detail-label">Cena</span>
            <span className="detail-value">{activity.price}€</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Trajanje</span>
            <span className="detail-value">{activity.duration_minutes || '–'} min</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Max</span>
            <span className="detail-value">{activity.max_capacity} os.</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Lokacija</span>
            <span className="detail-value">{activity.location || '–'}</span>
          </div>
        </div>

        <div className="card-footer">
          <button
            className={`reserve-btn ${season}`}
            onClick={() => onReserve(activity)}
          >
            Rezerviši
          </button>
        </div>
      </div>
    </div>
  );
}