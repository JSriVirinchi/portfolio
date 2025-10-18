import { useMemo, type CSSProperties } from 'react';
import type { Education } from '../types';
import { SectionHeader } from './SectionHeader';

interface Props {
  schools: Education[];
}

const schoolAssets = [
  {
    keywords: ['Arizona State University'],
    logo: '/images/asu.png',
    alt: 'Arizona State University logo',
    brandColor: '#8C1D40',
  },
  {
    keywords: ['Birla Institute of Technology and Science', 'BITS'],
    logo: '/images/bits.png',
    alt: 'BITS Pilani logo',
    brandColor: '#1D3A6B',
  },
];

type SchoolAsset = (typeof schoolAssets)[number];

function getSchoolAsset(school: string): SchoolAsset | undefined {
  return schoolAssets.find((asset) =>
    asset.keywords.some((key) => school.toLowerCase().includes(key.toLowerCase())),
  );
}

export function EducationSection({ schools }: Props) {
  const annotated = useMemo(
    () =>
      schools.map((school) => ({
        school,
        asset: getSchoolAsset(school.school),
      })),
    [schools],
  );

  return (
    <section className="section" id="education">
      <SectionHeader
        eyebrow="Education"
        title="Academic foundations"
        description="Blending information technology depth with hands-on product engineering."
      />
      <div className="education-grid">
        {annotated.map(({ school, asset }) => {
          const logoStyle = {
            '--education-brand': asset?.brandColor ?? 'rgba(14, 20, 44, 0.9)',
          } as CSSProperties;
          return (
            <article key={school.school} className="education-card">
              <span
                className="education-logo"
                style={logoStyle}
                role={asset?.logo ? undefined : 'img'}
                aria-label={asset?.logo ? undefined : school.school}
              >
                {asset?.logo ? (
                  <img src={asset.logo} alt={asset.alt} loading="lazy" />
                ) : (
                  <span className="education-logo-text">{school.school.slice(0, 3).toUpperCase()}</span>
                )}
              </span>
              <div className="education-content">
                <div className="education-details">
                  <h3>{school.degree}</h3>
                  <p className="education-school">{school.school}</p>
                  <p className="education-meta">
                    {school.location} | {school.period}
                  </p>
                  {school.gpa && <p className="education-meta">GPA: {school.gpa}</p>}
                </div>
                <div className="education-coursework">
                  {school.coursework.map((course) => (
                    <span key={course}>{course}</span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
