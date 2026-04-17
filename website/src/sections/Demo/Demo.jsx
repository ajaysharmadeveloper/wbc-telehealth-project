import { Link } from 'react-router-dom';
import { Github, ArrowRight } from '../../components/icons';
import { siteConfig } from '../../lib/siteConfig';
import ChatDemo from './ChatDemo';

export default function Demo() {
  return (
    <section className="section section-alt" id="demo" aria-labelledby="demo-heading">
      <div className="container">
        <div className="section-header fade-in">
          <div className="eyebrow">Sample Conversation</div>
          <h2 id="demo-heading">How a Triage Chat Looks</h2>
          <p>
            A scripted preview of a real triage flow - from symptom description to a clear
            recommendation. To run the actual assistant, clone the repo and follow the README.
          </p>
        </div>
        <div className="fade-in">
          <ChatDemo />
        </div>
        <div className="demo-self-host fade-in">
          <a
            className="btn-primary"
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={16} /> Get the Code on GitHub <ArrowRight size={16} />
          </a>
          <Link className="btn-outline" to="/about">
            Read the Story
          </Link>
        </div>
      </div>
    </section>
  );
}
