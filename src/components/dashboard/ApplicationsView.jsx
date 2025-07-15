import React, { useState, useEffect } from 'react'
import { Briefcase, MapPin, Calendar, ExternalLink } from 'lucide-react'
import { apiService } from '../../services/api'
import LoadingSpinner from '../LoadingSpinner'

const ApplicationsView = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const applicationsData = await apiService.getApplications()
      setApplications(applicationsData)
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { label: 'Pendente', class: 'badge-warning' },
      'under_review': { label: 'Em Análise', class: 'badge-purple' },
      'approved': { label: 'Aprovado', class: 'badge-success' },
      'rejected': { label: 'Rejeitado', class: 'badge-error' },
      'resume_analysis': { label: 'Análise de Currículo', class: 'badge-purple' },
      'technical_test': { label: 'Teste Técnico', class: 'badge-purple' },
      'group_dynamics': { label: 'Dinâmica em Grupo', class: 'badge-purple' },
      'interview': { label: 'Entrevista', class: 'badge-purple' },
      'reference_check': { label: 'Verificação de Referências', class: 'badge-purple' },
      'final_interview': { label: 'Entrevista Final', class: 'badge-purple' },
      'hired': { label: 'Contratado', class: 'badge-success' }
    }

    const config = statusConfig[status] || { label: status, class: 'badge-warning' }
    return <span className={`badge ${config.class}`}>{config.label}</span>
  }

  if (loading) {
    return <LoadingSpinner text="Carregando candidaturas..." />
  }

  return (
    <div className="fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Candidaturas</h1>
        <p className="text-gray-600">Acompanhe o status das suas candidaturas</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-500 mb-4">Você ainda não se candidatou a nenhuma vaga.</p>
          <p className="text-gray-400 text-sm mb-6">
            Explore as vagas disponíveis e candidate-se àquelas que mais combinam com seu perfil.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard/jobs'}
            className="btn btn-primary"
          >
            Explorar Vagas
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.id} className="card hover-lift">
              <div className="card-content">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {application.jobTitle}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                      <Briefcase size={16} />
                      <span>{application.company}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {getStatusBadge(application.currentStage)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{application.location} • {application.workLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">💰</span>
                    <span>{application.salary || 'Salário a combinar'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Aplicado em {new Date(application.appliedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-500">
                    <span className="font-medium">Fonte:</span> {application.jobSource}
                  </div>
                  
                  {application.jobSource !== 'selectflow' && (
                    <button className="flex items-center gap-1 text-purple-600 hover:text-purple-700">
                      <ExternalLink size={14} />
                      Ver vaga original
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ApplicationsView