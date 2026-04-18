import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Heart,
  Users,
  Code,
  Globe,
  Github,
  Discord,
  Whatsapp,
  Linkedin,
  Target,
  Zap,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  BookOpen,
} from '../components/icons';
import SEO from '../components/SEO';
import { siteConfig } from '../lib/siteConfig';
import {
  organizationSchema,
  medicalWebPageSchema,
  breadcrumbSchema,
} from '../lib/seo';

const STATS = [
  { value: '3', label: 'Builders' },
  { value: 'AGPL-3.0', label: 'Open license' },
  { value: 'Weekends', label: 'When we ship' },
  { value: '100%', label: 'Open source' },
];

const VALUES = [
  {
    icon: <Heart size={28} color="#fff" />,
    title: 'Patient First',
    desc: 'Every feature is designed with patients in mind - simple language, clear guidance, and no confusing medical jargon.',
    accent: '#ec4899',
  },
  {
    icon: <Target size={28} color="#fff" />,
    title: 'Real Impact',
    desc: 'We build tools that solve actual healthcare problems in small clinics, not theoretical prototypes that sit on a shelf.',
    accent: '#f97316',
  },
  {
    icon: <Code size={28} color="#fff" />,
    title: 'Open Source',
    desc: 'Our code is freely available for anyone to use, improve, and adapt. We believe healthcare innovation should be open.',
    accent: '#0d9488',
  },
  {
    icon: <Globe size={28} color="#fff" />,
    title: 'Community Driven',
    desc: 'Powered by weekend builders from different backgrounds - developers, designers, and healthcare enthusiasts working together.',
    accent: '#8b5cf6',
  },
];

const TIMELINE = [
  {
    icon: <Zap size={22} color="#fff" />,
    title: 'The Problem We Saw',
    desc: 'In many small clinics, patients arrive without any pre-screening. Front desk staff manually assess who needs urgent care, leading to long wait times and missed warning signs - especially for conditions like diabetes that can escalate quickly.',
  },
  {
    icon: <Stethoscope size={22} color="#fff" />,
    title: 'Our Approach',
    desc: 'We created an AI assistant that chats with patients before their visit. It asks simple questions, checks risk against clinically-informed rules, and gives clear next steps in plain language - in under 2 minutes.',
  },
  {
    icon: <CheckCircle size={22} color="#fff" />,
    title: 'What We Shipped',
    desc: 'A working open-source triage assistant with a chat UI, a LangGraph AI agent, a diabetes knowledge base, hard medical safety guardrails, and a dashboard for clinics. Clone the GitHub repo, follow the README, and run it on your own infrastructure.',
  },
];

function initialsOf(fullName) {
  return fullName
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const TEAM = [
  {
    name: 'Ajay Kumar Sharma',
    role: 'System Architect & Backend',
    color: '#0d9488',
    photo:
      'https://media.licdn.com/dms/image/v2/D5603AQHIc_14E-l38w/profile-displayphoto-scale_100_100/B56Z0l4evYJgAc-/0/1774457057663?e=1778112000&v=beta&t=E1PNgiGTNEs5SaPUZSpkPbguRoxJOAlD9mdzwsY1qMs',
    linkedin: 'https://www.linkedin.com/in/ajaykumarsharma1996/',
    github: 'ajaysharmadeveloper',
    website: 'https://www.ajaykumarsharma.co.in',
  },
  {
    name: 'Manish Sharma',
    role: 'Data & ML Pipeline',
    color: '#6366f1',
    photo:
      'https://media.licdn.com/dms/image/v2/D4D03AQFgPpnKuWBu0A/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1678647059412?e=1778112000&v=beta&t=9kjnpmpxMMjfxEg53jpzMmq_CXSGGuoHhC_oucvsxgM',
    linkedin: 'https://www.linkedin.com/in/manish-sharma-272006128/',
    github: null,
  },
  {
    name: 'Chanda Chanakya',
    role: 'UI & Experience',
    color: '#f59e0b',
    photo:
      'https://media.licdn.com/dms/image/v2/D5603AQHDQEjrYmEyBw/profile-displayphoto-crop_800_800/B56Z2btFisKYAI-/0/1776433787182?e=1778112000&v=beta&t=tQod_uTVsjwG_EHXsDQbpqdbQFwm_G-KtZscR5SniXA',
    linkedin: 'https://www.linkedin.com/in/chandachanakya/',
    github: null,
  },
];

const CONTRIBUTE = [
  {
    icon: <Github size={22} color="var(--teal)" />,
    title: 'Open an issue',
    desc: 'Found a bug or have a feature idea? File it on GitHub.',
    href: `${siteConfig.social.github}/issues/new`,
  },
  {
    icon: <Code size={22} color="var(--teal)" />,
    title: 'Send a pull request',
    desc: 'Pick a "good first issue" or improve docs - all PRs welcome.',
    href: `${siteConfig.social.github}/pulls`,
  },
  {
    icon: <BookOpen size={22} color="var(--teal)" />,
    title: 'Improve the knowledge base',
    desc: 'Help us refine the medical content the AI relies on.',
    href: `${siteConfig.social.github}/tree/main/data/knowledge`,
  },
  {
    icon: <MessageSquare size={22} color="var(--teal)" />,
    title: 'Share with a clinic',
    desc: 'Know a small clinic? Pass it along - real feedback shapes the roadmap.',
    href: siteConfig.social.discord,
  },
];

const COMMUNITY_LINKS = [
  {
    href: siteConfig.social.discord,
    className: 'community-card discord-card',
    icon: <Discord size={40} color="#fff" />,
    title: 'Discord',
    desc: 'Join the conversation, get help, share ideas',
  },
  {
    href: siteConfig.social.whatsapp,
    className: 'community-card whatsapp-card',
    icon: <Whatsapp size={40} color="#fff" />,
    title: 'WhatsApp',
    desc: 'Quick updates and casual discussion',
  },
  {
    href: siteConfig.organization.url,
    className: 'community-card website-card',
    icon: <Globe size={40} color="#fff" />,
    title: 'Community Website',
    desc: 'Learn more about Weekend Vibe Builders',
  },
];

function TeamAvatar({ member }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = member.photo && !imageFailed;
  return (
    <div
      className="team-avatar"
      style={{
        background: showImage
          ? 'transparent'
          : `linear-gradient(135deg, ${member.color}, var(--navy-solid))`,
      }}
    >
      {showImage ? (
        <img
          src={member.photo}
          alt={`${member.name} avatar`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="team-avatar-initials">{initialsOf(member.name)}</span>
      )}
    </div>
  );
}

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const schemas = [
    organizationSchema(),
    medicalWebPageSchema({
      url: `${siteConfig.url}/about`,
      title: `About - ${siteConfig.name}`,
      description: `Meet the Weekend Vibe Builders building ${siteConfig.name}.`,
    }),
    breadcrumbSchema([
      { name: 'Home', url: siteConfig.url },
      { name: 'About', url: `${siteConfig.url}/about` },
    ]),
  ];

  return (
    <>
      <SEO
        title="About Us"
        description="Meet the Weekend Vibe Builders - the team building open-source AI triage tools for small clinics."
        path="/about"
        jsonLd={schemas}
      />

      <section className="about-hero" aria-labelledby="about-heading">
        <div className="about-hero-bg" aria-hidden="true" />
        <div className="container">
          <div className="section-header fade-in" style={{ maxWidth: 720, paddingTop: 40 }}>
            <div className="eyebrow">About Us</div>
            <h1 id="about-heading">
              Built by the <em>Weekend Vibe</em> Builders
            </h1>
            <p>
              We're a small, passionate group of developers and builders who come together on
              weekends to create real-world tools that solve meaningful problems. No corporate
              timelines - just genuine curiosity and impact.
            </p>
          </div>

          <div className="about-stats fade-in" role="list">
            {STATS.map(({ value, label }) => (
              <div className="about-stat" role="listitem" key={label}>
                <div className="about-stat-value">{value}</div>
                <div className="about-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="mission" aria-labelledby="mission-heading">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Our Mission</div>
            <h2 id="mission-heading">Making Healthcare More Accessible</h2>
            <p>
              We believe smart technology can help small clinics provide better care. Our AI
              triage tool gives patients quick guidance and helps clinics work more efficiently -
              without replacing human doctors.
            </p>
          </div>
          <div className="about-values fade-in">
            {VALUES.map(({ icon, title, desc, accent }) => (
              <article
                className="about-value-card"
                key={title}
                style={{ '--accent': accent }}
              >
                <div className="about-value-icon" style={{ background: accent }}>
                  {icon}
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="purpose" aria-labelledby="purpose-heading">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">The Story</div>
            <h2 id="purpose-heading">Why We Built This</h2>
            <p>
              Small clinics often lack the technology bigger hospitals have. Patients wait too
              long, intake processes are manual, and risk assessment happens too late.
            </p>
          </div>
          <ol className="about-timeline fade-in">
            {TIMELINE.map(({ icon, title, desc }, idx) => (
              <li className="about-timeline-step" key={title}>
                <div className="about-timeline-marker" aria-hidden="true">
                  {icon}
                  <span className="about-timeline-num">{idx + 1}</span>
                </div>
                <div className="about-timeline-content">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-alt" id="team" aria-labelledby="team-heading">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">The Team</div>
            <h2 id="team-heading">Who's Behind This</h2>
            <p>A small team shipping real tools, every weekend.</p>
          </div>
          <div className="team-cards fade-in">
            {TEAM.map((member) => (
              <article className="team-card" key={member.name}>
                <TeamAvatar member={member} />
                <h4>{member.name}</h4>
                <p>{member.role}</p>
                <div className="team-socials">
                  {member.github && (
                    <a
                      className="team-social"
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on GitHub`}
                    >
                      <Github size={16} />
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      className="team-social team-social-linkedin"
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <Linkedin size={16} />
                    </a>
                  )}
                  {member.website && (
                    <a
                      className="team-social team-social-website"
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} personal website`}
                    >
                      <Globe size={16} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="contribute" aria-labelledby="contribute-heading">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Get Involved</div>
            <h2 id="contribute-heading">How to Contribute</h2>
            <p>
              You don't need to be a developer to help. Pick a path that fits your time and
              skills.
            </p>
          </div>
          <div className="contribute-grid fade-in">
            {CONTRIBUTE.map(({ icon, title, desc, href }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="contribute-card"
              >
                <div className="contribute-icon">{icon}</div>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <ArrowRight size={18} className="contribute-arrow" />
              </a>
            ))}
          </div>
          <div className="contribute-cta fade-in">
            <a
              className="btn-primary"
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={16} /> Get the Code on GitHub <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="community" aria-labelledby="community-heading">
        <div className="container">
          <div className="section-header fade-in">
            <div className="eyebrow">Join Us</div>
            <h2 id="community-heading">Be Part of the Community</h2>
            <p>
              Whether you're a developer, designer, healthcare professional, or just curious -
              we'd love to have you.
            </p>
          </div>
          <div className="community-links fade-in">
            {COMMUNITY_LINKS.map(({ href, className, icon, title, desc }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {icon}
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <ArrowRight
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 'auto', opacity: 0.7 }}
                />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
