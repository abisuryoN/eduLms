import axios from "axios";

const getBaseURL = () => {
  // Use http://localhost:8000/api if on port 5173 (Vite dev)
  if (window.location.port === '5173') {
    return "http://localhost:8000/api";
  }
  // Otherwise use relative path (same host, e.g. Laragon)
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Accept": "application/json",
  },
});

// Request interceptor to add auth token + auto Content-Type
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Jangan set Content-Type jika FormData — browser auto-set multipart/form-data + boundary
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }

  return config
})

// Response interceptor to handle 401 and 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
