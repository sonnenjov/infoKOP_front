import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/vesti.css"
import axios from 'axios';
import { getToken } from "../hooks/auth";
type Vest = {
  id: number
  title: string
  theme: string
  image: string
  text: string
  author: string
  status: string
  priority: string
  is_visible: boolean
  tags: { id: number; name: string }[]
  created_at: string
  published_at: string | null
  views_count: number
  seo_title: string
  seo_desc: string
}

const THEME_LABELS: Record<string, string> = {
  sve: "Sve",
  infrastruktura: "Infrastruktura",
  "vremenska prognoza": "Vremenska prognoza",
  sport: "Sport",
  aktivnosti: "Aktivnosti",
  dogadjaji: "Događaji",
}

const THEMES = Object.keys(THEME_LABELS)

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`
}

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "")

export default function Vesti() {
  const navigate = useNavigate()
  const [news, setNews] = useState<Vest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTheme, setActiveTheme] = useState("sve")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [email,setEmail] = useState('')
  const [status, setStatus] = useState('');
  const PER_PAGE = 6

  useEffect(() => {
    fetch("http://192.168.1.6:8000/api/news/all_news/")
      .then(r => r.json())
      .then(d => setNews(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = news.filter(n => {
    const matchTheme = activeTheme === "sve" || n.theme === activeTheme
    const matchSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      stripHtml(n.text).toLowerCase().includes(search.toLowerCase())
    return matchTheme && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const hero = filtered[0]
  const rest = paginated.slice(1)

  const handleTheme = (t: string) => {
    setActiveTheme(t)
    setPage(1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleNewsletter = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStatus("Sending...")


    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }


    try {
      const response = await axios.post(
        "http://192.168.1.6:8000/api/newsletter/subscribe/",
        {email: email},
        {headers:headers}
      );
      console.log(response)
      if (response.status == 200 || response.status == 201) {
        setStatus("Successfully subscribed to newsletter")
        setEmail("");
      }
    } catch (err) {
      console.error('API Error', err);
      setStatus(err.response?.data?.detail || "Error occured")
    }
  
  }




  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  return (
    <main className="vesti-page">
      <section className="vesti-header">
        <div className="vesti-header__inner">
          <p className="vesti-header__eyebrow">VESTI I IZVEŠTAJI</p>
          <h1 className="vesti-header__title">Planinske Vesti</h1>
          <p className="vesti-header__sub">
            Najnovije informacije sa Kopaonika — staze, vreme, događaji i sve što treba da znate pre polaska.
          </p>
        </div>
        <div className="vesti-header__gradient" />
      </section>

      <div className="vesti-controls">
        <div className="vesti-themes">
          {THEMES.map(t => (
            <button
              key={t}
              className={`vesti-theme-btn${activeTheme === t ? " vesti-theme-btn--active" : ""}`}
              onClick={() => handleTheme(t)}
            >
              {THEME_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="vesti-search">
          <span className="material-symbols-outlined vesti-search__icon">search</span>
          <input
            type="text"
            placeholder="Pretražite vesti..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="vesti-loading">
          <div className="vesti-loading__spinner" />
          <p>Učitavanje vesti...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="vesti-empty">
          <span className="material-symbols-outlined">search_off</span>
          <p>Nema vesti za izabranu kategoriju.</p>
        </div>
      ) : (
        <div className="vesti-content">
          {hero && page === 1 && (
            <article
              className="vesti-hero"
              onClick={() => navigate(`/vesti/${hero.id}`)}
              style={{ backgroundImage: `url(${hero.image})` }}
            >
              <div className="vesti-hero__overlay" />
              <div className="vesti-hero__body">
                <div className="vesti-hero__meta">
                  <span className="vesti-tag">{THEME_LABELS[hero.theme] || hero.theme}</span>
                  {hero.priority === "visok" && <span className="vesti-urgent">HITNO</span>}
                  <span className="vesti-hero__date">{formatDate(hero.created_at)}</span>
                </div>
                <h2 className="vesti-hero__title">{hero.title}</h2>
                <p className="vesti-hero__excerpt">{stripHtml(hero.text).slice(0, 160)}...</p>
                <div className="vesti-hero__footer">
                  <span className="vesti-hero__author">
                    <span className="material-symbols-outlined">person</span>
                    {hero.author}
                  </span>
                  
                  <button className="vesti-hero__cta">
                    Pročitaj više <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </article>
          )}

          <div className="vesti-grid">
            {rest.map(article => (
              <article
                key={article.id}
                className="vesti-card"
                onClick={() => navigate(`/vesti/${article.id}`)}
              >
                <div
                  className="vesti-card__img"
                  style={{ backgroundImage: `url(${article.image})` }}
                >
                  <span className="vesti-tag vesti-tag--card">
                    {THEME_LABELS[article.theme] || article.theme}
                  </span>
                  {article.priority === "visok" && (
                    <span className="vesti-urgent vesti-urgent--card">HITNO</span>
                  )}
                </div>
                <div className="vesti-card__body">
                  <p className="vesti-card__date">{formatDate(article.created_at)}</p>
                  <h3 className="vesti-card__title">{article.title}</h3>
                  <p className="vesti-card__excerpt">
                    {stripHtml(article.text).slice(0, 100)}...
                  </p>
                  <div className="vesti-card__footer">
                    <span className="vesti-card__author">
                      <span className="material-symbols-outlined">person</span>
                      {article.author}
                    </span>
                    
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="vesti-pagination">
              <button
                className="vesti-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`vesti-page-btn${page === p ? " vesti-page-btn--active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="vesti-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}


  <div className="vesti-newsletter">
  <div>
    <h2 className="vesti-newsletter__title">Budite prvi koji će saznati</h2>
    <p className="vesti-newsletter__sub">
      Prijavite se na naš newsletter i dobijajte najvažnije vesti o stanju na planini,
      ekskluzivne ponude i hitna obaveštenja direktno u vaš inbox.
    </p>
  </div>
  <div className="vesti-newsletter__form">
    <div className="vesti-newsletter__input">
      <span className="material-symbols-outlined">mail</span>
      <input 
      value={email} 
      onChange={handleChange} 
      placeholder="your@email.com"
      type="email" 
       />
    </div>
    <button 
    onClick={(e)=> {
      handleNewsletter(e)
    }}
    className="vesti-newsletter__btn">Prijavi se na listu</button>

    {status && (
  <p style={{ 
    color: status.includes('Error') ? '#e05555' : 'var(--weather-inactive-summer)',
    fontFamily: 'JetBrain Mono',
    fontSize: '0.75em',
    textAlign: 'center'
  }}>
    {status}
  </p>
)}
    <p className="vesti-newsletter__privacy">
      Vaša privatnost je sigurna. Možete se odjaviti u bilo kom trenutku.
    </p>
  </div>
</div>
        </div>
      )}
    </main>
  )
}
