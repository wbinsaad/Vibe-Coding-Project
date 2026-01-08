# Interview Companion Backend

Flask backend API for the Interview Companion Tool.

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `SECRET_KEY`: Change to a secure random string in production
- `GEMINI_API_KEY`: **Required** - Your Gemini API key for AI features (get one at https://aistudio.google.com/app/apikey)
- `GEMINI_MODEL`: Optional - Model to use (default: `gemma-3-1b-it`)
- `ALLOW_DUMMY_FALLBACK`: Optional - Set to `true` to fall back to dummy generation if Gemini fails

### 5. Initialize Database

Run the database initialization script:

```bash
python init_db.py
```

This will create the SQLite database and all required tables.

## Running the Server

### Development Mode

```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Available Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/` - API root with endpoint list
- `POST /api/scripts/generate` - Generate interview script with questions
- `GET /api/scripts/<script_id>` - Get script by ID with questions
- `POST /api/scripts/<script_id>/reorder` - Reorder questions in script
- `POST /api/scripts/<script_id>/checks` - Run quality checks on questions
- `POST /api/followups` - Generate AI-powered follow-up questions
- `POST /api/questions` - Create new question
- `PATCH /api/questions/<question_id>` - Update question text
- `DELETE /api/questions/<question_id>` - Delete question
- `DELETE /api/questions/<question_id>/flags` - Clear all flags for a question

## API Testing

### Generate Interview Script (Gemini AI)

Create a new interview script with AI-generated questions:

> **Note**: This endpoint now uses Gemini AI to generate professional, neutral, non-leading interview questions tailored to your research goal and target users.

```bash
curl -X POST http://localhost:5000/api/scripts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "research_goal": "Understand user pain points with mobile banking",
    "target_users": "Mobile banking app users aged 25-45",
    "duration_minutes": 30,
    "interview_type": "semi-structured"
  }'
```

**With debug mode** (includes raw Gemini response):
```bash
curl -X POST "http://localhost:5000/api/scripts/generate?debug=true" \
  -H "Content-Type: application/json" \
  -d '{
    "research_goal": "Understand user pain points with mobile banking",
    "target_users": "Mobile banking app users aged 25-45",
    "duration_minutes": 30,
    "interview_type": "semi-structured"
  }'
```

**Expected Response (201 Created):**
```json
{
  "status": "success",
  "message": "Script generated successfully",
  "script_id": 1,
  "script": {
    "id": 1,
    "title": "Interview: Mobile banking app users aged 25-45",
    "research_goal": "Understand user pain points with mobile banking",
    "target_users": "Mobile banking app users aged 25-45",
    "duration_minutes": 30,
    "interview_type": "semi-structured",
    "status": "draft",
    "created_at": "2026-01-06T19:00:00",
    "questions": [...]
  },
  "questions": [
    {
      "id": 1,
      "section": "intro",
      "order_index": 0,
      "text": "Thank you for joining...",
      "is_asked": false
    },
    ...
  ]
}
```

### Test Validation Errors

**Missing required field:**
```bash
curl -X POST http://localhost:5000/api/scripts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "research_goal": "Test research",
    "target_users": "Test users"
  }'
```

**Invalid interview_type:**
```bash
curl -X POST http://localhost:5000/api/scripts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "research_goal": "Test research",
    "target_users": "Test users",
    "duration_minutes": 30,
    "interview_type": "invalid-type"
  }'
```

**Invalid duration:**
```bash
curl -X POST http://localhost:5000/api/scripts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "research_goal": "Test research",
    "target_users": "Test users",
    "duration_minutes": "not-a-number",
    "interview_type": "structured"
  }'
```

### Get Script by ID

Retrieve a specific script with all questions, flags, and notes:

```bash
curl -X GET http://localhost:5000/api/scripts/1
```

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "script": {
    "id": 1,
    "title": "Interview: Mobile banking app users aged 25-45",
    "research_goal": "Understand user pain points with mobile banking",
    "target_users": "Mobile banking app users aged 25-45",
    "duration_minutes": 30,
    "interview_type": "semi-structured",
    "status": "draft",
    "user_id": null,
    "created_at": "2026-01-06T19:00:00.000000",
    "updated_at": "2026-01-06T19:00:00.000000",
    "questions": [...]
  },
  "questions": [
    {
      "id": 1,
      "text": "Thank you for joining...",
      "section": "intro",
      "order_index": 0,
      "notes": null,
      "is_asked": false,
      "script_id": 1,
      "created_at": "2026-01-06T19:00:00.000000",
      "updated_at": "2026-01-06T19:00:00.000000",
      "flags": [],
      "notes": []
    }
  ]
}
```

**Script Not Found (404):**
```bash
curl -X GET http://localhost:5000/api/scripts/999
```

**Response:**
```json
{
  "status": "error",
  "error": "Script not found"
}
```

### Update Question Text

Update the text of an existing question:

```bash
curl -X PATCH http://localhost:5000/api/questions/1 \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Updated question text here"
  }'
```

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Question updated successfully",
  "question": {
    "id": 1,
    "text": "Updated question text here",
    "section": "intro",
    "order_index": 0,
    "notes": null,
    "is_asked": false,
    "script_id": 1,
    "created_at": "2026-01-06T19:00:00.000000",
    "updated_at": "2026-01-06T22:45:00.000000"
  }
}
```

**Validation Errors:**

*Missing or empty text:*
```bash
curl -X PATCH http://localhost:5000/api/questions/1 \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (400):**
```json
{
  "status": "error",
  "message": "Question text is required and cannot be empty"
}
```

*Question not found:*
```bash
curl -X PATCH http://localhost:5000/api/questions/999 \
  -H "Content-Type: application/json" \
  -d '{"text": "New text"}'
```

**Response (404):**
```json
{
  "status": "error",
  "error": "Question not found"
}
```

### Create New Question

Add a new question to a script:

```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "script_id": 1,
    "section": "main",
    "text": "What features would you like to see improved?"
  }'
```

**With explicit order_index:**
```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "script_id": 1,
    "section": "main",
    "text": "Can you describe your workflow?",
    "order_index": 5
  }'
```

**Expected Response (201 Created):**
```json
{
  "status": "success",
  "message": "Question created successfully",
  "question": {
    "id": 12,
    "text": "What features would you like to see improved?",
    "section": "main",
    "order_index": 11,
    "notes": null,
    "is_asked": false,
    "script_id": 1,
    "created_at": "2026-01-06T23:00:00.000000",
    "updated_at": "2026-01-06T23:00:00.000000"
  }
}
```

**Validation Errors:**

*Missing required field:*
```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "script_id": 1,
    "section": "main"
  }'
```

**Response (400):**
```json
{
  "status": "error",
  "message": "Missing required fields",
  "missing_fields": ["text"]
}
```

*Invalid section:*
```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "script_id": 1,
    "section": "invalid-section",
    "text": "Question text"
  }'
```

**Response (400):**
```json
{
  "status": "error",
  "message": "Invalid section. Must be one of: intro, warmup, main, closing",
  "provided": "invalid-section"
}
```

### Delete Question

Delete a question by ID (also deletes associated flags and notes):

```bash
curl -X DELETE http://localhost:5000/api/questions/12
```

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Question deleted successfully"
}
```

**Question not found (404):**
```bash
curl -X DELETE http://localhost:5000/api/questions/999
```

**Response:**
```json
{
  "status": "error",
  "error": "Question not found"
}
```

### Generate Follow-up Questions

Generate AI-powered follow-up questions during an interview:

```bash
curl -X POST http://localhost:5000/api/followups \
  -H "Content-Type: application/json" \
  -d '{
    "script_id": 1,
    "question_id": 5,
    "current_question_text": "What challenges do you face with project management?",
    "research_goal": "Understanding pain points in team collaboration",
    "target_users": "Product managers at tech startups",
    "interview_type": "semi-structured",
    "notes_context": "User mentioned they struggle with keeping track of tasks",
    "remaining_minutes": 20
  }'
```

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "script_id": 1,
  "question_id": 5,
  "followups": [
    "Can you walk me through a specific example of when task tracking became difficult?",
    "What tools or methods have you tried to address this issue?",
    "How does this challenge impact your team's overall productivity?"
  ]
}
```

**Notes:**
- `notes_context` and `remaining_minutes` are optional
- Returns 1-3 follow-up questions based on interview type
- Structured interviews get minimal, focused follow-ups (1-2 questions)
- Semi-structured interviews get more exploratory follow-ups (2-3 questions)

### Add Question from Follow-up

Add a follow-up suggestion as a new question to the script:

```bash
curl -X POST http://localhost:5000/api/scripts/1/questions/from-followup \
  -H "Content-Type: application/json" \
  -d '{
    "section": "main",
    "text": "Can you walk me through a specific example of when task tracking became difficult?"
  }'
```

**Expected Response (201 Created):**
```json
{
  "status": "success",
  "question": {
    "id": 42,
    "script_id": 1,
    "section": "main",
    "text": "Can you walk me through a specific example of when task tracking became difficult?",
    "order_index": 15,
    "is_asked": false
  }
}
```

**Notes:**
- `section` defaults to "main" if not provided
- Valid sections: "intro", "warmup", "main", "closing"
- `order_index` is automatically set to max + 1
- `is_asked` defaults to false

### Export Script

Export a script in JSON or TEXT format:

**JSON Format:**
```bash
curl http://localhost:5000/api/scripts/1/export?format=json
```

**Expected Response (200 OK):**
```json
{
  "script": {
    "id": 1,
    "title": "User Research Interview",
    "research_goal": "Understanding pain points...",
    "target_users": "Product managers",
    "duration_minutes": 60,
    "interview_type": "semi-structured",
    "created_at": "2024-01-07T12:00:00"
  },
  "questions": [
    {
      "id": 1,
      "section": "intro",
      "order_index": 0,
      "text": "Can you tell me about your role?",
      "is_asked": false,
      "notes": [],
      "flags": []
    }
  ]
}
```

**TEXT Format:**
```bash
curl http://localhost:5000/api/scripts/1/export?format=text
```

**Expected Response (200 OK):**
```
================================================================================
INTERVIEW SCRIPT: User Research Interview
================================================================================

Research Goal: Understanding pain points in team collaboration
Target Users: Product managers at tech startups
Duration: 60 minutes
Interview Type: semi-structured
Created: 2024-01-07 12:00:00

================================================================================

INTRODUCTION
--------------------------------------------------------------------------------

1. Can you tell me about your role?

2. How long have you been working in product management?


MAIN QUESTIONS
--------------------------------------------------------------------------------

1. What are the biggest challenges you face in your daily work?

   Notes:
   - Focus on workflow issues
   - Ask for specific examples

...
```

**PDF Format:**
```bash
curl -o script.pdf "http://localhost:5000/api/scripts/1/export?format=pdf"
```

**Expected Response (200 OK):**
- Returns a PDF file with formatted content
- Includes title, metadata, section headers (bold)
- Questions numbered within sections
- Notes displayed in smaller italic text under questions
- Automatic page breaks and page numbers

**Notes:**
- Default format is JSON if not specified
- TEXT format includes notes indented under questions
- TEXT format groups questions by section (intro, warmup, main, closing)
- PDF format provides professional formatting suitable for printing
- Returns 404 if script not found
- Returns 400 if format is invalid (must be json, text, or pdf)

## Database Management

### Initialize Database

```bash
python init_db.py
```

### Reset Database (WARNING: Deletes all data)

```bash
python init_db.py --reset
```

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── init_db.py            # Database initialization CLI
├── requirements.txt      # Python dependencies
├── .env.example         # Environment variables template
├── .env                 # Your environment variables (not in git)
├── models/              # Database models
│   ├── __init__.py
│   ├── db.py           # Database configuration
│   ├── user.py         # User model
│   └── script.py       # Script and Question models
└── venv/               # Virtual environment (not in git)
```

## Database Models

### User
- Email-based user accounts
- One-to-many relationship with scripts

### Script
- Interview script with metadata
- Fields: title, research_goal, target_users, duration, type, status
- One-to-many relationship with questions

### Question
- Individual interview questions
- Fields: text, section, order, notes, is_asked
- Belongs to a script

## Development

- Python 3.8+
- Flask 3.0.0
- SQLAlchemy 2.0.23
- SQLite database
