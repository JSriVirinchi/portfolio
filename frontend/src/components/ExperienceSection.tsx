import { useMemo, useState, type CSSProperties } from 'react';
import type { Experience } from '../types';
import { SectionHeader } from './SectionHeader';

interface Props {
  experiences: Experience[];
}

const companyAssets = [
  {
    keywords: ['Amazon Web Services', 'AWS'],
    logo: '/images/aws.png',
    alt: 'Amazon Web Services logo',
    brandColor: '#FF9900',
    text: 'AWS',
  },
  {
    keywords: ['Amazon Robotics'],
    logo: '/images/amazon.jpg',
    alt: 'Amazon Robotics logo',
    brandColor: '#232F3E',
    text: 'Amazon Robotics',
  },
  {
    keywords: ['Quantiphi'],
    logo: '/images/quantiphi.jpg',
    alt: 'Quantiphi logo',
    brandColor: '#01A9E7',
    text: 'Quantiphi',
  },
  {
    keywords: ['ReferralYogi'],
    logo: '/images/referralyogi.jpg',
    alt: 'ReferralYogi logo',
    brandColor: '#0DB481',
    text: 'ReferralYogi',
  },
];

type CompanyAsset = (typeof companyAssets)[number];

function getCompanyAsset(company: string): CompanyAsset | undefined {
  return companyAssets.find((asset) =>
    asset.keywords.some((key) => company.toLowerCase().includes(key.toLowerCase())),
  );
}

function getYear(segment: string) {
  const match = segment.match(/\d{4}/);
  return match ? match[0] : segment;
}

export function ExperienceSection({ experiences }: Props) {
  const [expanded, setExpanded] = useState<string>(experiences[0]?.company ?? '');
  const annotated = useMemo(
    () =>
      experiences.map((experience) => ({
        experience,
        asset: getCompanyAsset(experience.company),
      })),
    [experiences],
  );
  return (
    <section className="section" id="experience">
      <SectionHeader
        eyebrow="Experience"
        title="Impact-inclined delivery"
        description="Product engineering across cloud infrastructure, robotics simulation, and conversational AI."
      />
      <div className="timeline experience-timeline">
        {annotated.map(({ experience: role, asset }, index) => {
          const logoStyle = {
            '--experience-brand': asset?.brandColor ?? 'rgba(44, 68, 130, 0.65)',
          } as CSSProperties;
          const logoLabel = asset?.text ?? role.company;
          const period = [role.location, `${role.start} - ${role.end}`].filter(Boolean).join(' | ');
          const isOpen = expanded === role.company;
          return (
            <article key={role.company} className="timeline-item experience-item">
              <div className="timeline-marker">
                <span>{getYear(role.start)}</span>
                <div className="timeline-line" aria-hidden />
              </div>
              <div className={`timeline-body experience-body ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="experience-header"
                  onClick={() => setExpanded(isOpen ? '' : role.company)}
                  aria-expanded={isOpen}
                >
                  <div className="experience-header-row">
                    <span
                      className="experience-logo"
                      style={logoStyle}
                      role={asset?.logo ? undefined : 'img'}
                      aria-label={asset?.logo ? undefined : logoLabel}
                    >
                      {asset?.logo ? (
                        <img src={asset.logo} alt={asset.alt} loading="lazy" />
                      ) : (
                        <span className="experience-logo-text">{logoLabel.slice(0, 2).toUpperCase()}</span>
                      )}
                    </span>
                    <div className="experience-summary">
                      <h3>{role.title}</h3>
                      <p className="experience-company">{role.company}</p>
                      <p className="experience-meta-text">{period}</p>
                    </div>
                  </div>
                  <span className="experience-toggle" aria-hidden>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div className="experience-collapsible">
                  {role.focus && <p className="experience-focus">Focus: {role.focus}</p>}
                  <ul className="experience-highlights">
                    {role.highlights.map((achievement) => (
                      <li key={achievement}>{achievement}</li>
                    ))}
                  </ul>
                </div>
                <span className="timeline-index">0{index + 1}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
