// API service for backend communication
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Erro de conexão. Verifique se o backend está rodando.');
            }
            
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }

    // Authentication
    async login(email, password, userType) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, userType }),
        });
    }

    async register(data) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST',
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Public routes for preview
    async getPublicJobs() {
        return this.request('/public/jobs');
    }

    async getPublicStats() {
        return this.request('/public/stats');
    }

    // Dashboard
    async getDashboardMetrics() {
        return this.request('/dashboard/metrics');
    }

    // Candidates
    async getCandidates() {
        return this.request('/candidates');
    }

    async getCandidateDetails(candidateId) {
        return this.request(`/candidates/${candidateId}/details`);
    }

    // Jobs
    async getJobs() {
        return this.request('/jobs');
    }

    async createJob(jobData) {
        return this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData),
        });
    }

    // Favorites
    async toggleFavorite(jobId) {
        return this.request('/favorites', {
            method: 'POST',
            body: JSON.stringify({ jobId }),
        });
    }

    async getFavorites() {
        return this.request('/favorites');
    }

    // Applications
    async applyToJob(jobId, jobSource = 'selectflow') {
        return this.request('/applications', {
            method: 'POST',
            body: JSON.stringify({ jobId, jobSource }),
        });
    }

    async getApplications() {
        return this.request('/applications');
    }

    // Recommendations
    async getJobRecommendations() {
        return this.request('/recommendations/jobs');
    }

    // Profile
    async getProfile() {
        return this.request('/profile');
    }

    async updateProfile(profileData) {
        return this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // Tags
    async getTags() {
        return this.request('/tags');
    }
}

// Create global instance
window.apiService = new ApiService();

// Test connection on load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.apiService.healthCheck();
        console.log('✅ Backend connection successful');
    } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
        
        // Show connection error to user if on preview page
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'connection-error';
            errorDiv.innerHTML = `
                <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 0.5rem; margin: 1rem; text-align: center;">
                    <strong>⚠️ Erro de Conexão</strong><br>
                    Não foi possível conectar ao backend. Certifique-se de que o servidor Flask está rodando em http://localhost:5000
                    <br><br>
                    <small>Execute: <code>cd backend && python run.py</code></small>
                </div>
            `;
            document.body.insertBefore(errorDiv, document.body.firstChild);
        }
    }
});