# Telehealth Triage AI - Landing Page

This folder contains the source code for the fast, SEO-optimized, public-facing marketing and information page for the Telehealth Triage AI Assistant.

## 🚀 Tech Stack
*   **Framework:** React 19 bootstrapped with Vite
*   **Styling:** Tailwind CSS v4 (using `@tailwindcss/vite`)
*   **Fonts:** Plus Jakarta Sans (Body), Sora (Display)
*   **Deployment Target:** Static Hosting (Vercel, Netlify, GitHub Pages)

## ✨ Core Features
*   **Interactive Chat Demo:** Features a mock live-action sequence of a patient interacting with the AI. The sequence is powered by the Intersection Observer API, ensuring it only triggers and animates when the user scrolls it into view.
*   **System-Aware Dark Mode:** Provides a rich, midnight-toned theme variation with smooth transitions that explicitly maps and adapts to standard design tokens (`--navy`, `--teal`).
*   **Responsive Architecture:** Hand-crafted CSS grids and flexbox layouts ensure the 10-section landing layout scales beautifully from ultra-wide desktops to mobile devices.
*   **Standalone Architecture:** Fully decoupled from the heavy administrative backend logic, ensuring sub-second page loads.

## 🏃‍♂️ Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (runs on `http://localhost:5173/` by default):
   ```bash
   npm run dev
   ```
