import { useMemo, type CSSProperties } from 'react';
import type { SkillEntry, SkillItem, Skills } from '../types';

interface Props {
  skills: Skills;
}

const MIN_ITEMS_PER_ROW = 10;

export function SkillsTape({ skills }: Props) {
  const rows = useMemo(() => {
    const normalize = (entry: SkillEntry): SkillItem => (typeof entry === 'string' ? { name: entry } : entry);
    const fillRow = (items: SkillItem[]): SkillItem[] => {
      if (items.length === 0) {
        return items;
      }
      const targetLength = Math.max(items.length, MIN_ITEMS_PER_ROW);
      const extended: SkillItem[] = [...items];
      while (extended.length < targetLength) {
        extended.push(...items);
      }
      return extended.slice(0, targetLength);
    };

    const map = [
      {
        id: 'languages',
        label: 'Languages',
        items: fillRow((skills.languages ?? []).map(normalize)),
        duration: '48s',
      },
      {
        id: 'frameworks',
        label: 'Frameworks',
        items: fillRow((skills.frameworks ?? []).map(normalize)),
        duration: '52s',
      },
      {
        id: 'cloud-tools',
        label: 'Cloud and tools',
        items: fillRow([...(skills.cloud ?? []), ...(skills.tools ?? [])].map(normalize)),
        duration: '56s',
      },
    ];

    return map.filter((row) => row.items.length > 0);
  }, [skills]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="skills-tape" aria-label="Core skills marquee">
      {rows.map((row) => (
        <div key={row.id} className="skills-tape-row">
          <ul
            className="skills-tape-track"
            aria-label={row.label}
            style={{ '--duration': row.duration } as CSSProperties}
          >
            {[0, 1].map((loop) =>
              row.items.map((item, index) => (
                <li
                  key={`${row.id}-${index}-${loop}`}
                  className="skills-tape-chip"
                  aria-hidden={loop === 1}
                >
                  {item.icon ? (
                    <img
                      src={item.icon}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="skills-tape-icon"
                    />
                  ) : (
                    <span className="skills-tape-icon fallback" aria-hidden="true">
                      {item.name.charAt(0)}
                    </span>
                  )}
                  <span>{item.name}</span>
                </li>
              )),
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
