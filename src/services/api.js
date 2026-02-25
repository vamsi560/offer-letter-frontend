import axios from 'axios'

const API_BASE_URL = 'http://20.84.109.123:8000/api'; // Updated for VM backend

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  }
}

export const dashboardAPI = {
  getDashboard: async () => {
    const response = await api.get('/dashboard')
    return response.data
  }
}

export const offerLetterAPI = {
  generate: async (offerData) => {
    const response = await api.post('/offer-letter/generate', offerData)
    return response.data
  },
  getSalaryBreakdown: async (totalSalary) => {
    const response = await api.get(`/salary-breakdown/${totalSalary}`)
    return response.data
  },
  getAll: async () => {
    const response = await api.get('/offer-letters')
    return response.data
  },
  sendEmail: async ({ candidate_email, pdf_path, candidate_name, cc_email }) => {
    const response = await api.post('/offer-letter/send-email', {
      candidate_email,
      pdf_path,
      candidate_name,
      cc_email,
    })
    return response.data
  },
  generateDocx: async (offerData) => {
    const response = await api.post('/offer-letter/generate-docx', offerData)
    return response.data
  }
}

export default api
