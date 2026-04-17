# WBC Telehealth - Marketing Website

Public-facing landing page for the **WBC Telehealth Triage AI Assistant** - an open-source AI tool that pre-screens patients for diabetes symptoms before they walk into a clinic. This site explains what the product does, who it's for, and how to try it.

> Live: https://wbc-telehealth-project.vercel.app
> Repo: https://github.com/ajaysharmadeveloper/wbc-telehealth-project
> Built by the [Weekend Vibe Builders](https://weekend-vibe-builder.vercel.app/).

---

## What's on the Site

### Home (`/`)

A single scrollable landing page composed of eight independent sections:

| Section | What it does | Why it's there |
|---|---|---|
| **Hero** | Headline + value prop + chat mockup | First impression. Explains the product in one line and shows what it looks like. |
| **Problem** | Pain points split into "For Clinics" and "For Patients" | Frames the gap the product fills before we pitch a solution. |
| **Solution** | The three triage outcomes (Green / Yellow / Red) | Concrete, color-coded explanation of what the user actually gets. |
| **Features** | 6 feature cards (chat-based, diabetes-focused, clinically-informed, safety, appointments, education) | Specifics for visitors who want to know what makes the tool different. |
| **HowItWorks** | 5-step vertical flow | Visualizes the user journey from "I feel sick" → "here's what to do." |
| **Demo** | Auto-playing chat simulation | Proof. Visitors see a real triage conversation without leaving the page. Triggered by IntersectionObserver so it only runs when scrolled into view. |
| **FAQ** | 7 expandable questions covering safety, scope, privacy, and licensing | AEO (Answer Engine Optimization) - answers voice/AI search queries, and emits FAQPage JSON-LD for rich results. |
| **CTA** | GitHub / Discord / About buttons | Conversion. Channels visitors into the community. |

### About (`/about`)

| Section | What it does |
|---|---|
| **AboutHero** | Intro to the Weekend Vibe Builders |
| **Mission** | Four "values" cards: Patient First, Real Impact, Open Source, Community Driven |
| **Story** | Two-card narrative: "The Problem We Saw" and "Our Approach" |
| **Team** | Three contributor cards |
| **Community** | Discord, WhatsApp, GitHub, Community website links |

### 404 (`/*`)

Catch-all `NotFound` page with `noindex` + a link back home.

---

## Tech Stack

- **Framework**: React 19 + Vite 8
- **Routing**: react-router-dom 7
- **SEO**: react-helmet-async (per-route meta + JSON-LD)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`) + scoped CSS files per component (no CSS-in-JS, no inline `<style>` tags)
- **Fonts**: Plus Jakarta Sans (body), Sora (display)
- **Deployment**: Static - works on Vercel, Netlify, Cloudflare Pages, or any static host

---

## SEO, AEO & Metadata

### Per-route meta (`src/components/SEO.jsx`)

Every page renders an `<SEO>` component that emits, via `react-helmet-async`:

- `<title>` and `<meta name="description">`
- `<link rel="canonical">`
- Open Graph: `og:title`, `og:description`, `og:url`, `og:image`, `og:type`, `og:site_name`, `og:locale`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `theme-color`, `keywords`, `author`
- Optional `<meta name="robots" content="noindex">` (used on the 404 page)

### Structured data (JSON-LD, `src/lib/seo.js`)

Each page injects schema.org data into `<head>` so Google, Bing, ChatGPT, Perplexity, and Claude can parse rich answers:

- **Home** → `Organization`, `SoftwareApplication`, `MedicalWebPage` (with ICD-10 code E11 for diabetes), `FAQPage` (drives AEO), `BreadcrumbList`
- **About** → `Organization`, `MedicalWebPage`, `BreadcrumbList`

### Static assets

- `public/robots.txt` - allows Google + AI crawlers (`GPTBot`, `ChatGPT-User`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `CCBot`)
- `public/sitemap.xml` - lists `/` and `/about`
- `index.html` - fallback meta + favicon + apple-touch-icon + theme-color (per-route values are overridden client-side by Helmet)

### AEO specifics

The FAQ section is structured both as semantic `<details>/<summary>` HTML *and* as `FAQPage` JSON-LD. Answer-engine bots (ChatGPT, Perplexity, Google AI Overviews) prefer Q&A pages with explicit schema; this maximizes the chance of being cited.

---

## Folder Structure

```
website/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── robots.txt              ← AI + search crawler allowlist
│   └── sitemap.xml             ← static sitemap (2 routes today)
├── index.html                  ← shell: lang, viewport, theme-color, fallback meta
├── package.json
├── vite.config.js
├── eslint.config.js
└── src/
    ├── main.jsx                ← entry: HelmetProvider + BrowserRouter
    ├── App.jsx                 ← route table only
    ├── index.css               ← imports tailwind + every modular CSS file
    │
    ├── styles/                 ← global, non-component-specific CSS
    │   ├── globals.css         ← :root vars, dark mode vars, reset, body, .container, .section, .fade-in
    │   ├── buttons.css         ← .btn-primary, .btn-outline, .btn-white, .btn-ghost
    │   └── section-header.css  ← .section-header, .eyebrow (shared by every section)
    │
    ├── lib/                    ← framework-agnostic helpers
    │   ├── siteConfig.js       ← single source of truth: name, url, social links, keywords
    │   └── seo.js              ← JSON-LD builders (organization, medicalWebPage, faqPage, breadcrumb, softwareApplication)
    │
    ├── hooks/                  ← reusable React hooks
    │   ├── useTheme.js         ← light/dark with localStorage + system preference
    │   └── useFadeIn.js        ← IntersectionObserver scroll-reveal, re-runs on route change
    │
    ├── components/             ← shared UI primitives
    │   ├── icons.jsx           ← all SVG icons (centralized for tree-shaking)
    │   ├── SEO.jsx             ← per-route Helmet wrapper
    │   └── ThemeToggle.jsx     ← sun/moon button
    │
    ├── layout/                 ← chrome that wraps every page
    │   ├── Layout.jsx          ← <Navbar/> + <Outlet/> + <Footer/>
    │   ├── Navbar.jsx + .css
    │   └── Footer.jsx + .css
    │
    ├── sections/               ← one folder per landing-page section
    │   ├── Hero/               (Hero.jsx + Hero.css)
    │   ├── Problem/            (Problem.jsx + Problem.css)
    │   ├── Solution/           (Solution.jsx + Solution.css)
    │   ├── Features/           (Features.jsx + Features.css)
    │   ├── HowItWorks/         (HowItWorks.jsx + HowItWorks.css)
    │   ├── Demo/               (Demo.jsx + ChatDemo.jsx + Demo.css)
    │   ├── FAQ/                (FAQ.jsx + faqData.js + FAQ.css)
    │   └── CTA/                (CTA.jsx + CTA.css)
    │
    └── pages/                  ← top-level routes
        ├── Home.jsx            ← composes all 8 sections + emits page-level SEO
        ├── About.jsx + .css    ← about-page sections (kept inline since they're not reused)
        └── NotFound.jsx        ← 404
```

### Why this layout

- **`sections/<Name>/<Name>.{jsx,css}` co-location.** Each section ships with its own CSS so deleting a section is one folder removal - no orphaned styles. Imports are local and obvious.
- **`pages/` composes, never implements.** `Home.jsx` is a 40-line file that imports sections and emits SEO. About is small enough that splitting it into 5 sub-folders would be over-engineering, so its sections live inline with a single `About.css`.
- **`layout/` is route-stable chrome.** Navbar and Footer render once via React Router's `Outlet`, so navigating Home ↔ About doesn't unmount them. Theme state lives here and persists across routes.
- **`lib/` is framework-agnostic.** `siteConfig.js` and `seo.js` have zero React imports, so they're easy to test, reuse server-side, or move to a shared package.
- **`hooks/` are pure React.** `useTheme` and `useFadeIn` encapsulate side effects so components stay declarative.
- **`styles/` holds only what's truly global** - design tokens, resets, and utilities used by ≥3 components. Anything section-specific lives next to its component.
- **One CSS entry point (`src/index.css`)** that `@import`s every module file. Vite/PostCSS bundles them into a single optimized stylesheet at build time, so we get modular authoring without runtime cost.
- **Routing is centralized in `App.jsx`.** Any future page is one line in the route table.

---

## Running Locally

From the project root:

```bash
make website-install     # one-time: install dependencies
make website-dev         # http://localhost:5173
make website-build       # production build → dist/
```

Or directly inside `website/`:

```bash
npm install
npm run dev              # dev server with HMR
npm run build            # production build
npm run preview          # preview the production build locally
npm run lint             # eslint
```

---

## Deployment Notes

- The site is static - `npm run build` outputs `dist/` which any static host will serve.
- For client-side routing to work, configure your host to fall back to `index.html` for unknown paths (Vercel and Netlify do this automatically).
- Update `siteConfig.url` in `src/lib/siteConfig.js`, plus the URLs in `public/robots.txt`, `public/sitemap.xml`, and `index.html` if you deploy under a different domain.
- The `og:image` defaults to `/og-image.png` - drop a 1200×630 PNG at `public/og-image.png` for proper social previews.

---

## Adding a New Section

1. Create `src/sections/<Name>/<Name>.jsx` and `<Name>.css`.
2. Add the CSS import to `src/index.css`.
3. Import and render the component in `src/pages/Home.jsx` (or wherever it belongs).
4. If it changes the page topic materially, update the JSON-LD in `src/lib/seo.js` and the page's `<SEO>` props.

## Adding a New Page

1. Create `src/pages/<Name>.jsx` with its own `<SEO>` and JSON-LD.
2. Add a `<Route>` in `src/App.jsx`.
3. Add an entry to `public/sitemap.xml`.
