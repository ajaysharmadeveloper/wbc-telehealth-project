import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope, Sun, Moon, Heart, Users, Code, Globe,
  Github, Discord, Whatsapp, ExternalLink, Target, Zap, ArrowRight,
} from "../components/icons";

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

export default function About({ theme, toggleTheme }) {
  useFadeIn();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* NAV */}
      <nav>
        <Link to="/" className="nav-logo" style={{ textDecoration: "none" }}>
          <Stethoscope size={22} color="var(--teal)" /> <span>WBC</span> Telehealth
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><a href="https://weekend-vibe-builder.vercel.app/" target="_blank" rel="noopener noreferrer">Community</a></li>
          <li><a href="https://github.com/ajaysharmadeveloper/wbc-telehealth-project" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
        <div className="nav-utils">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <Link to="/" className="nav-cta" style={{ textDecoration: "none" }}>Back to Home</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="about-hero">
        <div className="container">
          <div className="section-header fade-in" style={{ maxWidth: 720, paddingTop: 40 }}>
            <div className="eyebrow">About Us</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 800, lineHeight: 1.2, color: "var(--navy)", marginBottom: 20 }}>
              Built by the <em style={{ color: "var(--teal)", fontStyle: "normal" }}>Weekend Vibe Builders</em> Community
            </h1>
            <p>
              We're a small, passionate group of developers and builders who come together on weekends to create real-world tools that solve meaningful problems. No corporate timelines — just genuine curiosity and impact.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="section section-alt" id="mission">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Our Mission</div>
            <h2>Making Healthcare More Accessible</h2>
            <p>We believe smart technology can help small clinics provide better care. Our AI triage tool gives patients quick guidance and helps clinics work more efficiently — without replacing human doctors.</p>
          </div>
          <div className="about-values fade-in">
            {[
              { icon: <Heart size={28} color="var(--teal)" />, title: "Patient First", desc: "Every feature is designed with patients in mind — simple language, clear guidance, and no confusing medical jargon." },
              { icon: <Target size={28} color="var(--teal)" />, title: "Real Impact", desc: "We build tools that solve actual healthcare problems in small clinics, not theoretical prototypes that sit on a shelf." },
              { icon: <Code size={28} color="var(--teal)" />, title: "Open Source", desc: "Our code is freely available for anyone to use, improve, and adapt. We believe healthcare innovation should be open." },
              { icon: <Globe size={28} color="var(--teal)" />, title: "Community Driven", desc: "Powered by weekend builders from different backgrounds — developers, designers, and healthcare enthusiasts working together." },
            ].map(({ icon, title, desc }) => (
              <div className="about-value-card" key={title}>
                <div className="about-value-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY WE BUILT THIS */}
      <section className="section" id="purpose">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">The Story</div>
            <h2>Why We Built This</h2>
            <p>Small clinics often lack the technology bigger hospitals have. Patients wait too long, intake processes are manual, and risk assessment happens too late.</p>
          </div>
          <div className="about-story fade-in">
            <div className="about-story-card">
              <Zap size={36} color="var(--teal)" />
              <h3>The Problem We Saw</h3>
              <p>
                In many small clinics, patients arrive without any pre-screening. Front desk staff manually assess who needs urgent care, leading to long wait times and missed warning signs — especially for conditions like diabetes that can escalate quickly.
              </p>
            </div>
            <div className="about-story-card">
              <Stethoscope size={36} color="var(--teal)" />
              <h3>Our Approach</h3>
              <p>
                We created an AI assistant that chats with patients before their visit. It asks simple questions about their symptoms, checks their risk level using clinically-informed rules, and gives them clear next steps — all in plain language, in under 2 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="section section-alt" id="team">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">The Team</div>
            <h2>Who's Behind This</h2>
            <p>A small team shipping real tools, every weekend.</p>
          </div>
          <div className="team-cards fade-in">
            {[
              { initials: "AS", name: "Ajay Sharma", role: "System Architect & Backend", color: "#0D9488" },
              { initials: "MS", name: "Manish Sharma", role: "Data & ML Pipeline", color: "#6366F1" },
              { initials: "CC", name: "Chanda Chanakya", role: "UI & Experience", color: "#F59E0B" },
            ].map(({ initials, name, role, color }) => (
              <div className="team-card" key={name}>
                <div className="team-avatar" style={{ background: `linear-gradient(135deg, ${color}, var(--navy-solid))` }}>
                  <span style={{ color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)" }}>{initials}</span>
                </div>
                <h4>{name}</h4>
                <p>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="section" id="community">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Join Us</div>
            <h2>Be Part of the Community</h2>
            <p>Whether you're a developer, designer, healthcare professional, or just curious — we'd love to have you.</p>
          </div>
          <div className="community-links fade-in">
            <a href="https://discord.gg/Jw2THYBsX" target="_blank" rel="noopener noreferrer" className="community-card discord-card">
              <Discord size={32} color="#fff" />
              <div>
                <h3>Discord</h3>
                <p>Join the conversation, get help, share ideas</p>
              </div>
              <ArrowRight size={20} color="#fff" style={{ marginLeft: "auto", opacity: 0.7 }} />
            </a>
            <a href="https://chat.whatsapp.com/LCS2gmjPGjRJRygRf5MkFa?mode=gi_t" target="_blank" rel="noopener noreferrer" className="community-card whatsapp-card">
              <Whatsapp size={32} color="#fff" />
              <div>
                <h3>WhatsApp</h3>
                <p>Quick updates and casual discussion</p>
              </div>
              <ArrowRight size={20} color="#fff" style={{ marginLeft: "auto", opacity: 0.7 }} />
            </a>
            <a href="https://github.com/ajaysharmadeveloper/wbc-telehealth-project" target="_blank" rel="noopener noreferrer" className="community-card github-card">
              <Github size={32} color="#fff" />
              <div>
                <h3>GitHub</h3>
                <p>View the code, open issues, contribute</p>
              </div>
              <ArrowRight size={20} color="#fff" style={{ marginLeft: "auto", opacity: 0.7 }} />
            </a>
            <a href="https://weekend-vibe-builder.vercel.app/" target="_blank" rel="noopener noreferrer" className="community-card website-card">
              <Globe size={32} color="#fff" />
              <div>
                <h3>Community Website</h3>
                <p>Learn more about Weekend Vibe Builders</p>
              </div>
              <ArrowRight size={20} color="#fff" style={{ marginLeft: "auto", opacity: 0.7 }} />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <h3><Stethoscope size={18} color="var(--teal-light)" style={{ verticalAlign: "middle", marginRight: 6 }} /><span>WBC</span> Telehealth</h3>
              <p>AI-powered diabetes triage for small clinics — built by the Weekend Vibe Builders Community.</p>
            </div>
            <div className="footer-columns">
              <div className="footer-col">
                <h4>Product</h4>
                <Link to="/#features">Features</Link>
                <Link to="/#how">How It Works</Link>
                <Link to="/#demo">Demo</Link>
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
              <AlertTriangleInline /> This is a triage support tool, not a medical device. It does not diagnose, treat, or prescribe medication.
              Always consult a qualified healthcare professional. In a medical emergency, call your local emergency services immediately.
            </p>
            <p className="footer-copy">&copy; 2026 Weekend Vibe Builders Community. Open source under MIT license.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function AlertTriangleInline() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: 4 }}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
