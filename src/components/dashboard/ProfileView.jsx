import React, { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { apiService } from '../../services/api'
import LoadingSpinner from '../LoadingSpinner'

const ProfileView = ({ user }) => {
  const [profile, setProfile] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profileData = await apiService.getProfile()
      setProfile(profileData)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s)
    setProfile(prev => ({
      ...prev,
      skills
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      await apiService.updateProfile(profile)
      setMessage('Perfil atualizado com sucesso!')
    } catch (error) {
      setMessage('Erro ao atualizar perfil: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Carregando perfil..." />
  }

  return (
    <div className="fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user?.type === 'company' ? 'Perfil da Empresa' : 'Meu Perfil'}
        </h1>
        <p className="text-gray-600">Mantenha suas informações atualizadas</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`alert ${message.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}

          {user?.type === 'candidate' ? (
            <CandidateProfileForm 
              profile={profile} 
              onChange={handleChange}
              onSkillsChange={handleSkillsChange}
            />
          ) : (
            <CompanyProfileForm 
              profile={profile} 
              onChange={handleChange}
            />
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`btn btn-primary ${saving ? 'btn-loading' : ''}`}
            >
              {saving ? '' : (
                <>
                  <Save size={20} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CandidateProfileForm = ({ profile, onChange, onSkillsChange }) => {
  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Informações Básicas</h3>
        </div>
        <div className="card-content space-y-4">
          <div className="form-group">
            <label className="form-label">Título do Perfil</label>
            <input
              type="text"
              name="profile_title"
              className="form-input"
              placeholder="Ex: Desenvolvedor Full Stack"
              value={profile.profile_title || ''}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sobre você</label>
            <textarea
              name="bio"
              className="form-input form-textarea"
              rows="4"
              placeholder="Descreva sua experiência e objetivos profissionais"
              value={profile.bio || ''}
              onChange={onChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="(11) 99999-9999"
                value={profile.phone || ''}
                onChange={onChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Localização</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="São Paulo, SP"
                value={profile.location || ''}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Interesse Profissional</label>
            <select
              name="professional_interest"
              className="form-input form-select"
              value={profile.professional_interest || 'encontrar_emprego'}
              onChange={onChange}
            >
              <option value="encontrar_emprego">Encontrar novo emprego</option>
              <option value="prestar_servicos">Prestar serviços</option>
              <option value="contratar">Contratar</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Competências</h3>
        </div>
        <div className="card-content">
          <div className="form-group">
            <label className="form-label">Suas principais competências (separadas por vírgula)</label>
            <input
              type="text"
              className="form-input"
              placeholder="JavaScript, React, Node.js"
              value={profile.skills ? profile.skills.join(', ') : ''}
              onChange={onSkillsChange}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Links Profissionais</h3>
        </div>
        <div className="card-content space-y-4">
          <div className="form-group">
            <label className="form-label">LinkedIn</label>
            <input
              type="url"
              name="linkedin"
              className="form-input"
              placeholder="https://linkedin.com/in/seuperfil"
              value={profile.linkedin || ''}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">GitHub</label>
            <input
              type="url"
              name="github"
              className="form-input"
              placeholder="https://github.com/seuusuario"
              value={profile.github || ''}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Portfólio</label>
            <input
              type="url"
              name="portfolio"
              className="form-input"
              placeholder="https://seuportfolio.com"
              value={profile.portfolio || ''}
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </>
  )
}

const CompanyProfileForm = ({ profile, onChange }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Informações da Empresa</h3>
      </div>
      <div className="card-content space-y-4">
        <div className="form-group">
          <label className="form-label">Nome da Empresa</label>
          <input
            type="text"
            name="company_name"
            className="form-input"
            value={profile.company_name || ''}
            onChange={onChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descrição</label>
          <textarea
            name="description"
            className="form-input form-textarea"
            rows="4"
            placeholder="Descreva sua empresa"
            value={profile.description || ''}
            onChange={onChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Setor</label>
            <input
              type="text"
              name="industry"
              className="form-input"
              placeholder="Tecnologia"
              value={profile.industry || ''}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tamanho da Empresa</label>
            <select
              name="size"
              className="form-input form-select"
              value={profile.size || ''}
              onChange={onChange}
            >
              <option value="">Selecione o tamanho</option>
              <option value="1-10">1-10 funcionários</option>
              <option value="11-50">11-50 funcionários</option>
              <option value="51-200">51-200 funcionários</option>
              <option value="201-500">201-500 funcionários</option>
              <option value="500+">500+ funcionários</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Website</label>
          <input
            type="url"
            name="website"
            className="form-input"
            placeholder="https://suaempresa.com"
            value={profile.website || ''}
            onChange={onChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Localização</label>
          <input
            type="text"
            name="location"
            className="form-input"
            placeholder="São Paulo, SP"
            value={profile.location || ''}
            onChange={onChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">LinkedIn da Empresa</label>
          <input
            type="url"
            name="linkedin"
            className="form-input"
            placeholder="https://linkedin.com/company/suaempresa"
            value={profile.linkedin || ''}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  )
}

export default ProfileView