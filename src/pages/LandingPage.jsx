import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, CheckCircle, Users, ArrowRight, Briefcase } from 'lucide-react'
import Header from '../components/Header'
import JobCard from '../components/JobCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { apiService } from '../services/api'

const LandingPage = () => {
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalCandidates: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [jobsData, statsData] = await Promise.all([
        apiService.getPublicJobs(),
        apiService.getPublicStats()
      ])
      setJobs(jobsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load data:', error)
      // Fallback data
      setJobs([
        {
          id: 1,
          title: 'Desenvolvedor Full Stack',
          company: 'TechCorp',
          location: 'São Paulo, SP',
          workLocation: 'Híbrido',
          salary: 'R$ 8.000 - R$ 12.000',
          type: 'Tempo integral',
          applicants: 45,
          description: 'Procuramos um desenvolvedor experiente para nossa equipe de tecnologia.',
          tags: ['React', 'Node.js', 'TypeScript']
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container">
          <div className="max-w-4xl mx-auto fade-in-up">
            <img 
              src="/SelectFlow_3.png" 
              alt="SelectFlow" 
              className="h-20 mx-auto mb-6"
            />
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              O talento certo no lugar certo{' '}
              <span className="text-purple">muda tudo.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-width-3xl mx-auto">
              Conectamos empresas e candidatos através de uma plataforma inteligente 
              que facilita o processo de recrutamento e seleção.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary btn-lg">
                Encontrar Talentos
                <ArrowRight size={20} />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Buscar Vagas
                <Briefcase size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="fade-in-up">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.totalJobs}+
              </div>
              <div className="text-gray-600">Vagas Ativas</div>
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.totalCompanies}+
              </div>
              <div className="text-gray-600">Empresas Parceiras</div>
            </div>
            <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.totalCandidates}+
              </div>
              <div className="text-gray-600">Candidatos Cadastrados</div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Search Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Oportunidades
            </h2>
            <p className="text-gray-600 mb-8">
              Descubra vagas que combinam com seu perfil
            </p>
            
            <div className="max-w-md mx-auto relative">
              <div className="input-group">
                <Search className="input-icon" size={20} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar por cargo, empresa ou tecnologia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Carregando vagas..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredJobs.slice(0, 6).map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  showActions={false}
                />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/login" className="btn btn-primary">
              Ver Todas as Vagas
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher o SelectFlow?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center fade-in-up">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Matching Inteligente</h3>
              <p className="text-gray-600">
                Algoritmos avançados conectam candidatos e empresas com base em compatibilidade real.
              </p>
            </div>
            
            <div className="text-center fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Processo Simplificado</h3>
              <p className="text-gray-600">
                Interface intuitiva que torna o recrutamento mais eficiente para todos.
              </p>
            </div>
            
            <div className="text-center fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunidade Ativa</h3>
              <p className="text-gray-600">
                Rede crescente de profissionais e empresas em busca de oportunidades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center">
        <div className="container">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para encontrar sua próxima oportunidade?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Junte-se a milhares de profissionais e empresas que já confiam no SelectFlow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-secondary btn-lg">
              Cadastrar como Candidato
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-purple-600">
              Cadastrar como Empresa
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <img 
              src="/SelectFlowBranco.png" 
              alt="SelectFlow" 
              className="h-8 mb-4 md:mb-0"
            />
            <div className="text-gray-400 text-sm">
              © 2025 SelectFlow. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage