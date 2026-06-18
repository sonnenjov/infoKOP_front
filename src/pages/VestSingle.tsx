import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_URL } from "../config"

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

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${d.getFullYear()}`
}

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "")

export default function VestSingle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [article, setArticle] = useState<Vest | null>(null)
  const [related, setRelated] = useState<Vest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    setArticle(null)
    fetch(`${API_URL}/api/news/${id}/`)
      
       .then(r => {
        if (!r.ok) throw new Error('not found')  
        return r.json()
      })
      .then(data => {
        setArticle(data)
        return fetch(`${API_URL}/api/news/all_news/`)
      })
      .then(r => r.json())
      .then((all: Vest[]) => {
        setRelated(
          all
            .filter(a => a.id !== Number(id))
            .slice(0, 3)
        )
      })
      .catch(() => {
      setArticle(null)}) 
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="vd-loading">
        <div className="vd-loading__spinner" />
      </div>
    )
  }

 if (!loading && !article) {
  return (
    <div className="vd-error">
      <span className="vd-error__code">404</span>
      <span className="material-symbols-outlined vd-error__icon">newspaper</span>
      <h1 className="vd-error__title">Vest nije pronađena</h1>
      <p className="vd-error__sub">Vest koju tražite ne postoji ili je uklonjena.</p>
      <button className="vd-error__btn" onClick={() => navigate("/vesti")}>
        <span className="material-symbols-outlined">arrow_back</span>
        Nazad na vesti
      </button>
    </div>
  )
}

  return (
    <div className="vd-page">
      <button className="vd-back" onClick={() => navigate("/vesti")}>
        <span className="material-symbols-outlined">arrow_back</span>
        Nazad na vesti
      </button>

      <div
        className="vd-cover"
        style={{ backgroundImage: `url(${article.image})` }}
      >
        <div className="vd-cover__overlay" />
        <div className="vd-cover__meta">
          <span className="vd-tag">{THEME_LABELS[article.theme] || article.theme}</span>
          {article.priority === "visok" && (
            <span className="vd-urgent">HITNO</span>
          )}
        </div>
      </div>

      <article className="vd-article">
        <header className="vd-article__header">
          <div className="vd-article__info">
            <span className="vd-article__date">
              <span className="material-symbols-outlined">calendar_today</span>
              {formatDate(article.created_at)}
            </span>
            <span className="vd-article__author">
              <span className="material-symbols-outlined">person</span>
              {article.author}
            </span>
            <span className="vd-article__views">
              <span className="material-symbols-outlined">visibility</span>
              {article.views_count.toLocaleString()} pregleda
            </span>
          </div>
          <h1 className="vd-article__title">{article.title}</h1>

          {article.tags.length > 0 && (
            <div className="vd-article__tags">
              {article.tags.map(tag => (
                <span key={tag.id} className="vd-article__tag">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        <div
          className="vd-article__content"
          dangerouslySetInnerHTML={{ __html: article.text }}
        />

        <div className="vd-share">
          <span className="vd-share__label">Podelite vest</span>
          <button className="vd-share__btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>
            <span className="material-symbols-outlined">link</span>
            Kopiraj link
          </button>
        </div>
      </article>

      {related.length > 0 && (
        <section className="vd-related">
          <h2 className="vd-related__title">Slične vesti</h2>
          <div className="vd-related__grid">
            {related.map(a => (
              <div
                key={a.id}
                className="vd-related__card"
                onClick={() => navigate(`/vesti/${a.id}`)}
              >
                <div
                  className="vd-related__img"
                  style={{ backgroundImage: `url(${a.image})` }}
                >
                  <span className="vd-tag vd-tag--sm">
                    {THEME_LABELS[a.theme] || a.theme}
                  </span>
                </div>
                <div className="vd-related__body">
                  <p className="vd-related__date">{formatDate(a.created_at)}</p>
                  <h3 className="vd-related__card-title">{a.title}</h3>
                  <p className="vd-related__excerpt">
                    {stripHtml(a.text).slice(0, 90)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="vd-all-btn" onClick={() => navigate("/vesti")}>
            Sve vesti
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </section>
      )}
    </div>
  )
}