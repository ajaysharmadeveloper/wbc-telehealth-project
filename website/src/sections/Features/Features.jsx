import {
  MessageCircle,
  Droplet,
  Scale,
  Shield,
  Calendar,
  BookOpen,
  Telegram,
  Globe,
} from '../../components/icons';

const FEATURES = [
  {
    icon: <MessageCircle size={22} />,
    title: 'Chat-Based Screening',
    desc: 'Patients describe symptoms in their own words - no confusing forms or medical terms needed.',
    accent: '#0d9488',
  },
  {
    icon: <Droplet size={22} />,
    title: 'Diabetes-Focused',
    desc: 'Built specifically around diabetes symptoms, risk factors, and warning signs.',
    accent: '#3b82f6',
  },
  {
    icon: <Scale size={22} />,
    title: 'Clinically-Informed AI',
    desc: 'Combines medical guidelines with AI to give accurate, trustworthy risk assessments.',
    accent: '#8b5cf6',
  },
  {
    icon: <Shield size={22} />,
    title: 'Built-in Safety Checks',
    desc: 'Detects emergencies automatically and always reminds patients to consult a real doctor.',
    accent: '#f43f5e',
  },
  {
    icon: <Calendar size={22} />,
    title: 'Appointment Guidance',
    desc: 'Recommends next steps and helps patients understand when and how to book a clinic visit.',
    accent: '#f59e0b',
  },
  {
    icon: <BookOpen size={22} />,
    title: 'Health Education',
    desc: 'Shares easy-to-understand tips about diabetes prevention, diet, and self-care throughout the chat.',
    accent: '#10b981',
  },
];

export default function Features() {
  return (
    <section className="section section-alt" id="features" aria-labelledby="features-heading">
      <div className="container">
        <div className="section-header fade-in">
          <div className="eyebrow">Key Features</div>
          <h2 id="features-heading">What Makes This Different</h2>
          <p>Purpose-built for diabetes screening. Simple for patients. Useful for clinics.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(({ icon, title, desc, accent }) => (
            <article
              className="feature-card fade-in"
              key={title}
              style={{ '--accent': accent }}
            >
              <div className="feature-icon" aria-hidden="true">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>

        <article className="feature-spotlight fade-in" aria-label="Bundled channels">
          <div className="feature-spotlight-copy">
            <div className="feature-spotlight-eyebrow">Bundled In The Stack</div>
            <h3>Telegram &amp; Web Chat</h3>
            <p>
              Both channels ship out of the box and share one LangGraph agent - a patient's
              session stays intact whether they message the Telegram bot or open the web chat.
              Spin it up on your own infra with Docker Compose.
            </p>
          </div>
          <div className="feature-spotlight-channels" role="list">
            <div className="feature-spotlight-channel" role="listitem">
              <div className="feature-spotlight-icon feature-spotlight-icon-telegram">
                <Telegram size={22} />
              </div>
              <div>
                <div className="feature-spotlight-channel-name">Telegram Bot</div>
                <div className="feature-spotlight-channel-sub">python-telegram-bot · polling</div>
              </div>
            </div>
            <div className="feature-spotlight-channel" role="listitem">
              <div className="feature-spotlight-icon feature-spotlight-icon-web">
                <Globe size={22} />
              </div>
              <div>
                <div className="feature-spotlight-channel-name">Web Chat</div>
                <div className="feature-spotlight-channel-sub">Self-hosted · same session</div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
