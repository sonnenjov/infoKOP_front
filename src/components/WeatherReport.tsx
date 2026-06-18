import { useEffect, useState } from 'react'
import '../styles/weather.css'
import { getWeatherIconName } from '../services/iconMap'; // For Option 2
import { useMediaQuery } from '../hooks/useMediaQueries';


export function WeatherDisplay({ weatherCode }: { weatherCode: number }) {
     const iconUrl = getWeatherIconName(weatherCode);

          return (
              <span className='material-symbols-outlined clouds' >
                  {iconUrl}
              </span> 
            );
}


interface WeatherData {
  daily: {
    time: Date[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    apparent_temperature_mean: number[]
    weather_code: number[]
  },
   current: {
    weather_code: number,
    apparent_temperature: number
  }
}
const options:object = {
  weekday: "long",
};
function WeatherReport({ activeSeason }: { activeSeason: string }) {
  const isDesktop = useMediaQuery("(min-width: 1290px)")
  
  const [weather, setWeather] = useState<WeatherData | null>(null)
  
  useEffect(() => {
    fetch("http://192.168.1.6:8000/api/weather/fetchweather/")
    .then((response) => response.json())
    
    .then((data) => {
      setWeather(data)
            })
            .catch((error) => {
              console.log(error)
            })
            
            
          },[])
          
  return (
    <div className="weather_report">
      
      <div className={activeSeason === "summer" ? "weather_report_inner_summer" : "weather_report_inner_winter"}>
        <div className="current">
        <div className="icon">
          {
            weather &&
            <WeatherDisplay weatherCode={weather.current.weather_code} />
          }
        </div>
        <div className='text'>
          <p className='word'>TRENUTNO</p>
          <p className='temp'>
            {weather?.current.apparent_temperature}°C
          </p>
        </div>
      </div>
      { isDesktop && <div className='vertical'></div>}
        {
          weather && isDesktop &&  (
            <div className='weatherMap'>
              {weather.daily.time.map((day: Date, index: number) => (
                <div key={index}>
                      <p>{new Date(day).toLocaleDateString("sr-Latn-RS",options)}</p>
                      <div className="icon">
                        <WeatherDisplay  weatherCode={weather.daily.weather_code[index]} />
                      </div>
                      <p className='temps'>
                        {weather?.daily.apparent_temperature_mean[index]}°C
                      </p>
                </div>
))}             
            </div>
          )

        }
      </div>
    </div>
  )
}

export default WeatherReport


