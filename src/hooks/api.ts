import axios from "axios";
const BASE_URL = "http://192.168.1.6:8000"
export const apiReq = axios.create({
  baseURL: `${BASE_URL}/api`
})


apiReq.interceptors.request.use(
  (config) => {
    const savedUserString = localStorage.getItem('infokop_auth');
    if (savedUserString) {
      try {
        const userData = JSON.parse(savedUserString)
        const token = userData?.access
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error("Greška pri parse", err);
        
      }
    }
    return config;
  },
  (error) => {
    Promise.reject(error)}
);


apiReq.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const savedUserString = localStorage.getItem('infokop_auth'); 

        if (!savedUserString) throw new Error("Nema korisnika ulogovanog");

        const userData = JSON.parse(savedUserString)

        const refreshToken = userData?.refresh
        if (!refreshToken) {
          window.location.href = '/login';
          localStorage.removeItem("infokop_auth")
          return Promise.reject(error);
        }

        const response = await axios.post(`${BASE_URL}/api/users/token/refresh/`, {
          refresh: refreshToken
        });

        if (response.status === 200) {
          const newAccessToken = response.data.access;
          
          userData.access = newAccessToken
          localStorage.setItem('infokop_auth', JSON.stringify(userData))

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return apiReq(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token expired or invalid. Logging out...", refreshError);
        localStorage.removeItem('infokop_auth');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);