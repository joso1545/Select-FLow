// Dashboard functionality
class DashboardManager {
    constructor() {
        this.activeTab = 'dashboard';
        this.metrics = {
            totalCandidates: 0,
            activeJobs: 0,
            candidatesInReview: 0,
            scheduledInterviews: 0,
            totalApplications: 0,
            hiredCandidates: 0
        };
    }

    async loadMetrics() {
        try {
            const metricsData = await window.apiService.getDashboardMetrics();
            this.metrics = metricsData;
        } catch (error) {
            console.error('Failed to load metrics:', error);
        }
    }

    renderSidebar(user) {
        const sidebar = document.getElementById('sidebar');
        const userTypeClass = user.type === 'company' ? 'company' : 'candidate';
        
        const navigation = user.type === 'company' ? [
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'jobs', label: 'Vagas', icon: '💼' },
            { id: 'candidates', label: 'Candidatos', icon: '👥' },
            { id: 'profile', label: 'Perfil', icon: '🏢' },
        ] : [
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'jobs', label: 'Vagas', icon: '🔍' },
            { id: 'favorites', label: 'Favoritas', icon: '❤️' },
            { id: 'applications', label: 'Candidaturas', icon: '📄' },
            { id: 'recommendations', label: 'Recomendações', icon: '⭐' },
            { id: 'profile', label: 'Perfil', icon: '👤' },
        ];

        sidebar.className = `sidebar ${userTypeClass}`;
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="logo">
                    <img src="MaletaSF.png" alt="SelectFlow" class="logo-icon">
                    <img src="SelectFlowBranco.png" alt="SelectFlow" class="logo-text">
                </div>
            </div>

            <div class="sidebar-profile">
                <div class="sidebar-avatar">
                    <img src="${user.avatar}" alt="${user.name}">
                </div>
                <div class="sidebar-name">${user.name}</div>
                <div class="sidebar-role">${user.type === 'company' ? 'Empresa' : 'Candidato'}</div>
            </div>

            <nav class="sidebar-nav">
                ${navigation.map(item => `
                    <button class="nav-item ${userTypeClass} ${item.id === this.activeTab ? 'active' : ''}" 
                            onclick="window.dashboardManager.setActiveTab('${item.id}')">
                        <span class="nav-icon">${item.icon}</span>
                        <span>${item.label}</span>
                    </button>
                `).join('')}
            </nav>

            <button class="sidebar-logout" onclick="window.authManager.logout()">
                <span class="nav-icon">🚪</span>
                <span>Sair</span>
            </button>
        `;
    }

    setActiveTab(tab) {
        this.activeTab = tab;
        this.renderContent();
        
        // Update active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.onclick.toString().includes(`'${tab}'`)) {
                item.classList.add('active');
            }
        });
    }

    renderContent() {
        const mainContent = document.getElementById('main-content');
        const user = window.authManager.currentUser;

        switch (this.activeTab) {
            case 'dashboard':
                this.renderDashboardHome(mainContent, user);
                break;
            case 'jobs':
                this.renderJobsView(mainContent, user);
                break;
            case 'candidates':
                this.renderCandidatesView(mainContent);
                break;
            case 'favorites':
                this.renderFavoritesView(mainContent);
                break;
            case 'applications':
                this.renderApplicationsView(mainContent);
                break;
            case 'recommendations':
                this.renderRecommendationsView(mainContent);
                break;
            case 'profile':
                this.renderProfileView(mainContent, user);
                break;
            default:
                this.renderDashboardHome(mainContent, user);
        }
    }

    renderDashboardHome(container, user) {
        const greeting = user.type === 'company' 
            ? `Bem-vindo, ${user.name}! 🏢`
            : `Olá, ${user.name.split(' ')[0]}! 👋`;

        const subtitle = user.type === 'company'
            ? 'Aqui está um resumo das suas atividades de recrutamento'
            : 'Aqui está um resumo das suas atividades';

        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">${greeting}</h1>
                <p class="dashboard-subtitle">${subtitle}</p>
            </div>

            <div class="metrics-grid">
                ${this.renderMetricCard('Total de candidatos', this.metrics.totalCandidates, '👥', 'blue')}
                ${this.renderMetricCard('Vagas ativas', this.metrics.activeJobs, '💼', 'purple')}
                ${this.renderMetricCard('Em análise', this.metrics.candidatesInReview, '📄', 'gray')}
                ${this.renderMetricCard('Entrevistas', this.metrics.scheduledInterviews, '📅', 'green')}
            </div>

            <div class="content-grid">
                ${this.renderRecentActivities()}
                ${this.renderQuickStats()}
            </div>
        `;
    }

    renderMetricCard(title, value, icon, variant) {
        return `
            <div class="metric-card ${variant}">
                <div class="metric-header">
                    <div>
                        <div class="metric-icon">${icon}</div>
                    </div>
                </div>
                <div class="metric-title">${title}</div>
                <div class="metric-value">${value.toLocaleString()}</div>
            </div>
        `;
    }

    renderRecentActivities() {
        const activities = [
            { action: 'Nova candidatura recebida', detail: 'Desenvolvedor Full Stack - João Silva', time: '1 hora atrás' },
            { action: 'Entrevista agendada', detail: 'Analista de Dados - Amanda Silva', time: '3 horas atrás' },
            { action: 'Candidato contratado', detail: 'Designer UX/UI - Bruno Ferreira', time: '1 dia atrás' },
        ];

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Atividades Recentes</h3>
                </div>
                <div class="card-content">
                    <div class="activity-feed">
                        ${activities.map(activity => `
                            <div class="activity-item">
                                <div class="activity-dot"></div>
                                <div class="activity-content">
                                    <div class="activity-title">${activity.action}</div>
                                    <div class="activity-description">${activity.detail}</div>
                                    <div class="activity-time">${activity.time}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderQuickStats() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Estatísticas Rápidas</h3>
                </div>
                <div class="card-content">
                    <div class="activity-feed">
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-title">Taxa de aprovação</div>
                                <div class="activity-description">68% dos candidatos passam para entrevista</div>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-title">Tempo médio</div>
                                <div class="activity-description">12 dias para contratação</div>
                            </div>
                        </div>
                        <div class="activity-item">
                            <div class="activity-content">
                                <div class="activity-title">Score IA médio</div>
                                <div class="activity-description">84% de compatibilidade</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderJobsView(container, user) {
        if (user.type === 'company') {
            this.renderCompanyJobs(container);
        } else {
            this.renderCandidateJobs(container);
        }
    }

    async renderCompanyJobs(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Minhas Vagas</h1>
                <p class="dashboard-subtitle">Gerencie suas oportunidades de emprego</p>
                <button class="btn btn-primary" onclick="window.dashboardManager.showCreateJobModal()">
                    Criar Nova Vaga
                </button>
            </div>
            <div id="jobs-container">
                <div class="loading">Carregando vagas...</div>
            </div>
        `;

        try {
            const jobs = await window.apiService.getJobs();
            this.renderJobsList(jobs, 'company');
        } catch (error) {
            document.getElementById('jobs-container').innerHTML = `
                <div class="error-message">Erro ao carregar vagas: ${error.message}</div>
            `;
        }
    }

    async renderCandidateJobs(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Vagas Disponíveis</h1>
                <p class="dashboard-subtitle">Encontre oportunidades que combinam com seu perfil</p>
                <div class="search-box">
                    <input type="text" id="job-search" placeholder="Buscar vagas...">
                    <span class="search-icon">🔍</span>
                </div>
            </div>
            <div id="jobs-container">
                <div class="loading">Carregando vagas...</div>
            </div>
        `;

        try {
            const jobs = await window.apiService.getJobs();
            this.renderJobsList(jobs, 'candidate');
            this.setupJobSearch(jobs);
        } catch (error) {
            document.getElementById('jobs-container').innerHTML = `
                <div class="error-message">Erro ao carregar vagas: ${error.message}</div>
            `;
        }
    }

    renderJobsList(jobs, userType) {
        const container = document.getElementById('jobs-container');
        
        if (jobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma vaga encontrada.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="jobs-grid">
                ${jobs.map(job => this.renderJobCard(job, userType)).join('')}
            </div>
        `;
    }

    renderJobCard(job, userType) {
        const favoriteButton = userType === 'candidate' ? `
            <button class="favorite-btn ${job.isFavorite ? 'active' : ''}" 
                    onclick="window.dashboardManager.toggleFavorite(${job.id}, this)">
                ${job.isFavorite ? '❤️' : '🤍'}
            </button>
        ` : '';

        const actionButton = userType === 'candidate' ? `
            <button class="btn ${job.hasApplied ? 'btn-outline' : 'btn-primary'} btn-sm" 
                    onclick="window.dashboardManager.${job.hasApplied ? 'viewApplication' : 'applyToJob'}(${job.id})"
                    ${job.hasApplied ? 'disabled' : ''}>
                ${job.hasApplied ? 'Candidatado' : 'Candidatar-se'}
            </button>
        ` : `
            <button class="btn btn-outline btn-sm" onclick="window.dashboardManager.viewJobDetails(${job.id})">
                Ver Detalhes
            </button>
        `;

        return `
            <div class="job-card">
                <div class="job-card-header">
                    <div>
                        <div class="job-card-title">${job.title}</div>
                        <div class="job-card-company">
                            🏢 ${job.company || 'Empresa'}
                        </div>
                    </div>
                    <div class="job-card-actions">
                        ${favoriteButton}
                        <div class="job-card-location">${this.getWorkLocationIcon(job.workLocation)}</div>
                    </div>
                </div>
                
                <div class="job-card-meta">
                    <div class="job-card-meta-item">
                        📍 ${job.location} • ${job.workLocation}
                    </div>
                    <div class="job-card-meta-item">
                        👥 ${job.applicants} candidatos
                    </div>
                </div>
                
                <div class="job-card-description">${job.description}</div>
                
                <div class="job-card-salary">
                    <span class="job-card-salary-amount">${job.salary || 'Salário a combinar'}</span>
                    <span>${job.type}</span>
                </div>
                
                <div class="job-card-tags">
                    ${(job.tags || []).slice(0, 3).map(tag => `
                        <span class="job-tag">${tag}</span>
                    `).join('')}
                    ${job.tags && job.tags.length > 3 ? `<span class="job-tag">+${job.tags.length - 3}</span>` : ''}
                </div>
                
                <div class="job-card-footer">
                    <div class="job-card-applicants">
                        👥 ${job.applicants} candidatos
                    </div>
                    ${actionButton}
                </div>
            </div>
        `;
    }

    async toggleFavorite(jobId, button) {
        try {
            const response = await window.apiService.toggleFavorite(jobId);
            if (response.success) {
                button.classList.toggle('active');
                button.textContent = response.isFavorite ? '❤️' : '🤍';
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    }

    async applyToJob(jobId) {
        try {
            const response = await window.apiService.applyToJob(jobId);
            if (response.success) {
                // Refresh the jobs list
                const user = window.authManager.currentUser;
                if (user.type === 'candidate') {
                    this.renderCandidateJobs(document.getElementById('main-content'));
                }
            }
        } catch (error) {
            alert('Erro ao se candidatar: ' + error.message);
        }
    }

    setupJobSearch(jobs) {
        const searchInput = document.getElementById('job-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredJobs = jobs.filter(job => 
                    job.title.toLowerCase().includes(searchTerm) ||
                    (job.company && job.company.toLowerCase().includes(searchTerm)) ||
                    (job.tags && job.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
                );
                this.renderJobsList(filteredJobs, 'candidate');
            });
        }
    }

    async renderCandidatesView(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Candidatos</h1>
                <p class="dashboard-subtitle">Gerencie candidatos que se aplicaram às suas vagas</p>
            </div>
            <div id="candidates-container">
                <div class="loading">Carregando candidatos...</div>
            </div>
        `;

        try {
            const candidates = await window.apiService.getCandidates();
            this.renderCandidatesList(candidates);
        } catch (error) {
            document.getElementById('candidates-container').innerHTML = `
                <div class="error-message">Erro ao carregar candidatos: ${error.message}</div>
            `;
        }
    }

    renderCandidatesList(candidates) {
        const container = document.getElementById('candidates-container');
        
        if (candidates.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhum candidato encontrado.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="candidates-grid">
                ${candidates.map(candidate => `
                    <div class="candidate-card">
                        <div class="candidate-header">
                            <img src="${candidate.avatar}" alt="${candidate.name}" class="candidate-avatar">
                            <div class="candidate-info">
                                <h3 class="candidate-name">${candidate.name}</h3>
                                <p class="candidate-title">${candidate.profileTitle}</p>
                                <p class="candidate-location">📍 ${candidate.location}</p>
                            </div>
                        </div>
                        
                        <div class="candidate-position">
                            <strong>Vaga:</strong> ${candidate.position}
                        </div>
                        
                        <div class="candidate-bio">
                            ${candidate.bio}
                        </div>
                        
                        <div class="candidate-skills">
                            ${candidate.skills.slice(0, 3).map(skill => `
                                <span class="skill-tag">${skill}</span>
                            `).join('')}
                            ${candidate.skills.length > 3 ? `<span class="skill-tag">+${candidate.skills.length - 3}</span>` : ''}
                        </div>
                        
                        <div class="candidate-status">
                            <span class="status-badge status-${candidate.status}">${this.getStatusLabel(candidate.status)}</span>
                        </div>
                        
                        <div class="candidate-actions">
                            <button class="btn btn-outline btn-sm" onclick="window.dashboardManager.viewCandidateDetails(${candidate.id})">
                                Ver Perfil Completo
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async viewCandidateDetails(candidateId) {
        try {
            const candidate = await window.apiService.getCandidateDetails(candidateId);
            this.showCandidateModal(candidate);
        } catch (error) {
            alert('Erro ao carregar detalhes do candidato: ' + error.message);
        }
    }

    showCandidateModal(candidate) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content candidate-modal">
                <div class="modal-header">
                    <h2>Perfil Completo do Candidato</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="candidate-profile">
                        <div class="profile-header">
                            <img src="${candidate.avatar}" alt="${candidate.name}" class="profile-avatar">
                            <div class="profile-info">
                                <h3>${candidate.name}</h3>
                                <p class="profile-title">${candidate.profileTitle}</p>
                                <p class="profile-location">📍 ${candidate.location}</p>
                                <p class="profile-email">📧 ${candidate.email}</p>
                                ${candidate.phone ? `<p class="profile-phone">📱 ${candidate.phone}</p>` : ''}
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Sobre</h4>
                            <p>${candidate.bio}</p>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Interesse Profissional</h4>
                            <p>${this.getProfessionalInterestLabel(candidate.professionalInterest)}</p>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Competências</h4>
                            <div class="skills-list">
                                ${candidate.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Experiência Profissional</h4>
                            ${candidate.experience.map(exp => `
                                <div class="experience-item">
                                    <h5>${exp.title} - ${exp.company}</h5>
                                    <p class="experience-period">${exp.start_date} - ${exp.current ? 'Atual' : exp.end_date}</p>
                                    <p class="experience-location">${exp.location} • ${exp.location_type}</p>
                                    <p class="experience-description">${exp.description}</p>
                                    <div class="experience-skills">
                                        ${exp.skills.map(skill => `<span class="skill-tag-sm">${skill}</span>`).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="profile-section">
                            <h4>Formação</h4>
                            ${candidate.education.map(edu => `
                                <div class="education-item">
                                    <h5>${edu.degree}</h5>
                                    <p>${edu.institution} - ${edu.year}</p>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="profile-section">
                            <h4>Idiomas</h4>
                            <div class="languages-list">
                                ${candidate.languages.map(lang => `<span class="language-tag">${lang}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Links</h4>
                            <div class="links-list">
                                ${candidate.linkedin ? `<a href="${candidate.linkedin}" target="_blank">LinkedIn</a>` : ''}
                                ${candidate.github ? `<a href="${candidate.github}" target="_blank">GitHub</a>` : ''}
                                ${candidate.portfolio ? `<a href="${candidate.portfolio}" target="_blank">Portfólio</a>` : ''}
                            </div>
                        </div>
                        
                        ${candidate.resumeContent ? `
                            <div class="profile-section">
                                <h4>Currículo</h4>
                                <div class="resume-content">
                                    <pre>${candidate.resumeContent}</pre>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async renderFavoritesView(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Vagas Favoritas</h1>
                <p class="dashboard-subtitle">Suas vagas salvas para acompanhar</p>
            </div>
            <div id="favorites-container">
                <div class="loading">Carregando favoritas...</div>
            </div>
        `;

        try {
            const favorites = await window.apiService.getFavorites();
            this.renderFavoritesList(favorites);
        } catch (error) {
            document.getElementById('favorites-container').innerHTML = `
                <div class="error-message">Erro ao carregar favoritas: ${error.message}</div>
            `;
        }
    }

    renderFavoritesList(favorites) {
        const container = document.getElementById('favorites-container');
        
        if (favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Você ainda não favoritou nenhuma vaga.</p>
                    <button class="btn btn-primary" onclick="window.dashboardManager.setActiveTab('jobs')">
                        Explorar Vagas
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="jobs-grid">
                ${favorites.map(job => this.renderJobCard(job, 'candidate')).join('')}
            </div>
        `;
    }

    async renderApplicationsView(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Minhas Candidaturas</h1>
                <p class="dashboard-subtitle">Acompanhe o status das suas candidaturas</p>
            </div>
            <div id="applications-container">
                <div class="loading">Carregando candidaturas...</div>
            </div>
        `;

        try {
            const applications = await window.apiService.getApplications();
            this.renderApplicationsList(applications);
        } catch (error) {
            document.getElementById('applications-container').innerHTML = `
                <div class="error-message">Erro ao carregar candidaturas: ${error.message}</div>
            `;
        }
    }

    renderApplicationsList(applications) {
        const container = document.getElementById('applications-container');
        
        if (applications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Você ainda não se candidatou a nenhuma vaga.</p>
                    <button class="btn btn-primary" onclick="window.dashboardManager.setActiveTab('jobs')">
                        Explorar Vagas
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="applications-list">
                ${applications.map(app => `
                    <div class="application-card">
                        <div class="application-header">
                            <div class="application-job">
                                <h3>${app.jobTitle}</h3>
                                <p class="application-company">🏢 ${app.company}</p>
                            </div>
                            <div class="application-status">
                                <span class="status-badge status-${app.currentStage}">${this.getStatusLabel(app.currentStage)}</span>
                            </div>
                        </div>
                        
                        <div class="application-details">
                            <div class="application-meta">
                                <span>📍 ${app.location} • ${app.workLocation}</span>
                                <span>💰 ${app.salary || 'Salário a combinar'}</span>
                            </div>
                            
                            <div class="application-timeline">
                                <p><strong>Fonte:</strong> ${app.jobSource}</p>
                                <p><strong>Candidatura enviada:</strong> ${new Date(app.appliedAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async renderRecommendationsView(container) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">Recomendações</h1>
                <p class="dashboard-subtitle">Vagas que combinam com seu perfil</p>
            </div>
            <div id="recommendations-container">
                <div class="loading">Carregando recomendações...</div>
            </div>
        `;

        try {
            const recommendations = await window.apiService.getJobRecommendations();
            this.renderRecommendationsList(recommendations);
        } catch (error) {
            document.getElementById('recommendations-container').innerHTML = `
                <div class="error-message">Erro ao carregar recomendações: ${error.message}</div>
            `;
        }
    }

    renderRecommendationsList(recommendations) {
        const container = document.getElementById('recommendations-container');
        
        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Complete seu perfil para receber recomendações personalizadas.</p>
                    <button class="btn btn-primary" onclick="window.dashboardManager.setActiveTab('profile')">
                        Completar Perfil
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="jobs-grid">
                ${recommendations.map(job => `
                    <div class="job-card recommendation-card">
                        <div class="recommendation-score">
                            <span class="match-score">${job.matchScore}% match</span>
                        </div>
                        ${this.renderJobCard(job, 'candidate')}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderProfileView(container, user) {
        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="dashboard-title">${user.type === 'company' ? 'Perfil da Empresa' : 'Meu Perfil'}</h1>
                <p class="dashboard-subtitle">Mantenha suas informações atualizadas</p>
            </div>
            <div id="profile-container">
                <div class="loading">Carregando perfil...</div>
            </div>
        `;

        this.loadProfile();
    }

    async loadProfile() {
        try {
            const profile = await window.apiService.getProfile();
            this.renderProfileForm(profile);
        } catch (error) {
            document.getElementById('profile-container').innerHTML = `
                <div class="error-message">Erro ao carregar perfil: ${error.message}</div>
            `;
        }
    }

    renderProfileForm(profile) {
        const container = document.getElementById('profile-container');
        const user = window.authManager.currentUser;

        if (user.type === 'candidate') {
            container.innerHTML = `
                <form id="profile-form" class="profile-form">
                    <div class="form-section">
                        <h3>Informações Básicas</h3>
                        
                        <div class="form-group">
                            <label>Título do Perfil</label>
                            <input type="text" name="profileTitle" value="${profile.profile_title || ''}" placeholder="Ex: Desenvolvedor Full Stack">
                        </div>
                        
                        <div class="form-group">
                            <label>Sobre você</label>
                            <textarea name="bio" rows="4" placeholder="Descreva sua experiência e objetivos profissionais">${profile.bio || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Telefone</label>
                            <input type="tel" name="phone" value="${profile.phone || ''}" placeholder="(11) 99999-9999">
                        </div>
                        
                        <div class="form-group">
                            <label>Localização</label>
                            <input type="text" name="location" value="${profile.location || ''}" placeholder="São Paulo, SP">
                        </div>
                        
                        <div class="form-group">
                            <label>Interesse Profissional</label>
                            <select name="professionalInterest">
                                <option value="encontrar_emprego" ${profile.professional_interest === 'encontrar_emprego' ? 'selected' : ''}>Encontrar novo emprego</option>
                                <option value="prestar_servicos" ${profile.professional_interest === 'prestar_servicos' ? 'selected' : ''}>Prestar serviços</option>
                                <option value="contratar" ${profile.professional_interest === 'contratar' ? 'selected' : ''}>Contratar</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Competências</h3>
                        <div class="form-group">
                            <label>Suas principais competências (separadas por vírgula)</label>
                            <input type="text" name="skills" value="${profile.skills ? profile.skills.join(', ') : ''}" placeholder="JavaScript, React, Node.js">
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>Links Profissionais</h3>
                        
                        <div class="form-group">
                            <label>LinkedIn</label>
                            <input type="url" name="linkedin" value="${profile.linkedin || ''}" placeholder="https://linkedin.com/in/seuperfil">
                        </div>
                        
                        <div class="form-group">
                            <label>GitHub</label>
                            <input type="url" name="github" value="${profile.github || ''}" placeholder="https://github.com/seuusuario">
                        </div>
                        
                        <div class="form-group">
                            <label>Portfólio</label>
                            <input type="url" name="portfolio" value="${profile.portfolio || ''}" placeholder="https://seuportfolio.com">
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                    </div>
                </form>
            `;
        } else {
            container.innerHTML = `
                <form id="profile-form" class="profile-form">
                    <div class="form-section">
                        <h3>Informações da Empresa</h3>
                        
                        <div class="form-group">
                            <label>Nome da Empresa</label>
                            <input type="text" name="company_name" value="${profile.company_name || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea name="description" rows="4" placeholder="Descreva sua empresa">${profile.description || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Setor</label>
                            <input type="text" name="industry" value="${profile.industry || ''}" placeholder="Tecnologia">
                        </div>
                        
                        <div class="form-group">
                            <label>Tamanho da Empresa</label>
                            <select name="size">
                                <option value="1-10" ${profile.size === '1-10' ? 'selected' : ''}>1-10 funcionários</option>
                                <option value="11-50" ${profile.size === '11-50' ? 'selected' : ''}>11-50 funcionários</option>
                                <option value="51-200" ${profile.size === '51-200' ? 'selected' : ''}>51-200 funcionários</option>
                                <option value="201-500" ${profile.size === '201-500' ? 'selected' : ''}>201-500 funcionários</option>
                                <option value="500+" ${profile.size === '500+' ? 'selected' : ''}>500+ funcionários</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Website</label>
                            <input type="url" name="website" value="${profile.website || ''}" placeholder="https://suaempresa.com">
                        </div>
                        
                        <div class="form-group">
                            <label>Localização</label>
                            <input type="text" name="location" value="${profile.location || ''}" placeholder="São Paulo, SP">
                        </div>
                        
                        <div class="form-group">
                            <label>LinkedIn da Empresa</label>
                            <input type="url" name="linkedin" value="${profile.linkedin || ''}" placeholder="https://linkedin.com/company/suaempresa">
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                    </div>
                </form>
            `;
        }

        // Setup form submission
        document.getElementById('profile-form').addEventListener('submit', (e) => this.handleProfileSubmit(e));
    }

    async handleProfileSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            if (key === 'skills') {
                data[key] = value.split(',').map(s => s.trim()).filter(s => s);
            } else {
                data[key] = value;
            }
        }

        try {
            const response = await window.apiService.updateProfile(data);
            if (response.success) {
                alert('Perfil atualizado com sucesso!');
            }
        } catch (error) {
            alert('Erro ao atualizar perfil: ' + error.message);
        }
    }

    getWorkLocationIcon(workLocation) {
        switch (workLocation?.toLowerCase()) {
            case 'remoto':
                return '🏠';
            case 'presencial':
                return '🏢';
            case 'híbrido':
                return '🔄';
            default:
                return '📍';
        }
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'Pendente',
            'under_review': 'Em Análise',
            'approved': 'Aprovado',
            'rejected': 'Rejeitado',
            'resume_analysis': 'Análise de Currículo',
            'technical_test': 'Teste Técnico',
            'group_dynamics': 'Dinâmica em Grupo',
            'interview': 'Entrevista',
            'reference_check': 'Verificação de Referências',
            'final_interview': 'Entrevista Final',
            'hired': 'Contratado'
        };
        return labels[status] || status;
    }

    getProfessionalInterestLabel(interest) {
        const labels = {
            'encontrar_emprego': 'Encontrar novo emprego',
            'prestar_servicos': 'Prestar serviços',
            'contratar': 'Contratar'
        };
        return labels[interest] || interest;
    }
}

// Create global instance
window.dashboardManager = new DashboardManager();