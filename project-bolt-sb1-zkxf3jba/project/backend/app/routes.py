from flask import Blueprint, request, jsonify, session
import sqlite3
import hashlib
import json
from datetime import datetime
from models import get_db_connection

main = Blueprint('main', __name__)

def hash_senha(senha):
    """Hash password using SHA256"""
    return hashlib.sha256(senha.encode()).hexdigest()

def get_user_by_id(user_id):
    """Get user information by ID"""
    try:
        conn = get_db_connection()
        user = conn.execute(
            "SELECT id, nome, email, tipo, avatar, profile_photo, created_at FROM usuarios WHERE id = ?",
            (user_id,)
        ).fetchone()
        conn.close()
        return dict(user) if user else None
    except Exception as e:
        print(f"Error getting user by ID: {e}")
        return None

# Authentication routes
@main.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
            
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('userType')
        
        if not email or not password:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        hashed_password = hash_senha(password)
        
        conn = get_db_connection()
        user = conn.execute(
            "SELECT id, nome, email, tipo, avatar, profile_photo FROM usuarios WHERE email = ? AND senha = ? AND tipo = ?",
            (email, hashed_password, user_type)
        ).fetchone()
        conn.close()
        
        if user:
            user_data = dict(user)
            session['user_id'] = user_data['id']
            session['user_type'] = user_data['tipo']
            
            avatar = user_data['profile_photo'] or user_data['avatar'] or f"https://ui-avatars.com/api/?name={user_data['nome']}&background=7c3aed&color=fff"
            
            return jsonify({
                'success': True,
                'user': {
                    'id': user_data['id'],
                    'name': user_data['nome'],
                    'email': user_data['email'],
                    'type': user_data['tipo'],
                    'avatar': avatar
                }
            })
        else:
            return jsonify({'error': 'Credenciais inválidas'}), 401
            
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@main.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
            
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('userType')
        company_name = data.get('companyName')
        
        if not all([name, email, password, user_type]):
            return jsonify({'error': 'Todos os campos são obrigatórios'}), 400
        
        hashed_password = hash_senha(password)
        avatar = f"https://ui-avatars.com/api/?name={name}&background=7c3aed&color=fff"
        
        conn = get_db_connection()
        
        try:
            # Check if email already exists
            existing_user = conn.execute("SELECT id FROM usuarios WHERE email = ?", (email,)).fetchone()
            if existing_user:
                return jsonify({'error': 'Já existe um cadastro com esse e-mail.'}), 400
            
            # Insert user
            cursor = conn.execute(
                "INSERT INTO usuarios (nome, email, senha, tipo, avatar) VALUES (?, ?, ?, ?, ?)",
                (name, email, hashed_password, user_type, avatar)
            )
            user_id = cursor.lastrowid
            
            # Create profile based on user type
            if user_type == 'company':
                conn.execute(
                    "INSERT INTO company_profiles (user_id, company_name) VALUES (?, ?)",
                    (user_id, company_name or name)
                )
            else:
                conn.execute(
                    "INSERT INTO candidate_profiles (user_id, skills, experience, education, languages, professional_interest) VALUES (?, ?, ?, ?, ?, ?)",
                    (user_id, '[]', '[]', '[]', '[]', 'encontrar_emprego')
                )
            
            conn.commit()
            
            session['user_id'] = user_id
            session['user_type'] = user_type
            
            return jsonify({
                'success': True,
                'user': {
                    'id': user_id,
                    'name': name,
                    'email': email,
                    'type': user_type,
                    'avatar': avatar
                }
            })
            
        except sqlite3.IntegrityError:
            return jsonify({'error': 'Já existe um cadastro com esse e-mail.'}), 400
        finally:
            conn.close()
            
    except Exception as e:
        print(f"Register error: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@main.route('/api/auth/logout', methods=['POST'])
def logout():
    try:
        session.clear()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({'error': 'Erro ao fazer logout'}), 500

@main.route('/api/auth/me', methods=['GET'])
def get_current_user():
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        
        user = get_user_by_id(session['user_id'])
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        avatar = user['profile_photo'] or user['avatar'] or f"https://ui-avatars.com/api/?name={user['nome']}&background=7c3aed&color=fff"
        
        return jsonify({
            'id': user['id'],
            'name': user['nome'],
            'email': user['email'],
            'type': user['tipo'],
            'avatar': avatar,
            'createdAt': user['created_at']
        })
    except Exception as e:
        print(f"Get current user error: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

# Public routes for preview
@main.route('/api/public/jobs', methods=['GET'])
def get_public_jobs():
    """Get public jobs for preview"""
    try:
        conn = get_db_connection()
        
        jobs = conn.execute("""
            SELECT j.*, cp.company_name, COUNT(a.id) as applicants
            FROM jobs j
            LEFT JOIN applications a ON j.id = a.job_id
            LEFT JOIN company_profiles cp ON j.company_id = cp.user_id
            WHERE j.status = 'active'
            GROUP BY j.id
            ORDER BY j.created_at DESC
            LIMIT 10
        """).fetchall()
        
        conn.close()
        
        jobs_list = []
        for job in jobs:
            requirements = json.loads(job['requirements'] or '[]')
            tags = json.loads(job['tags'] or '[]')
            jobs_list.append({
                'id': job['id'],
                'title': job['title'],
                'description': job['description'],
                'company': job['company_name'] or 'Empresa',
                'location': job['location'],
                'workLocation': job['work_location'],
                'salary': job['salary'],
                'type': job['job_type'],
                'applicants': job['applicants'] or 0,
                'postedAt': job['created_at'],
                'requirements': requirements,
                'tags': tags
            })
        
        return jsonify(jobs_list)
        
    except Exception as e:
        print(f"Get public jobs error: {e}")
        return jsonify([])

@main.route('/api/public/stats', methods=['GET'])
def get_public_stats():
    """Get public statistics for preview"""
    try:
        conn = get_db_connection()
        
        total_jobs = conn.execute("SELECT COUNT(*) FROM jobs WHERE status = 'active'").fetchone()[0]
        total_companies = conn.execute("SELECT COUNT(*) FROM usuarios WHERE tipo = 'company'").fetchone()[0]
        total_candidates = conn.execute("SELECT COUNT(*) FROM usuarios WHERE tipo = 'candidate'").fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'totalJobs': total_jobs or 0,
            'totalCompanies': total_companies or 0,
            'totalCandidates': total_candidates or 0
        })
        
    except Exception as e:
        print(f"Get public stats error: {e}")
        return jsonify({
            'totalJobs': 0,
            'totalCompanies': 0,
            'totalCandidates': 0
        })

# Dashboard routes
@main.route('/api/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        
        conn = get_db_connection()
        
        if session['user_type'] == 'company':
            # Company metrics
            company_id = session['user_id']
            
            # Total candidates who applied to company jobs
            total_candidates = conn.execute("""
                SELECT COUNT(DISTINCT a.candidate_id) 
                FROM applications a 
                JOIN jobs j ON a.job_id = j.id 
                WHERE j.company_id = ?
            """, (company_id,)).fetchone()[0]
            
            # Active jobs
            active_jobs = conn.execute(
                "SELECT COUNT(*) FROM jobs WHERE company_id = ? AND status = 'active'",
                (company_id,)
            ).fetchone()[0]
            
            # Candidates in review
            candidates_in_review = conn.execute("""
                SELECT COUNT(*) 
                FROM applications a 
                JOIN jobs j ON a.job_id = j.id 
                WHERE j.company_id = ? AND a.status = 'under_review'
            """, (company_id,)).fetchone()[0]
            
            # Scheduled interviews
            scheduled_interviews = conn.execute("""
                SELECT COUNT(*) 
                FROM applications a 
                JOIN jobs j ON a.job_id = j.id 
                WHERE j.company_id = ? AND a.current_stage IN ('interview', 'final_interview')
            """, (company_id,)).fetchone()[0]
            
            # Total applications
            total_applications = conn.execute("""
                SELECT COUNT(*) 
                FROM applications a 
                JOIN jobs j ON a.job_id = j.id 
                WHERE j.company_id = ?
            """, (company_id,)).fetchone()[0]
            
            # Hired candidates
            hired_candidates = conn.execute("""
                SELECT COUNT(*) 
                FROM applications a 
                JOIN jobs j ON a.job_id = j.id 
                WHERE j.company_id = ? AND a.current_stage = 'hired'
            """, (company_id,)).fetchone()[0]
            
        else:
            # Candidate metrics
            candidate_id = session['user_id']
            
            total_candidates = 1
            active_jobs = conn.execute("SELECT COUNT(*) FROM jobs WHERE status = 'active'").fetchone()[0]
            candidates_in_review = 0
            scheduled_interviews = conn.execute(
                "SELECT COUNT(*) FROM applications WHERE candidate_id = ? AND current_stage IN ('interview', 'final_interview')",
                (candidate_id,)
            ).fetchone()[0]
            total_applications = conn.execute(
                "SELECT COUNT(*) FROM applications WHERE candidate_id = ?",
                (candidate_id,)
            ).fetchone()[0]
            hired_candidates = conn.execute(
                "SELECT COUNT(*) FROM applications WHERE candidate_id = ? AND current_stage = 'hired'",
                (candidate_id,)
            ).fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'totalCandidates': total_candidates or 0,
            'activeJobs': active_jobs or 0,
            'candidatesInReview': candidates_in_review or 0,
            'scheduledInterviews': scheduled_interviews or 0,
            'totalApplications': total_applications or 0,
            'hiredCandidates': hired_candidates or 0
        })
        
    except Exception as e:
        print(f"Get dashboard metrics error: {e}")
        return jsonify({
            'totalCandidates': 0,
            'activeJobs': 0,
            'candidatesInReview': 0,
            'scheduledInterviews': 0,
            'totalApplications': 0,
            'hiredCandidates': 0
        })

# Candidates routes
@main.route('/api/candidates', methods=['GET'])
def get_candidates():
    try:
        if 'user_id' not in session or session['user_type'] != 'company':
            return jsonify({'error': 'Acesso negado'}), 403
        
        conn = get_db_connection()
        
        # Get candidates who applied to company jobs
        candidates = conn.execute("""
            SELECT DISTINCT 
                u.id, u.nome, u.email, u.avatar, u.profile_photo,
                cp.phone, cp.location, cp.skills, cp.profile_title, cp.bio, cp.experience,
                a.status, a.current_stage, a.submitted_at,
                j.title as position,
                c.content as resume_content, c.file_name as resume_file
            FROM usuarios u
            JOIN applications a ON u.id = a.candidate_id
            JOIN jobs j ON a.job_id = j.id
            LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
            LEFT JOIN curriculos c ON u.id = c.candidate_id
            WHERE j.company_id = ? AND u.tipo = 'candidate'
            ORDER BY a.submitted_at DESC
        """, (session['user_id'],)).fetchall()
        
        conn.close()
        
        candidates_list = []
        for candidate in candidates:
            skills = json.loads(candidate['skills'] or '[]')
            experience = json.loads(candidate['experience'] or '[]')
            avatar = candidate['profile_photo'] or candidate['avatar'] or f"https://ui-avatars.com/api/?name={candidate['nome']}&background=7c3aed&color=fff"
            
            candidates_list.append({
                'id': candidate['id'],
                'name': candidate['nome'],
                'email': candidate['email'],
                'avatar': avatar,
                'profileTitle': candidate['profile_title'] or 'Profissional',
                'bio': candidate['bio'] or 'Sem descrição disponível',
                'position': candidate['position'],
                'location': candidate['location'] or 'Não informado',
                'phone': candidate['phone'],
                'skills': skills,
                'experience': experience,
                'status': candidate['current_stage'],
                'appliedAt': candidate['submitted_at'],
                'resumeContent': candidate['resume_content'],
                'resumeFile': candidate['resume_file']
            })
        
        return jsonify(candidates_list)
        
    except Exception as e:
        print(f"Get candidates error: {e}")
        return jsonify([])

@main.route('/api/candidates/<int:candidate_id>/details', methods=['GET'])
def get_candidate_details(candidate_id):
    try:
        if 'user_id' not in session or session['user_type'] != 'company':
            return jsonify({'error': 'Acesso negado'}), 403
        
        conn = get_db_connection()
        
        # Get detailed candidate information
        candidate = conn.execute("""
            SELECT 
                u.id, u.nome, u.email, u.avatar, u.profile_photo,
                cp.*,
                c.content as resume_content, c.file_name as resume_file, c.file_path
            FROM usuarios u
            LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
            LEFT JOIN curriculos c ON u.id = c.candidate_id
            WHERE u.id = ? AND u.tipo = 'candidate'
        """, (candidate_id,)).fetchone()
        
        conn.close()
        
        if not candidate:
            return jsonify({'error': 'Candidato não encontrado'}), 404
        
        candidate_data = dict(candidate)
        avatar = candidate_data['profile_photo'] or candidate_data['avatar'] or f"https://ui-avatars.com/api/?name={candidate_data['nome']}&background=7c3aed&color=fff"
        
        return jsonify({
            'id': candidate_data['id'],
            'name': candidate_data['nome'],
            'email': candidate_data['email'],
            'avatar': avatar,
            'profileTitle': candidate_data['profile_title'] or 'Profissional',
            'bio': candidate_data['bio'] or 'Sem descrição disponível',
            'phone': candidate_data['phone'],
            'location': candidate_data['location'],
            'professionalInterest': candidate_data['professional_interest'],
            'skills': json.loads(candidate_data['skills'] or '[]'),
            'experience': json.loads(candidate_data['experience'] or '[]'),
            'education': json.loads(candidate_data['education'] or '[]'),
            'languages': json.loads(candidate_data['languages'] or '[]'),
            'linkedin': candidate_data['linkedin'],
            'github': candidate_data['github'],
            'portfolio': candidate_data['portfolio'],
            'resumeContent': candidate_data['resume_content'],
            'resumeFile': candidate_data['resume_file'],
            'resumePath': candidate_data['file_path']
        })
        
    except Exception as e:
        print(f"Get candidate details error: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

# Jobs routes
@main.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        
        conn = get_db_connection()
        
        if session['user_type'] == 'company':
            # Company's jobs
            jobs = conn.execute("""
                SELECT j.*, COUNT(a.id) as applicants
                FROM jobs j
                LEFT JOIN applications a ON j.id = a.job_id
                WHERE j.company_id = ?
                GROUP BY j.id
                ORDER BY j.created_at DESC
            """, (session['user_id'],)).fetchall()
        else:
            # All active jobs for candidates with favorite status
            jobs = conn.execute("""
                SELECT j.*, COUNT(a.id) as applicants, cp.company_name,
                       CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite,
                       CASE WHEN app.id IS NOT NULL THEN 1 ELSE 0 END as has_applied
                FROM jobs j
                LEFT JOIN applications a ON j.id = a.job_id
                LEFT JOIN company_profiles cp ON j.company_id = cp.user_id
                LEFT JOIN favorites f ON j.id = f.job_id AND f.candidate_id = ?
                LEFT JOIN applications app ON j.id = app.job_id AND app.candidate_id = ?
                WHERE j.status = 'active'
                GROUP BY j.id
                ORDER BY j.created_at DESC
            """, (session['user_id'], session['user_id'])).fetchall()
        
        conn.close()
        
        jobs_list = []
        for job in jobs:
            requirements = json.loads(job['requirements'] or '[]')
            tags = json.loads(job['tags'] or '[]')
            job_data = {
                'id': job['id'],
                'title': job['title'],
                'description': job['description'],
                'location': job['location'],
                'workLocation': job['work_location'],
                'salary': job['salary'],
                'type': job['job_type'],
                'employmentType': job.get('employment_type', 'tempo_integral'),
                'status': job['status'],
                'applicants': job['applicants'] or 0,
                'postedAt': job['created_at'],
                'requirements': requirements,
                'tags': tags
            }
            
            # Add candidate-specific fields
            if session['user_type'] == 'candidate':
                job_data['company'] = job.get('company_name', 'Empresa')
                job_data['isFavorite'] = bool(job.get('is_favorite', 0))
                job_data['hasApplied'] = bool(job.get('has_applied', 0))
            
            jobs_list.append(job_data)
        
        return jsonify(jobs_list)
        
    except Exception as e:
        print(f"Get jobs error: {e}")
        return jsonify([])

@main.route('/api/jobs', methods=['POST'])
def create_job():
    try:
        if 'user_id' not in session or session['user_type'] != 'company':
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
            
        title = data.get('title')
        description = data.get('description')
        requirements = data.get('requirements', [])
        location = data.get('location')
        work_location = data.get('workLocation')
        salary = data.get('salary')
        job_type = data.get('type', 'full-time')
        employment_type = data.get('employmentType', 'tempo_integral')
        tags = data.get('tags', [])
        
        if not all([title, description, location, work_location]):
            return jsonify({'error': 'Campos obrigatórios não preenchidos'}), 400
        
        conn = get_db_connection()
        cursor = conn.execute("""
            INSERT INTO jobs (company_id, title, description, requirements, location, work_location, salary, job_type, employment_type, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (session['user_id'], title, description, json.dumps(requirements), location, work_location, salary, job_type, employment_type, json.dumps(tags)))
        
        job_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'jobId': job_id})
        
    except Exception as e:
        print(f"Create job error: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

# Favorites routes
@main.route('/api/favorites', methods=['POST'])
def toggle_favorite():
    try:
        if 'user_id' not in session or session['user_type'] != 'candidate':
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
            
        job_id = data.get('jobId')
        
        if not job_id:
            return jsonify({'error': 'ID da vaga é obrigatório'}), 400
        
        conn = get_db_connection()
        
        try:
            # Check if already favorited
            existing = conn.execute(
                "SELECT id FROM favorites WHERE candidate_id = ? AND job_id = ?",
                (session['user_id'], job_id)
            ).fetchone()
            
            if existing:
                # Remove from favorites
                conn.execute(
                    "DELETE FROM favorites WHERE candidate_id = ? AND job_id = ?",
                    (session['user_id'], job_id)
                )
                is_favorite = False
            else:
                # Add to favorites
                conn.execute(
                    "INSERT INTO favorites (candidate_id, job_id) VALUES (?, ?)",
                    (session['user_id'], job_id)
                )
                is_favorite = True
            
            conn.commit()
            return jsonify({'success': True, 'isFavorite': is_favorite})
            
        finally:
            conn.close()
            
    except Exception as e:
        print(f"Toggle favorite error: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@main.route('/api/favorites', methods=['GET'])
def get_favorites():
    try:
        if 'user_id' not in session or session['user_type'] != 'candidate':
            return jsonify({'error': 'Acesso negado'}), 403
        
        conn = get_db_connection()
        
        favorites = conn.execute("""
            SELECT j.*, cp.company_name, COUNT(a.id) as applicants
            FROM favorites f
            JOIN jobs j ON f.job_id = j.id
            LEFT JOIN applications a ON j.id = a.job_id
            LEFT JOIN company_profiles cp ON j.company_id = cp.user_id
            WHERE f.candidate_id = ? AND j.status = 'active'
            GROUP BY j.id
            ORDER BY f.created_at DESC
        """, (session['user_id'],)).fetchall()
        
        conn.close()
        
        favorites_list = []
        for job in favorites:
            requirements = json.loads(job['requirements'] or '[]')
            tags = json.loads(job['tags'] or '[]')
            favorites_list.append({
                'id': job['id'],
                'title': job['title'],
                'description': job['description'],
                'company': job['company_name'] or 'Empresa',
                'location': job['location'],
                'workLocation': job['work_location'],
                'salary': job['salary'],
                'type': job['job_type'],
                'applicants': job['applicants'] or 0,
                'postedAt': job['created_at'],
                'requirements': requirements,
                'tags': tags,
                'isFavorite': True
            })
        
        return jsonify(favorites_list)
        
    except Exception as e:
        print(f"Get favorites error: {e}")
        return jsonify([])

# Profile routes
@main.route('/api/profile', methods=['GET'])
def get_profile():
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        
        conn = get_db_connection()
        user_id = session['user_id']
        user_type = session['user_type']
        
        if user_type == 'candidate':
            profile = conn.execute("""
                SELECT cp.*, u.nome, u.email, u.profile_photo, u.avatar
                FROM candidate_profiles cp
                JOIN usuarios u ON cp.user_id = u.id
                WHERE cp.user_id = ?
            """, (user_id,)).fetchone()
        else:
            profile = conn.execute("""
                SELECT cp.*, u.nome, u.email, u.profile_photo, u.avatar
                FROM company_profiles cp
                JOIN usuarios u ON cp.user_id = u.id
                WHERE cp.user_id = ?
            """, (user_id,)).fetchone()
        
        conn.close()
        
        if not profile:
            return jsonify({'error': 'Perfil não encontrado'}), 404
        
        profile_data = dict(profile)
        avatar = profile_data['profile_photo'] or profile_data['avatar'] or f"https://ui-avatars.com/api/?name={profile_data['nome']}&background=7c3aed&color=fff"
        
        # Parse JSON fields for candidate
        if user_type == 'candidate':
            profile_data['skills'] = json.loads(profile_data.get('skills', '[]'))
            profile_data['experience'] = json.loads(profile_data.get('experience', '[]'))
            profile_data['education'] = json.loads(profile_data.get('education', '[]'))
            profile_data['languages'] = json.loads(profile_data.get('languages', '[]'))
        
        profile_data['avatar'] = avatar
        return jsonify(profile_data)
        
    except Exception as e:
        print(f"Get profile error: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@main.route('/api/profile', methods=['PUT'])
def update_profile():
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
            
        user_id = session['user_id']
        user_type = session['user_type']
        
        conn = get_db_connection()
        
        try:
            if user_type == 'candidate':
                conn.execute("""
                    UPDATE candidate_profiles 
                    SET phone = ?, location = ?, profile_title = ?, bio = ?, professional_interest = ?,
                        skills = ?, experience = ?, education = ?, languages = ?, linkedin = ?, github = ?, portfolio = ?
                    WHERE user_id = ?
                """, (
                    data.get('phone'),
                    data.get('location'),
                    data.get('profileTitle'),
                    data.get('bio'),
                    data.get('professionalInterest'),
                    json.dumps(data.get('skills', [])),
                    json.dumps(data.get('experience', [])),
                    json.dumps(data.get('education', [])),
                    json.dumps(data.get('languages', [])),
                    data.get('linkedin'),
                    data.get('github'),
                    data.get('portfolio'),
                    user_id
                ))
            else:
                conn.execute("""
                    UPDATE company_profiles 
                    SET company_name = ?, description = ?, industry = ?, size = ?, website = ?, location = ?, linkedin = ?
                    WHERE user_id = ?
                """, (
                    data.get('company_name'),
                    data.get('description'),
                    data.get('industry'),
                    data.get('size'),
                    data.get('website'),
                    data.get('location'),
                    data.get('linkedin'),
                    user_id
                ))
            
            conn.commit()
            return jsonify({'success': True})
            
        finally:
            conn.close()
            
    except Exception as e:
        print(f"Update profile error: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

# Applications routes
@main.route('/api/applications', methods=['POST'])
def apply_to_job():
    try:
        if 'user_id' not in session or session['user_type'] != 'candidate':
            return jsonify({'error': 'Acesso negado'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
            
        job_id = data.get('jobId')
        job_source = data.get('jobSource', 'selectflow')
        
        if not job_id:
            return jsonify({'error': 'ID da vaga é obrigatório'}), 400
        
        conn = get_db_connection()
        
        try:
            # Check if already applied
            existing = conn.execute(
                "SELECT id FROM applications WHERE candidate_id = ? AND job_id = ?",
                (session['user_id'], job_id)
            ).fetchone()
            
            if existing:
                return jsonify({'error': 'Você já se candidatou a esta vaga'}), 400
            
            # Create application
            conn.execute("""
                INSERT INTO applications (candidate_id, job_id, status, current_stage, job_source)
                VALUES (?, ?, 'pending', 'resume_analysis', ?)
            """, (session['user_id'], job_id, job_source))
            
            conn.commit()
            return jsonify({'success': True})
            
        finally:
            conn.close()
            
    except Exception as e:
        print(f"Apply to job error: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@main.route('/api/applications', methods=['GET'])
def get_applications():
    try:
        if 'user_id' not in session or session['user_type'] != 'candidate':
            return jsonify({'error': 'Acesso negado'}), 403
        
        conn = get_db_connection()
        
        applications = conn.execute("""
            SELECT a.*, j.title, j.location, j.work_location, j.salary, cp.company_name
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            LEFT JOIN company_profiles cp ON j.company_id = cp.user_id
            WHERE a.candidate_id = ?
            ORDER BY a.submitted_at DESC
        """, (session['user_id'],)).fetchall()
        
        conn.close()
        
        applications_list = []
        for app in applications:
            applications_list.append({
                'id': app['id'],
                'jobId': app['job_id'],
                'jobTitle': app['title'],
                'company': app['company_name'] or 'Empresa',
                'location': app['location'],
                'workLocation': app['work_location'],
                'salary': app['salary'],
                'status': app['status'],
                'currentStage': app['current_stage'],
                'jobSource': app['job_source'],
                'appliedAt': app['submitted_at']
            })
        
        return jsonify(applications_list)
        
    except Exception as e:
        print(f"Get applications error: {e}")
        return jsonify([])

# Recommendations routes
@main.route('/api/recommendations/jobs', methods=['GET'])
def get_job_recommendations():
    try:
        if 'user_id' not in session or session['user_type'] != 'candidate':
            return jsonify({'error': 'Acesso negado'}), 403
        
        conn = get_db_connection()
        
        # Get candidate profile
        candidate = conn.execute("""
            SELECT skills, experience, location, professional_interest
            FROM candidate_profiles
            WHERE user_id = ?
        """, (session['user_id'],)).fetchone()
        
        if not candidate:
            return jsonify([])
        
        candidate_skills = json.loads(candidate['skills'] or '[]')
        candidate_location = candidate['location'] or ''
        
        # Get jobs with matching criteria
        jobs = conn.execute("""
            SELECT j.*, cp.company_name, COUNT(a.id) as applicants,
                   CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
            FROM jobs j
            LEFT JOIN applications a ON j.id = a.job_id
            LEFT JOIN company_profiles cp ON j.company_id = cp.user_id
            LEFT JOIN favorites f ON j.id = f.job_id AND f.candidate_id = ?
            WHERE j.status = 'active'
            GROUP BY j.id
            ORDER BY j.created_at DESC
        """, (session['user_id'],)).fetchall()
        
        # Simple recommendation algorithm
        recommendations = []
        for job in jobs:
            requirements = json.loads(job['requirements'] or '[]')
            tags = json.loads(job['tags'] or '[]')
            
            # Calculate match score based on skills
            skill_matches = 0
            for skill in candidate_skills:
                for req in requirements + tags:
                    if skill.lower() in req.lower():
                        skill_matches += 1
            
            # Location match
            location_match = 0
            if candidate_location and candidate_location.lower() in job['location'].lower():
                location_match = 1
            
            # Calculate total score
            match_score = (skill_matches * 20) + (location_match * 10)
            
            if match_score > 0:  # Only include jobs with some match
                recommendations.append({
                    'id': job['id'],
                    'title': job['title'],
                    'description': job['description'],
                    'company': job['company_name'] or 'Empresa',
                    'location': job['location'],
                    'workLocation': job['work_location'],
                    'salary': job['salary'],
                    'type': job['job_type'],
                    'applicants': job['applicants'] or 0,
                    'postedAt': job['created_at'],
                    'requirements': requirements,
                    'tags': tags,
                    'isFavorite': bool(job['is_favorite']),
                    'matchScore': min(match_score, 100)  # Cap at 100%
                })
        
        # Sort by match score
        recommendations.sort(key=lambda x: x['matchScore'], reverse=True)
        
        conn.close()
        return jsonify(recommendations[:10])  # Return top 10
        
    except Exception as e:
        print(f"Get job recommendations error: {e}")
        return jsonify([])

# Tags routes
@main.route('/api/tags', methods=['GET'])
def get_tags():
    """Get available tags"""
    try:
        tags = [
            # Tecnologia
            'desenvolvedor', 'backend', 'frontend', 'fullstack', 'mobile', 'devops',
            'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue.js',
            'php', 'c#', 'ruby', 'go', 'rust', 'typescript', 'sql', 'nosql',
            'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum',
            
            # Níveis
            'estágio', 'junior', 'pleno', 'senior', 'especialista', 'lead', 'arquiteto',
            
            # Áreas
            'medicina', 'enfermagem', 'fisioterapia', 'psicologia', 'odontologia',
            'engenharia', 'civil', 'mecânica', 'elétrica', 'química', 'ambiental',
            'marketing', 'vendas', 'comercial', 'atendimento', 'suporte',
            'recursos humanos', 'rh', 'financeiro', 'contabilidade', 'auditoria',
            'design', 'ux', 'ui', 'gráfico', 'produto', 'arquitetura',
            'educação', 'professor', 'coordenador', 'diretor',
            'logística', 'operações', 'produção', 'qualidade',
            'jurídico', 'advocacia', 'compliance', 'contratos',
            
            # Modalidades
            'remoto', 'presencial', 'híbrido', 'home office',
            'tempo integral', 'meio período', 'freelancer', 'consultoria',
            'temporário', 'efetivo', 'terceirizado', 'pj', 'clt'
        ]
        
        return jsonify(sorted(tags))
        
    except Exception as e:
        print(f"Get tags error: {e}")
        return jsonify([])

# Health check route
@main.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Test database connection
        conn = get_db_connection()
        conn.execute("SELECT 1").fetchone()
        conn.close()
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500