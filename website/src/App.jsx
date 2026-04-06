import { useState, useEffect, useRef } from "react";

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

    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; transition: background-color 0.3s, border-color 0.3s; }
    .dark nav { background: rgba(11, 17, 32, 0.92); }
    .dark .hero-badge { background: rgba(20, 184, 166, 0.15); color: var(--teal-light); }
    .nav-logo { font-family: var(--font-display); font-weight: 700; font-size: 20px; color: var(--navy); display: flex; align-items: center; gap: 8px; }
    .nav-logo span { color: var(--teal); }
    .nav-utils { display: flex; align-items: center; gap: 16px; }
    .theme-toggle { background: transparent; border: 1px solid var(--border); color: var(--navy); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 16px; }
    .theme-toggle:hover { border-color: var(--teal); color: var(--teal); }
    .nav-links { display: flex; gap: 32px; list-style: none; }
    .nav-links a { font-size: 14px; font-weight: 500; color: var(--slate); text-decoration: none; transition: color .2s; }
    .nav-links a:hover { color: var(--teal); }
    .nav-cta { background: var(--teal); color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .2s; font-family: var(--font-body); }
    .nav-cta:hover { background: var(--teal-dark); }

    .hero { padding: 160px 24px 96px; max-width: 1160px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: #CCFBF1; color: var(--teal-dark); padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
    .hero-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--teal); display: inline-block; }
    .hero h1 { font-family: var(--font-display); font-size: clamp(34px, 4vw, 52px); font-weight: 800; line-height: 1.15; color: var(--navy); margin-bottom: 20px; }
    .hero h1 em { color: var(--teal); font-style: normal; }
    .hero p { font-size: 17px; color: var(--slate); line-height: 1.75; margin-bottom: 36px; }
    .hero-btns { display: flex; gap: 16px; flex-wrap: wrap; }
    .btn-primary { background: var(--teal); color: #fff; padding: 14px 28px; border-radius: 10px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all .2s; text-decoration: none; display: inline-block; }
    .btn-primary:hover { background: var(--teal-dark); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(13,148,136,.25); }
    .btn-outline { background: transparent; color: var(--navy); padding: 14px 28px; border-radius: 10px; border: 1.5px solid var(--border); font-size: 15px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: all .2s; text-decoration: none; display: inline-block; }
    .btn-outline:hover { border-color: var(--teal); color: var(--teal); }

    .chat-mockup { background: var(--white); border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 24px 64px rgba(15,23,42,.1); overflow: hidden; transition: background-color 0.3s, border-color 0.3s; }
    .chat-header { background: var(--navy-solid); padding: 16px 20px; display: flex; align-items: center; gap: 12px; transition: background-color 0.3s; }
    .chat-header-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--teal); display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .chat-header-info h4 { color: #fff; font-size: 14px; font-weight: 600; }
    .chat-header-info p { color: #94A3B8; font-size: 12px; }
    .chat-online { margin-left: auto; display: flex; align-items: center; gap: 6px; color: #4ADE80; font-size: 12px; font-weight: 500; }
    .chat-online::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; }
    .chat-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; background: var(--bg); min-height: 260px; transition: background-color 0.3s; }
    .msg { max-width: 80%; padding: 10px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.55; }
    .msg-patient { background: var(--teal); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .msg-ai { background: var(--white); color: var(--navy); align-self: flex-start; border: 1px solid var(--border); border-bottom-left-radius: 4px; }
    .triage-badge { display: inline-block; background: var(--yellow-bg); color: var(--yellow); padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-top: 6px; }

    .problem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 48px; }
    .problem-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 32px; transition: background-color 0.3s, border-color 0.3s; }
    .problem-card-title { font-size: 13px; font-weight: 700; color: var(--slate-light); text-transform: uppercase; letter-spacing: .09em; margin-bottom: 28px; }
    .pain-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 22px; }
    .pain-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
    .pain-label { font-size: 15px; font-weight: 600; color: var(--navy); margin-bottom: 3px; }
    .pain-desc { font-size: 13px; color: var(--slate-light); }

    .steps { display: flex; flex-direction: column; gap: 0; margin-top: 56px; position: relative; }
    .steps::before { content: ''; position: absolute; left: 39px; top: 40px; bottom: 40px; width: 2px; background: linear-gradient(to bottom, var(--teal), #CCFBF1); }
    .step { display: flex; gap: 28px; align-items: flex-start; margin-bottom: 40px; position: relative; }
    .step-num { width: 80px; height: 80px; flex-shrink: 0; background: var(--white); border: 2px solid var(--teal); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--teal); z-index: 1; box-shadow: 0 0 0 6px var(--bg); }
    .step-content { padding-top: 18px; }
    .step-content h3 { font-size: 18px; font-weight: 700; color: var(--navy); margin-bottom: 6px; }
    .step-content p { font-size: 15px; color: var(--slate); }

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
    .demo-restart { background: transparent; border: 1px solid #334155; color: #94A3B8; padding: 8px 18px; border-radius: 8px; font-size: 13px; cursor: pointer; margin-top: 16px; font-family: var(--font-body); transition: all .2s; }
    .demo-restart:hover { border-color: var(--teal); color: var(--teal-light); }

    .triage-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; }
    .triage-card { border-radius: 20px; padding: 36px 28px; text-align: center; }
    .triage-card.green { background: var(--green-bg); border: 2px solid #86EFAC; }
    .triage-card.yellow { background: var(--yellow-bg); border: 2px solid #FDE047; }
    .triage-card.red { background: var(--red-bg); border: 2px solid #FCA5A5; }
    .triage-dot { width: 56px; height: 56px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 26px; }
    .triage-card.green .triage-dot { background: var(--green); }
    .triage-card.yellow .triage-dot { background: var(--yellow); }
    .triage-card.red .triage-dot { background: var(--red); }
    .triage-card h3 { font-family: var(--font-display); font-size: 22px; font-weight: 800; margin-bottom: 4px; }
    .triage-card.green h3 { color: var(--green); }
    .triage-card.yellow h3 { color: var(--yellow); }
    .triage-card.red h3 { color: var(--red); }
    .triage-sub { font-size: 12px; font-weight: 700; color: var(--slate-light); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 16px; }
    .triage-card p { font-size: 14px; color: var(--slate); line-height: 1.7; }

    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
    .feature-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 28px; transition: all .3s; }
    .feature-card:hover { border-color: var(--teal-light); box-shadow: 0 8px 32px rgba(13,148,136,.08); transform: translateY(-2px); }
    .feature-icon { font-size: 32px; margin-bottom: 16px; }
    .feature-card h3 { font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
    .feature-card p { font-size: 13.5px; color: var(--slate-light); line-height: 1.65; }

    .arch-wrap { background: var(--navy-solid); border-radius: 24px; padding: 48px; margin-top: 48px; transition: background-color 0.3s; }
    .arch-flow { display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap; row-gap: 16px; }
    .arch-node { background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 16px 20px; text-align: center; min-width: 110px; }
    .arch-node .arch-icon { font-size: 24px; margin-bottom: 8px; }
    .arch-node .arch-label { font-size: 12px; font-weight: 600; color: #E2E8F0; }
    .arch-node .arch-sub { font-size: 11px; color: #64748B; margin-top: 2px; }
    .arch-arrow { color: var(--teal-light); font-size: 20px; padding: 0 8px; user-select: none; }
    .tech-badges { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 32px; }
    .badge { background: #1E293B; border: 1px solid #334155; color: #94A3B8; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; }

    .safety-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 48px; }
    .safety-item { display: flex; align-items: flex-start; gap: 16px; background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: 24px; }
    .safety-icon { font-size: 28px; flex-shrink: 0; }
    .safety-item h4 { font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
    .safety-item p { font-size: 13.5px; color: var(--slate-light); }

    .team-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 48px; }
    .team-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 28px 20px; text-align: center; }
    .team-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--teal), var(--navy-solid)); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 22px; transition: background 0.3s; }
    .team-card h4 { font-size: 15px; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
    .team-card p { font-size: 13px; color: var(--slate-light); }

    .section-header { text-align: center; max-width: 620px; margin: 0 auto; }
    .eyebrow { font-size: 12.5px; font-weight: 700; color: var(--teal); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px; }
    .section-header h2 { font-family: var(--font-display); font-size: clamp(26px, 3.5vw, 38px); font-weight: 800; color: var(--navy); margin-bottom: 16px; line-height: 1.2; }
    .section-header p { font-size: 17px; color: var(--slate); line-height: 1.7; }

    footer { background: var(--navy-solid); color: #94A3B8; padding: 56px 24px 32px; transition: background-color 0.3s; }
    .footer-inner { max-width: 1160px; margin: 0 auto; }
    .footer-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; flex-wrap: wrap; gap: 24px; }
    .footer-brand h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .footer-brand h3 span { color: var(--teal-light); }
    .footer-brand p { font-size: 14px; max-width: 300px; line-height: 1.65; }
    .footer-links { display: flex; gap: 24px; align-items: center; }
    .footer-links a { color: #94A3B8; text-decoration: none; font-size: 14px; font-weight: 500; transition: color .2s; }
    .footer-links a:hover { color: var(--teal-light); }
    .footer-divider { border: none; border-top: 1px solid #1E293B; margin-bottom: 24px; }
    .footer-disclaimer { font-size: 12.5px; line-height: 1.7; color: #64748B; text-align: center; }

    .fade-in { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
    .fade-in.visible { opacity: 1; transform: translateY(0); }

    @media (max-width: 920px) {
      .hero { grid-template-columns: 1fr; padding: 120px 24px 64px; }
      .problem-grid { grid-template-columns: 1fr; }
      .triage-cards { grid-template-columns: 1fr; }
      .features-grid { grid-template-columns: repeat(2, 1fr); }
      .safety-grid { grid-template-columns: 1fr; }
      .team-cards { grid-template-columns: repeat(2, 1fr); }
      .nav-links { display: none; }
    }
    @media (max-width: 560px) {
      .features-grid { grid-template-columns: 1fr; }
      .team-cards { grid-template-columns: 1fr; }
      .hero-btns { flex-direction: column; }
    }
  `}</style>
);

const DEMO_SCRIPT = [
  { role: "user", text: "I've been feeling extremely thirsty and tired for the past 3 days, and urinating more than usual." },
  { role: "ai", text: "Thanks for sharing that. A few quick follow-ups: Do you have a known diabetes diagnosis? Have you noticed any blurred vision or numbness in your hands or feet?" },
  { role: "user", text: "No diabetes diagnosis. I did notice some blurred vision this morning." },
  { role: "ai", text: "Understood. Do you have a glucometer to check your blood glucose? Also, any recent changes in diet or significant stress?" },
  { role: "user", text: "No glucometer. I've been eating more sugary food and work has been very stressful lately." },
  { role: "triage", text: "🟡 YELLOW — Book an Appointment\n\nYour symptoms (excessive thirst, frequent urination, fatigue, blurred vision) are consistent with elevated blood glucose and warrant clinical evaluation.\n\nPlease schedule a clinic visit within 1–2 days. Avoid sugary foods, stay well hydrated, and monitor for worsening symptoms." },
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

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
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
          <button className="demo-restart" onClick={restart}>↺ Replay Demo</button>
        </div>
      )}
    </div>
  );
}

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

export default function WBCTelehealthLanding() {
  useFadeIn();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check system preference dynamically on load
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <GlobalStyles />

      {/* NAV */}
      <nav>
        <div className="nav-logo">🩺 <span>WBC</span> Telehealth</div>
        <ul className="nav-links">
          {[["problem", "Problem"], ["how", "How It Works"], ["demo", "Demo"], ["features", "Features"], ["team", "Team"]].map(([id, label]) => (
            <li key={id}><a href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>{label}</a></li>
          ))}
        </ul>
        <div className="nav-utils">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="nav-cta" onClick={() => scrollTo("demo")}>Try Demo</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-badge">Weekend Builders Community · Open Source</div>
          <h1>AI-Powered Diabetes Triage for <em>Small Clinics</em></h1>
          <p>Pre-screen patients, assess risk, and recommend next steps — before they walk in the door. Built on LangGraph + OpenAI with hybrid medical scoring.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => scrollTo("demo")}>See How It Works</button>
            <button className="btn-outline" onClick={() => scrollTo("how")}>Learn More</button>
          </div>
        </div>
        <div className="chat-mockup">
          <div className="chat-header">
            <div className="chat-header-avatar">🩺</div>
            <div className="chat-header-info">
              <h4>WBC Triage Assistant</h4>
              <p>Diabetes Screening AI</p>
            </div>
            <div className="chat-online">Online</div>
          </div>
          <div className="chat-body">
            <div className="msg msg-patient">I've been very thirsty and fatigued for 3 days.</div>
            <div className="msg msg-ai">Do you have a known diabetes diagnosis? Any blurred vision or frequent urination?</div>
            <div className="msg msg-patient">No history, but slight blurred vision this morning.</div>
            <div className="msg msg-ai">
              Assessing your symptoms now…
              <br />
              <span className="triage-badge">🟡 YELLOW — Book an Appointment</span>
            </div>
          </div>
        </div>
      </div>

      {/* PROBLEM */}
      <section className="section section-alt" id="problem">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Why This Exists</div>
            <h2>The Gap Between Patients and Clinics</h2>
            <p>Small clinics struggle with broken intake. Patients make uninformed decisions. This tool bridges both sides.</p>
          </div>
          <div className="problem-grid fade-in">
            <div className="problem-card">
              <div className="problem-card-title">🏥 Clinic Side</div>
              {[
                ["📋", "No Structured Intake", "Patient info arrives incomplete, forcing manual data collection at point of care."],
                ["⏳", "Overloaded Queues", "High-severity cases mix with routine visits — no smart prioritization exists."],
                ["🔀", "Poor Case Prioritization", "Triage is manual, leading to missed urgency signals and inefficient scheduling."],
                ["🔧", "Manual Triage Dependency", "Staff time is consumed by intake workflows that AI can pre-handle at scale."],
              ].map(([icon, label, desc]) => (
                <div className="pain-item" key={label}>
                  <div className="pain-icon">{icon}</div>
                  <div><div className="pain-label">{label}</div><div className="pain-desc">{desc}</div></div>
                </div>
              ))}
            </div>
            <div className="problem-card">
              <div className="problem-card-title">👤 Patient Side</div>
              {[
                ["😕", "Confused About Severity", "Patients can't judge if symptoms need emergency care or can safely wait."],
                ["⏰", "Delayed Decision-Making", "Waiting too long to seek care significantly worsens diabetes outcomes."],
                ["🚫", "No Early Intervention", "Without screening, early warning signs go unnoticed until they become critical."],
                ["❓", "Uncertainty About Next Steps", "Patients don't know whether to rest, book an appointment, or call emergency services."],
              ].map(([icon, label, desc]) => (
                <div className="pain-item" key={label}>
                  <div className="pain-icon">{icon}</div>
                  <div><div className="pain-label">{label}</div><div className="pain-desc">{desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">How It Works</div>
            <h2>The AI Triage Flow</h2>
            <p>Five clear steps from symptom description to actionable outcome — powered by LangGraph and medical-grade rules.</p>
          </div>
          <div className="steps">
            {[
              ["1", "💬", "Patient Chats", "The patient describes symptoms in plain natural language — no forms, no medical jargon required."],
              ["2", "🧠", "AI Extracts Data", "The LLM parses symptoms, duration, severity, and diabetes-specific indicators from the conversation."],
              ["3", "⚖️", "Risk Assessment", "A hybrid scoring engine combines hard medical rules with AI reasoning for accurate, explainable triage."],
              ["4", "🚦", "Triage Decision", "The system classifies the case as GREEN (self-care), YELLOW (book appointment), or RED (emergency)."],
              ["5", "✅", "Actionable Outcome", "The patient receives a clear recommendation, next steps, and relevant educational resources."],
            ].map(([num, icon, title, desc]) => (
              <div className="step fade-in" key={num}>
                <div className="step-num">{num}</div>
                <div className="step-content">
                  <h3>{icon} {title}</h3>
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
            <p>Watch a simulated patient conversation — from symptom description to triage recommendation.</p>
          </div>
          <div className="fade-in">
            <ChatDemo />
          </div>
        </div>
      </section>

      {/* TRIAGE LEVELS */}
      <section className="section" id="triage">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Triage Levels</div>
            <h2>What the AI Recommends</h2>
            <p>Every conversation ends with one of three clear, color-coded outcomes.</p>
          </div>
          <div className="triage-cards fade-in">
            <div className="triage-card green">
              <div className="triage-dot">✅</div>
              <h3>GREEN</h3>
              <div className="triage-sub">Self-Care</div>
              <p>Symptoms are mild. Patient receives lifestyle tips, dietary guidance, blood glucose monitoring instructions, and diabetes prevention resources.</p>
            </div>
            <div className="triage-card yellow">
              <div className="triage-dot">⚠️</div>
              <h3>YELLOW</h3>
              <div className="triage-sub">Book an Appointment</div>
              <p>Symptoms warrant clinical evaluation. Patient is guided to schedule a clinic visit within 1–2 days, with pre-visit preparation instructions.</p>
            </div>
            <div className="triage-card red">
              <div className="triage-dot">🚨</div>
              <h3>RED</h3>
              <div className="triage-sub">Emergency</div>
              <p>Symptoms suggest a potential diabetes emergency (DKA, hypoglycaemic crisis). Patient is instructed to seek urgent care immediately.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section section-alt" id="features">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Key Features</div>
            <h2>What's Inside</h2>
            <p>Purpose-built for diabetes triage. Production-grade. Responsibly designed.</p>
          </div>
          <div className="features-grid">
            {[
              ["💬", "Conversational AI", "Natural language symptom collection via chat — no rigid forms or medical jargon required from the patient."],
              ["🩸", "Diabetes Focus", "Specialized screening logic built around diabetes-specific indicators, patterns, and clinical risk factors."],
              ["⚖️", "Hybrid Risk Scoring", "Medical rules combined with LLM reasoning for accuracy that neither approach achieves independently."],
              ["🛡️", "Safety Guardrails", "Emergency detection, no-diagnosis disclaimers, and mandatory medical caveats on every response."],
              ["📅", "Clinic Integration", "Connects to appointment booking and doctor availability systems for a seamless patient handoff."],
              ["📚", "Patient Education", "Inline diabetes awareness content, lifestyle guidance, and prevention tips embedded at every step."],
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

      {/* ARCHITECTURE */}
      <section className="section" id="architecture">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Architecture</div>
            <h2>Built for Production</h2>
            <p>A modular system designed to scale from a weekend project to real clinic deployments.</p>
          </div>
          <div className="arch-wrap fade-in">
            <div className="arch-flow">
              {[
                { icon: "👤", label: "Patient", sub: "Next.js UI" }, null,
                { icon: "🔀", label: "LangGraph", sub: "Orchestration" }, null,
                { icon: "🧠", label: "OpenAI", sub: "LLM Engine" }, null,
                { icon: "⚖️", label: "Risk Engine", sub: "Hybrid Scoring" }, null,
                { icon: "🗄️", label: "Database", sub: "PostgreSQL" },
              ].map((node, i) =>
                node === null
                  ? <div key={i} className="arch-arrow">→</div>
                  : <div key={i} className="arch-node">
                    <div className="arch-icon">{node.icon}</div>
                    <div className="arch-label">{node.label}</div>
                    <div className="arch-sub">{node.sub}</div>
                  </div>
              )}
            </div>
            <div className="tech-badges">
              {["FastAPI", "LangGraph", "OpenAI", "Next.js", "PostgreSQL", "Redis", "Pinecone", "Python", "TypeScript"].map(t => (
                <span key={t} className="badge">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section className="section section-alt" id="safety">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Safety & Compliance</div>
            <h2>Safety First</h2>
            <p>Responsible AI principles are embedded at every layer — from the guardrail engine to the response templates.</p>
          </div>
          <div className="safety-grid fade-in">
            {[
              ["🚫", "Not a Diagnostic Tool", "This is triage support only — it helps patients understand urgency, never diagnoses conditions."],
              ["📢", "Mandatory Disclaimers", "Every AI response includes clear medical disclaimers and a recommendation to consult a professional."],
              ["🚨", "Emergency Detection", "A dedicated guardrail layer detects life-threatening symptom combinations and escalates immediately."],
              ["👨‍⚕️", "Human Override Always Available", "Clinicians retain full authority — the AI supports decisions, it never replaces them."],
              ["🔒", "No Unauthorized Data Storage", "Personal health data is never persisted without explicit informed user consent."],
              ["⚖️", "Transparent Reasoning", "The system explains its triage logic clearly so patients and clinicians understand every recommendation."],
            ].map(([icon, title, desc]) => (
              <div className="safety-item fade-in" key={title}>
                <div className="safety-icon">{icon}</div>
                <div><h4>{title}</h4><p>{desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="section" id="team">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">About</div>
            <h2>Built by Weekend Builders Community</h2>
            <p>Low pressure, high output, real-world systems. A small team shipping production-grade tools that solve actual problems.</p>
          </div>
          <div className="team-cards fade-in">
            {[
              ["🏗️", "Ajay Sharma", "System Architect"],
              ["📊", "Manish Sharma", "Data & ML Pipeline"],
              ["🎨", "Chanda Chanakya", "UI & Experience"],
              ["⚙️", "Backend Developer", "API & Infrastructure"],
            ].map(([icon, name, role]) => (
              <div className="team-card" key={name}>
                <div className="team-avatar">{icon}</div>
                <h4>{name}</h4>
                <p>{role}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }} className="fade-in">
            <a className="btn-outline" href="https://github.com/ajaysharmadeveloper/wbc-telehealth-project" target="_blank" rel="noopener noreferrer">View on GitHub →</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <h3>🩺 <span>WBC</span> Telehealth</h3>
              <p>AI-Powered Diabetes Triage for Small Clinics — built by the Weekend Builders Club.</p>
            </div>
            <div className="footer-links">
              <a href="https://github.com/ajaysharmadeveloper/wbc-telehealth-project" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="#demo" onClick={e => { e.preventDefault(); scrollTo("demo"); }}>Demo</a>
              <a href="#how" onClick={e => { e.preventDefault(); scrollTo("how"); }}>Docs</a>
            </div>
          </div>
          <hr className="footer-divider" />
          <p className="footer-disclaimer">
            ⚠️ This is a triage support tool, not a medical device. It does not diagnose, treat, or prescribe medication.
            Always consult a qualified healthcare professional for medical decisions. In a medical emergency, call your local emergency services immediately.
          </p>
        </div>
      </footer>
    </>
  );
}
