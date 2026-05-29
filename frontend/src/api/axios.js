import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor — redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname
      if (!path.includes('/login')) {
        window.location.href = path.startsWith('/student') ? '/student/login' : '/librarian/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
