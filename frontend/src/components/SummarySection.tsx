import { useMemo, useState } from 'react';
import type { Profile } from '../types';
import { SectionHeader } from './SectionHeader';

interface Props {
  profile: Profile;
}

export function SummarySection({ profile }: Props) {
  const perspectiveContent = useMemo(() => {
    const firstName = profile.name.split(' ')[0] ?? profile.name;
    return {
      Recruiter: {
        summary: `I'm ${firstName}, a product-minded front-end lead who ships at AWS scale. I pair developer experience with accessible UX, mentor across hiring loops, and keep launches measurable so your managers see impact fast.`,
        highlights: [
          'Senior front-end & UX leadership',
          'AWS-scale launch experience',
          'Interview-ready mentor & coach',
          'Accessibility and telemetry focus',
        ],
        persona:
          'Talent partners building slates for front-end or full-stack roles who need someone ready to mentor, ship, and speak with stakeholders.',
      },
      Manager: {
        summary:
          'I partner with engineering managers to unblock roadmaps with clarity. I stitch design, backend, and reliability teams together, expose metrics early, and de-risk complex rollouts so your org stays confident.',
        highlights: [
          'Roadmap and stakeholder alignment',
          'Cross-team execution at scale',
          'Data-informed experimentation loops',
          'Operational guardrails and automation',
        ],
        persona:
          'Engineering leaders owning growth-critical initiatives who want a hands-on lead comfortable communicating tradeoffs and driving cross-org work.',
      },
      Client: {
        summary: `I collaborate with founders and product teams to turn ideas into durable software. From discovery workshops to iterative React/TypeScript builds with AWS backends, I keep pace high without sacrificing polish.`,
        highlights: [
          'Product discovery and UX flow mapping',
          'Full-stack delivery with AWS foundations',
          'Automation and observability baked in',
          'Transparent, collaborative cadence',
        ],
        persona:
          'Founders, PMs, or collaborators launching a product, proof-of-concept, or automation initiative who want a strategic, hands-on builder.',
      },
    } as const;
  }, [profile.name]);

  const [active, setActive] = useState<keyof typeof perspectiveContent>('Recruiter');
  const { summary, highlights, persona } = perspectiveContent[active];

  return (
    <section className="section" id="about">
      <SectionHeader
        eyebrow="About"
        title="What drives my work"
        description="Curiosity, purposeful automation, and crisp product experiences."
      />
      <div className="summary-card">
        <div className="summary-main">
          <p>{summary}</p>
          <div className="summary-highlights">
            {highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="summary-perspectives">
          <p className="summary-perspectives-title">Choose a perspective</p>
          <div className="summary-perspective-tabs">
            {Object.keys(perspectiveContent).map((label) => (
              <button
                key={label}
                type="button"
                className={label === active ? 'active' : ''}
                onClick={() => setActive(label as keyof typeof perspectiveContent)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="summary-perspective-copy">{persona}</p>
        </div>
      </div>
    </section>
  );
}
