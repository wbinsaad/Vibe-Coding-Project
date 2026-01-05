# Interview Companion Tool

**A simple AI-assisted web tool that generates structured interview scripts and provides live interview support (question tracking, time tracking, follow-up suggestions) for structured and semi-structured interviews.**

## Tech Stack

### Frontend
- React JS
- Tailwind CSS

### Backend
- Flask (Python)

### Database
- SQLite

### APIs
- OpenAI API (for AI script generation and follow-up suggestions)

## Project Structure

This is a monorepo containing:

- **`frontend/`** - React + Tailwind frontend application
- **`backend/`** - Flask backend API
- **`docs/`** - Project documentation (PRD, design docs, etc.)

## Getting Started

### Prerequisites
- Node.js and npm (for frontend)
- Python 3.8+ (for backend)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (or similar, check terminal output).

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
python app.py
```

The backend API will be available at `http://localhost:5000`.

## Documentation

See the [`docs/`](./docs) folder for:
- Product Requirements Document (PRD)
- Prototype Blueprint
- Additional project documentation

## License

See [LICENSE](./LICENSE) file for details.