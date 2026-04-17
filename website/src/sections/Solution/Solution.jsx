import { CheckCircle, AlertTriangle, AlertOctagon } from '../../components/icons';

const TRIAGE = [
  {
    level: 'green',
    icon: <CheckCircle size={26} color="#fff" />,
    title: 'GREEN',
    sub: 'Self-Care at Home',
    desc: "Your symptoms are mild. You'll get practical tips for healthy eating, staying active, and monitoring your blood sugar at home.",
  },
  {
    level: 'yellow',
    icon: <AlertTriangle size={26} color="#fff" />,
    title: 'YELLOW',
    sub: 'Book a Clinic Visit',
    desc: "Your symptoms need a doctor's attention soon. You'll be guided to schedule a visit within 1–2 days with preparation tips.",
  },
  {
    level: 'red',
    icon: <AlertOctagon size={26} color="#fff" />,
    title: 'RED',
    sub: 'Get Emergency Help',
    desc: "Your symptoms suggest a serious diabetes emergency. You'll be told to seek urgent medical care immediately.",
  },
];

export default function Solution() {
  return (
    <section className="section" id="solution" aria-labelledby="solution-heading">
      <div className="container">
        <div className="section-header fade-in">
          <div className="eyebrow">The Solution</div>
          <h2 id="solution-heading">Clear Answers in Under 2 Minutes</h2>
          <p>
            Our AI chats with patients about their symptoms and gives them a clear
            recommendation - color-coded by urgency.
          </p>
        </div>
        <div className="triage-cards fade-in">
          {TRIAGE.map(({ level, icon, title, sub, desc }) => (
            <div className={`triage-card ${level}`} key={level}>
              <div className="triage-dot">{icon}</div>
              <h3>{title}</h3>
              <div className="triage-sub">{sub}</div>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
