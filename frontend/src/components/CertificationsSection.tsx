import type { Certification } from '../types';
import { SectionHeader } from './SectionHeader';

interface Props {
  items: Certification[];
}

export function CertificationsSection({ items }: Props) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="section" id="certifications">
      <SectionHeader
        eyebrow="Certifications"
        title="Verified credentials"
        description="Industry certifications, each verifiable on Credly."
      />
      <div className="cert-grid">
        {items.map((cert) => (
          <article key={cert.name} className="cert-card">
            <div className="cert-badge">
              <img src={cert.image} alt={`${cert.name} badge`} loading="lazy" />
            </div>
            <div className="cert-body">
              <h3>{cert.name}</h3>
              <p className="cert-issuer">{cert.issuer}</p>
              {cert.issued && <p className="cert-date">{cert.issued}</p>}
              {cert.url && (
                <a className="cert-verify" href={cert.url} target="_blank" rel="noreferrer">
                  Verify on Credly
                  <span aria-hidden> →</span>
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
