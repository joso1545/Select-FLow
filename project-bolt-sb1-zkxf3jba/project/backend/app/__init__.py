from flask import Flask
from flask_cors import CORS
from config import SECRET_KEY
import os

def create_app():
    app = Flask(__name__)
    app.secret_key = SECRET_KEY
    
    # Enable CORS for React frontend with proper configuration
    CORS(app, 
         origins=["http://localhost:5173", "https://localhost:5173", "http://127.0.0.1:5173"], 
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Ensure database directory exists
    from config import DATABASE_PATH
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    
    # Register blueprints
    from .routes import main
    app.register_blueprint(main)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Endpoint não encontrado'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Erro interno do servidor'}, 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return {'error': 'Requisição inválida'}, 400
    
    return app