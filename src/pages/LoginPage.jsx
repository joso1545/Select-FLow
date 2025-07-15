import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'candidate'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleUserTypeChange = (type) => {
    setFormData({
      ...formData,
      userType: type
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password, formData.userType)
      navigate('/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar ao início
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/MaletaSF.png" alt="SelectFlow" className="w-12 h-12" />
            <img src="/SelectFlow_2.png" alt="SelectFlow" className="h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900">
            Entre na sua conta
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selector */}
          <div className="form-group">
            <label className="form-label">Tipo de usuário</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleUserTypeChange('candidate')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  formData.userType === 'candidate'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Candidato
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeChange('company')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  formData.userType === 'company'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Empresa
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`}
          >
            {loading ? '' : 'Entrar'}
          </button>

          <button
            type="button"
            className="btn btn-outline btn-full"
            onClick={() => alert('Login com Google não implementado ainda')}
          >
            <span className="text-lg font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
              G
            </span>
            Entrar com Google
          </button>

          <div className="text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage