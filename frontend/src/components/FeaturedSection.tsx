import type { Featured } from '../types';
import { SectionHeader } from './SectionHeader';

interface Props {
  items: Featured[];
}

function LinkedInGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden focusable="false">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export function FeaturedSection({ items }: Props) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="section" id="featured">
      <SectionHeader
        eyebrow="Featured"
        title="Out in the community"
        description="Hackathons, events, and shout-outs from across my network."
      />
      <div className="featured-grid">
        {items.map((item) => (
          <a
            key={item.url}
            className="featured-card"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="featured-icon" aria-hidden>
              <LinkedInGlyph />
            </span>
            <div className="featured-body">
              <h3>{item.title}</h3>
              {item.subtitle && <p>{item.subtitle}</p>}
            </div>
            <span className="featured-source">
              {item.source ?? 'View'}
              <span aria-hidden> ↗</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
