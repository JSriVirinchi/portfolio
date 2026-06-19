import { useEffect, useState } from 'react';
import type { Profile } from '../types';

interface Props {
  profile: Profile;
}

const links = [
  { href: '#experience', label: 'Experience' },
  { href: '#spotlight', label: 'Spotlight' },
  { href: '#skills', label: 'Skills' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#github', label: 'GitHub' },
  { href: '#contact', label: 'Contact' },
];

export function TechNav({ profile }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const words = profile.name.split(' ').filter(Boolean);
  const initials = words
    .slice(-2)
    .map((chunk) => chunk[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`tech-nav ${menuOpen ? 'is-open' : ''}`}>
      <div className="tech-nav-glow" aria-hidden />
      <a href="#top" className="tech-nav-logo" aria-label="Back to top">
        <span className="tech-nav-mono" aria-hidden>
          {initials}
        </span>
        <span className="tech-nav-name">
          {words.slice(-2)[0]}
          <span className="tech-nav-name-dim"> {words.slice(-2)[1]}</span>
        </span>
      </a>
      <button
        type="button"
        className="tech-nav-toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={toggleMenu}
      >
        <span />
        <span />
        <span />
      </button>
      <nav
        id="primary-navigation"
        aria-label="Primary"
        className={menuOpen ? 'open' : undefined}
      >
        <ul>
          {links.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
