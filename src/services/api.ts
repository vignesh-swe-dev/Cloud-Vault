import axios from 'axios'
import { API_URL, buildApiUrl } from '../utils/apiUrl'
import { useAuthStore } from '../store/authStore'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
let isRefreshing = false
let queue: Array<{ resolve: (v: string) => void; reject: (e: any) => void }> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }
      isRefreshing = true
      try {
        const { data } = await axios.post(buildApiUrl('/auth/refresh'), {}, { withCredentials: true })
        const newToken = data.data.accessToken
        useAuthStore.getState().setAuth(useAuthStore.getState().user!, newToken)
        queue.forEach((p) => p.resolve(newToken))
        queue = []
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        queue.forEach((p) => p.reject(error))
        queue = []
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)
