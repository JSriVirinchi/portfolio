import { getResumeUrl } from '../api/client';
import { useTypewriter } from '../hooks/useTypewriter';
import { useTilt } from '../hooks/useTilt';
import type { Profile } from '../types';
import { MetricsTicker } from './MetricsTicker';
import { TerminalOverlay } from './TerminalOverlay';
import { SkillsTape } from './SkillsTape';

interface Props {
  profile: Profile;
}

const heroStatements = [
  'orchestrate resilient cloud-native experiences',
  'infuse automation with human-centered design',
  'ship data-driven products with measurable impact',
];

export function HeroSection({ profile }: Props) {
  const resumeUrl = getResumeUrl(profile);
  const typed = useTypewriter(heroStatements, 70, 1800);
  const { ref, style } = useTilt(10);

  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden />
      <div className="hero-layout">
        <div className="hero-card" ref={ref} style={style}>
          <div className="hero-content">
            <p className="hero-eyebrow">{profile.location}</p>
            <h1 className="hero-title">
              {profile.name}
              <span className="hero-title-underline" />
            </h1>
            <p className="hero-subtitle">{profile.headline}</p>
            <p className="hero-summary">
              I {typed}
              <span className="hero-cursor" aria-hidden>
                ▌
              </span>
            </p>
            <p className="hero-description">{profile.summary}</p>
            <div className="hero-actions">
              {resumeUrl && (
                <a className="button primary" href={resumeUrl} target="_blank" rel="noreferrer">
                  View Resume
                </a>
              )}
              {profile.linkedin && (
                <a className="button ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
                  Connect on LinkedIn
                </a>
              )}
            </div>
            <div className="hero-specialties" aria-label="Areas of focus">
              {profile.specialties.map((item) => (
                <span key={item} className="hero-chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <MetricsTicker />
        </div>
        <div className="hero-aside">
          <TerminalOverlay />
          <SkillsTape skills={profile.skills} />
        </div>
      </div>
    </section>
  );
}
