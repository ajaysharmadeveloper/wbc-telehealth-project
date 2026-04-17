import { Link } from 'react-router-dom';
import { Github, Users } from '../../components/icons';
import { siteConfig } from '../../lib/siteConfig';

export default function CTA() {
  return (
    <section className="cta-section" id="cta" aria-labelledby="cta-heading">
      <div className="container">
        <div className="cta-badge">
          Open Source ·{' '}
          <a
            href={siteConfig.organization.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-badge-link"
          >
            Weekend Vibe Builders
          </a>
        </div>
        <h2 id="cta-heading">Ready to Make Healthcare Smarter?</h2>
        <p>
          Explore the code, learn how it works, or get to know the team behind it. Built in the
          open - fork it, run it, improve it.
        </p>
        <div className="cta-buttons">
          <Link className="btn-white" to="/about">
            <Users size={18} /> About Us
          </Link>
          <a
            className="btn-ghost"
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={18} /> View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
