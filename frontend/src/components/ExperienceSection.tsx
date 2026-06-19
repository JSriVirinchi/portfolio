import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
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
    keywords: ['Decision Theater', 'ASU Decision'],
    logo: '/images/asu-dtn.jpg',
    alt: 'ASU Decision Theater Network logo',
    brandColor: '#8C1D40',
    text: 'ASU DTN',
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

const SLIDE_FRACTION = 0.62; // each experience occupies ~62% of the viewport height

export function ExperienceSection({ experiences }: Props) {
  const annotated = useMemo(
    () =>
      experiences.map((experience) => ({
        experience,
        asset: getCompanyAsset(experience.company),
      })),
    [experiences],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const count = annotated.length;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = scrollRef.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const vh = window.innerHeight;
      const slideH = vh * SLIDE_FRACTION;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - vh;
      const passed = Math.min(scrollable, Math.max(0, -rect.top));
      const progress = scrollable > 0 ? passed / scrollable : 0;
      const idx = count > 1 ? Math.round(progress * (count - 1)) : 0;
      if (pinRef.current) {
        // Fill stops exactly on the active marker, so the dot is "reached" the
        // moment its experience is shown (the fill eases between markers in CSS).
        const markerPos = count > 1 ? idx / (count - 1) : 0;
        pinRef.current.style.setProperty('--xp-progress', markerPos.toFixed(4));
        const sub = count > 1 ? progress * (count - 1) - idx : 0; // -0.5..0.5 within a slot
        pinRef.current.style.setProperty('--xp-parallax', (sub * 16).toFixed(2));
      }
      // Centre the active experience; neighbours peek above/below and slide on swap.
      const y = (vh - slideH) / 2 - idx * slideH;
      track.style.transform = `translate3d(0, ${y}px, 0)`;
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count]);

  return (
    <section className="section xp" id="experience">
      <SectionHeader
        eyebrow="Experience"
        title="Where I've worked"
        description="Scroll the journey — cloud infrastructure, robotics simulation, data analysis, and conversational AI."
      />
      <div
        className="xp-scroll"
        ref={scrollRef}
        style={{ '--xp-count': count } as CSSProperties}
      >
        <div className="xp-pin" ref={pinRef}>
          <div className="xp-line" aria-hidden>
            <span className="xp-line-fill" />
            {annotated.map((entry, i) => (
              <span
                key={entry.experience.company}
                className={`xp-marker${i <= active ? ' is-reached' : ''}${
                  i === active ? ' is-active' : ''
                }`}
                style={{ top: count > 1 ? `${(i / (count - 1)) * 100}%` : '50%' }}
              />
            ))}
          </div>
          <div className="xp-window">
            <div className="xp-track" ref={trackRef}>
              {annotated.map(({ experience: role, asset }, i) => {
                const isActive = i === active;
                const isCurrent = /present|current/i.test(role.end);
                const style = {
                  '--xp-brand': asset?.brandColor ?? 'rgba(124, 160, 255, 0.7)',
                } as CSSProperties;
                const logoLabel = asset?.text ?? role.company;
                return (
                  <article
                    key={`${role.company}-${role.start}`}
                    className={`xp-slide${isActive ? ' is-active' : ''}`}
                    style={style}
                  >
                    <div className="xp-aside">
                      <div className="xp-dates">
                        <span className="xp-dates-val">{role.start}</span>
                        <span className="xp-dates-line" aria-hidden />
                        <span className="xp-dates-val">{role.end}</span>
                        {isCurrent && <span className="xp-badge">Now</span>}
                      </div>
                      <div className="xp-aside-main">
                        <span
                          className="xp-logo"
                          role={asset?.logo ? undefined : 'img'}
                          aria-label={asset?.logo ? undefined : logoLabel}
                        >
                          {asset?.logo ? (
                            <img src={asset.logo} alt={asset.alt} loading="lazy" />
                          ) : (
                            <span className="xp-logo-text">{logoLabel.slice(0, 2).toUpperCase()}</span>
                          )}
                        </span>
                        <h3 className="xp-company">{role.company}</h3>
                        <p className="xp-role">{role.title}</p>
                        {role.location && <p className="xp-loc">{role.location}</p>}
                      </div>
                    </div>
                    <div className="xp-detail">
                      {role.focus && <p className="xp-focus">{role.focus}</p>}
                      <ul className="xp-highlights">
                        {role.highlights.map((achievement) => (
                          <li key={achievement}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
