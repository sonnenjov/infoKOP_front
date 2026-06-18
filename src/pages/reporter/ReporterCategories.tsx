import { useEffect, useState } from "react"
import { apiReq } from "../../hooks/api"
import "../../styles/reporter/kategorije.css"

type Tag = { id: number; name: string }
type Vest = { id: number; theme: string; status: string }

const THEMES = [
  { value: "sve", label: "Sve" },
  { value: "infrastruktura", label: "Infrastruktura" },
  { value: "vremenska prognoza", label: "Vremenska prognoza" },
  { value: "sport", label: "Sport" },
  { value: "aktivnosti", label: "Aktivnosti" },
  { value: "dogadjaji", label: "Događaji" },
]

export default function ReporterCategories() {
  const [news, setNews] = useState<Vest[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiReq.get("news/all_news/"),
      apiReq.get("tags/")
    ]).then(([newsRes, tagsRes]) => {
      setNews(newsRes.data)
      setTags(tagsRes.data)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])



  const countByTheme = (theme: string) =>
    news.filter(n => n.theme === theme && n.status === "objavljeno").length

  return (
    <div className="rk-page">
      <div className="rk-stats">
        <div className="rk-stat">
          <span className="material-symbols-outlined rk-stat__icon">folder</span>
          <div>
            <p className="rk-stat__label">Total Categories</p>
            <p className="rk-stat__value">{THEMES.length}</p>
          </div>
        </div>
        <div className="rk-stat">
          <span className="material-symbols-outlined rk-stat__icon">article</span>
          <div>
            <p className="rk-stat__label">Total Articles</p>
            <p className="rk-stat__value">{loading ? "—" : news.filter(n => n.status === "objavljeno").length}</p>
          </div>
        </div>
        <div className="rk-stat">
          <span className="material-symbols-outlined rk-stat__icon">label</span>
          <div>
            <p className="rk-stat__label">Total Tags</p>
            <p className="rk-stat__value">{loading ? "—" : tags.length}</p>
          </div>
        </div>
      </div>

      {/* THEMES */}
      <div className="rk-section">
        <h2 className="rk-section__title">Content Architecture</h2>
        <p className="rk-section__sub">Manage resort news classifications and visibility settings.</p>
        <div className="rk-themes">
          {THEMES.map(t => (
            <div key={t.value} className="rk-theme-card">
              <span className="material-symbols-outlined rk-theme-card__icon">folder_open</span>
              <h3 className="rk-theme-card__name">{t.label}</h3>
              <p className="rk-theme-card__count">
                <span>{countByTheme(t.value)}</span> ARTICLES
              </p>
            </div>
          ))}
        </div>
      </div>

    
    </div>
  )
}