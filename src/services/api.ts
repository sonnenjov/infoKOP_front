import axios, { Axios } from "axios";



const api:Axios = axios.create({
  baseURL: "127.0.0:8000",
  timeout: 5000,
  headers: {
    'Content-Type': "application/json"
  }
})


// WEATHER 
export const func_fetch_weather = async () => {
    try {
        const response = await api.get('/api/weather/')
        return response.data

    } catch (error) {
        console.log("Weather fetch error:", error)

        throw error
    }
}