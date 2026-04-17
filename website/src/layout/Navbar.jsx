import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, Menu, X, Github } from '../components/icons';
import ThemeToggle from '../components/ThemeToggle';
import { siteConfig } from '../lib/siteConfig';

const SECTIONS = [
  ['problem', 'Problem'],
  ['solution', 'Solution'],
  ['features', 'Features'],
  ['how', 'How to Use'],
  ['demo', 'Preview'],
  ['faq', 'FAQ'],
];

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Navbar({ theme, toggleTheme }) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSectionClick = (id) => {
    setOpen(false);
    if (isHome) {
      scrollToId(id);
    } else {
      window.location.href = `/#${id}`;
    }
  };

  const renderSectionLinks = (onClick) =>
    SECTIONS.map(([id, label]) => (
      <li key={id}>
        {isHome ? (
          <a
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              onClick(id);
            }}
          >
            {label}
          </a>
        ) : (
          <Link to={`/#${id}`} onClick={() => setOpen(false)}>
            {label}
          </Link>
        )}
      </li>
    ));

  const tryDemoCta = (
    <a
      className="nav-cta nav-cta-desktop"
      href={siteConfig.social.github}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Github size={14} /> Try Demo
    </a>
  );

  return (
    <>
      <nav>
        <Link to="/" className="nav-logo" onClick={() => setOpen(false)}>
          <Stethoscope size={22} color="var(--teal)" /> <span>WBC</span> Telehealth
        </Link>

        <ul className="nav-links">
          {renderSectionLinks(scrollToId)}
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>

        <div className="nav-utils">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {tryDemoCta}
          <button
            type="button"
            className="nav-burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <div
        className={`nav-backdrop ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="mobile-drawer"
        className={`nav-drawer ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
      >
        <ul className="nav-drawer-links">
          {renderSectionLinks(handleSectionClick)}
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>

        <div className="nav-drawer-cta">
          <a
            className="nav-cta"
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <Github size={14} /> Try Demo
          </a>
        </div>
      </aside>
    </>
  );
}
