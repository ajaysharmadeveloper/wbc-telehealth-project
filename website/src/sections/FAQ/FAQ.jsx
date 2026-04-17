import { FAQS } from './faqData';

export default function FAQ() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-heading">
      <div className="container">
        <div className="section-header fade-in">
          <div className="eyebrow">FAQ</div>
          <h2 id="faq-heading">Frequently Asked Questions</h2>
          <p>Quick answers about how WBC Telehealth works, who it's for, and what it isn't.</p>
        </div>
        <div className="faq-list fade-in">
          {FAQS.map(({ q, a }) => (
            <details className="faq-item" key={q}>
              <summary>{q}</summary>
              <div className="faq-answer">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
