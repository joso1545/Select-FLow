import React from 'react'
import { Users, Briefcase, FileText, Calendar } from 'lucide-react'

const DashboardHome = ({ user, metrics }) => {
  const greeting = user?.type === 'company' 
    ? `Bem-vindo, ${user.name}! 🏢`
    : `Olá, ${user.name.split(' ')[0]}! 👋`

  const subtitle = user?.type === 'company'
    ? 'Aqui está um resumo das suas atividades de recrutamento'
    : 'Aqui está um resumo das suas atividades'

  const getMetricCards = () => {
    return [
      {
        title: 'Total de candidatos',
        value: metrics.totalCandidates || 0,
        icon: Users,
        color: 'blue'
      },
      {
        title: 'Vagas ativas',
        value: metrics.activeJobs || 0,
        icon: Briefcase,
        color: 'purple'
      },
      {
        title: 'Em análise',
        value: metrics.candidatesInReview || 0,
        icon: FileText,
        color: 'gray'
      },
      {
        title: 'Entrevistas',
        value: metrics.scheduledInterviews || 0,
        icon: Calendar,
        color: 'green'
      }
    ]
  }

  const MetricCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      purple: 'bg-purple-600 text-white border-purple-600',
      green: 'bg-green-50 text-green-600 border-green-200',
      gray: 'bg-gray-50 text-gray-600 border-gray-200'
    }

    return (
      <div className={`card border-2 ${colorClasses[color]} transition-all hover:shadow-lg`}>
        <div className="card-content">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Icon size={24} />
            </div>
          </div>
          <div className="text-sm font-medium opacity-90 mb-1">{title}</div>
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        </div>
      </div>
    )
  }

  const RecentActivities = () => {
    const activities = [
      { action: 'Nova candidatura recebida', detail: 'Desenvolvedor Full Stack - João Silva', time: '1 hora atrás' },
      { action: 'Entrevista agendada', detail: 'Analista de Dados - Amanda Silva', time: '3 horas atrás' },
      { action: 'Candidato contratado', detail: 'Designer UX/UI - Bruno Ferreira', time: '1 dia atrás' },
    ]

    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Atividades Recentes</h3>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{activity.action}</div>
                  <div className="text-sm text-gray-600">{activity.detail}</div>
                  <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const QuickStats = () => {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Estatísticas Rápidas</h3>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">Taxa de aprovação</div>
                <div className="text-sm text-gray-600">68% dos candidatos passam para entrevista</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">Tempo médio</div>
                <div className="text-sm text-gray-600">12 dias para contratação</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">Score IA médio</div>
                <div className="text-sm text-gray-600">84% de compatibilidade</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{greeting}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {getMetricCards().map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivities />
        <QuickStats />
      </div>
    </div>
  )
}

export default DashboardHome