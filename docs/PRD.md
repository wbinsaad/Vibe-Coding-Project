THI  
Prof. Dr. Ignacio Alvarez  
UXDM_VCUX | WS25  

# Interview Companion Tool — Vibe-Coding PRD (UXD Master)

**Project Vibe (1-sentence pitch):** A simple AI-assisted web tool that generates structured interview scripts and provides live interview support (question tracking, time tracking, follow-up suggestions) for structured and semi-structured interviews.   

**Date:** 2026-01-02  
**Author(s):** Waleed Binsaad  
**Version:** v0.1  

**Links:** [Figma/Figma Make] · [\[Repo\]](https://github.com/wbinsaad/Vibe-Coding-Project) · [Docs] · [Issue tracker]  

---

## 1) Core Context — “Master Prompt”

### Problem  
Many UX students and junior researchers struggle to prepare high-quality interview scripts and conduct interviews efficiently due to lack of structured guidance and live interview support, leading to poor data quality and missed insights.

### Solution  
A simple AI-assisted web tool that generates structured interview scripts and provides live interview support (question tracking, time tracking, follow-up suggestions) for structured and semi-structured interviews.

### Target Users  
- UX students  
- Junior UX researchers  

### Primary Use Cases  
- Generate an interview script based on research goal + target audience  
- Edit/add/delete/reorder generated questions  
- Run live interview mode with timer + question checklist + AI follow-up suggestions  

### North-Star Success Metric  
User can successfully conduct a 20–30 minute interview using the tool without losing track of time or questions, and produces a complete structured script ready for use.

### Non-Goals  
- Full transcription of interviews  
- Sentiment analysis  
- Complex analytics  
- Full automation of research synthesis  

---

## 2) UX Foundations (Vibe, Research, Accessibility)

### Personas  
**Sara (UX student / junior researcher):** needs help preparing and executing an interview script and staying on track during the interview.

### Top Insights / Pain Points  
- Difficulty structuring interview scripts  
- Difficulty tracking time and interview progress  
- Difficulty asking meaningful follow-up questions in real time  

### Emotional & Contextual “Vibe” Principles  
- Supportive and confidence-building  
- Minimal and lightweight  

### Accessibility & Inclusion Requirements  
--------------------------------------------------  

### High-Level Journey  
1. User defines research goal and target audience  
2. AI generates a structured interview script  
3. User uses “Live Mode” to run the interview with tracking + timer + follow-ups  
4. User exports the script/notes  

---

## 3) Scope & Priorities

### MVP (V1) Goals  
- Generate structured interview scripts (intro, warm-up, main, closing)  
- Support both structured and semi-structured interview styles  
- Provide live interview support:  
  - question tracking  
  - time tracking/timer  
  - AI follow-up suggestions  

### Out of Scope for V1  
- Full transcription & post-interview analysis  
- Sentiment analysis  
- Complex research analytics dashboards  

### Assumptions & Risks  
- **Assumption:** Users will run the tool alongside online interviews (e.g., Zoom) in a separate tab/window.  
- **Risk:** AI follow-up suggestions may not always match user context (requires careful prompting).  
- **Risk:** Scope creep if trying to add “analysis” features beyond live support.  

---

## 4) Tech Stack & Architecture

### Frontend  
- React JS + Tailwind CSS  

### Backend  
- Flask  

### Database  
- SQLite  

### Key APIs  
- [OpenAI, Maps, Auth, etc.]

### Deployment  
- [Vercel, Railway]

### Security/Privacy  
- [PII, tokens, etc.]

---

## 5) Feature Modules (Prompt-by-Prompt, Build the MVP)

### Module 1: Research Input Form  
**Priority:** P0  

**User Story:** As a UX student, I want to enter research goal, target users, and interview duration, so that the tool can generate an appropriate interview script.

#### Acceptance Criteria — To-Prompt Checklist  
- [ ] UI route exists: `/create`  
- [ ] Input fields: research goal, target users, interview duration, interview type (structured/semi-structured)  
- [ ] Primary action: “Generate Script” button  
- [ ] Validation: required fields cannot be empty  
- [ ] On success → redirect to script editor/view  

---

### Module 2: AI Script Generation  
**Priority:** P0  

**User Story:** As a junior researcher, I want an AI-generated script with intro, warm-up, main, and closing sections, so that I can prepare efficiently.

#### Acceptance Criteria — To-Prompt Checklist  
- [ ] Generated output contains 4 structured sections  
- [ ] Questions are displayed in an editable format  
- [ ] Output is readable and “clean/structured”  

---

### Module 3: Script Editor  
**Priority:** P0  

**User Story:** As a UX student, I want to view and edit the generated script, so that I can tailor it to my study.

#### Acceptance Criteria — To-Prompt Checklist  
- [ ] UI route exists: `/script`  
- [ ] Questions are editable (inline edit)  
- [ ] User can add/delete questions  
- [ ] Save draft button exists  
- [ ] After edits, user can run checks (see Module 4)  

---

### Module 4: Script Quality Checks (Flagging System)  
**Priority:** P0  

**User Story:** As a junior researcher, I want the tool to flag bias/leading language and weak alignment to research goal so that I can improve my script quality.

#### Acceptance Criteria — To-Prompt Checklist  
- [ ] Button: “Run Checks”  
- [ ] Each question can receive flags:  
  - Bias/leading wording  
  - Weak alignment to research goal/hypothesis  
- [ ] Flags display short explanation  
- [ ] Suggested rewrite is shown  
- [ ] Flags update after edits  

---

### Module 5: Live Interview Mode  
**Priority:** P0  

**User Story:** As a UX researcher, I want live interview support with time tracking and question tracking, so that I can stay on track during interviews.

#### Acceptance Criteria — To-Prompt Checklist  
- [ ] UI route exists: `/live`  
- [ ] Timer displays elapsed + remaining time  
- [ ] User can mark a question as “asked/done”  
- [ ] Progress indicates completed vs remaining questions  
- [ ] Notes field per question  

---

### Module 6: AI Follow-up Suggestions  
**Priority:** P1  

**User Story:** As a semi-structured interviewer, I want AI to suggest follow-up questions, so that I can explore deeper insights.

#### Acceptance Criteria — To-Prompt Checklist  
- [ ] Follow-up button exists in live mode  
- [ ] AI returns 1–3 follow-up questions linked to the current question/research goal  
- [ ] User can choose to add suggested follow-up to script or ask verbally  

---

### Module 7: Export  
**Priority:** P1  

**User Story:** As a UX student, I want to export my interview script (and possibly notes), so that I can reuse it and include it in project documentation.

#### Acceptance Criteria — To-Prompt Checklist  
- [ ] Export button exists  
- [ ] Output: script in text format  
- [ ] Output: JSON, TEXT, PDF  
- [ ] Download/copy functionality works  

---

## 6) AI Design & Prompting Strategy

### System Prompt  

### Prompt Bank (TACO examples)  

### Reasoning Boosters (CoT, ToT, Meta)  

### Hallucination Mitigation & Safety  
Tool should avoid making unsupported claims and remain focused on interview question generation and follow-up suggestions.

### Vibe-Coding History  

---

## 7) IA, Flows & UI

### Information Architecture  
- Home / Create Script  
- Script Editor  
- Checks / Flags View  
- Live Interview Mode  
- Export / Summary  

### Key Flows  

**Flow 1: Preparation**  
Input → Generate script → Edit → Run checks → Save  

**Flow 2: Live Interview**  
Open script → Start timer → Mark questions asked → Get follow-ups → Export  

### Design Tokens & Components  

### Localization & Tone Guidelines  
- Clear, simple, supportive  

---

## 8) Iteration Plan & Workflow

### Build Rhythm  

### Versioning & Reviews  

### Risk/Spike Tickets  

---

## 9) Quality: Testing, A11y, Performance

### Testing  

### Accessibility  

### Performance Budgets  

---

## 10) Metrics & Analytics

### Events & Props  

### Dashboards/KPIs  

### Experimentation  

---

## 11) Launch & Ops

### Environments & Feature Flags  

### Rollout Plan  

### Support & Maintenance  
