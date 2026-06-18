import { useEffect, useState } from "react"
import { apiReq } from "../../hooks/api"
import "../../styles/reporter/allnews.css"
import { useNavigate } from "react-router-dom"

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

type Theme = "sve" | "infrastruktura" | "vremenska prognoza" | "sport" | "aktivnosti" | "dogadjaji"
type Status = "all" | "nacrt" | "objavljeno" | "zakazano"

const THEME_LABELS: Record<Theme, string> = {
    sve: "Sve vesti",
    infrastruktura: "Infrastruktura",
    "vremenska prognoza": "Vremenska prognoza",
    sport: "Sport",
    aktivnosti: "Aktivnosti",
    dogadjaji: "Događaji",
}

const STATUS_LABELS: Record<Status, string> = {
    all: "Svi statusi",
    nacrt: "Nacrt",
    objavljeno: "Objavljeno",
    zakazano: "Zakazano",
}

const STATUS_COLORS: Record<string, string> = {
    nacrt: "#c9a227",
    objavljeno: "#7ebf3f",
    zakazano: "#5a9abf",
}

export default function ReporterNews() {
    const navigate = useNavigate()
    const [news, setNews] = useState<Vest[]>([])
    const [filteredNews, setFilteredNews] = useState<Vest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    
    const [selectedTheme, setSelectedTheme] = useState<Theme>("sve")
    const [selectedStatus, setSelectedStatus] = useState<Status>("all")

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await apiReq.get("/news/all_news/")
                setNews(response.data)
                setFilteredNews(response.data)
            } catch (err) {
                console.error("Error fetching news:", err)
                setError('Greška pri učitavanju vesti')
            } finally {
                setLoading(false)
            }
        }
        fetchNews()
    }, [])

    useEffect(() => {
        let filtered = [...news]

        if (selectedTheme !== "sve") {
            filtered = filtered.filter(article => article.theme === selectedTheme)
        }

        if (selectedStatus !== "all") {
            filtered = filtered.filter(article => article.status === selectedStatus)
        }

        setFilteredNews(filtered)
    }, [news, selectedTheme, selectedStatus])

    const handleThemeFilter = (theme: Theme) => {
        setSelectedTheme(theme)
    }

    const handleStatusFilter = (status: Status) => {
        setSelectedStatus(status)
    }

    const getStatusLabel = (status: string) => {
        switch(status) {
            case "nacrt": return "Nacrt"
            case "objavljeno": return "Objavljeno"
            case "zakazano": return "Zakazano"
            default: return status
        }
    }

    if (loading) {
        return <div className="loading">Učitavanje vesti...</div>
    }

    if (error) {
        return <div className="error">{error}</div>
    }



   const renderTextPreview = (htmlString: string) => {
    if (!htmlString) return ""
    
    const cleanText = htmlString.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    
    return cleanText.length > 100 ? `${cleanText.substring(0, 100)}...` : cleanText
  }





    return (
        <main className="news_feed_main">
            <div className="categories">
                {Object.entries(THEME_LABELS).map(([value, label]) => (
                    <p
                        key={value}
                        onClick={() => handleThemeFilter(value as Theme)}
                        style={{
                            cursor: "pointer",
                            fontWeight: selectedTheme === value ? "bold" : "normal",
                            borderBottom: selectedTheme === value ? `2px solid ${STATUS_COLORS.objavljeno}` : "none",
                            padding: "0.5em 0",
                            margin: 0
                        }}
                    >
                        {label}
                    </p>
                ))}
            </div>

            <div className="filter">
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <p
                        key={value}
                        onClick={() => handleStatusFilter(value as Status)}
                        style={{
                            cursor: "pointer",
                            fontWeight: selectedStatus === value ? "bold" : "normal",
                            color: selectedStatus === value ? STATUS_COLORS[value as string] : "white",
                            padding: "0.5em 0",
                            margin: 0
                        }}
                    >
                        {label}
                    </p>
                ))}
            </div>

            <div className="news_all">
                {filteredNews.length === 0 ? (
                    <p style={{ textAlign: "center", gridColumn: "1/-1", color: "#666" }}>
                        Nema vesti za prikazane filtere
                    </p>
                ) : (
                    filteredNews.map((article) => (
                        <div 
                            className="article_one" 
                            key={article.id}
                            onClick={() => navigate(`/reporter/vestisredjivanje/${article.id}/edit`)}
                            style={{
                                backgroundImage: article.image ? `url(${article.image})` : "none",
                                backgroundSize: "cover",
                                backgroundPosition: "center"
                            }}
                        >
                            <div className="article_layout">
                                <div className="article_content">
                                    <div className="statuslines">
                                        <p style={{ 
                                            backgroundColor: STATUS_COLORS[article.status],
                                            color: "#0d0f0d"
                                        }}>
                                            {getStatusLabel(article.status)}
                                        </p>
                                        <p style={{
                                            backgroundColor: "#1a221a",
                                            color: "#aabcaa"
                                        }}>
                                            {THEME_LABELS[article.theme as Theme] || article.theme}
                                        </p>
                                    </div>
                                    
                                    <div className="title_news">
                                        <h1>{article.title}</h1>
                                    </div>
                                    
                                    <div className="text_news">
                                      {renderTextPreview(article.text)}
                                    </div>
                                    
                                    <div className="bottom_info">
                                        <span>
                                          <span className="material-symbols-outlined">person</span>
                                          {article.author}</span>
                                        <span>
                                          <span className="material-symbols-outlined">score</span>
                                          
                                          {article.views_count}</span>
                                        <span>
                                          <span className="material-symbols-outlined">
                                            calendar_check
                                          </span>
                                          {new Date(article.created_at).toLocaleDateString('sr-RS')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    )
}