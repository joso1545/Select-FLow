import React, { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { apiService } from '../../services/api'
import LoadingSpinner from '../LoadingSpinner'
import JobCard from '../JobCard'

const JobsView = ({ user }) => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const jobsData = await apiService.getJobs()
      setJobs(jobsData)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (jobId) => {
    try {
      await apiService.applyToJob(jobId)
      // Refresh jobs to update application status
      loadJobs()
    } catch (error) {
      alert('Erro ao se candidatar: ' + error.message)
    }
  }

  const handleToggleFavorite = async (jobId) => {
    try {
      await apiService.toggleFavorite(jobId)
      // Update the job in the list
      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, isFavorite: !job.isFavorite }
          : job
      ))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  if (loading) {
    return <LoadingSpinner text="Carregando vagas..." />
  }

  return (
    <div className="fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.type === 'company' ? 'Minhas Vagas' : 'Vagas Disponíveis'}
          </h1>
          <p className="text-gray-600">
            {user?.type === 'company' 
              ? 'Gerencie suas oportunidades de emprego'
              : 'Encontre oportunidades que combinam com seu perfil'
            }
          </p>
        </div>
        
        {user?.type === 'company' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Criar Nova Vaga
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="max-w-md relative">
          <div className="input-group">
            <Search className="input-icon" size={20} />
            <input
              type="text"
              className="form-input"
              placeholder="Buscar vagas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nenhuma vaga encontrada.</p>
          {user?.type === 'company' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Criar Primeira Vaga
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onApply={handleApply}
              onToggleFavorite={handleToggleFavorite}
              userType={user?.type}
            />
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <CreateJobModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadJobs()
          }}
        />
      )}
    </div>
  )
}

const CreateJobModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    workLocation: 'presencial',
    salary: '',
    type: 'full-time',
    employmentType: 'tempo_integral',
    requirements: '',
    tags: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(r => r),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      }

      await apiService.createJob(jobData)
      onSuccess()
    } catch (error) {
      alert('Erro ao criar vaga: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Criar Nova Vaga</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Título da Vaga</label>
              <input
                type="text"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea
                name="description"
                className="form-input form-textarea"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Localização</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="São Paulo, SP"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Modalidade</label>
                <select
                  name="workLocation"
                  className="form-input form-select"
                  value={formData.workLocation}
                  onChange={handleChange}
                >
                  <option value="presencial">Presencial</option>
                  <option value="remoto">Remoto</option>
                  <option value="híbrido">Híbrido</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Salário</label>
              <input
                type="text"
                name="salary"
                className="form-input"
                placeholder="R$ 5.000 - R$ 8.000"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Requisitos (separados por vírgula)</label>
              <input
                type="text"
                name="requirements"
                className="form-input"
                placeholder="React, Node.js, 3+ anos de experiência"
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (separadas por vírgula)</label>
              <input
                type="text"
                name="tags"
                className="form-input"
                placeholder="desenvolvedor, frontend, senior"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
              >
                {loading ? '' : 'Criar Vaga'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default JobsView