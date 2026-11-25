import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { Accept: 'application/json' },
})

// Attach the current JWT to protected API requests.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('careerly_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api