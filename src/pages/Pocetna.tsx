import "../styles/main.css"
import "../styles/pocetna.css"
import { Season } from "../hooks/useSeason"
import WeatherReport from "../components/WeatherReport";
import { useEffect, useState } from "react";
import { apiReq } from "../hooks/api";
import { useNavigate } from "react-router-dom";

interface Props {
  activeSeason: Season;
}

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
 

export default function Page({ activeSeason }: Props) {
  const [news, setNews] = useState<Vest[]>([])
  const [error,setError] = useState('')
  const navigate = useNavigate()
const renderTextPreview = (htmlString: string) => {
    if (!htmlString) return ""
    
    const cleanText = htmlString.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    
    return cleanText.length > 100 ? `${cleanText.substring(0, 200)}...` : cleanText
  }





  useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await apiReq.get("/news/all_news/")
                setNews(response.data)
            } catch (err) {
                console.error("Error fetching news:", err)
                setError('Greška pri učitavanju vesti')
            } 
        }
        fetchNews()
    }, [])
 
 
 
 
  return (
    <main >
      <div className={activeSeason === 'summer' ? 'main_background_summer' : 'main_background_winter'}>

      <div className={activeSeason === 'summer' ? 'block_summer' : 'block_winter'}>
      <div className="header_pocetna">
        <h1>DOŽIVITE KOPAONIK U SVAKOM TRENUTKU</h1>
        <p>Vremenska prognoza u realnom vremenu, stanje na stazama, smeštaj i najnovije vesti sa najpopularnije srpske planine.</p>
        
      </div>
      <WeatherReport activeSeason={activeSeason} />   
      <div className="gradient">

      </div>
      </div>
     
    </div>
     <div className="vesti">
        <h5 className={activeSeason === 'summer' ? "podnaslov_summer" : "podnaslov_winter"}>AKTUELNOSTI</h5>
        <h1 className="naslov">NAJNOVIJE VESTI</h1>
        <div className="newsdiv">

        {news && news.slice(0, 3).map((vest) => 
        (
          <div 
          onClick={() => navigate(`/vesti/${vest.id}`)}
          className="vest_kartica" 
         
          key={vest.id}>
          <div 
           style={{
             backgroundImage: vest.image ? `url(${vest.image})` : "none",
             backgroundSize: "cover",
             backgroundPosition: "center"
            }}
          className="vest_kartica_layout">
            <div className="layoutoverlay"/>
          </div>
          <div 
           
            className="vest_kartica_content">
        <h1>{vest.title}</h1>
        <p>{renderTextPreview(vest.text)}</p>
         <span>
          <span className="material-symbols-outlined">person</span>
          {vest.author}</span>
          <span>
          <span className="material-symbols-outlined">score</span>
          {vest.views_count}</span>
          <span>
          <span className="material-symbols-outlined">
          calendar_check
          </span>
          {new Date(vest.created_at).toLocaleDateString('sr-RS')}</span>
          </div>
      </div>
    ))}
       <button
       onClick={() => navigate("/vesti")}
       >Procitaj jos vesti</button>
      </div>
      </div>

     

    </main>
  )
}