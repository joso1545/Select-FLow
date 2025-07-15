import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import LoadingSpinner from '../LoadingSpinner'
import JobCard from '../JobCard'

const RecommendationsView = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      const recommendationsData = await apiService.getJobRecommendations()
      setRecommendations(recommendationsData)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (jobId) => {
    try {
      await apiService.applyToJob(jobId)
      // Refresh recommendations to update application status
      loadRecommendations()
    } catch (error) {
      alert('Erro ao se candidatar: ' + error.message)
    }
  }

  const handleToggleFavorite = async (jobId) => {
    try {
      await apiService.toggleFavorite(jobId)
      // Update the job in the list
      setRecommendations(recommendations.map(job => 
        job.id === jobId 
          ? { ...job, isFavorite: !job.isFavorite }
          : job
      ))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Carregando recomendações..." />
  }

  return (
    <div className="fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recomendações</h1>
        <p className="text-gray-600">Vagas que combinam com seu perfil</p>
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <p className="text-gray-500 mb-4">Complete seu perfil para receber recomendações personalizadas.</p>
          <p className="text-gray-400 text-sm mb-6">
            Quanto mais informações você fornecer, melhores serão nossas recomendações.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard/profile'}
            className="btn btn-primary"
          >
            Completar Perfil
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((job) => (
            <div key={job.id} className="relative">
              {/* Match Score Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  {job.matchScore}% match
                </span>
              </div>
              
              <JobCard
                job={job}
                onApply={handleApply}
                onToggleFavorite={handleToggleFavorite}
                userType="candidate"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecommendationsView