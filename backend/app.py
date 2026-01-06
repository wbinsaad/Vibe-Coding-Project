# Flask Backend - Interview Companion Tool
# This file contains the main Flask application with API endpoints

import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS to allow requests from frontend
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",  # Vite default dev server
            "http://localhost:3000",  # Alternative frontend port
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
        ]
    }
})

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///interview_companion.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Import database (after app config)
from models.db import init_app
init_app(app)

# ============================================
# API Routes
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API is running"""
    return jsonify({
        'status': 'ok',
        'message': 'Interview Companion API is running',
        'version': '1.0.0'
    }), 200


@app.route('/api/', methods=['GET'])
def api_root():
    """Root API endpoint with available routes"""
    return jsonify({
        'message': 'Interview Companion Tool API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'scripts': '/api/scripts (coming soon)',
            'generate': '/api/generate (coming soon)'
        }
    }), 200


# ============================================
# Error Handlers
# ============================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found',
        'code': 404
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'status': 'error',
        'message': 'Internal server error',
        'code': 500
    }), 500


# ============================================
# Development Server
# ============================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"\n{'='*50}")
    print(f"🚀 Interview Companion API Starting")
    print(f"{'='*50}")
    print(f"📍 Server: http://localhost:{port}")
    print(f"🔧 Debug Mode: {debug}")
    print(f"{'='*50}\n")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
