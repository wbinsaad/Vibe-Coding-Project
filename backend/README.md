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
- `OPENAI_API_KEY`: Add your OpenAI API key for AI features

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

## API Testing

### Generate Interview Script

Create a new interview script with generated questions:

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
