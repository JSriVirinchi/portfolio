import type { Profile } from '../types';

interface Props {
  profile: Profile;
}

const links = [
  { href: '#about', label: 'About' },
  { href: '#spotlight', label: 'Spotlight' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#github', label: 'GitHub' },
  { href: '#contact', label: 'Contact' },
];

export function TechNav({ profile }: Props) {
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .map((chunk) => chunk[0])
    .join('')
    .slice(0, 4)
    .toUpperCase();

  return (
    <header className="tech-nav">
      <div className="tech-nav-glow" aria-hidden />
      <a href="#top" className="tech-nav-logo" aria-label="Back to top">
        <span>{initials}</span>
        <span className="tech-nav-glitch" aria-hidden>
          {initials}
        </span>
      </a>
      <nav aria-label="Primary">
        <ul>
          {links.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
