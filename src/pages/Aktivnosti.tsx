import { Season } from "../hooks/useSeason";
import "../styles/aktivnosti.css";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import ActivityCard from "../components/ActivityCard";
import CreateActivityModal from "../components/CreateActivityModal";
import ReservationModal from "../components/ReservationModal";
import { Activity, WeatherData } from "../types";
import { API_URL } from "../config";

interface Props { 
  activeSeason: Season 
}

type SeasonFilter = 'current' | 'summer' | 'winter' | 'all';
type PriceFilter = 'all' | 'under50' | '50to100' | 'over100';

export default function Aktivnosti({ activeSeason }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, isCompany } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('current');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/aktivnosti/?season=${activeSeason}`
      );
      const data = await response.json();
      setActivities(data.results || data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const response = await fetch(`${API_URL}/api/weather/fetchweather`);
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchWeather();
  }, [activeSeason]);

  const handleReservation = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowReservationModal(true);
  };

  const handleReservationSuccess = () => {
    setShowReservationModal(false);
    setSelectedActivity(null);
    fetchActivities();
  };

  const handleActivityCreated = () => {
    setShowCreateModal(false);
    fetchActivities();
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSeason =
      seasonFilter === 'all'
        ? true
        : seasonFilter === 'current'
        ? activity.season === activeSeason || activity.season === 'all_year'
        : activity.season === seasonFilter || activity.season === 'all_year';

    if (!matchesSeason) return false;

    const price = Number(activity.price);
    if (priceFilter === 'under50' && !(price <= 50)) return false;
    if (priceFilter === '50to100' && !(price > 50 && price <= 100)) return false;
    if (priceFilter === 'over100' && !(price > 100)) return false;

    return true;
  });

  return (
    <main className="aktivnosti-page">
      <div className={`aktivnosti-hero ${activeSeason}`}>
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="aktivnosti-naslov">AKTIVNOSTI</h1>
            <p className="hero-subtitle">
              Otkrijte neograničene mogućnosti za avanturu na Srebrnoj planini. 
              Bez obzira na godišnje doba, Kopaonik nudi vrhunske sadržaje za 
              sport i rekreaciju.
            </p>
            {isCompany && (
              <button 
                className="create-activity-btn"
                onClick={() => setShowCreateModal(true)}
              >
                <span className="material-symbols-outlined">add</span>
                Kreiraj Aktivnost
              </button>
            )}
          </div>
        </div>
        <div className="gradient-bottom"></div>
      </div>

      <div className="aktivnosti-main">
        <div className={`aktivnosti-grid ${activeSeason}`}>
          <div className="sidebar">
            <div className="weather-card">
              <div className="weather-header">
                <span className="weather-icon">temp</span>
                <span className="weather-label">TRENUTNI USLOVI</span>
              </div>
              <div className="weather-temp">
                {weather?.current?.apparent_temperature || '--'}°C
              </div>
              <div className="weather-condition">
                {weather?.current?.weather_code === 71 || 
                 weather?.current?.weather_code === 73 || 
                 weather?.current?.weather_code === 75 
                  ? 'Sneg pada' 
                  : ' Suvo vreme'}
              </div>
              <div className="weather-details">
                <div className="weather-detail">
                  <span>Žicare</span>
                  <strong>8/12</strong>
                </div>
                <div className="weather-detail">
                  <span>Staze</span>
                  <strong>15/25</strong>
                </div>
              </div>
            </div>

            <div className={`filters ${activeSeason}`}>
              <h2>Filteri</h2>
              <div className="filter-group">
                <p className="filter-label">Sezona</p>
                <div className="filter-options">
                  <button 
                    className={`filter-btn ${seasonFilter === 'current' ? 'active' : ''}`}
                    onClick={() => setSeasonFilter('current')}
                  >
                    {activeSeason === 'summer' ? 'Leto' : 'Zima'}
                  </button>
                  <button 
                    className={`filter-btn ${seasonFilter === (activeSeason === 'summer' ? 'winter' : 'summer') ? 'active' : ''}`}
                    onClick={() => setSeasonFilter(activeSeason === 'summer' ? 'winter' : 'summer')}
                  >
                    {activeSeason === 'summer' ? 'Zima' : 'Leto'}
                  </button>
                  <button 
                    className={`filter-btn ${seasonFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setSeasonFilter('all')}
                  >
                    Sve
                  </button>
                </div>
              </div>
              <div className="filter-group">
                <p className="filter-label">Cena</p>
                <div className="filter-options">
                  <button
                    className={`filter-btn ${priceFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setPriceFilter('all')}
                  >
                    Sve
                  </button>
                  <button
                    className={`filter-btn ${priceFilter === 'under50' ? 'active' : ''}`}
                    onClick={() => setPriceFilter('under50')}
                  >
                    Do 50€
                  </button>
                  <button
                    className={`filter-btn ${priceFilter === '50to100' ? 'active' : ''}`}
                    onClick={() => setPriceFilter('50to100')}
                  >
                    50-100€
                  </button>
                  <button
                    className={`filter-btn ${priceFilter === 'over100' ? 'active' : ''}`}
                    onClick={() => setPriceFilter('over100')}
                  >
                    100+€
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="activities-list">
            <div className="list-header">
              <div className="header-left">
                <span className="section-title">
                  {activeSeason === 'summer' ? 'Letnje Aktivnosti' : 'Zimske Aktivnosti'}
                </span>
                <span className="activity-count">
                  {filteredActivities.length} aktivnosti
                </span>
              </div>
              <div className="view-toggle">
                <span>Prikaz:</span>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <span className="material-symbols-outlined">list</span>
                  Lista
                </button>
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <span className="material-symbols-outlined">grid</span>
                  Mreža
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <span className="material-symbols-outlined spinning">refresh</span>
                <p>Učitavanje aktivnosti...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="empty-state">
                <span className="material-symbols-outlined">search_off</span>
                <p>Nema aktivnosti za izabrane filtere</p>
                {isCompany && (
                  <button 
                    className="create-first-btn"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Kreiraj prvu aktivnost
                  </button>
                )}
              </div>
            ) : (
              <div className={`activities-container ${viewMode}`}>
                {filteredActivities.map((activity, index) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    index={index}
                    onReserve={handleReservation}
                    season={activeSeason}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showReservationModal && selectedActivity && (
        <ReservationModal
          activity={selectedActivity}
          onClose={() => {
            setShowReservationModal(false);
            setSelectedActivity(null);
          }}
          onSuccess={handleReservationSuccess}
          season={activeSeason}
        />
      )}

      {showCreateModal && (
        <CreateActivityModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleActivityCreated}
          season={activeSeason}
        />
      )}
    </main>
  );
}