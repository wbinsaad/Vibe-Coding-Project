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
            'get_script': 'GET /api/scripts/<script_id>',
            'add_question_from_followup': 'POST /api/scripts/<script_id>/questions/from-followup',
            'reorder_questions': 'POST /api/scripts/<script_id>/reorder',
            'run_checks': 'POST /api/scripts/<script_id>/checks',
            'generate_followups': 'POST /api/followups',
            'create_question': 'POST /api/questions',
            'update_question': 'PATCH /api/questions/<question_id>',
            'delete_question': 'DELETE /api/questions/<question_id>',
            'clear_flags': 'DELETE /api/questions/<question_id>/flags',
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


@app.route('/api/scripts/<int:script_id>', methods=['GET'])
def get_script(script_id):
    """
    Retrieve a script by ID with all questions, flags, and notes
    
    GET /api/scripts/<script_id>
    
    Returns:
        200: Script found with all related data
        404: Script not found
    """
    from models.db import db
    from models.script import Script, Question
    from models.flag import Flag
    from models.note import Note
    
    # Query script by ID
    script = Script.query.filter_by(id=script_id).first()
    
    if not script:
        return jsonify({
            'status': 'error',
            'error': 'Script not found'
        }), 404
    
    # Get all questions for this script, ordered by order_index
    questions = Question.query.filter_by(script_id=script_id)\
        .order_by(Question.order_index)\
        .all()
    
    # Build questions list with flags and notes
    questions_data = []
    for question in questions:
        # Get flags for this question
        flags = Flag.query.filter_by(question_id=question.id).all()
        
        # Get notes for this question
        notes = Note.query.filter_by(question_id=question.id).all()
        
        # Build question dict with nested data
        question_dict = question.to_dict()
        question_dict['flags'] = [flag.to_dict() for flag in flags]
        question_dict['notes'] = [note.to_dict() for note in notes]
        
        questions_data.append(question_dict)
    
    # Build response
    response_data = {
        'status': 'success',
        'script': script.to_dict(),
        'questions': questions_data
    }
    
    return jsonify(response_data), 200


@app.route('/api/scripts/<int:script_id>/questions/from-followup', methods=['POST'])
def add_question_from_followup(script_id):
    """Create a new question from a follow-up suggestion"""
    from models.db import db
    from models.script import Script, Question
    
    # Validate script exists
    script = Script.query.filter_by(id=script_id).first()
    if not script:
        return jsonify({'status': 'error', 'error': 'Script not found'}), 404
    
    data = request.get_json()
    
    # Validate required field
    if not data or 'text' not in data or not data['text'].strip():
        return jsonify({'status': 'error', 'message': 'Missing required field: text'}), 400
    
    try:
        # Get section (default to 'main')
        section = data.get('section', 'main').lower()
        
        # Validate section
        valid_sections = ['intro', 'warmup', 'main', 'closing']
        if section not in valid_sections:
            section = 'main'
        
        # Get max order_index for this script
        max_order = db.session.query(db.func.max(Question.order_index)).filter_by(script_id=script_id).scalar()
        order_index = (max_order + 1) if max_order is not None else 0
        
        # Create question
        question = Question(
            script_id=script_id,
            section=section,
            text=data['text'].strip(),
            order_index=order_index,
            is_asked=False
        )
        
        db.session.add(question)
        db.session.commit()
        
        return jsonify({'status': 'success', 'question': question.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': f'Failed to create question: {str(e)}'}), 500


@app.route('/api/questions/<int:question_id>', methods=['PATCH'])
def update_question(question_id):
    """
    Update a question's text
    
    PATCH /api/questions/<question_id>
    Body: { "text": "new question text" }
    
    Returns:
        200: Question updated successfully
        400: Validation error
        404: Question not found
    """
    from models.db import db
    from models.script import Question
    from datetime import datetime
    
    # Get JSON data
    data = request.get_json()
    
    if not data:
        return jsonify({
            'status': 'error',
            'message': 'Request body must be JSON'
        }), 400
    
    # Validate text field
    if 'text' not in data or not data['text'] or not data['text'].strip():
        return jsonify({
            'status': 'error',
            'message': 'Question text is required and cannot be empty'
        }), 400
    
    # Find question by ID
    question = Question.query.filter_by(id=question_id).first()
    
    if not question:
        return jsonify({
            'status': 'error',
            'error': 'Question not found'
        }), 404
    
    try:
        # Update question text and timestamp
        question.text = data['text'].strip()
        question.updated_at = datetime.utcnow()
        
        # Commit changes
        db.session.commit()
        
        # Return updated question
        return jsonify({
            'status': 'success',
            'message': 'Question updated successfully',
            'question': question.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to update question: {str(e)}'
        }), 500


@app.route('/api/questions', methods=['POST'])
def create_question():
    """
    Create a new question for a script
    
    POST /api/questions
    Body:
    {
        "script_id": number,
        "section": "intro"|"warmup"|"main"|"closing",
        "text": "question text",
        "order_index": number (optional)
    }
    
    Returns:
        201: Question created successfully
        400: Validation error
        404: Script not found
    """
    from models.db import db
    from models.script import Script, Question
    
    # Get JSON data
    data = request.get_json()
    
    if not data:
        return jsonify({
            'status': 'error',
            'message': 'Request body must be JSON'
        }), 400
    
    # Validate required fields
    required_fields = ['script_id', 'section', 'text']
    missing_fields = []
    
    for field in required_fields:
        if field not in data or (isinstance(data[field], str) and not data[field].strip()):
            missing_fields.append(field)
    
    if missing_fields:
        return jsonify({
            'status': 'error',
            'message': 'Missing required fields',
            'missing_fields': missing_fields
        }), 400
    
    # Validate section
    valid_sections = ['intro', 'warmup', 'main', 'closing']
    if data['section'] not in valid_sections:
        return jsonify({
            'status': 'error',
            'message': f'Invalid section. Must be one of: {", ".join(valid_sections)}',
            'provided': data['section']
        }), 400
    
    # Validate script exists
    script = Script.query.filter_by(id=data['script_id']).first()
    if not script:
        return jsonify({
            'status': 'error',
            'error': 'Script not found'
        }), 404
    
    try:
        # Calculate order_index if not provided
        if 'order_index' in data and data['order_index'] is not None:
            order_index = int(data['order_index'])
        else:
            # Get max order_index for this script
            max_order = db.session.query(db.func.max(Question.order_index))\
                .filter_by(script_id=data['script_id'])\
                .scalar()
            order_index = (max_order + 1) if max_order is not None else 0
        
        # Create question
        question = Question(
            script_id=data['script_id'],
            section=data['section'],
            text=data['text'].strip(),
            order_index=order_index,
            is_asked=False
        )
        
        db.session.add(question)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Question created successfully',
            'question': question.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to create question: {str(e)}'
        }), 500


@app.route('/api/questions/<int:question_id>', methods=['DELETE'])
def delete_question(question_id):
    """
    Delete a question by ID
    
    DELETE /api/questions/<question_id>
    
    Returns:
        200: Question deleted successfully
        404: Question not found
    """
    from models.db import db
    from models.script import Question
    
    # Find question by ID
    question = Question.query.filter_by(id=question_id).first()
    
    if not question:
        return jsonify({
            'status': 'error',
            'error': 'Question not found'
        }), 404
    
    try:
        # Delete question (flags and notes will cascade delete)
        db.session.delete(question)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Question deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to delete question: {str(e)}'
        }), 500


@app.route('/api/scripts/<int:script_id>/reorder', methods=['POST'])
def reorder_questions(script_id):
    """
    Reorder questions for a script
    
    POST /api/scripts/<script_id>/reorder
    Body:
    {
        "question_order": [
            {"question_id": 1, "order_index": 0},
            {"question_id": 2, "order_index": 1},
            ...
        ]
    }
    
    Returns:
        200: Questions reordered successfully
        400: Validation error
        404: Script not found
    """
    from models.db import db
    from models.script import Script, Question
    
    # Get JSON data
    data = request.get_json()
    
    if not data or 'question_order' not in data:
        return jsonify({
            'status': 'error',
            'message': 'Request body must contain question_order array'
        }), 400
    
    # Validate script exists
    script = Script.query.filter_by(id=script_id).first()
    if not script:
        return jsonify({
            'status': 'error',
            'error': 'Script not found'
        }), 404
    
    question_order = data['question_order']
    
    if not isinstance(question_order, list):
        return jsonify({
            'status': 'error',
            'message': 'question_order must be an array'
        }), 400
    
    try:
        # Get all question IDs being reordered
        question_ids = [item['question_id'] for item in question_order if 'question_id' in item]
        
        # Validate all questions belong to this script
        questions = Question.query.filter(Question.id.in_(question_ids)).all()
        
        if len(questions) != len(question_ids):
            return jsonify({
                'status': 'error',
                'message': 'One or more questions not found'
            }), 400
        
        # Validate all questions belong to this script
        for question in questions:
            if question.script_id != script_id:
                return jsonify({
                    'status': 'error',
                    'message': f'Question {question.id} does not belong to script {script_id}'
                }), 400
        
        # Update order_index for each question
        for item in question_order:
            if 'question_id' not in item or 'order_index' not in item:
                continue
                
            question = next((q for q in questions if q.id == item['question_id']), None)
            if question:
                question.order_index = item['order_index']
        
        # Commit all changes in one transaction
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Questions reordered successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to reorder questions: {str(e)}'
        }), 500



@app.route('/api/scripts/<int:script_id>/checks', methods=['POST'])
def run_quality_checks(script_id):
    """
    Run AI-powered quality checks on all questions in a script using Gemini
    
    POST /api/scripts/<script_id>/checks
    Query params:
        - debug=true: Include raw Gemini response in output
    
    Returns:
        200: Checks completed with flags
        404: Script not found
        500: Gemini API error
    """
    from models.db import db
    from models.script import Script, Question
    from models.flag import Flag
    from services.gemini_client import generate_with_schema
    from flask import request
    import json

    # Check for debug mode
    debug_mode = request.args.get('debug', 'false').lower() == 'true'
    
    # Validate script exists
    script = Script.query.filter_by(id=script_id).first()
    if not script:
        return jsonify({
            'status': 'error',
            'error': 'Script not found'
        }), 404
    
    # Load all questions for this script, ordered by order_index
    questions = Question.query.filter_by(script_id=script_id)\
        .order_by(Question.order_index)\
        .all()
    
    if not questions:
        return jsonify({
            'status': 'success',
            'script_id': script_id,
            'flags': [],
            'flag_counts': {'bias': 0, 'alignment': 0}
        }), 200
    
    try:
        # Delete existing flags for all questions in this script
        question_ids = [q.id for q in questions]
        if question_ids:
            Flag.query.filter(Flag.question_id.in_(question_ids)).delete(synchronize_session=False)
        
        # Prepare questions data for Gemini
        questions_data = [
            {
                'id': q.id,
                'section': q.section,
                'text': q.text
            }
            for q in questions
        ]
        
        # Build the prompt for Gemini
        prompt = f"""You are an expert UX researcher evaluating interview questions for quality and bias.

**Research Context:**
- Research Goal: {script.research_goal}
- Target Users: {script.target_users}
- Interview Type: {script.interview_type}

**Your Task:**
Analyze the following interview questions and identify any that have CLEAR, SERIOUS issues with:

1. **Bias/Leading Language**: 
   - Questions that explicitly suggest an answer or assume facts
   - Use of words like "obviously", "clearly", "don't you think", "you must", "you always", "you never"
   - Questions that pressure participants toward a specific response
   
2. **Weak Alignment**: 
   - Questions that are COMPLETELY OFF-TOPIC and unrelated to the research goal
   - Generic questions are FINE if they help understand user experience (e.g., "Can you tell me more?", "What challenges do you face?")
   - Do NOT flag a question just because it doesn't repeat keywords from the research goal

**IMPORTANT - What NOT to Flag:**
- Generic follow-up questions like "Tell me more", "Can you explain?", "What else?" - these are GOOD
- Questions about user experience, challenges, pain points, needs - these align with UX research
- Questions that explore user behavior, goals, or context - these are relevant
- Questions in the warmup or closing sections that build rapport
- Only flag alignment issues when a question is CLEARLY and COMPLETELY off-topic

**Guidelines:**
- Be VERY STRICT - only flag questions with clear, obvious problems
- Avoid false positives - when in doubt, do NOT flag
- For rewrites: preserve the original intent, make minimal changes, do not add assumptions
- Explanations should be specific and actionable (not generic)

**Questions to Evaluate:**
{json.dumps(questions_data, indent=2)}

For each CLEARLY problematic question, return:
- question_id: the ID of the question
- type: either "bias" (for leading/biased language) or "alignment" (for completely off-topic questions)
- severity: "low", "medium", or "high" based on how problematic it is
- explanation: a specific explanation of the exact issue (be concrete, cite the problematic phrase)
- suggestion_rewrite: a rewritten version that fixes the issue while preserving the original intent

**REMEMBER:** Only include questions that have CLEAR, SERIOUS problems. Most questions should NOT have flags."""

        # Define JSON schema for structured output
        schema = {
            'type': 'object',
            'properties': {
                'flags': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'question_id': {'type': 'integer'},
                            'type': {
                                'type': 'string',
                                'enum': ['bias', 'alignment']
                            },
                            'severity': {
                                'type': 'string',
                                'enum': ['low', 'medium', 'high']
                            },
                            'explanation': {'type': 'string'},
                            'suggestion_rewrite': {'type': 'string'}
                        },
                        'required': ['question_id', 'type', 'severity', 'explanation', 'suggestion_rewrite']
                    }
                }
            },
            'required': ['flags']
        }
        
        # Call Gemini with structured output
        result, raw_response = generate_with_schema(prompt, schema)
        
        # Process Gemini response and create flags
        new_flags = []
        flag_counts = {'bias': 0, 'alignment': 0}
        
        # Create a lookup for questions by ID
        questions_by_id = {q.id: q for q in questions}
        
        for flag_data in result.get('flags', []):
            # Validate question_id exists
            if flag_data['question_id'] not in question_ids:
                continue
            
            # Post-processing validation
            explanation = flag_data.get('explanation', '').strip()
            suggestion = flag_data.get('suggestion_rewrite', '').strip()
            
            # Skip if explanation is empty or too generic
            if not explanation or len(explanation) < 10:
                continue
            
            # If suggestion is too short or empty, generate a safe default
            if not suggestion or len(suggestion) < 10:
                question = questions_by_id.get(flag_data['question_id'])
                if question:
                    if flag_data['type'] == 'bias':
                        # Simple neutral version
                        suggestion = f"Can you describe {question.text.lower().replace('?', '').strip()}?"
                    else:
                        # Add context from research goal
                        suggestion = f"{question.text.rstrip('?')} in the context of {script.research_goal.lower()}?"
            
            # Ensure suggestion doesn't just repeat the original
            question = questions_by_id.get(flag_data['question_id'])
            if question and suggestion.strip().lower() == question.text.strip().lower():
                # Skip if the suggestion is identical to the original
                continue
            
            # Create flag
            flag = Flag(
                question_id=flag_data['question_id'],
                type=flag_data['type'],
                severity=flag_data['severity'],
                explanation=explanation,
                suggestion_rewrite=suggestion
            )
            db.session.add(flag)
            new_flags.append(flag)
            flag_counts[flag_data['type']] += 1
        
        # Commit all flags
        db.session.commit()
        
        # Format response
        flags_data = [flag.to_dict() for flag in new_flags]
        
        response_data = {
            'status': 'success',
            'script_id': script_id,
            'flags': flags_data,
            'flag_counts': flag_counts
        }
        
        # Add raw response if debug mode
        if debug_mode:
            response_data['debug'] = {
                'raw_gemini_response': raw_response,
                'prompt_length': len(prompt)
            }
        
        return jsonify(response_data), 200
        
    except ValueError as e:
        # API key not configured
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Gemini API configuration error: {str(e)}'
        }), 500
        
    except Exception as e:
        # Gemini API error or other failure
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to run quality checks: {str(e)}'
        }), 500


@app.route('/api/questions/<int:question_id>/flags', methods=['DELETE'])
def clear_question_flags(question_id):
    """
    Clear all flags for a question
    
    DELETE /api/questions/<question_id>/flags
    
    Returns:
        200: Flags cleared successfully
    """
    from models.db import db
    from models.flag import Flag
    
    try:
        # Delete all flags for this question
        deleted_count = Flag.query.filter_by(question_id=question_id).delete()
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Flags cleared',
            'deleted_count': deleted_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Failed to clear flags: {str(e)}'
        }), 500


@app.route('/api/followups', methods=['POST'])
def generate_followups():
    """
    Generate AI-powered follow-up questions using Gemini
    
    POST /api/followups
    
    Body:
        {
            "script_id": number,
            "question_id": number,
            "current_question_text": string,
            "research_goal": string,
            "target_users": string,
            "interview_type": "structured" | "semi-structured",
            "notes_context": string (optional),
            "remaining_minutes": number (optional)
        }
    
    Returns:
        200: Follow-ups generated successfully
        400: Missing required fields
        500: Gemini API error
    """
    from services.gemini_client import generate_with_schema
    
    data = request.get_json()
    
    # Validate required fields
    required = ['script_id', 'question_id', 'current_question_text', 'research_goal', 'target_users', 'interview_type']
    missing = [field for field in required if field not in data or not data[field]]
    
    if missing:
        return jsonify({
            'status': 'error',
            'message': f'Missing required fields: {", ".join(missing)}'
        }), 400
    
    # Validate interview_type
    if data['interview_type'] not in ['structured', 'semi-structured']:
        return jsonify({
            'status': 'error',
            'message': 'interview_type must be "structured" or "semi-structured"'
        }), 400
    
    try:
        # Build context for Gemini
        context_parts = [
            f"**Current Question:** {data['current_question_text']}",
            f"**Research Goal:** {data['research_goal']}",
            f"**Target Users:** {data['target_users']}",
            f"**Interview Type:** {data['interview_type']}"
        ]
        
        if data.get('notes_context'):
            context_parts.append(f"**Participant Response/Notes:** {data['notes_context']}")
        
        if data.get('remaining_minutes'):
            context_parts.append(f"**Time Remaining:** {data['remaining_minutes']} minutes")
        
        context_str = '\n'.join(context_parts)
        
        # Adapt instructions based on interview type
        if data['interview_type'] == 'structured':
            style_instructions = """- Keep follow-ups minimal and controlled
- Only suggest follow-ups if critical information is missing
- Limit to 1-2 follow-ups maximum
- Stay very focused on the research goal"""
        else:  # semi-structured
            style_instructions = """- Generate 2-3 follow-ups to explore deeper insights
- Encourage open exploration while staying relevant
- Help uncover unexpected findings
- Balance depth with time efficiency"""
        
        # Build the prompt
        prompt = f"""You are an expert UX researcher conducting an interview. Based on the current question and context, generate helpful follow-up questions.

{context_str}

**Your Task:**
Generate 1-3 follow-up questions that help explore deeper insights related to the current question.

**Guidelines:**
{style_instructions}
- All follow-ups must be neutral and non-leading
- Avoid yes/no questions unless they're necessary for clarification
- Phrase as open-ended questions that encourage detailed responses
- Ensure follow-ups align with the research goal
- No duplicates
- Each follow-up should explore a different angle or aspect

**Examples of Good Follow-ups:**
- "Can you walk me through what happened when...?"
- "What made that experience particularly challenging?"
- "How did you work around that issue?"
- "What would an ideal solution look like for you?"

Return 1-3 follow-up questions as a JSON array. Each must be a complete, well-formed question."""

        # Define JSON schema
        schema = {
            'type': 'object',
            'properties': {
                'followups': {
                    'type': 'array',
                    'items': {
                        'type': 'string'
                    },
                    'minItems': 1,
                    'maxItems': 3
                }
            },
            'required': ['followups']
        }
        
        # Call Gemini
        result, raw_response = generate_with_schema(prompt, schema)
        
        # Validate and clean followups
        followups = result.get('followups', [])
        
        # Ensure we have at least 1 and at most 3
        followups = followups[:3]
        
        # Filter out empty strings and duplicates
        seen = set()
        clean_followups = []
        for f in followups:
            f_clean = f.strip()
            f_lower = f_clean.lower()
            if f_clean and f_lower not in seen and len(f_clean) > 10:
                clean_followups.append(f_clean)
                seen.add(f_lower)
        
        # Ensure all are questions (end with ?)
        clean_followups = [
            f if f.endswith('?') else f + '?'
            for f in clean_followups
        ]
        
        return jsonify({
            'status': 'success',
            'script_id': data['script_id'],
            'question_id': data['question_id'],
            'followups': clean_followups
        }), 200
        
    except ValueError as e:
        return jsonify({
            'status': 'error',
            'error': f'Gemini API configuration error: {str(e)}'
        }), 500
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': f'Gemini followup generation failed: {str(e)}'
        }), 500


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
