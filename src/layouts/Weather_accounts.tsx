import { useEffect, useState } from "react"
import { getWeatherIconName } from "../services/iconMap"
import "../styles/user/weather.css"
import { API_URL } from "../config"


const getWeatherDescription = (code: number): string => {
  const descriptions: Record<number, string> = {
    0:  "Vedro",
    1:  "Pretežno vedro",
    2:  "Delimično oblačno",
    3:  "Oblačno",
    45: "Magla",
    48: "Magla sa mrazom",
    51: "Slab rosulja",
    53: "Umerena rosulja",
    55: "Gusta rosulja",
    61: "Slab dažd",
    63: "Umeren dažd",
    65: "Jak dažd",
    71: "Slab sneg",
    73: "Umeren sneg",
    75: "Jak sneg",
    77: "Zrnevlje",
    80: "Slabi pljuskovi",
    81: "Umereni pljuskovi",
    82: "Jaki pljuskovi",
    85: "Slabi snežni pljuskovi",
    86: "Jaki snežni pljuskovi",
    95: "Grmljavina",
    96: "Grmljavina sa gradom",
    99: "Grmljavina sa jakim gradom",
  }
  return descriptions[code] ?? "Nepoznato"
}



interface WeatherData {
  daily: {
    time: Date[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    apparent_temperature_mean: number[]
    weather_code: number[]
    wind_speed_10m: number[]
    wind_direction_10m: number[]
  },
  current: {
    weather_code: number
    apparent_temperature: number
    wind_speed_10m: number       
    wind_direction_10m: number    
  },
  current_units: {               
    apparent_temperature: string
  }
}

const getWindDirection = (deg: number | undefined): string => {
  if (deg === undefined) return ""
  const dirs = ["S", "SSI", "SI", "ISI", "I", "IIJ", "IJ", "JIJ", "J", "JJZ", "JZ", "ZJZ", "Z", "ZSZ", "SZ", "SSZ"]
  return dirs[Math.round(deg / 22.5) % 16]
}

// usage




export function WeatherDisplay({ weatherCode }: { weatherCode: number }) {
     const iconUrl = getWeatherIconName(weatherCode);

          return (
              <span className='material-symbols-outlined clouds' >
                  {iconUrl}
              </span> 
            );
}
export default  function Weather_accounts() {
  
  const [weather, setWeather] = useState<WeatherData | null>(null)
  
  useEffect(() => {
    fetch(`${API_URL}/api/weather/fetchweather/`)
    .then((response) => response.json())
    
    .then((data) => {
      setWeather(data)
    })
    .catch((error) => {
      console.log(error)
    })
    
    
  },[])
 
const windSpeed = weather?.current?.wind_speed_10m
const windDir = weather?.current?.wind_direction_10m 
if (!weather?.current) return <div className="weather_block">Učitavanje...</div>
  return (
    <>
    <div className="weather_block">
      <div className="first_weatherblock">
        <div className="prognoza">
          Prognoza: {"Kopaonik"}
        </div>
        <div className="weather_icon">
          {          
            weather &&
            <WeatherDisplay weatherCode={weather.current.weather_code} />
          }
        </div>
        
      </div>
      <div className="second_weatherblock">
        <div className="temp">
            {weather?.current.apparent_temperature}{weather?.current_units.apparent_temperature}
        </div>
        {weather?.current && (
        <div className="info_progn">
          <p>{getWeatherDescription(weather.current.weather_code)}</p>
          Vetar: {windSpeed ?? "--"} km/h - Pravac : {getWindDirection(windDir)}
        </div>
)}
      </div>
      <hr className="razdvajanje" />

      <div className="third_weatherblock">
        <div className="sutra">
          Sutra 
        </div>
        <div className="min_max">
          {weather?.daily.temperature_2m_max[1]}
          {weather?.current_units.apparent_temperature} / {weather?.daily.temperature_2m_min[1]} {weather?.current_units.apparent_temperature}
        </div>
      </div>
    </div>
    </>
  )
}