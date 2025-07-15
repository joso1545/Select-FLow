import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import LoadingSpinner from '../LoadingSpinner'
import JobCard from '../JobCard'

const FavoritesView = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      const favoritesData = await apiService.getFavorites()
      setFavorites(favoritesData)
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (jobId) => {
    try {
      await apiService.applyToJob(jobId)
      // Refresh favorites to update application status
      loadFavorites()
    } catch (error) {
      alert('Erro ao se candidatar: ' + error.message)
    }
  }

  const handleToggleFavorite = async (jobId) => {
    try {
      await apiService.toggleFavorite(jobId)
      // Remove from favorites list since it was unfavorited
      setFavorites(favorites.filter(job => job.id !== jobId))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Carregando favoritas..." />
  }

  return (
    <div className="fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vagas Favoritas</h1>
        <p className="text-gray-600">Suas vagas salvas para acompanhar</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❤️</div>
          <p className="text-gray-500 mb-4">Você ainda não favoritou nenhuma vaga.</p>
          <p className="text-gray-400 text-sm mb-6">
            Explore as vagas disponíveis e favorite aquelas que mais te interessam.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard/jobs'}
            className="btn btn-primary"
          >
            Explorar Vagas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((job) => (
            <JobCard
              key={job.id}
              job={{ ...job, isFavorite: true }}
              onApply={handleApply}
              onToggleFavorite={handleToggleFavorite}
              userType="candidate"
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoritesView