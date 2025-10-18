import { useMemo } from 'react';
import type { SkillEntry, SkillItem, Skills } from '../types';
import { SectionHeader } from './SectionHeader';

interface Props {
  skills: Skills;
}

const ORDER: Array<keyof Skills> = ['languages', 'frameworks', 'tools', 'cloud'];

export function SkillsSection({ skills }: Props) {
  const entries = useMemo(() => {
    const records = (Object.entries(skills) as Array<[keyof Skills, SkillEntry[]]>).filter(
      ([, list]) => list.length > 0,
    );

    const prioritized = ORDER.flatMap((key) => {
      const match = records.find(([category]) => category === key);
      return match ? [match] : [];
    });

    const remainder = records.filter(([category]) => !ORDER.includes(category));

    return [...prioritized, ...remainder];
  }, [skills]);

  return (
    <section className="section" id="skills">
      <SectionHeader
        eyebrow="Toolkit"
        title="Languages, frameworks, and platforms"
        description="Pragmatic choices, type safety, and automation-ready stacks."
      />
      <div className="skills-grid">
        {entries.map(([key, list]) => (
          <article key={key} className="skills-card">
            <h3>{key}</h3>
            <ul>
              {list.map((raw) => {
                const item: SkillItem = typeof raw === 'string' ? { name: raw } : raw;
                return (
                  <li key={item.name}>
                    {item.icon ? (
                      <img
                        src={item.icon}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="skill-icon"
                      />
                    ) : (
                      <span className="skill-icon fallback" aria-hidden="true">
                        {item.name.charAt(0)}
                      </span>
                    )}
                    <span>{item.name}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
