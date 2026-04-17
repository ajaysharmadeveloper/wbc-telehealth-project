export const FAQS = [
  {
    q: 'Is WBC Telehealth a diagnostic tool?',
    a: 'No. WBC Telehealth is a triage support assistant - not a medical device. It helps patients understand the urgency of their symptoms and recommends next steps, but it never diagnoses, prescribes, or replaces a qualified clinician.',
  },
  {
    q: 'Who is this built for?',
    a: 'Small clinics that want to pre-screen patients for diabetes-related symptoms before a visit, and patients who want a fast, plain-language read on whether they should self-manage, book an appointment, or seek emergency care.',
  },
  {
    q: 'How does the AI decide between Green, Yellow, and Red?',
    a: 'The assistant uses a hybrid scoring model: clinically-informed rules (e.g., emergency keywords, symptom thresholds based on ADA 2026 guidelines) combined with LLM contextual reasoning. A safety guardrail can escalate the score upward but never downward, so urgent cases are never under-triaged.',
  },
  {
    q: 'Is my conversation private?',
    a: 'Conversations are stored to give the assistant context across turns and to let clinics review their own intake data. The project is open source, self-hostable, and contains no third-party analytics by default.',
  },
  {
    q: 'Is it really free and open source?',
    a: 'Yes. The full backend, agent, knowledge base, and this website are open source on GitHub. You can run it on your own infrastructure, fork it, or contribute back.',
  },
  {
    q: 'What happens in a medical emergency?',
    a: 'If the assistant detects emergency keywords (e.g., loss of consciousness, severe chest pain, signs of DKA), it immediately surfaces a RED triage and tells the patient to call local emergency services. The disclaimer is shown on every response.',
  },
  {
    q: 'Can I use this for conditions other than diabetes?',
    a: 'The current knowledge base, rules, and prompts are tuned for diabetes pre-screening. The architecture (LangGraph agent + RAG + rule layer) is general - you can adapt it to other conditions by swapping the knowledge base and rules.',
  },
];
