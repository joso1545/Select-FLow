import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Erro de conexão. Verifique se o backend está rodando.')
    }
    throw new Error(error.message || 'Erro desconhecido')
  }
)

export const apiService = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Authentication
  login: (email, password, userType) => 
    api.post('/auth/login', { email, password, userType }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getCurrentUser: () => 
    api.get('/auth/me'),

  // Public routes
  getPublicJobs: () => 
    api.get('/public/jobs'),
  
  getPublicStats: () => 
    api.get('/public/stats'),

  // Dashboard
  getDashboardMetrics: () => 
    api.get('/dashboard/metrics'),

  // Jobs
  getJobs: () => 
    api.get('/jobs'),
  
  createJob: (jobData) => 
    api.post('/jobs', jobData),

  // Candidates
  getCandidates: () => 
    api.get('/candidates'),
  
  getCandidateDetails: (candidateId) => 
    api.get(`/candidates/${candidateId}/details`),

  // Applications
  applyToJob: (jobId, jobSource = 'selectflow') => 
    api.post('/applications', { jobId, jobSource }),
  
  getApplications: () => 
    api.get('/applications'),

  // Favorites
  toggleFavorite: (jobId) => 
    api.post('/favorites', { jobId }),
  
  getFavorites: () => 
    api.get('/favorites'),

  // Recommendations
  getJobRecommendations: () => 
    api.get('/recommendations/jobs'),

  // Profile
  getProfile: () => 
    api.get('/profile'),
  
  updateProfile: (profileData) => 
    api.put('/profile', profileData),

  // Tags
  getTags: () => 
    api.get('/tags'),
}