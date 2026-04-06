# Website Landing Page — Full Plan

Created: 2026-04-06 13:27

---

## Purpose

A showcase/landing page for the Telehealth Triage AI Assistant. Not a marketing funnel — a presentation layer that explains what the app does, how it works, and why it matters. Think product demo page, not SaaS sales page.

**Tech**: React + Vite, Tailwind CSS

---

## Page Structure (Single Page, Sectioned)

### Section 1: Hero

- **Headline**: Clear one-liner about what the app does
  - e.g., "AI-Powered Diabetes Triage for Small Clinics"
- **Subheadline**: 1-2 sentences explaining the value
  - e.g., "Pre-screen patients, assess risk, and recommend next steps — before they walk in."
- **CTA Button**: "See How It Works" (scrolls to demo section) + "Try the App" (links to app)
- **Visual**: Mockup/screenshot of the chat interface in action

---

### Section 2: The Problem

- **Title**: "Why This Exists"
- 2-column or card layout showing:

| Clinic Side | Patient Side |
|-------------|-------------|
| No structured intake | Confused about symptom severity |
| Overloaded queues | Delayed decision-making |
| Poor case prioritization | No early intervention guidance |
| Manual triage dependency | Uncertainty about next steps |

- Keep it short — 4 pain points per side, icon + one-liner each

---

### Section 3: How It Works

- **Title**: "How the AI Triage Works"
- Step-by-step visual flow (horizontal or vertical timeline):

```
Step 1: Patient Chats
  Patient describes symptoms in natural language

Step 2: AI Extracts Data
  LLM parses symptoms, duration, severity, diabetes indicators

Step 3: Risk Assessment
  Hybrid scoring — medical rules + AI reasoning

Step 4: Triage Decision
  GREEN (self-care) / YELLOW (book appointment) / RED (emergency)

Step 5: Actionable Outcome
  Patient gets clear recommendation + next steps
```

- Each step gets an icon/illustration + short description
- Optionally animate steps on scroll

---

### Section 4: Live Demo / Interactive Preview

- **Title**: "See It In Action"
- Embedded or simulated chat interaction showing a sample conversation:
  - Patient sends a message about symptoms
  - AI responds with follow-up questions
  - AI gives triage result with recommendation
- This can be:
  - **Option A**: Animated/scripted chat replay (no backend needed)
  - **Option B**: Live embedded chat widget connected to the real app
- For MVP, go with **Option A** — scripted replay looks polished, zero infra dependency

---

### Section 5: Triage Levels Explained

- **Title**: "What the AI Recommends"
- 3 cards side by side:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   GREEN      │  │   YELLOW     │  │    RED       │
│              │  │              │  │              │
│  Self-Care   │  │  Book Appt   │  │  Emergency   │
│              │  │              │  │              │
│ Lifestyle    │  │ Schedule a   │  │ Seek urgent  │
│ tips, diet,  │  │ clinic visit │  │ care now     │
│ monitoring   │  │ within days  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

- Each card: color-coded, icon, short description of what the patient receives

---

### Section 6: Key Features

- **Title**: "What's Inside"
- Grid of 4-6 feature cards:

| Feature | Description |
|---------|-------------|
| Conversational AI | Natural language symptom collection via chat |
| Diabetes Focus | Specialized in diabetes-related screening |
| Hybrid Risk Scoring | Medical rules + AI reasoning combined |
| Safety Guardrails | Emergency detection, no diagnosis claims, disclaimers |
| Clinic Integration | Appointment booking, doctor availability |
| Patient Education | Diabetes awareness, lifestyle guidance, prevention tips |

---

### Section 7: Architecture / Tech Overview

- **Title**: "Built for Production"
- Simplified architecture diagram (visual version of the system flow)
- Brief tech stack badges/pills: FastAPI, LangGraph, OpenAI, Next.js, PostgreSQL, Redis, Pinecone
- This section is for technical audiences — keep it clean and visual

---

### Section 8: Safety & Compliance

- **Title**: "Safety First"
- Key points as icon + one-liner:
  - Not a diagnostic tool — triage support only
  - Mandatory medical disclaimers on every response
  - Emergency detection built into the guardrail layer
  - Human clinical override always available
  - No personal health data stored without consent

---

### Section 9: About / Team

- **Title**: "Built by Weekend Builders Club"
- Brief about the project philosophy (low pressure, high output, real-world systems)
- Team roles:
  - System Architect (Ajay)
  - Data Specialist
  - Frontend Developer
  - Backend Developer
- Links to GitHub repo if public

---

### Section 10: Footer

- Project name + tagline
- Links: GitHub, App, Docs
- Disclaimer: "This is a triage support tool, not a medical device. Always consult a healthcare professional."

---

## Design Direction

- **Style**: Clean, modern, medical-professional feel. Not playful — trustworthy.
- **Colors**: White/light background, teal/blue primary (healthcare standard), green/yellow/red for triage levels
- **Typography**: Clean sans-serif (Inter or similar)
- **Layout**: Full-width sections, generous whitespace, scroll-driven
- **Responsive**: Mobile-first, works on all devices
- **Animations**: Subtle — scroll reveals, step-by-step timeline animation. No flashy effects.

---

## Page Flow Summary

```
HERO (what it is + CTA)
  ↓
PROBLEM (why it exists)
  ↓
HOW IT WORKS (step-by-step flow)
  ↓
LIVE DEMO (scripted chat replay)
  ↓
TRIAGE LEVELS (GREEN/YELLOW/RED explained)
  ↓
KEY FEATURES (feature grid)
  ↓
ARCHITECTURE (tech overview for technical audience)
  ↓
SAFETY (compliance & guardrails)
  ↓
ABOUT/TEAM (who built it)
  ↓
FOOTER (links + disclaimer)
```

---

## Tech Implementation Notes

- Single-page React + Vite app (`/website` directory)
- Tailwind CSS for styling
- No backend dependency — fully static, can be deployed standalone
- Scripted chat demo component (hardcoded conversation JSON, animated typing effect)
- Smooth scroll navigation between sections
- React Router not needed — single page with anchor scroll
- SEO: react-helmet for meta tags, Open Graph, description
