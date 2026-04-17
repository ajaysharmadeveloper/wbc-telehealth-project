import { Link } from 'react-router-dom';
import { Stethoscope, AlertTriangle } from '../components/icons';
import { siteConfig } from '../lib/siteConfig';

const FOOTER_LINKS = [
  { label: 'About Us', to: '/about', external: false },
  { label: 'Community', href: siteConfig.organization.url, external: true },
  { label: 'GitHub', href: siteConfig.social.github, external: true },
  { label: 'WhatsApp', href: siteConfig.social.whatsapp, external: true },
  { label: 'Discord', href: siteConfig.social.discord, external: true },
  { label: `License (${siteConfig.license.name})`, href: siteConfig.license.url, external: true },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>
              <Stethoscope size={18} color="var(--teal-light)" />
              <span>WBC</span> Telehealth
            </h3>
            <p>
              AI-powered diabetes triage for small clinics - built by the Weekend Vibe
              Builders.
            </p>
          </div>

          <ul className="footer-links">
            {FOOTER_LINKS.map((item) =>
              item.external ? (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.label}
                  </a>
                </li>
              ) : (
                <li key={item.label}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              )
            )}
          </ul>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-disclaimer">
            <span className="footer-disclaimer-icon" aria-hidden="true">
              <AlertTriangle size={14} />
            </span>
            <span>
              This is a triage support tool, not a medical device. It does not diagnose, treat, or
              prescribe medication. Always consult a qualified healthcare professional. In a
              medical emergency, call your local emergency services immediately.
            </span>
          </p>
          <p className="footer-copy">
            &copy; {year} {siteConfig.organization.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
