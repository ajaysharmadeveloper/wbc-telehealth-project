import {
  Building,
  ClipboardList,
  Hourglass,
  Shuffle,
  Wrench,
  UserX,
  HelpCircle,
  Clock,
  ShieldOff,
} from '../../components/icons';

const CLINIC_PAINS = [
  {
    icon: <ClipboardList size={20} />,
    label: 'No Pre-Screening',
    desc: "Patient info arrives incomplete - staff spend time collecting data instead of treating patients.",
  },
  {
    icon: <Hourglass size={20} />,
    label: 'Long Wait Times',
    desc: 'Urgent and routine cases are mixed together with no way to sort by priority.',
  },
  {
    icon: <Shuffle size={20} />,
    label: 'No Smart Prioritization',
    desc: 'Triage is done manually, so urgent warning signs can be missed.',
  },
  {
    icon: <Wrench size={20} />,
    label: 'Too Much Manual Work',
    desc: 'Staff spend hours on intake tasks that could be handled automatically.',
  },
];

const PATIENT_PAINS = [
  {
    icon: <HelpCircle size={20} />,
    label: 'Unsure About Severity',
    desc: 'Is this urgent or can it wait? Patients struggle to judge how serious their symptoms are.',
  },
  {
    icon: <Clock size={20} />,
    label: 'Delayed Action',
    desc: 'Waiting too long to see a doctor can turn a manageable condition into a serious one.',
  },
  {
    icon: <ShieldOff size={20} />,
    label: 'No Early Warning',
    desc: 'Without screening, early signs of diabetes go unnoticed until they become critical.',
  },
  {
    icon: <HelpCircle size={20} />,
    label: "Don't Know Next Steps",
    desc: 'Should I rest, book an appointment, or go to the ER? Patients need clear guidance.',
  },
];

function PainList({ items }) {
  return items.map((item) => (
    <div className="pain-item" key={item.label}>
      <div className="pain-icon">{item.icon}</div>
      <div>
        <div className="pain-label">{item.label}</div>
        <div className="pain-desc">{item.desc}</div>
      </div>
    </div>
  ));
}

export default function Problem() {
  return (
    <section className="section section-alt" id="problem" aria-labelledby="problem-heading">
      <div className="container">
        <div className="section-header fade-in">
          <div className="eyebrow">The Problem</div>
          <h2 id="problem-heading">Why Small Clinics Need This</h2>
          <p>
            Clinics are overwhelmed with manual processes. Patients don't know how urgent their
            symptoms are. Both sides lose time.
          </p>
        </div>
        <div className="problem-grid fade-in">
          <div className="problem-card">
            <div className="problem-card-title">
              <Building size={16} color="var(--teal)" /> For Clinics
            </div>
            <PainList items={CLINIC_PAINS} />
          </div>
          <div className="problem-card">
            <div className="problem-card-title">
              <UserX size={16} color="var(--teal)" /> For Patients
            </div>
            <PainList items={PATIENT_PAINS} />
          </div>
        </div>
      </div>
    </section>
  );
}
