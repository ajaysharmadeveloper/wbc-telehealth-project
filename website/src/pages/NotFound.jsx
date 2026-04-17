import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" path="/404" noindex />
      <section
        className="section"
        style={{ paddingTop: 200, paddingBottom: 200, textAlign: 'center' }}
      >
        <div className="container">
          <div className="eyebrow">404</div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 800,
              color: 'var(--navy)',
              margin: '12px 0 16px',
            }}
          >
            Page Not Found
          </h1>
          <p style={{ color: 'var(--slate)', marginBottom: 32 }}>
            The page you're looking for doesn't exist or has moved.
          </p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
