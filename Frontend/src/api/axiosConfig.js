import axios from "axios"

// Use environment variable or fallback to development URL
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api"

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

export const setupInterceptors = (logoutCallback) => {
  // Request interceptor
  apiClient.interceptors.request.use(
    (config) => {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    (error) => {
      console.error("❌ Request Error:", error)
      return Promise.reject(error)
    },
  )

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
      )
      return response
    },
    async (error) => {
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`,
      )

      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(() => {
              return apiClient(originalRequest)
            })
            .catch((err) => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          console.log("🔄 Attempting to refresh token...")
          await apiClient.post("/auth/refresh-token")
          console.log("✅ Token refreshed successfully")
          processQueue(null)
          return apiClient(originalRequest)
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError)
          processQueue(refreshError)
          logoutCallback()
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(error.response?.data || error)
    },
  )
}

export default apiClient
