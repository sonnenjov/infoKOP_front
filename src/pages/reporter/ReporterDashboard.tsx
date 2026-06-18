import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiReq } from "../../hooks/api"
import "../../styles/reporter/dashboard_reporter.css"

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
  created_at: string
  updated_at: string
  views_count: number
}

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}min ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return `Juče`
  return `${days} dana ago`
}

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "")

export default function ReporterDashboard() {
  const navigate = useNavigate()
  const [news, setNews] = useState<Vest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiReq.get("news/all_news/")
      .then(r => setNews(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const published = news.filter(n => n.status === "objavljeno")
  const drafts = news.filter(n => n.status === "nacrt")
  const totalViews = news.reduce((sum, n) => sum + (n.views_count || 0), 0)

  return (
    <div className="rd-page">
      <header className="rd-topbar">
        <div>
          <p className="rd-topbar__greeting">DOBRO JUTRO, REPORTERU</p>
          <h1 className="rd-topbar__title">Daily Overview</h1>
        </div>
        <div className="rd-topbar__actions">
          <button
            className="rd-btn rd-btn--outline"
            onClick={() => window.open("/vesti", "_blank")}
          >
            <span className="material-symbols-outlined">open_in_new</span>
            View Live Site
          </button>
          <button
            className="rd-btn rd-btn--primary"
            onClick={() => navigate("/reporter/vestisredjivanje")}
          >
            <span className="material-symbols-outlined">add</span>
            New Article
          </button>
        </div>
      </header>

      <div className="rd-stats">
        <div className="rd-stat">
          <div className="rd-stat__top">
            <span className="material-symbols-outlined rd-stat__icon">article</span>
            <span className="rd-stat__label">This week</span>
          </div>
          <p className="rd-stat__value">
            {loading ? "—" : published.length}
          </p>
          <p className="rd-stat__desc">My Published Articles</p>
        </div>

        <div className="rd-stat">
          <div className="rd-stat__top">
            <span className="material-symbols-outlined rd-stat__icon">visibility</span>
            <span className="rd-stat__label rd-stat__label--green">15% Growth</span>
          </div>
          <p className="rd-stat__value">
            {loading ? "—" : totalViews >= 1000
              ? `${(totalViews / 1000).toFixed(1)}k`
              : totalViews}
          </p>
          <p className="rd-stat__desc">Total Views</p>
        </div>
      </div>

      <div className="rd-drafts">
        <div className="rd-drafts__header">
          <h2 className="rd-drafts__title">Recent Drafts</h2>
          <button
            className="rd-drafts__link"
            onClick={() => navigate("/reporter/vesti")}
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="rd-loading">
            <div className="rd-loading__spinner" />
          </div>
        ) : drafts.length === 0 ? (
          <p className="rd-empty">Nema nacrta.</p>
        ) : (
          <div className="rd-drafts__list">
            {drafts.slice(0, 4).map(article => (
              <div
                key={article.id}
                className="rd-draft-item"
                onClick={() => navigate(`/reporter/vestisredjivanje/${article.id}/edit/`)}
              >
                <div
                  className="rd-draft-item__img"
                  style={{ backgroundImage: article.image ? `url(${article.image})` : "none" }}
                />
                <div className="rd-draft-item__body">
                  <span className="rd-draft-item__theme">{article.theme}</span>
                  <h3 className="rd-draft-item__title">{article.title}</h3>
                  <p className="rd-draft-item__excerpt">
                    {stripHtml(article.text).slice(0, 60)}...
                  </p>
                </div>
                <div className="rd-draft-item__meta">
                  <span className="rd-draft-item__time">
                    Last Edit<br />
                    <strong>{formatTimeAgo(article.updated_at)}</strong>
                  </span>
                  <span className="material-symbols-outlined rd-draft-item__arrow">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}