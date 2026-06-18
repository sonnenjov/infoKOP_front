import "../styles/main.css"
import { Season } from "../hooks/useSeason"
import Calendar from "react-calendar"
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css'
import '../styles/dogadjaji.css'
import { useState } from "react";
import { useDogadjaji } from '../hooks/useDogadjaji'
import CompanyFilter from '../components/CompanyFilter'
import { apiReq } from '../hooks/api'

interface Props {
  activeSeason: Season;
}

const filterOptions = ['Svi', 'Koncerti', 'Festivali', 'Sport', 'Kultura', 'Ostalo'];

const filterValueMap: Record<string, string | undefined> = {
  'Svi': undefined,
  'Koncerti': 'koncerti',
  'Festivali': 'festivali',
  'Sport': 'sport',
  'Kultura': 'kultura',
  'Ostalo': 'ostalo',
};

export default function Dogadjaji({ activeSeason }: Props) {
  const [activeFilter, setActiveFilter] = useState('Svi');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'lista' | 'mreza'>('lista');
  const [reserving, setReserving] = useState<number | null>(null);
  const [success, setSuccess] = useState<number | null>(null);

  const filters = {
    kategorija: filterValueMap[activeFilter],
    season: activeSeason === 'all' ? undefined : activeSeason,
    od_datuma: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
    kompanija: selectedCompany?.id,
    page,
  };

  const { data, loading, error } = useDogadjaji(filters);

  const hasMore = data?.next != null;

  const reserve = async (dogadjaj: any) => {
  console.log('dogadjaj:', dogadjaj);
  setReserving(dogadjaj.id);
  try {
const companyId = typeof dogadjaj.company === 'object'
  ? dogadjaj.company?.id
  : dogadjaj.company ?? null;

    const payload = {
      company: companyId,
      service_name: dogadjaj.naziv,
      service_type: 'dogadjaj',
      company_name: dogadjaj.company?.company_name || '',
      date_from: dogadjaj.datum_pocetka,
      date_to: null,               
      guests: 1,                    
      amount: dogadjaj.je_besplatan ? 0 : dogadjaj.cena,
      notes: '',
      source: 'InfoKOP',
      channel: 'infokop',
      status: 'pending',
    };

    await apiReq.post('/rezervacije/reservations/', payload);
    setSuccess(dogadjaj.id);
  } catch (err: any) {
    console.error('Reserve error:', err);
    alert('Greška pri rezervaciji: ' + (err.response?.data?.detail || err.message));
  } finally {
    setReserving(null);
  }
};
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleDateChange = (val: any) => {
    if (
      selectedDate &&
      val instanceof Date &&
      val.toDateString() === selectedDate.toDateString()
    ) {
      setSelectedDate(null);
    } else {
      setSelectedDate(val as Date);
    }
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedCompany(null);
    setActiveFilter('Svi');
    setPage(1);
  };

  const eventDates = new Set(
    (data?.results ?? []).map((d: any) => d.datum_pocetka)
  );

  return (
    <main>
      <div className={`dogadjaji ${activeSeason}`}>

        <div className={`istaknuto_main ${activeSeason}`}>
          <div className="istaknuto_inner">
            <div className="content">
              <h1 className="dogadjaji_naslov">DOGADJAJI</h1>
              <p>Istražite naš kalendar i rezervišite svoje mesto na sledećem okupljanju.</p>
            </div>
            <div className="gradient_bottom"></div>
          </div>
        </div>

        <div className={`nadolazeci_dogadjaji ${activeSeason}`}>

          <aside className="sidebar" style={{ gridArea: 'box-1' }}>
            <div className="mini-calendar">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileClassName={({ date }) => {
                  const dateStr = date.toISOString().split('T')[0];
                  return eventDates.has(dateStr) ? 'has-event' : null;
                }}
              />
              {selectedDate && (
                <button className="clear-date-btn" onClick={() => setSelectedDate(null)}>
                  <span className="material-symbols-outlined">close</span>
                  Ukloni datum
                </button>
              )}
            </div>

            <CompanyFilter
              activeSeason={activeSeason}
              onCompanySelect={(c) => {
                setSelectedCompany(c);
                setPage(1);
              }}
              filterType="dogadjaji"
            />

            <div className="filters">
              <h2>Filteri</h2>
              <div className={`filter_comp ${activeSeason}`}>
                {filterOptions.map((filter) => (
                  <p
                    key={filter}
                    className={activeFilter === filter ? 'active' : ''}
                    onClick={() => { setActiveFilter(filter); setPage(1); }}
                  >
                    {filter}
                  </p>
                ))}
              </div>
            </div>

            {(selectedDate || selectedCompany || activeFilter !== 'Svi') && (
              <button className="clear-all-btn" onClick={clearFilters}>
                <span className="material-symbols-outlined">filter_alt_off</span>
                Resetuj filtere
              </button>
            )}
          </aside>

          <div className="list" style={{ gridArea: 'box-2' }}>
            <div className="naslovi">
              <p>
                NADOLAZECI DOGADJAJI
                {data?.count != null && (
                  <span className="event-count">{data.count}</span>
                )}
              </p>
              <div className="view-toggle">
                <span>Prikaz:</span>
                <button
                  className={viewMode === 'lista' ? 'active' : ''}
                  onClick={() => setViewMode('lista')}
                  title="Lista"
                >
                  <span className="material-symbols-outlined">list</span>
                  LISTA
                </button>
                <button
                  className={viewMode === 'mreza' ? 'active' : ''}
                  onClick={() => setViewMode('mreza')}
                  title="Mreža"
                >
                  <span className="material-symbols-outlined">grid_view</span>
                  MREŽA
                </button>
              </div>
            </div>

            <div className={`elementi ${viewMode}`}>
              {loading && page === 1 && (
                <div className="loading-state">
                  <span className="material-symbols-outlined spinning">progress_activity</span>
                  <p>Učitavanje...</p>
                </div>
              )}

              {error && (
                <div className="error-state">
                  <span className="material-symbols-outlined">error</span>
                  <p>Greška pri učitavanju. Pokušajte ponovo.</p>
                  <button className="retry-btn" onClick={() => setPage(1)}>
                    Pokušaj ponovo
                  </button>
                </div>
              )}

              {!loading && !error && data?.results?.length === 0 && (
                <div className="empty-state">
                  <span className="material-symbols-outlined">event_busy</span>
                  <p>Nema događaja za izabrane filtere.</p>
                  <button className="clear-all-btn" onClick={clearFilters}>
                    Resetuj filtere
                  </button>
                </div>
              )}

              {data?.results?.map((dogadjaj: any) => (
                <div className="event-card" key={dogadjaj.id}>
                  {dogadjaj.image_url && (
                    <img src={dogadjaj.image_url} alt={dogadjaj.naziv} />
                  )}
                  <div className="event-info">
                    <div className="event-meta">
                      {dogadjaj.kategorija && (
                        <span className={`event-badge badge-${dogadjaj.kategorija}`}>
                          {dogadjaj.kategorija}
                        </span>
                      )}
                    </div>
                    <h2>{dogadjaj.naziv}</h2>
                    <p className="datum">
                      {dogadjaj.datum_pocetka}
                      {dogadjaj.vreme && ` · ${dogadjaj.vreme}`}
                    </p>
                    <p className="lokacija">{dogadjaj.lokacija}</p>
                    <p className="opis">{dogadjaj.opis}</p>
                    {dogadjaj.company && (
                      <p className="organizator">
                        Organizator: {dogadjaj.company.company_name}
                      </p>
                    )}
                    <div className="event-footer">
                      <span className="cena">
                        {dogadjaj.je_besplatan ? 'Besplatno' : `${dogadjaj.cena} €`}
                      </span>
                      <div className="event-actions">
                        <button
                          className="btn-bookmark"
                          title="Sačuvaj"
                          onClick={(e) => e.preventDefault()}
                        >
                          <span className="material-symbols-outlined">bookmark</span>
                        </button>
                        <button
                          className={`btn-reserve ${activeSeason}`}
                          disabled={reserving === dogadjaj.id}
                          onClick={() => reserve(dogadjaj)}
                        >
                          {success === dogadjaj.id
                            ? 'Rezervisano!'
                            : reserving === dogadjaj.id
                            ? 'Slanje...'
                            : 'PRIJAVI SE'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {loading && page > 1 && (
                <div className="loading-more">
                  <span className="material-symbols-outlined spinning">progress_activity</span>
                </div>
              )}
            </div>

            {hasMore && !loading && (
              <button className={`load-more-btn ${activeSeason}`} onClick={handleLoadMore}>
                UČITAJ VIŠE DOGAĐAJA
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}