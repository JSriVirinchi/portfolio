import { type ReactNode } from 'react';

interface Props {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  align?: 'left' | 'center';
}

export function SectionHeader({ eyebrow, title, description, align = 'left' }: Props) {
  return (
    <header className={`section-header ${align === 'center' ? 'center' : ''}`}>
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </header>
  );
}
