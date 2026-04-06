# 🏥 Telehealth Triage AI Assistant (Diabetes Focus) — Complete Project Specification

---

## 📌 Project Overview

The Telehealth Triage AI Assistant is an AI-driven system designed to help small clinics **pre-screen patients**, specifically focusing on **diabetes-related conditions**.

It acts as a **first-level digital assistant** that:
- Collects patient symptoms via chat
- Structures the data
- Evaluates risk
- Suggests next steps:
  - Self-care
  - Clinic appointment
  - Emergency care

This project is aligned with the Weekend Builders philosophy:
- Low pressure
- High output
- Real-world system design
- Practical AI implementation

---

## 🎯 Problem Statement

### Clinic Challenges
- No structured intake system
- Overloaded patient queues
- Poor prioritization of critical cases
- Manual triage dependency

### Patient Challenges
- Confusion about symptom severity
- Delay in decision-making
- Lack of early intervention guidance

---

## 💡 Solution

Build an **AI-powered triage assistant** that:
1. Talks with patients (chat interface)
2. Extracts structured medical data
3. Applies AI + rule-based triage
4. Generates actionable outcomes
5. Integrates with clinic workflows

---

## 🧠 Core Features

### 1. Conversational Interface
- Chat-based UI (Web / App)
- Collects:
  - Age
  - Symptoms
  - Duration
  - Severity
  - Medical history
  - Diabetes indicators

### 2. AI Symptom Understanding
- LLM-based parsing
- Converts text → structured JSON
- Extracts:
  - Blood sugar indicators
  - Fatigue, thirst, urination
  - Medication adherence

### 3. Risk Scoring Engine
Hybrid logic:
- Rule-based medical logic
- AI reasoning layer

Outputs:
- 🟢 Self-care
- 🟡 Book appointment
- 🔴 Urgent care

### 4. Guardrail System
- Emergency detection
- Safety filters
- No diagnosis claims
- Strict disclaimers
- Escalation handling

### 5. Clinic Integration
- Appointment booking APIs
- Doctor availability
- Slot recommendations

### 6. Patient Education
- Diabetes awareness
- Lifestyle guidance
- Preventive tips

---

## 🏗️ System Architecture

```
[ Website / App (React / Next.js) ]
        ↓
[ Chat Interface ]
        ↓
[ Input Processing Layer ]
  - Session Manager
  - Validation
  - Normalization
        ↓
[ AI Triage Engine ]
  - Symptom Understanding (LLM)
  - Risk Scoring (Rules + AI)
        ↓
[ Guardrail Layer ]
  - Emergency Detection
  - Safety Rules
        ↓
[ Decision Engine ]
        ↓
[ Backend APIs (FastAPI) ]
        ↓
[ Clinic Integration APIs ]
        ↓
[ Response Generator ]
```

---

## 🧩 Architecture Layer Breakdown

### 1. Application Layer
- App will include:
  - AI Assistant UI
  - Chat interaction system
  - Admin panel
  - Dashboard for stats & data

> "App will be AI Assistant UI and Admin stats/data"

### 2. Frontend
- Built using React / Next.js
- Responsible for:
  - Chat UI
  - Admin dashboard
  - User interaction

### 3. Backend
- Built using FastAPI
- Responsibilities:
  - Core APIs
  - AI agent orchestration
  - Business logic

> "This is our core where we will build the support APIs and the AI Agent"

### 4. Git Repository Structure

```
/project-root
  /website
  /app
    /app/frontend
    /app/backend
  /docs
  /data
```

### 5. Admin + Analytics Layer
- Tracks:
  - User interactions
  - Patient data
  - Usage metrics
- Helps clinics:
  - Monitor load
  - Understand trends

### 6. Builder Notes

- "Check use of the app"
- "Design its website"
- "Define purpose before building"

👉 Interpretation:
- UX clarity is critical
- Use-case validation before development
- Website acts as entry + explanation layer

---

## ⚙️ Tech Stack

### Backend
- FastAPI
- LangGraph (agent orchestration)
- OpenAI APIs
- Pydantic

### AI Layer
- RAG system (medical knowledge)
- Rule + LLM hybrid
- Pinecone (vector DB)

### Frontend
- Next.js / React
- Tailwind CSS
- Chat UI (streaming)

### Infrastructure
- AWS EC2 / Docker
- Redis (sessions/cache)
- PostgreSQL (data storage)

---

## 🔄 AI Agent Flow (LangGraph Style)

```
START
  ↓
Collect Patient Data
  ↓
Extract Entities (LLM)
  ↓
Validate Data
  ↓
Risk Scoring Node
  ↓
Guardrail Check Node
  ↓
Decision Node
  ↓
Response Generation
  ↓
END
```

---

## 👥 Team Roles

### 🧠 System Architect (Ajay)
- Full architecture design
- AI + rule hybrid system
- LangGraph flow definition

### 📊 Data Specialist
- Diabetes datasets
- Symptom-risk mapping
- Rule definitions

### 🎨 Frontend Developer
- Chat UI
- Admin dashboard
- UX design

### 🔧 Backend Developer
- API development
- AI integration
- Database handling

---

## 🚀 MVP Scope (Phase 1)

- Chat interface
- Diabetes symptom intake
- Rule-based triage
- Static recommendations
- Mock booking system

---

## 📈 Future Roadmap

- Multi-disease expansion
- Real EHR integration
- Voice-based input
- Wearable device sync
- Continuous monitoring AI

---

## ⚠️ Compliance & Safety

- Not a diagnostic tool
- Only triage support
- Mandatory disclaimers
- Human override required
- Medical safety rules enforced

---

## 🧩 Why This Project Matters

- High real-world impact (healthcare)
- Strong AI + system design use case
- Portfolio-grade architecture
- Demonstrates:
  - Agent orchestration
  - Guardrails
  - Production thinking

---

## 🧠 Final Strategic Insight

This is not just a chatbot.

This is:
> A **controlled AI execution system** where:
> - LLM handles reasoning
> - Backend enforces decisions
> - Guardrails ensure safety
> - System architecture ensures reliability

That's what makes it **production-grade AI**, not demo AI.
