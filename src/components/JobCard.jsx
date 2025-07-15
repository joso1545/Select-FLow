import React from 'react'
import { MapPin, Users, Heart, Briefcase } from 'lucide-react'

const JobCard = ({ 
  job, 
  onApply, 
  onToggleFavorite, 
  showActions = true, 
  userType = 'candidate' 
}) => {
  const getWorkLocationIcon = (workLocation) => {
    switch (workLocation?.toLowerCase()) {
      case 'remoto':
        return '🏠'
      case 'presencial':
        return '🏢'
      case 'híbrido':
        return '🔄'
      default:
        return '📍'
    }
  }

  const handleApply = (e) => {
    e.stopPropagation()
    onApply?.(job.id)
  }

  const handleToggleFavorite = (e) => {
    e.stopPropagation()
    onToggleFavorite?.(job.id)
  }

  return (
    <div className="card hover-lift cursor-pointer">
      <div className="card-content">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Briefcase size={16} />
              <span>{job.company || 'Empresa'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {userType === 'candidate' && showActions && (
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-full transition-colors ${
                  job.isFavorite 
                    ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart size={20} fill={job.isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
            <div className="text-2xl">
              {getWorkLocationIcon(job.workLocation)}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{job.location} • {job.workLocation}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>{job.applicants} candidatos</span>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {job.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-purple-600">
              {job.salary || 'Salário a combinar'}
            </span>
            <span className="text-gray-500">{job.type}</span>
          </div>
        </div>

        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="badge badge-purple">
                {tag}
              </span>
            ))}
            {job.tags.length > 3 && (
              <span className="badge badge-purple">
                +{job.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users size={16} />
              <span>{job.applicants} candidatos</span>
            </div>
            
            {userType === 'candidate' ? (
              <button
                onClick={handleApply}
                disabled={job.hasApplied}
                className={`btn btn-sm ${
                  job.hasApplied 
                    ? 'btn-outline opacity-50 cursor-not-allowed' 
                    : 'btn-primary'
                }`}
              >
                {job.hasApplied ? 'Candidatado' : 'Candidatar-se'}
              </button>
            ) : (
              <button className="btn btn-outline btn-sm">
                Ver Detalhes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobCard