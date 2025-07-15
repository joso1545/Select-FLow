import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, 
  Briefcase, 
  Users, 
  Heart, 
  FileText, 
  Star, 
  User, 
  LogOut,
  Building
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import DashboardHome from '../components/dashboard/DashboardHome'
import JobsView from '../components/dashboard/JobsView'
import CandidatesView from '../components/dashboard/CandidatesView'
import FavoritesView from '../components/dashboard/FavoritesView'
import ApplicationsView from '../components/dashboard/ApplicationsView'
import RecommendationsView from '../components/dashboard/RecommendationsView'
import ProfileView from '../components/dashboard/ProfileView'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [metrics, setMetrics] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const metricsData = await apiService.getDashboardMetrics()
      setMetrics(metricsData)
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getNavigation = () => {
    if (user?.type === 'company') {
      return [
        { id: 'home', label: 'Dashboard', icon: Home, path: '/dashboard' },
        { id: 'jobs', label: 'Vagas', icon: Briefcase, path: '/dashboard/jobs' },
        { id: 'candidates', label: 'Candidatos', icon: Users, path: '/dashboard/candidates' },
        { id: 'profile', label: 'Perfil', icon: Building, path: '/dashboard/profile' },
      ]
    } else {
      return [
        { id: 'home', label: 'Dashboard', icon: Home, path: '/dashboard' },
        { id: 'jobs', label: 'Vagas', icon: Briefcase, path: '/dashboard/jobs' },
        { id: 'favorites', label: 'Favoritas', icon: Heart, path: '/dashboard/favorites' },
        { id: 'applications', label: 'Candidaturas', icon: FileText, path: '/dashboard/applications' },
        { id: 'recommendations', label: 'Recomendações', icon: Star, path: '/dashboard/recommendations' },
        { id: 'profile', label: 'Perfil', icon: User, path: '/dashboard/profile' },
      ]
    }
  }

  const navigation = getNavigation()

  if (loading) {
    return <LoadingSpinner text="Carregando dashboard..." />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`w-64 min-h-screen p-6 flex flex-col text-white ${
        user?.type === 'company' 
          ? 'bg-gradient-to-b from-purple-600 to-purple-700' 
          : 'bg-gradient-to-b from-blue-600 to-blue-700'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <img src="/MaletaSF.png" alt="SelectFlow" className="w-8 h-8" />
            <img src="/SelectFlowBranco.png" alt="SelectFlow" className="h-6" />
          </div>
        </div>

        {/* User Profile */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-14 h-14 rounded-full object-cover"
            />
          </div>
          <div className="font-semibold text-lg">{user?.name}</div>
          <div className="text-sm opacity-80">
            {user?.type === 'company' ? 'Empresa' : 'Candidato'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-yellow-400 text-gray-900 shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white/90 transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardHome user={user} metrics={metrics} />} />
          <Route path="/jobs" element={<JobsView user={user} />} />
          <Route path="/candidates" element={<CandidatesView />} />
          <Route path="/favorites" element={<FavoritesView />} />
          <Route path="/applications" element={<ApplicationsView />} />
          <Route path="/recommendations" element={<RecommendationsView />} />
          <Route path="/profile" element={<ProfileView user={user} />} />
        </Routes>
      </main>
    </div>
  )
}

export default Dashboard