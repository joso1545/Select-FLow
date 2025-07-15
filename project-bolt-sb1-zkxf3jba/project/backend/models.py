import sqlite3
import os
from datetime import datetime
from config import DATABASE_PATH

def get_db_connection():
    """Get database connection with proper error handling"""
    try:
        os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        # Enable foreign keys
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise

def init_db():
    """Initialize database with all required tables"""
    conn = get_db_connection()
    c = conn.cursor()
    
    try:
        # Drop existing tables for fresh start
        tables_to_drop = [
            'favorites', 'stage_history', 'applications', 'jobs', 'curriculos', 
            'candidate_profiles', 'company_profiles', 'usuarios'
        ]
        
        for table in tables_to_drop:
            c.execute(f"DROP TABLE IF EXISTS {table}")
        
        # Users table
        c.execute("""CREATE TABLE usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('candidate', 'company')),
            avatar TEXT,
            profile_photo TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""")
        
        # Candidate profiles
        c.execute("""CREATE TABLE candidate_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            phone TEXT,
            location TEXT,
            profile_title TEXT,
            bio TEXT,
            professional_interest TEXT CHECK(professional_interest IN ('contratar', 'prestar_servicos', 'encontrar_emprego')),
            skills TEXT, -- JSON array
            experience TEXT, -- JSON array
            education TEXT, -- JSON array
            languages TEXT, -- JSON array
            linkedin TEXT,
            github TEXT,
            portfolio TEXT,
            FOREIGN KEY(user_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )""")
        
        # Company profiles
        c.execute("""CREATE TABLE company_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            company_name TEXT,
            description TEXT,
            industry TEXT,
            size TEXT,
            website TEXT,
            location TEXT,
            linkedin TEXT,
            FOREIGN KEY(user_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )""")
        
        # Curriculos table
        c.execute("""CREATE TABLE curriculos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidate_id INTEGER,
            content TEXT NOT NULL,
            file_name TEXT,
            file_path TEXT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(candidate_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )""")
        
        # Jobs table
        c.execute("""CREATE TABLE jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id INTEGER,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            requirements TEXT, -- JSON array
            location TEXT NOT NULL, -- Company location
            work_location TEXT NOT NULL, -- Work location (remote, on-site, hybrid)
            salary TEXT,
            job_type TEXT DEFAULT 'full-time',
            employment_type TEXT DEFAULT 'tempo_integral',
            tags TEXT, -- JSON array
            status TEXT DEFAULT 'active' CHECK(status IN ('active', 'closed', 'draft')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(company_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )""")
        
        # Applications table
        c.execute("""CREATE TABLE applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidate_id INTEGER,
            job_id INTEGER,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'under_review', 'approved', 'rejected')),
            current_stage TEXT DEFAULT 'resume_analysis' CHECK(current_stage IN (
                'resume_analysis', 'technical_test', 'group_dynamics', 
                'interview', 'reference_check', 'final_interview', 'hired'
            )),
            job_source TEXT DEFAULT 'selectflow',
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(candidate_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE,
            UNIQUE(candidate_id, job_id)
        )""")
        
        # Stage history table
        c.execute("""CREATE TABLE stage_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id INTEGER,
            stage TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('pending', 'passed', 'failed')),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(application_id) REFERENCES applications(id) ON DELETE CASCADE
        )""")
        
        # Favorites table
        c.execute("""CREATE TABLE favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            candidate_id INTEGER,
            job_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(candidate_id) REFERENCES usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE,
            UNIQUE(candidate_id, job_id)
        )""")
        
        # Insert sample data
        insert_sample_data(c)
        
        conn.commit()
        print("Database initialized successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"Database initialization error: {e}")
        raise
    finally:
        conn.close()

def insert_sample_data(cursor):
    """Insert sample data for testing"""
    import hashlib
    import json
    
    def hash_password(password):
        return hashlib.sha256(password.encode()).hexdigest()
    
    try:
        # Sample users
        users = [
            ('TechCorp Ltda', 'empresa@techcorp.com', hash_password('123456'), 'company'),
            ('João Silva', 'joao@email.com', hash_password('123456'), 'candidate'),
            ('Amanda Silva', 'amanda@email.com', hash_password('123456'), 'candidate'),
            ('Bruno Ferreira', 'bruno@email.com', hash_password('123456'), 'candidate'),
            ('Carla Oliveira', 'carla@email.com', hash_password('123456'), 'candidate'),
            ('InnovaTech', 'contato@innovatech.com', hash_password('123456'), 'company'),
        ]
        
        cursor.executemany(
            "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)",
            users
        )
        
        # Company profiles
        company_profiles = [
            (1, 'TechCorp Ltda', 'Empresa de tecnologia focada em soluções inovadoras', 'Tecnologia', '50-100', 'https://techcorp.com', 'São Paulo, SP', 'https://linkedin.com/company/techcorp'),
            (6, 'InnovaTech', 'Startup de tecnologia em crescimento', 'Tecnologia', '10-50', 'https://innovatech.com', 'Rio de Janeiro, RJ', 'https://linkedin.com/company/innovatech'),
        ]
        
        cursor.executemany("""
            INSERT INTO company_profiles (user_id, company_name, description, industry, size, website, location, linkedin)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, company_profiles)
        
        # Sample candidate profiles
        candidate_profiles = [
            (2, '(11) 99999-0001', 'São Paulo, SP', 'Desenvolvedor Full Stack',
             'Desenvolvedor apaixonado por tecnologia e inovação.', 'encontrar_emprego',
             json.dumps(['JavaScript', 'React', 'Node.js', 'Python']),
             json.dumps([{
                 'title': 'Desenvolvedor Jr',
                 'company': 'Tech Corp',
                 'employment_type': 'tempo_integral',
                 'location': 'São Paulo, SP',
                 'location_type': 'presencial',
                 'start_date': '2022-01',
                 'end_date': '2024-01',
                 'current': False,
                 'description': 'Desenvolvimento de aplicações web usando React e Node.js',
                 'skills': ['React', 'Node.js', 'JavaScript']
             }]),
             json.dumps([{'degree': 'Ciência da Computação', 'institution': 'USP', 'year': '2022'}]),
             json.dumps(['Português', 'Inglês']),
             'https://linkedin.com/in/joaosilva',
             'https://github.com/joaosilva',
             'https://joaosilva.dev'),
            (3, '(11) 99999-0002', 'São Paulo, SP', 'Analista de Dados Sênior',
             'Especialista em análise de dados com foco em insights de negócio.', 'encontrar_emprego',
             json.dumps(['Python', 'SQL', 'Power BI', 'Machine Learning']),
             json.dumps([{
                 'title': 'Analista de Dados',
                 'company': 'Data Inc',
                 'employment_type': 'tempo_integral',
                 'location': 'São Paulo, SP',
                 'location_type': 'hibrido',
                 'start_date': '2021-03',
                 'end_date': None,
                 'current': True,
                 'description': 'Análise de dados e criação de dashboards para tomada de decisão',
                 'skills': ['Python', 'SQL', 'Power BI']
             }]),
             json.dumps([{'degree': 'Estatística', 'institution': 'UNICAMP', 'year': '2021'}]),
             json.dumps(['Português', 'Inglês']),
             'https://linkedin.com/in/amandasilva',
             'https://github.com/amandasilva',
             'https://amanda-portfolio.com'),
            (4, '(21) 99999-0003', 'Rio de Janeiro, RJ', 'Desenvolvedor Front-End',
             'Front-end developer com experiência em UX/UI design.', 'prestar_servicos',
             json.dumps(['React', 'TypeScript', 'CSS', 'JavaScript', 'Figma']),
             json.dumps([{
                 'title': 'Desenvolvedor Front-End',
                 'company': 'Web Solutions',
                 'employment_type': 'tempo_integral',
                 'location': 'Rio de Janeiro, RJ',
                 'location_type': 'remoto',
                 'start_date': '2019-06',
                 'end_date': None,
                 'current': True,
                 'description': 'Desenvolvimento de interfaces modernas e responsivas',
                 'skills': ['React', 'TypeScript', 'CSS']
             }]),
             json.dumps([{'degree': 'Design Digital', 'institution': 'PUC-RJ', 'year': '2019'}]),
             json.dumps(['Português', 'Inglês', 'Espanhol']),
             'https://linkedin.com/in/brunoferreira',
             'https://github.com/brunoferreira',
             'https://bruno-design.com'),
            (5, '(31) 99999-0004', 'Belo Horizonte, MG', 'Gerente de Projetos',
             'Gerente de projetos experiente em metodologias ágeis.', 'contratar',
             json.dumps(['Scrum', 'Agile', 'Jira', 'Liderança', 'Gestão de Projetos']),
             json.dumps([{
                 'title': 'Gerente de Projetos',
                 'company': 'Project Masters',
                 'employment_type': 'tempo_integral',
                 'location': 'Belo Horizonte, MG',
                 'location_type': 'hibrido',
                 'start_date': '2017-01',
                 'end_date': None,
                 'current': True,
                 'description': 'Gestão de projetos de tecnologia usando metodologias ágeis',
                 'skills': ['Scrum', 'Agile', 'Jira']
             }]),
             json.dumps([{'degree': 'Administração', 'institution': 'UFMG', 'year': '2017'}]),
             json.dumps(['Português', 'Inglês']),
             'https://linkedin.com/in/carlaoliveira',
             '',
             'https://carla-pm.com')
        ]
        
        cursor.executemany("""
            INSERT INTO candidate_profiles (user_id, phone, location, profile_title, bio, professional_interest, skills, experience, education, languages, linkedin, github, portfolio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, candidate_profiles)
        
        # Sample jobs
        jobs = [
            (1, 'Desenvolvedor Full Stack Sênior', 
             'Procuramos um desenvolvedor experiente para nossa equipe de tecnologia. Você será responsável por desenvolver e manter aplicações web modernas, trabalhando tanto no frontend quanto no backend.',
             json.dumps(['React', 'Node.js', 'TypeScript', 'PostgreSQL', '5+ anos de experiência']),
             'São Paulo, SP', 'Híbrido', 'R$ 8.000 - R$ 12.000', 'full-time', 'tempo_integral',
             json.dumps(['desenvolvedor', 'fullstack', 'senior', 'react', 'node.js', 'híbrido']),
             'active'),
            (1, 'Analista de Dados Pleno',
             'Oportunidade para analista de dados com foco em business intelligence. Você irá trabalhar com grandes volumes de dados para gerar insights estratégicos.',
             json.dumps(['Python', 'SQL', 'Power BI', 'Estatística', '3+ anos de experiência']),
             'São Paulo, SP', 'Remoto', 'R$ 6.000 - R$ 9.000', 'full-time', 'tempo_integral',
             json.dumps(['analista', 'dados', 'pleno', 'python', 'sql', 'remoto']),
             'active'),
            (6, 'Designer UX/UI Junior',
             'Estamos buscando um designer criativo para melhorar a experiência do usuário em nossos produtos digitais.',
             json.dumps(['Figma', 'Adobe XD', 'Prototyping', 'User Research', '1+ ano de experiência']),
             'Rio de Janeiro, RJ', 'Presencial', 'R$ 4.000 - R$ 6.000', 'full-time', 'tempo_integral',
             json.dumps(['design', 'ux', 'ui', 'junior', 'figma', 'presencial']),
             'active'),
            (6, 'Desenvolvedor Mobile React Native',
             'Desenvolvedor mobile para criar aplicativos inovadores usando React Native.',
             json.dumps(['React Native', 'JavaScript', 'TypeScript', 'Mobile', '2+ anos de experiência']),
             'Rio de Janeiro, RJ', 'Híbrido', 'R$ 7.000 - R$ 10.000', 'full-time', 'tempo_integral',
             json.dumps(['desenvolvedor', 'mobile', 'react native', 'pleno', 'híbrido']),
             'active'),
            (1, 'Estágio em Desenvolvimento Web',
             'Oportunidade de estágio para estudantes de tecnologia interessados em desenvolvimento web.',
             json.dumps(['HTML', 'CSS', 'JavaScript', 'Estudante de tecnologia']),
             'São Paulo, SP', 'Presencial', 'R$ 1.500', 'internship', 'estagio',
             json.dumps(['estágio', 'desenvolvimento', 'web', 'javascript', 'presencial']),
             'active')
        ]
        
        cursor.executemany("""
            INSERT INTO jobs (company_id, title, description, requirements, location, work_location, salary, job_type, employment_type, tags, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, jobs)
        
        # Sample applications
        applications = [
            (3, 2, 'under_review', 'interview', 'selectflow'),  # Amanda -> Analista de Dados
            (4, 3, 'under_review', 'technical_test', 'selectflow'),  # Bruno -> Designer UX/UI
            (5, 1, 'pending', 'resume_analysis', 'selectflow'),  # Carla -> Full Stack
            (2, 5, 'approved', 'hired', 'selectflow'),  # João -> Estágio
        ]
        
        cursor.executemany("""
            INSERT INTO applications (candidate_id, job_id, status, current_stage, job_source)
            VALUES (?, ?, ?, ?, ?)
        """, applications)
        
        # Sample favorites
        favorites = [
            (2, 1),  # João favorita Full Stack
            (3, 1),  # Amanda favorita Full Stack
            (4, 4),  # Bruno favorita Mobile
        ]
        
        cursor.executemany("""
            INSERT INTO favorites (candidate_id, job_id)
            VALUES (?, ?)
        """, favorites)
        
        # Sample curriculos
        curriculos = [
            (2, 'João Silva - Desenvolvedor\nExperiência: 2 anos em desenvolvimento web\nHabilidades: JavaScript, React, Node.js, Python\nFormação: Ciência da Computação - USP', 'joao_curriculo.pdf', '/uploads/curriculos/joao_curriculo.pdf'),
            (3, 'Amanda Silva - Analista de Dados\nExperiência: 3 anos em análise de dados\nHabilidades: Python, SQL, Power BI, Machine Learning\nFormação: Estatística - UNICAMP', 'amanda_curriculo.pdf', '/uploads/curriculos/amanda_curriculo.pdf'),
            (4, 'Bruno Ferreira - Desenvolvedor Front-End\nExperiência: 5 anos em desenvolvimento frontend\nHabilidades: React, TypeScript, CSS, JavaScript\nFormação: Design Digital - PUC-RJ', 'bruno_curriculo.pdf', '/uploads/curriculos/bruno_curriculo.pdf'),
            (5, 'Carla Oliveira - Gerente de Projetos\nExperiência: 7 anos em gestão de projetos\nHabilidades: Scrum, Agile, Jira, Liderança\nFormação: Administração - UFMG', 'carla_curriculo.pdf', '/uploads/curriculos/carla_curriculo.pdf')
        ]
        
        cursor.executemany("""
            INSERT INTO curriculos (candidate_id, content, file_name, file_path)
            VALUES (?, ?, ?, ?)
        """, curriculos)
        
        print("Sample data inserted successfully!")
        
    except Exception as e:
        print(f"Error inserting sample data: {e}")
        raise

if __name__ == "__main__":
    init_db()