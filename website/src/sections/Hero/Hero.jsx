import { Stethoscope, AlertTriangle, ArrowRight, Github } from '../../components/icons';
import { siteConfig } from '../../lib/siteConfig';

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div>
        <div className="hero-badge">Open Source · Weekend Vibe Builders</div>
        <h1 id="hero-heading">
          Smart Diabetes Screening for <em>Small Clinics</em>
        </h1>
        <p>
          Help patients understand their symptoms, check their risk level, and know what to do
          next - all through a simple chat, before they even visit the clinic.
        </p>
        <div className="hero-btns">
          <a
            className="btn-primary"
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={16} /> Try Demo on GitHub <ArrowRight size={16} />
          </a>
          <button type="button" className="btn-outline" onClick={() => scrollTo('how')}>
            How It Works
          </button>
        </div>
        <div className="hero-selfhost" role="list" aria-label="How to self-host">
          <span className="hero-selfhost-label">Run it in 3 steps · Set up &amp; use</span>
          <ol className="hero-selfhost-steps">
            <li>
              <span className="hero-selfhost-num">1</span>
              <span>
                Clone the <code>repo</code>
              </span>
            </li>
            <li>
              <span className="hero-selfhost-num">2</span>
              <span>
                Read the <code>README</code>
              </span>
            </li>
            <li>
              <span className="hero-selfhost-num">3</span>
              <span>
                Run with <code>docker compose</code>
              </span>
            </li>
          </ol>
        </div>
      </div>

      <div className="chat-mockup" aria-hidden="true">
        <div className="chat-header">
          <div className="chat-header-avatar">
            <Stethoscope size={18} color="#fff" />
          </div>
          <div className="chat-header-info">
            <h4>WBC Triage Assistant</h4>
            <p>Diabetes Screening</p>
          </div>
          <div className="chat-online">Online</div>
        </div>
        <div className="chat-body">
          <div className="msg msg-patient">
            I've been very thirsty and fatigued for 3 days.
          </div>
          <div className="msg msg-ai">
            Do you have a known diabetes diagnosis? Any blurred vision or frequent urination?
          </div>
          <div className="msg msg-patient">
            No history, but slight blurred vision this morning.
          </div>
          <div className="msg msg-ai">
            Checking your risk level now...
            <br />
            <span className="triage-badge">
              <AlertTriangle size={12} /> YELLOW - Book an Appointment
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
