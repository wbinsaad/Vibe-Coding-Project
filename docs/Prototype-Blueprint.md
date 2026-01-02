# Blueprint — Interview Companion Tool (Flask + React + Tailwind)

This blueprint is derived strictly from the final PRD you provided (v0.1, 2026-01-02). It is structured to be implementable as an MVP with P0 modules first, then P1.

---

## 1) Implementation Goals

### P0 (Must Ship)
- /create: Research input form (goal, target users, duration, interview type)
- AI script generation (4 sections: intro, warm-up, main, closing)
- /script: Script editor (inline edit, add/delete, reorder, save draft)
- Script quality checks (flagging: bias/leading + alignment; rewrite suggestions)
- /live: Live interview mode (timer, checklist, progress, notes)
- SQLite persistence for scripts + questions + flags + notes

### P1 (Nice-to-Ship)
- AI follow-up suggestions in live mode (1–3 questions linked to current context)
- Export: TEXT + JSON + PDF, download/copy

---

## 2) System Architecture

### Frontend
- React JS
- Tailwind CSS
- Client-side routing (React Router)

### Backend
- Flask REST API
- SQLite database
- OpenAI API integration for:
  - script generation
  - script checks / flagging + rewrite suggestions
  - follow-up suggestions

### Data Flow Overview
1. User submits research input on /create
2. Frontend calls POST /api/scripts/generate
3. Backend saves script + questions to SQLite
4. User edits script on /script -> PATCH endpoints update DB
5. User runs checks -> POST /api/scripts/{id}/checks
6. User enters live mode /live -> timer + progress + notes + follow-ups
7. Export from /export -> GET /api/scripts/{id}/export?format=...

---

## 3) Repository / Folder Structure (Recommended)

repo/
  backend/
    app.py
    config.py
    requirements.txt
    .env.example
    /api/
      __init__.py
      scripts.py
      checks.py
      followups.py
      export.py
    /services/
      openai_client.py
      prompt_templates.py
      pdf_exporter.py
    /models/
      db.py
      script.py
      question.py
      flag.py
      note.py
    /migrations/ (optional)
    /tests/
      test_scripts.py
      test_checks.py

  frontend/
    package.json
    tailwind.config.js
    postcss.config.js
    /src/
      main.jsx
      App.jsx
      /routes/
        Create.jsx
        ScriptEditor.jsx
        LiveMode.jsx
        Export.jsx
      /components/
        Layout.jsx
        ScriptSection.jsx
        QuestionItem.jsx
        Timer.jsx
        ProgressBar.jsx
        FlagsPanel.jsx
        NotesPanel.jsx
        FollowUpPanel.jsx
      /services/
        api.js
      /utils/
        formatters.js

  README.md
  PRD.md (your PRD)
  LICENSE (optional)

---

## 4) Database Schema (SQLite)

### scripts
- id (PK, UUID or integer)
- title (text, nullable)
- research_goal (text)
- target_users (text)
- duration_minutes (integer)
- interview_type (text: "structured" | "semi-structured")
- created_at (datetime)
- updated_at (datetime)

### questions
- id (PK)
- script_id (FK -> scripts.id)
- section (text: "intro" | "warmup" | "main" | "closing")
- order_index (integer)
- text (text)
- asked (boolean default false)
- created_at, updated_at

### flags
- id (PK)
- question_id (FK -> questions.id)
- type (text: "bias" | "alignment")
- severity (text: "low" | "medium" | "high")
- explanation (text)
- suggestion_rewrite (text, nullable)
- created_at

### notes
- id (PK)
- question_id (FK -> questions.id)
- content (text)
- created_at, updated_at

### followups (optional table for persistence)
- id (PK)
- question_id (FK -> questions.id)
- suggested_text (text)
- created_at

---

## 5) Frontend Routes + UI Responsibilities

### Route: /create
Purpose: Collect research input and generate script
Components:
- ResearchGoalInput
- TargetUsersInput
- DurationInput
- InterviewTypeSelector
- GenerateButton

Actions:
- Validate required fields
- POST /api/scripts/generate
- Navigate to /script/:scriptId

---

### Route: /script/:scriptId
Purpose: Display generated script and allow editing
Components:
- ScriptSection (intro, warmup, main, closing)
- QuestionItem (inline edit)
- AddQuestionButton
- DeleteQuestionButton
- Reorder (drag/drop or up/down buttons)
- SaveDraftButton
- RunChecksButton
- FlagsPanel (shows flags per question)

Actions:
- GET /api/scripts/:id
- PATCH /api/questions/:id (edit text)
- POST /api/questions (add)
- DELETE /api/questions/:id (delete)
- POST /api/scripts/:id/reorder
- POST /api/scripts/:id/checks

---

### Route: /live/:scriptId
Purpose: Support interview execution
Components:
- Timer (elapsed + remaining)
- QuestionChecklist (asked/not asked)
- ProgressBar
- NotesPanel (notes per question)
- FollowUpPanel (P1)

Actions:
- GET /api/scripts/:id
- PATCH /api/questions/:id/asked
- POST /api/notes (create/update)
- POST /api/followups (P1)

---

### Route: /export/:scriptId
Purpose: Export to TEXT / JSON / PDF
Components:
- ExportFormatSelector
- DownloadButton
- CopyButton

Actions:
- GET /api/scripts/:id/export?format=json|text|pdf

---

## 6) Backend API Endpoints (Flask)

### Scripts
- POST /api/scripts/generate
  Body:
    {
      "research_goal": "...",
      "target_users": "...",
      "duration_minutes": 30,
      "interview_type": "structured" | "semi-structured"
    }
  Returns:
    { "script_id": "...", "script": {...}, "questions": [...] }

- GET /api/scripts/<script_id>
  Returns script + questions + flags + notes (optionally)

- PATCH /api/scripts/<script_id>
  Update script metadata (optional)

---

### Questions
- PATCH /api/questions/<question_id>
  Body: { "text": "..." }

- POST /api/questions
  Body:
    {
      "script_id": "...",
      "section": "main",
      "order_index": 5,
      "text": "..."
    }

- DELETE /api/questions/<question_id>

- POST /api/scripts/<script_id>/reorder
  Body: { "question_order": [ { "question_id": 1, "order_index": 0 }, ... ] }

- PATCH /api/questions/<question_id>/asked
  Body: { "asked": true }

---

### Checks / Flagging System
- POST /api/scripts/<script_id>/checks
  Body:
    {
      "mode": "full" | "changed_only",
      "changed_question_ids": [ ... ] (optional)
    }

  Returns:
    {
      "flags_created": N,
      "flags": [
        {
          "question_id": "...",
          "type": "bias" | "alignment",
          "severity": "low|medium|high",
          "explanation": "...",
          "suggestion_rewrite": "..."
        }
      ]
    }

Behavior:
- Deletes old flags for checked questions
- Generates new flags + rewrites
- Stores flags in DB

---

### Follow-up Suggestions (P1)
- POST /api/followups
  Body:
    {
      "script_id": "...",
      "question_id": "...",
      "research_goal": "...",
      "current_question_text": "...",
      "notes_context": "...", (optional)
      "remaining_minutes": 10
    }
  Returns:
    { "followups": ["...", "...", "..."] }

---

### Export (P1)
- GET /api/scripts/<script_id>/export?format=text|json|pdf
  Returns:
    - text/plain for TEXT
    - application/json for JSON
    - application/pdf for PDF (generated server-side)

---

## 7) AI Integration Plan (OpenAI)

### Where AI is used (matches PRD)
1. Script generation (4-section structured output)
2. Checks (bias/leading + alignment) with suggestion rewrite
3. Follow-up suggestions (semi-structured interviews only)

### Prompt Output Format Standards
To support reliable parsing:
- Script generation must return JSON:
  {
    "intro": [ ... ],
    "warmup": [ ... ],
    "main": [ ... ],
    "closing": [ ... ]
  }

- Checks must return JSON per question:
  {
    "flags": [
      {
        "type": "bias" | "alignment",
        "severity": "low|medium|high",
        "explanation": "...",
        "suggestion_rewrite": "..."
      }
    ]
  }

- Follow-up suggestions:
  { "followups": ["...", "...", "..."] }

---

## 8) Core Screen-to-API Mapping (Traceability)

### /create
- POST /api/scripts/generate

### /script/:id
- GET /api/scripts/:id
- PATCH /api/questions/:id
- POST /api/questions
- DELETE /api/questions/:id
- POST /api/scripts/:id/reorder
- POST /api/scripts/:id/checks

### /live/:id
- GET /api/scripts/:id
- PATCH /api/questions/:id/asked
- POST /api/notes
- POST /api/followups (P1)

### /export/:id
- GET /api/scripts/:id/export?format=...

---

## 9) MVP Build Order (Recommended Sprint Plan)

### Sprint 1 (Core Flow: Generate + View)
1. Flask app scaffold + SQLite models
2. /create UI + generate endpoint + save script/questions
3. /script UI read-only view of generated script

### Sprint 2 (Editing + Persistence)
4. Inline edit + add/delete questions
5. Save draft (auto-save optional)
6. Reorder questions

### Sprint 3 (Checks: Flagging + Rewrite Suggestions)
7. Run checks button
8. Flags panel UI
9. Store flags per question in DB

### Sprint 4 (Live Mode)
10. /live timer + checklist + progress
11. Notes per question

### Sprint 5 (P1 Enhancements)
12. Follow-up suggestions
13. Export: JSON + TEXT
14. Export: PDF

---

## 10) Testing Plan (Minimal but Functional)

### Backend
- Unit tests:
  - script generation endpoint returns correct schema
  - checks endpoint stores flags
  - follow-up endpoint returns 1–3 items
- DB tests:
  - create script, add questions, reorder, persist asked state, notes

### Frontend
- Manual QA checklist for end-to-end flow:
  - create -> generate -> edit -> check -> live -> export

---

## 11) Acceptance Criteria Coverage Matrix

- /create implemented with required inputs and validation
- AI-generated output has 4 sections
- /script supports inline edit + add/delete + reorder + save draft
- checks produce flags (bias + alignment) and show rewrite suggestions
- /live supports timer + marking done + notes + progress
- follow-ups return 1–3 questions and can be used in live mode
- export supports TEXT + JSON + PDF download/copy

---

## 12) Open Items You Marked as Placeholders (Still in PRD)

These are present in the final PRD as placeholders and will need final decisions during implementation:
- Key APIs: exact OpenAI model + auth method
- Deployment: confirm Vercel/Railway split (frontend vs backend)
- Security/Privacy: token storage strategy, PII handling, rate limiting

This blueprint assumes:
- backend is deployed (Railway or similar)
- frontend is deployed (Vercel)
- OpenAI key stored only server-side via environment variables

---