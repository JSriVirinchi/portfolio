import { useMemo, useState } from 'react';
import type { Profile } from '../types';
import { SectionHeader } from './SectionHeader';

interface Props {
  profile: Profile;
}

const perspectives = {
  Builder:
    'I love simplifying complex distributed systems with clean, intuitive frontends that keep teams confident and fast.',
  Strategist:
    'I connect customer goals to measurable engineering outcomes, shipping with data loops and thoughtful guardrails.',
  Collaborator:
    'I invest in accessible, inclusive tooling, mentoring teammates, and creating environments where ideas compound quickly.',
};

export function SummarySection({ profile }: Props) {
  const [active, setActive] = useState<keyof typeof perspectives>('Builder');

  const chips = useMemo(() => profile.specialties.slice(0, 6), [profile.specialties]);

  return (
    <section className="section" id="about">
      <SectionHeader
        eyebrow="Profile"
        title="What drives my work"
        description="Curiosity, purposeful automation, and crisp product experiences."
      />
      <div className="summary-card">
        <div className="summary-main">
          <p>{profile.summary}</p>
          <div className="summary-highlights">
            {chips.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="summary-perspectives">
          <p className="summary-perspectives-title">Choose a perspective</p>
          <div className="summary-perspective-tabs">
            {Object.keys(perspectives).map((label) => (
              <button
                key={label}
                type="button"
                className={label === active ? 'active' : ''}
                onClick={() => setActive(label as keyof typeof perspectives)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="summary-perspective-copy">{perspectives[active]}</p>
        </div>
      </div>
    </section>
  );
}
