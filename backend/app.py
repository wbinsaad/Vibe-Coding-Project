# Flask Backend - Interview Companion Tool
# This file contains the main Flask application with API endpoints

import os
from flask import Flask, jsonify, request
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
            'generate_script': 'POST /api/scripts/generate',
            'scripts': '/api/scripts (coming soon)',
        }
    }), 200


@app.route('/api/scripts/generate', methods=['POST'])
def generate_script():
    """
    Generate a new interview script with questions
    
    POST /api/scripts/generate
    Body:
    {
        "research_goal": "string",
        "target_users": "string",
        "duration_minutes": integer,
        "interview_type": "structured" | "semi-structured"
    }
    
    Returns:
        201: Script and questions created successfully
        400: Validation error
    """
    from models.db import db
    from models.script import Script, Question
    
    # Get JSON data from request
    data = request.get_json()
    
    if not data:
        return jsonify({
            'status': 'error',
            'message': 'Request body must be JSON'
        }), 400
    
    # Validate required fields
    required_fields = ['research_goal', 'target_users', 'duration_minutes', 'interview_type']
    missing_fields = []
    
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
    
    if missing_fields:
        return jsonify({
            'status': 'error',
            'message': 'Missing required fields',
            'missing_fields': missing_fields
        }), 400
    
    # Validate interview_type
    valid_types = ['structured', 'semi-structured']
    if data['interview_type'] not in valid_types:
        return jsonify({
            'status': 'error',
            'message': f'Invalid interview_type. Must be one of: {", ".join(valid_types)}',
            'provided': data['interview_type']
        }), 400
    
    # Validate duration_minutes is an integer
    try:
        duration = int(data['duration_minutes'])
        if duration <= 0:
            raise ValueError("Duration must be positive")
    except (ValueError, TypeError):
        return jsonify({
            'status': 'error',
            'message': 'duration_minutes must be a positive integer'
        }), 400
    
    # Create the script
    try:
        script = Script(
            title=f"Interview: {data['target_users'][:50]}",  # Auto-generate title
            research_goal=data['research_goal'],
            target_users=data['target_users'],
            duration_minutes=duration,
            interview_type=data['interview_type'],
            status='draft'
        )
        
        db.session.add(script)
        db.session.flush()  # Get the script ID without committing
        
        # Generate dummy questions
        questions = _generate_dummy_questions(script.id, data['research_goal'], data['target_users'])
        
        # Add all questions to the session
        for question in questions:
            db.session.add(question)
        
        # Commit all changes
        db.session.commit()
        
        # Prepare response
        response_data = {
            'status': 'success',
            'message': 'Script generated successfully',
            'script_id': script.id,
            'script': script.to_dict(),
            'questions': [q.to_dict() for q in questions]
        }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to create script: {str(e)}'
        }), 500


def _generate_dummy_questions(script_id, research_goal, target_users):
    """
    Generate dummy interview questions for testing
    
    Args:
        script_id: ID of the script to link questions to
        research_goal: Research goal for context
        target_users: Target user group for context
    
    Returns:
        List of Question objects
    """
    from models.script import Question
    
    questions = []
    order_index = 0
    
    # INTRO SECTION (2 questions)
    intro_questions = [
        f"Thank you for joining this interview. Can you briefly introduce yourself and your experience with {target_users.lower()}?",
        f"Before we dive in, could you tell me a bit about your general background and how it relates to our research on {research_goal.lower()}?"
    ]
    
    for text in intro_questions:
        questions.append(Question(
            script_id=script_id,
            section='intro',
            order_index=order_index,
            text=text,
            is_asked=False
        ))
        order_index += 1
    
    # WARMUP SECTION (2 questions)
    warmup_questions = [
        f"What initially motivated you to get involved with {target_users.lower()}?",
        f"Can you walk me through a typical day or scenario related to {research_goal.lower()}?"
    ]
    
    for text in warmup_questions:
        questions.append(Question(
            script_id=script_id,
            section='warmup',
            order_index=order_index,
            text=text,
            is_asked=False
        ))
        order_index += 1
    
    # MAIN SECTION (5 questions)
    main_questions = [
        f"What are the main challenges or pain points you've encountered regarding {research_goal.lower()}?",
        f"Can you describe a specific situation where you faced difficulties related to our research topic?",
        f"How do you currently address or work around these challenges?",
        f"What would an ideal solution or experience look like for you in this context?",
        f"Are there any tools, methods, or approaches you've found particularly helpful or unhelpful?"
    ]
    
    for text in main_questions:
        questions.append(Question(
            script_id=script_id,
            section='main',
            order_index=order_index,
            text=text,
            is_asked=False
        ))
        order_index += 1
    
    # CLOSING SECTION (2 questions)
    closing_questions = [
        f"Is there anything else you'd like to share about {research_goal.lower()} that we haven't covered?",
        f"Do you have any questions for me, or is there anything you'd like to know about this research?"
    ]
    
    for text in closing_questions:
        questions.append(Question(
            script_id=script_id,
            section='closing',
            order_index=order_index,
            text=text,
            is_asked=False
        ))
        order_index += 1
    
    return questions


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
