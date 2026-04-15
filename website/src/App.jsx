import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  Stethoscope, Sun, Moon,
  Building, ClipboardList, Hourglass, Shuffle, Wrench,
  UserX, Clock, ShieldOff, HelpCircle,
  CheckCircle, AlertTriangle, AlertOctagon,
  MessageCircle, Droplet, Scale, Shield, Calendar, BookOpen,
  MessageSquare, Brain, BarChart, Activity, CheckSquare,
  Github, Discord, Whatsapp, Globe, ExternalLink, ArrowRight,
  Users, Heart, Repeat,
} from "./components/icons";
import About from "./pages/About";

/* ─────────────────────────────────────────────
   GLOBAL STYLES (injected into <head>)
   ───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --teal: #0D9488; --teal-light: #14B8A6; --teal-dark: #0F766E;
      --navy: #0F172A; --navy-mid: #1E293B; --navy-solid: #0F172A;
      --slate: #334155; --slate-light: #64748B;
      --border: #E2E8F0; --bg: #F8FAFC; --white: #FFFFFF;
      --green: #16A34A; --green-bg: #DCFCE7;
      --yellow: #CA8A04; --yellow-bg: #FEF9C3;
      --red: #DC2626; --red-bg: #FEE2E2;
      --font-display: 'Sora', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
    }
    .dark {
      --navy: #F8FAFC;
      --navy-mid: #94A3B8;
      --navy-solid: #070B14;
      --slate: #94A3B8;
      --slate-light: #CBD5E1;
      --border: #334155;
      --bg: #0B1120;
      --white: #1E293B;
      --green-bg: rgba(22, 163, 74, 0.15);
      --yellow-bg: rgba(202, 138, 4, 0.15);
      --red-bg: rgba(220, 38, 38, 0.15);
    }
    html { scroll-behavior: smooth; }
    body { font-family: var(--font-body); background: var(--bg); color: var(--navy); line-height: 1.6; -webkit-font-smoothing: antialiased; transition: background-color 0.3s, color 0.3s; }
    .container { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
    .section { padding: 96px 0; transition: background-color 0.3s; }
    .section-alt { background: var(--white); transition: background-color 0.3s; }

    /* ── NAV ── */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; transition: background-color 0.3s, border-color 0.3s; }
    .dark nav { background: rgba(11, 17, 32, 0.92); }
    .nav-logo { font-family: var(--font-display); font-weight: 700; font-size: 20px; color: var(--navy); display: flex; align-items: center; gap: 8px; text-decoration: none; }
    .nav-logo span { color: var(--teal); }
    .nav-utils { display: flex; align-items: center; gap: 16px; }
    .theme-toggle { background: transparent; border: 1px solid var(--border); color: var(--navy); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .theme-toggle:hover { border-color: var(--teal); color: var(--teal); }
    .nav-links { display: flex; gap: 32px; list-style: none; }
    .nav-links a { font-size: 14px; font-weight: 500; color: var(--slate); text-decoration: none; transition: color .2s; }
    .nav-links a:hover { color: var(--teal); }
    .nav-cta { background: var(--teal); color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .2s; font-family: var(--font-body); text-decoration: none; display: inline-block; }
    .nav-cta:hover { background: var(--teal-dark); }

    /* ── HERO ── */
    .hero { padding: 160px 24px 96px; max-width: 1160px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: #CCFBF1; color: var(--teal-dark); padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
    .dark .hero-badge { background: rgba(20, 184, 166, 0.15); color: var(--teal-light); }
    .hero-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--teal); display: inline-block; }
    .hero h1 { font-family: var(--font-display); font-size: clamp(34px, 4vw, 52px); font-weight: 800; line-height: 1.15; color: var(--navy); margin-bottom: 20px; }
    .hero h1 em { color: var(--teal); font-style: normal; }
    .hero p { font-size: 17px; color: var(--slate); line-height: 1.75; margin-bottom: 36px; }
    .hero-btns { display: flex; gap: 16px; flex-wrap: wrap; }
    .btn-primary { background: var(--teal); color: #fff; padding: 14px 28px; border-radius: 10px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all .2s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .btn-primary:hover { background: var(--teal-dark); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(13,148,136,.25); }
    .btn-outline { background: transparent; color: var(--navy); padding: 14px 28px; border-radius: 10px; border: 1.5px solid var(--border); font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all .2s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .btn-outline:hover { border-color: var(--teal); color: var(--teal); }

    /* ── CHAT MOCKUP ── */
    .chat-mockup { background: var(--white); border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 24px 64px rgba(15,23,42,.1); overflow: hidden; transition: background-color 0.3s, border-color 0.3s; }
    .chat-header { background: var(--navy-solid); padding: 16px 20px; display: flex; align-items: center; gap: 12px; transition: background-color 0.3s; }
    .chat-header-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--teal); display: flex; align-items: center; justify-content: center; }
    .chat-header-info h4 { color: #fff; font-size: 14px; font-weight: 600; }
    .chat-header-info p { color: #94A3B8; font-size: 12px; }
    .chat-online { margin-left: auto; display: flex; align-items: center; gap: 6px; color: #4ADE80; font-size: 12px; font-weight: 500; }
    .chat-online::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; }
    .chat-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; background: var(--bg); min-height: 260px; transition: background-color 0.3s; }
    .msg { max-width: 80%; padding: 10px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.55; }
    .msg-patient { background: var(--teal); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .msg-ai { background: var(--white); color: var(--navy); align-self: flex-start; border: 1px solid var(--border); border-bottom-left-radius: 4px; }
    .triage-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--yellow-bg); color: var(--yellow); padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-top: 6px; }

    /* ── PROBLEM ── */
    .problem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 48px; }
    .problem-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 32px; transition: background-color 0.3s, border-color 0.3s; }
    .problem-card-title { font-size: 13px; font-weight: 700; color: var(--slate-light); text-transform: uppercase; letter-spacing: .09em; margin-bottom: 28px; display: flex; align-items: center; gap: 8px; }
    .pain-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 22px; }
    .pain-icon { flex-shrink: 0; margin-top: 2px; color: var(--teal); }
    .pain-label { font-size: 15px; font-weight: 600; color: var(--navy); margin-bottom: 3px; }
    .pain-desc { font-size: 13px; color: var(--slate-light); }

    /* ── SOLUTION / TRIAGE ── */
    .triage-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
    .triage-card { border-radius: 20px; padding: 36px 28px; text-align: center; }
    .triage-card.green { background: var(--green-bg); border: 2px solid #86EFAC; }
    .triage-card.yellow { background: var(--yellow-bg); border: 2px solid #FDE047; }
    .triage-card.red { background: var(--red-bg); border: 2px solid #FCA5A5; }
    .triage-dot { width: 56px; height: 56px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
    .triage-card.green .triage-dot { background: var(--green); }
    .triage-card.yellow .triage-dot { background: var(--yellow); }
    .triage-card.red .triage-dot { background: var(--red); }
    .triage-card h3 { font-family: var(--font-display); font-size: 22px; font-weight: 800; margin-bottom: 4px; }
    .triage-card.green h3 { color: var(--green); }
    .triage-card.yellow h3 { color: var(--yellow); }
    .triage-card.red h3 { color: var(--red); }
    .triage-sub { font-size: 12px; font-weight: 700; color: var(--slate-light); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 16px; }
    .triage-card p { font-size: 14px; color: var(--slate); line-height: 1.7; }

    /* ── FEATURES ── */
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
    .feature-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 28px; transition: all .3s; }
    .feature-card:hover { border-color: var(--teal-light); box-shadow: 0 8px 32px rgba(13,148,136,.08); transform: translateY(-2px); }
    .feature-icon { margin-bottom: 16px; color: var(--teal); }
    .feature-card h3 { font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
    .feature-card p { font-size: 13.5px; color: var(--slate-light); line-height: 1.65; }

    /* ── HOW TO USE ── */
    .steps { display: flex; flex-direction: column; gap: 0; margin-top: 56px; position: relative; }
    .steps::before { content: ''; position: absolute; left: 39px; top: 40px; bottom: 40px; width: 2px; background: linear-gradient(to bottom, var(--teal), #CCFBF1); }
    .step { display: flex; gap: 28px; align-items: flex-start; margin-bottom: 40px; position: relative; }
    .step-num { width: 80px; height: 80px; flex-shrink: 0; background: var(--white); border: 2px solid var(--teal); border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 1; box-shadow: 0 0 0 6px var(--bg); color: var(--teal); }
    .step-content { padding-top: 18px; }
    .step-content h3 { font-size: 18px; font-weight: 700; color: var(--navy); margin-bottom: 6px; display: flex; align-items: center; gap: 10px; }
    .step-content p { font-size: 15px; color: var(--slate); }

    /* ── DEMO ── */
    .demo-wrap { background: var(--navy-solid); border-radius: 24px; padding: 40px; margin-top: 48px; max-width: 700px; margin-left: auto; margin-right: auto; transition: background-color 0.3s; }
    .demo-chat { display: flex; flex-direction: column; gap: 14px; max-height: 380px; overflow-y: auto; padding-right: 4px; }
    .demo-msg { padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.6; max-width: 85%; }
    .demo-msg-user { background: var(--teal); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .demo-msg-ai { background: #1E293B; color: #E2E8F0; align-self: flex-start; border-bottom-left-radius: 4px; }
    .demo-triage { background: #FEF9C3; color: #78350F; padding: 14px 16px; border-radius: 12px; font-size: 13.5px; font-weight: 600; border-left: 4px solid #CA8A04; align-self: flex-start; max-width: 85%; white-space: pre-line; }
    .typing { display: flex; gap: 5px; align-items: center; padding: 14px 18px; background: #1E293B; border-radius: 16px; width: fit-content; border-bottom-left-radius: 4px; }
    .typing span { width: 6px; height: 6px; background: #64748B; border-radius: 50%; animation: bounce 1.2s infinite; }
    .typing span:nth-child(2) { animation-delay: .2s; }
    .typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
    .demo-restart { background: transparent; border: 1px solid #334155; color: #94A3B8; padding: 8px 18px; border-radius: 8px; font-size: 13px; cursor: pointer; margin-top: 16px; font-family: var(--font-body); transition: all .2s; display: inline-flex; align-items: center; gap: 6px; }
    .demo-restart:hover { border-color: var(--teal); color: var(--teal-light); }

    /* ── CTA ── */
    .cta-section { background: linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 50%, var(--teal-light) 100%); padding: 96px 0; text-align: center; }
    .cta-section h2 { font-family: var(--font-display); font-size: clamp(26px, 3.5vw, 38px); font-weight: 800; color: #fff; margin-bottom: 16px; }
    .cta-section p { font-size: 17px; color: rgba(255,255,255,0.85); max-width: 560px; margin: 0 auto 36px; line-height: 1.7; }
    .cta-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .btn-white { background: #fff; color: var(--teal-dark); padding: 14px 28px; border-radius: 10px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all .2s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .btn-white:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,.15); }
    .btn-ghost { background: transparent; color: #fff; padding: 14px 28px; border-radius: 10px; border: 1.5px solid rgba(255,255,255,0.4); font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all .2s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .btn-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.1); }

    /* ── FOOTER ── */
    footer { background: var(--navy-solid); color: #94A3B8; padding: 56px 24px 32px; transition: background-color 0.3s; }
    .footer-inner { max-width: 1160px; margin: 0 auto; }
    .footer-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; flex-wrap: wrap; gap: 32px; }
    .footer-brand h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .footer-brand h3 span { color: var(--teal-light); }
    .footer-brand p { font-size: 14px; max-width: 300px; line-height: 1.65; }
    .footer-columns { display: flex; gap: 56px; flex-wrap: wrap; }
    .footer-col { display: flex; flex-direction: column; gap: 10px; }
    .footer-col h4 { font-size: 13px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 4px; }
    .footer-col a { color: #94A3B8; text-decoration: none; font-size: 14px; transition: color .2s; }
    .footer-col a:hover { color: var(--teal-light); }
    .footer-divider { border: none; border-top: 1px solid #1E293B; margin-bottom: 24px; }
    .footer-bottom { text-align: center; }
    .footer-disclaimer { font-size: 12.5px; line-height: 1.7; color: #64748B; margin-bottom: 12px; }
    .footer-copy { font-size: 12px; color: #475569; }

    /* ── ABOUT PAGE ── */
    .about-hero { padding: 140px 24px 64px; }
    .about-values { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 48px; }
    .about-value-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 28px; text-align: center; transition: all 0.3s; }
    .about-value-card:hover { border-color: var(--teal-light); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(13,148,136,.08); }
    .about-value-icon { margin-bottom: 16px; }
    .about-value-card h3 { font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
    .about-value-card p { font-size: 13.5px; color: var(--slate-light); line-height: 1.65; }
    .about-story { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 48px; }
    .about-story-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 36px; transition: all 0.3s; }
    .about-story-card:hover { border-color: var(--teal-light); }
    .about-story-card h3 { font-size: 18px; font-weight: 700; color: var(--navy); margin: 16px 0 12px; }
    .about-story-card p { font-size: 14px; color: var(--slate); line-height: 1.75; }

    /* ── COMMUNITY LINKS ── */
    .community-links { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 48px; max-width: 720px; margin-left: auto; margin-right: auto; }
    .community-card { display: flex; align-items: center; gap: 16px; padding: 20px 24px; border-radius: 14px; text-decoration: none; transition: all 0.3s; }
    .community-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,.2); }
    .community-card h3 { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 2px; }
    .community-card p { font-size: 12.5px; color: rgba(255,255,255,0.75); }
    .discord-card { background: #5865F2; }
    .whatsapp-card { background: #25D366; }
    .github-card { background: #24292e; }
    .website-card { background: var(--teal); }

    /* ── TEAM ── */
    .team-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
    .team-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 28px 20px; text-align: center; }
    .team-avatar { width: 56px; height: 56px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; transition: background 0.3s; }
    .team-card h4 { font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
    .team-card p { font-size: 13px; color: var(--slate-light); }

    /* ── SECTION HEADER ── */
    .section-header { text-align: center; max-width: 620px; margin: 0 auto; }
    .eyebrow { font-size: 12.5px; font-weight: 700; color: var(--teal); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px; }
    .section-header h2 { font-family: var(--font-display); font-size: clamp(26px, 3.5vw, 38px); font-weight: 800; color: var(--navy); margin-bottom: 16px; line-height: 1.2; }
    .section-header p { font-size: 17px; color: var(--slate); line-height: 1.7; }

    /* ── ANIMATIONS ── */
    .fade-in { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }

    /* ── RESPONSIVE ── */
    @media (max-width: 920px) {
      .hero { grid-template-columns: 1fr; padding: 120px 24px 64px; }
      .problem-grid { grid-template-columns: 1fr; }
      .triage-cards { grid-template-columns: 1fr; }
      .features-grid { grid-template-columns: repeat(2, 1fr); }
      .team-cards { grid-template-columns: repeat(2, 1fr); }
      .about-values { grid-template-columns: repeat(2, 1fr); }
      .about-story { grid-template-columns: 1fr; }
      .community-links { grid-template-columns: 1fr; }
      .nav-links { display: none; }
      .footer-columns { gap: 32px; }
    }
    @media (max-width: 560px) {
      .features-grid { grid-template-columns: 1fr; }
      .team-cards { grid-template-columns: 1fr; }
      .about-values { grid-template-columns: 1fr; }
      .hero-btns { flex-direction: column; }
      .cta-buttons { flex-direction: column; align-items: center; }
      .footer-columns { gap: 24px; }
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   DEMO CHAT COMPONENT
   ───────────────────────────────────────────── */
const DEMO_SCRIPT = [
  { role: "user", text: "I've been feeling extremely thirsty and tired for the past 3 days, and urinating more than usual." },
  { role: "ai", text: "Thanks for sharing that. A few quick follow-ups: Do you have a known diabetes diagnosis? Have you noticed any blurred vision or numbness in your hands or feet?" },
  { role: "user", text: "No diabetes diagnosis. I did notice some blurred vision this morning." },
  { role: "ai", text: "Understood. Do you have a glucometer to check your blood glucose? Also, any recent changes in diet or significant stress?" },
  { role: "user", text: "No glucometer. I've been eating more sugary food and work has been very stressful lately." },
  { role: "triage", text: "YELLOW — Book an Appointment\n\nYour symptoms (excessive thirst, frequent urination, fatigue, blurred vision) suggest you should see a doctor soon.\n\nPlease schedule a clinic visit within 1–2 days. Avoid sugary foods, stay hydrated, and watch for worsening symptoms." },
];

function ChatDemo() {
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || step >= DEMO_SCRIPT.length) return;
    const cur = DEMO_SCRIPT[step];
    const delay = step === 0 ? 700 : 1000;
    const t = setTimeout(() => {
      if (cur.role === "ai" || cur.role === "triage") {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMessages(m => [...m, cur]);
          setStep(s => s + 1);
        }, 1800);
      } else {
        setMessages(m => [...m, cur]);
        setStep(s => s + 1);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [step, isVisible]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.style.scrollBehavior = 'smooth';
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const restart = () => { setStep(0); setMessages([]); setTyping(false); };

  return (
    <div className="demo-wrap" ref={containerRef}>
      <div className="demo-chat" ref={chatScrollRef}>
        {messages.map((m, i) =>
          m.role === "triage"
            ? <div key={i} className="demo-triage">{m.text}</div>
            : <div key={i} className={`demo-msg ${m.role === "user" ? "demo-msg-user" : "demo-msg-ai"}`}>{m.text}</div>
        )}
        {typing && <div className="typing"><span /><span /><span /></div>}
      </div>
      {step >= DEMO_SCRIPT.length && (
        <div style={{ textAlign: "center" }}>
          <button className="demo-restart" onClick={restart}><Repeat size={14} /> Replay Demo</button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FADE-IN HOOK
   ───────────────────────────────────────────── */
function useFadeIn() {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-in");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────
   HOMEPAGE
   ───────────────────────────────────────────── */
function HomePage({ theme, toggleTheme, scrollTo }) {
  useFadeIn();

  return (
    <>
      {/* NAV */}
      <nav>
        <Link to="/" className="nav-logo">
          <Stethoscope size={22} color="var(--teal)" /> <span>WBC</span> Telehealth
        </Link>
        <ul className="nav-links">
          {[["problem", "Problem"], ["solution", "Solution"], ["features", "Features"], ["how", "How to Use"], ["demo", "Demo"]].map(([id, label]) => (
            <li key={id}><a href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>{label}</a></li>
          ))}
          <li><Link to="/about">About</Link></li>
        </ul>
        <div className="nav-utils">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="nav-cta" onClick={() => scrollTo("demo")}>Try Demo</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-badge">Open Source · Weekend Vibe Builders Community</div>
          <h1>Smart Diabetes Screening for <em>Small Clinics</em></h1>
          <p>Help patients understand their symptoms, check their risk level, and know what to do next — all through a simple chat, before they even visit the clinic.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => scrollTo("demo")}>See It In Action <ArrowRight size={16} /></button>
            <button className="btn-outline" onClick={() => scrollTo("how")}>How It Works</button>
          </div>
        </div>
        <div className="chat-mockup">
          <div className="chat-header">
            <div className="chat-header-avatar"><Stethoscope size={18} color="#fff" /></div>
            <div className="chat-header-info">
              <h4>WBC Triage Assistant</h4>
              <p>Diabetes Screening</p>
            </div>
            <div className="chat-online">Online</div>
          </div>
          <div className="chat-body">
            <div className="msg msg-patient">I've been very thirsty and fatigued for 3 days.</div>
            <div className="msg msg-ai">Do you have a known diabetes diagnosis? Any blurred vision or frequent urination?</div>
            <div className="msg msg-patient">No history, but slight blurred vision this morning.</div>
            <div className="msg msg-ai">
              Checking your risk level now…
              <br />
              <span className="triage-badge"><AlertTriangle size={12} /> YELLOW — Book an Appointment</span>
            </div>
          </div>
        </div>
      </div>

      {/* PROBLEM */}
      <section className="section section-alt" id="problem">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">The Problem</div>
            <h2>Why Small Clinics Need This</h2>
            <p>Clinics are overwhelmed with manual processes. Patients don't know how urgent their symptoms are. Both sides lose time.</p>
          </div>
          <div className="problem-grid fade-in">
            <div className="problem-card">
              <div className="problem-card-title"><Building size={16} color="var(--teal)" /> For Clinics</div>
              {[
                [<ClipboardList size={20} />, "No Pre-Screening", "Patient info arrives incomplete — staff spend time collecting data instead of treating patients."],
                [<Hourglass size={20} />, "Long Wait Times", "Urgent and routine cases are mixed together with no way to sort by priority."],
                [<Shuffle size={20} />, "No Smart Prioritization", "Triage is done manually, so urgent warning signs can be missed."],
                [<Wrench size={20} />, "Too Much Manual Work", "Staff spend hours on intake tasks that could be handled automatically."],
              ].map(([icon, label, desc]) => (
                <div className="pain-item" key={label}>
                  <div className="pain-icon">{icon}</div>
                  <div><div className="pain-label">{label}</div><div className="pain-desc">{desc}</div></div>
                </div>
              ))}
            </div>
            <div className="problem-card">
              <div className="problem-card-title"><UserX size={16} color="var(--teal)" /> For Patients</div>
              {[
                [<HelpCircle size={20} />, "Unsure About Severity", "Is this urgent or can it wait? Patients struggle to judge how serious their symptoms are."],
                [<Clock size={20} />, "Delayed Action", "Waiting too long to see a doctor can turn a manageable condition into a serious one."],
                [<ShieldOff size={20} />, "No Early Warning", "Without screening, early signs of diabetes go unnoticed until they become critical."],
                [<HelpCircle size={20} />, "Don't Know Next Steps", "Should I rest, book an appointment, or go to the ER? Patients need clear guidance."],
              ].map(([icon, label, desc], idx) => (
                <div className="pain-item" key={label + idx}>
                  <div className="pain-icon">{icon}</div>
                  <div><div className="pain-label">{label}</div><div className="pain-desc">{desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="section" id="solution">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">The Solution</div>
            <h2>Clear Answers in Under 2 Minutes</h2>
            <p>Our AI chats with patients about their symptoms and gives them a clear recommendation — color-coded by urgency.</p>
          </div>
          <div className="triage-cards fade-in">
            <div className="triage-card green">
              <div className="triage-dot"><CheckCircle size={26} color="#fff" /></div>
              <h3>GREEN</h3>
              <div className="triage-sub">Self-Care at Home</div>
              <p>Your symptoms are mild. You'll get practical tips for healthy eating, staying active, and monitoring your blood sugar at home.</p>
            </div>
            <div className="triage-card yellow">
              <div className="triage-dot"><AlertTriangle size={26} color="#fff" /></div>
              <h3>YELLOW</h3>
              <div className="triage-sub">Book a Clinic Visit</div>
              <p>Your symptoms need a doctor's attention soon. You'll be guided to schedule a visit within 1–2 days with preparation tips.</p>
            </div>
            <div className="triage-card red">
              <div className="triage-dot"><AlertOctagon size={26} color="#fff" /></div>
              <h3>RED</h3>
              <div className="triage-sub">Get Emergency Help</div>
              <p>Your symptoms suggest a serious diabetes emergency. You'll be told to seek urgent medical care immediately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section section-alt" id="features">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Key Features</div>
            <h2>What Makes This Different</h2>
            <p>Purpose-built for diabetes screening. Simple for patients. Useful for clinics.</p>
          </div>
          <div className="features-grid">
            {[
              [<MessageCircle size={32} />, "Chat-Based Screening", "Patients describe symptoms in their own words — no confusing forms or medical terms needed."],
              [<Droplet size={32} />, "Diabetes-Focused", "Built specifically around diabetes symptoms, risk factors, and warning signs."],
              [<Scale size={32} />, "Clinically-Informed AI", "Combines medical guidelines with AI to give accurate, trustworthy risk assessments."],
              [<Shield size={32} />, "Built-in Safety Checks", "Detects emergencies automatically and always reminds patients to consult a real doctor."],
              [<Calendar size={32} />, "Appointment Guidance", "Recommends next steps and helps patients understand when and how to book a clinic visit."],
              [<BookOpen size={32} />, "Health Education", "Shares easy-to-understand tips about diabetes prevention, diet, and self-care throughout the chat."],
            ].map(([icon, title, desc]) => (
              <div className="feature-card fade-in" key={title}>
                <div className="feature-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section className="section" id="how">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">How to Use</div>
            <h2>5 Simple Steps</h2>
            <p>From describing your symptoms to getting a clear recommendation — it takes less than 2 minutes.</p>
          </div>
          <div className="steps">
            {[
              [<MessageSquare size={28} />, "Start a Chat", "Open the assistant and describe how you're feeling — just like texting a friend. No medical jargon needed."],
              [<Brain size={28} />, "AI Understands You", "The assistant picks up on your symptoms, how long you've had them, and any relevant details."],
              [<BarChart size={28} />, "Risk Check", "Your symptoms are checked against clinically-informed rules to determine how urgent they are."],
              [<Activity size={28} />, "Get Your Result", "You'll see a clear color-coded result: Green (self-care), Yellow (see a doctor), or Red (emergency)."],
              [<CheckSquare size={28} />, "Know What to Do", "You'll receive specific next steps, helpful tips, and guidance on whether to book an appointment."],
            ].map(([icon, title, desc], idx) => (
              <div className="step fade-in" key={idx}>
                <div className="step-num">{icon}</div>
                <div className="step-content">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section className="section section-alt" id="demo">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Live Demo</div>
            <h2>See It In Action</h2>
            <p>Watch a sample conversation — from symptom description to a clear recommendation.</p>
          </div>
          <div className="fade-in">
            <ChatDemo />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="cta">
        <div className="container">
          <h2>Ready to Make Healthcare Smarter?</h2>
          <p>Join our community, explore the code, or try the demo. Built with care by the Weekend Vibe Builders Community.</p>
          <div className="cta-buttons">
            <a className="btn-white" href="https://github.com/ajaysharmadeveloper/wbc-telehealth-project" target="_blank" rel="noopener noreferrer">
              <Github size={18} /> View on GitHub
            </a>
            <a className="btn-ghost" href="https://discord.gg/Jw2THYBsX" target="_blank" rel="noopener noreferrer">
              <Discord size={18} /> Join Discord
            </a>
            <Link className="btn-ghost" to="/about">
              <Users size={18} /> About Us
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <h3><Stethoscope size={18} color="var(--teal-light)" /> <span>WBC</span> Telehealth</h3>
              <p>AI-powered diabetes triage for small clinics — built by the Weekend Vibe Builders Community.</p>
            </div>
            <div className="footer-columns">
              <div className="footer-col">
                <h4>Product</h4>
                <a href="#features" onClick={e => { e.preventDefault(); scrollTo("features"); }}>Features</a>
                <a href="#how" onClick={e => { e.preventDefault(); scrollTo("how"); }}>How It Works</a>
                <a href="#demo" onClick={e => { e.preventDefault(); scrollTo("demo"); }}>Demo</a>
              </div>
              <div className="footer-col">
                <h4>Community</h4>
                <a href="https://github.com/ajaysharmadeveloper/wbc-telehealth-project" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://discord.gg/Jw2THYBsX" target="_blank" rel="noopener noreferrer">Discord</a>
                <a href="https://weekend-vibe-builder.vercel.app/" target="_blank" rel="noopener noreferrer">Community Site</a>
              </div>
              <div className="footer-col">
                <h4>Project</h4>
                <Link to="/about">About Us</Link>
                <a href="https://chat.whatsapp.com/LCS2gmjPGjRJRygRf5MkFa?mode=gi_t" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </div>
            </div>
          </div>
          <hr className="footer-divider" />
          <div className="footer-bottom">
            <p className="footer-disclaimer">
              <AlertTriangle size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
              This is a triage support tool, not a medical device. It does not diagnose, treat, or prescribe medication.
              Always consult a qualified healthcare professional. In a medical emergency, call your local emergency services immediately.
            </p>
            <p className="footer-copy">&copy; 2026 Weekend Vibe Builders Community. Open source.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT (Router)
   ───────────────────────────────────────────── */
export default function App() {
  const [theme, setTheme] = useState('light');
  const location = useLocation();

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Re-run fade-in observer on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      const els = document.querySelectorAll(".fade-in:not(.visible)");
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
      }, { threshold: 0.1 });
      els.forEach(el => obs.observe(el));
      return () => obs.disconnect();
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={<HomePage theme={theme} toggleTheme={toggleTheme} scrollTo={scrollTo} />} />
        <Route path="/about" element={<About theme={theme} toggleTheme={toggleTheme} />} />
      </Routes>
    </>
  );
}
