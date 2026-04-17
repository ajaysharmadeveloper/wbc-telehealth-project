import {
  MessageSquare,
  Brain,
  BarChart,
  Activity,
  CheckSquare,
} from '../../components/icons';

const STEPS = [
  {
    icon: <MessageSquare size={28} />,
    title: 'Start a Chat — on Telegram or Web',
    desc: "Once your clinic self-hosts the stack, patients message your Telegram bot or open the bundled web chat and describe how they're feeling - no medical jargon needed. Same assistant, same session, either channel.",
  },
  {
    icon: <Brain size={28} />,
    title: 'AI Understands You',
    desc: "The assistant picks up on your symptoms, how long you've had them, and any relevant details.",
  },
  {
    icon: <BarChart size={28} />,
    title: 'Risk Check',
    desc: 'Your symptoms are checked against clinically-informed rules to determine how urgent they are.',
  },
  {
    icon: <Activity size={28} />,
    title: 'Get Your Result',
    desc: "You'll see a clear color-coded result: Green (self-care), Yellow (see a doctor), or Red (emergency).",
  },
  {
    icon: <CheckSquare size={28} />,
    title: 'Know What to Do',
    desc: "You'll receive specific next steps, helpful tips, and guidance on whether to book an appointment.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how" aria-labelledby="how-heading">
      <div className="container">
        <div className="section-header fade-in">
          <div className="eyebrow">How to Use</div>
          <h2 id="how-heading">5 Simple Steps</h2>
          <p>
            From describing your symptoms to getting a clear recommendation - it takes less than 2
            minutes.
          </p>
        </div>
        <ol className="steps">
          {STEPS.map(({ icon, title, desc }, idx) => (
            <li className="step fade-in" key={idx}>
              <div className="step-num">{icon}</div>
              <div className="step-content">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
