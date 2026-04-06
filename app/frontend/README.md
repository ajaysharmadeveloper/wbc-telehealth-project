# Telehealth Triage AI - Provider Dashboard

This directory houses the secure, authenticated Administrative Dashboard used by clinic staff to monitor and respond to AI-driven patient triages in real-time.

## 🚀 Tech Stack
*   **Core Framework:** React 19 + Vite
*   **Navigation:** React Router DOM
*   **Data Visualization:** Recharts
*   **Iconography:** Lucide React
*   **Styling Engine:** Tailwind CSS v4

## ✨ Core Features
*   **Provider Authentication:** Secure mock login flow to restrict access to sensitive patient data.
*   **Real-time Analytics Dashboard:** Live continuous area-charts tracking patient influx volumes securely synced with KPI summaries (Total Screened, Urgent Red Cases).
*   **Patient Intake Directory:** A comprehensive, interactive data grid equipped with live search states and triage priority badge filters.
*   **Live Assessment Feed:** A simulated WebSocket terminal view mimicking real-time continuous ingestion of AI patient evaluations with dynamic pulse animations.
*   **Deep Clinical Insight Modals:** Interactive modals triggered from data tables presenting the exact JSON reasoning parameters extrapolated by the LLM paired with conversational log snippets.
*   **System Configuration:** Interactive settings menu for toggling Automated Patient Queuing and modifying AI Strictness thresholds.

## 🏃‍♂️ Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (runs independently on `http://localhost:5174/`):
   ```bash
   npm run dev -- --port 5174
   ```
