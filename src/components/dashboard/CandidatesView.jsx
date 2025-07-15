import React, { useState, useEffect } from 'react'
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react'
import { apiService } from '../../services/api'
import LoadingSpinner from '../LoadingSpinner'

const CandidatesView = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  useEffect(() => {
    loadCandidates()
  }, [])

  const loadCandidates = async () => {
    try {
      const candidatesData = await apiService.getCandidates()
      setCandidates(candidatesData)
    } catch (error) {
      console.error('Failed to load candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (candidateId) => {
    try {
      const candidate = await apiService.getCandidateDetails(candidateId)
      setSelectedCandidate(candidate)
    } catch (error) {
      alert('Erro ao carregar detalhes do candidato: ' + error.message)
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
      'interview': { label: 'Entrevista', class: 'badge-purple' },
      'hired': { label: 'Contratado', class: 'badge-success' }
    }

    const config = statusConfig[status] || { label: status, class: 'badge-warning' }
    return <span className={`badge ${config.class}`}>{config.label}</span>
  }

  if (loading) {
    return <LoadingSpinner text="Carregando candidatos..." />
  }

  return (
    <div className="fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidatos</h1>
        <p className="text-gray-600">Gerencie candidatos que se aplicaram às suas vagas</p>
      </div>

      {candidates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum candidato encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="card hover-lift">
              <div className="card-content">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-purple-600 font-medium text-sm">{candidate.profileTitle}</p>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <MapPin size={14} />
                      <span>{candidate.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Vaga:</p>
                  <p className="text-sm text-gray-600">{candidate.position}</p>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {candidate.bio}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {candidate.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="badge badge-purple text-xs">
                      {skill}
                    </span>
                  ))}
                  {candidate.skills.length > 3 && (
                    <span className="badge badge-purple text-xs">
                      +{candidate.skills.length - 3}
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  {getStatusBadge(candidate.status)}
                </div>

                <button
                  onClick={() => handleViewDetails(candidate.id)}
                  className="btn btn-outline btn-sm btn-full"
                >
                  Ver Perfil Completo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}

const CandidateModal = ({ candidate, onClose }) => {
  const getProfessionalInterestLabel = (interest) => {
    const labels = {
      'encontrar_emprego': 'Encontrar novo emprego',
      'prestar_servicos': 'Prestar serviços',
      'contratar': 'Contratar'
    }
    return labels[interest] || interest
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '800px', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h2 className="modal-title">Perfil Completo do Candidato</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="modal-body">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-6">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{candidate.name}</h3>
                <p className="text-lg text-purple-600 font-medium mb-2">{candidate.profileTitle}</p>
                <div className="space-y-1 text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{candidate.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Sobre</h4>
              <p className="text-gray-700">{candidate.bio}</p>
            </div>

            {/* Professional Interest */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Interesse Profissional</h4>
              <p className="text-gray-700">{getProfessionalInterestLabel(candidate.professionalInterest)}</p>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Competências</h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span key={index} className="badge badge-purple">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            {candidate.experience && candidate.experience.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Experiência Profissional</h4>
                <div className="space-y-4">
                  {candidate.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-purple-200 pl-4">
                      <h5 className="font-semibold text-gray-900">{exp.title} - {exp.company}</h5>
                      <p className="text-sm text-gray-600 mb-1">
                        {exp.start_date} - {exp.current ? 'Atual' : exp.end_date}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">{exp.location} • {exp.location_type}</p>
                      <p className="text-gray-700 mb-2">{exp.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {exp.skills.map((skill, skillIndex) => (
                          <span key={skillIndex} className="badge badge-purple text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {candidate.education && candidate.education.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Formação</h4>
                <div className="space-y-2">
                  {candidate.education.map((edu, index) => (
                    <div key={index}>
                      <h5 className="font-semibold text-gray-900">{edu.degree}</h5>
                      <p className="text-gray-600">{edu.institution} - {edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {candidate.languages && candidate.languages.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Idiomas</h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.languages.map((lang, index) => (
                    <span key={index} className="badge badge-yellow">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Links</h4>
              <div className="flex flex-wrap gap-4">
                {candidate.linkedin && (
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <ExternalLink size={16} />
                    LinkedIn
                  </a>
                )}
                {candidate.github && (
                  <a
                    href={candidate.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <ExternalLink size={16} />
                    GitHub
                  </a>
                )}
                {candidate.portfolio && (
                  <a
                    href={candidate.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <ExternalLink size={16} />
                    Portfólio
                  </a>
                )}
              </div>
            </div>

            {/* Resume */}
            {candidate.resumeContent && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Currículo</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {candidate.resumeContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidatesView