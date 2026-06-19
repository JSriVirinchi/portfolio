import { useEffect, useRef } from 'react';
import './App.css';
import { CertificationsSection } from './components/CertificationsSection';
import { ContactSection } from './components/ContactSection';
import { EducationSection } from './components/EducationSection';
import { ExperienceSection } from './components/ExperienceSection';
import { FeaturedSection } from './components/FeaturedSection';
import { Footer } from './components/Footer';
import { GithubShowcase } from './components/GithubShowcase';
import { HeroSection } from './components/HeroSection';
import { SkillsSection } from './components/SkillsSection';
import { SpotlightGallery } from './components/SpotlightGallery';
import { TechBackdrop } from './components/TechBackdrop';
import { TechNav } from './components/TechNav';
import { useProfile } from './hooks/useProfile';

function App() {
  const { data: profile, loading, error } = useProfile();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    // Individual blocks (not whole sections) reveal as they scroll into view,
    // so content unfolds progressively. The pinned experience animates itself.
    const selector =
      '.section-header, .gallery, .skills-card, .cert-card, .education-card, ' +
      '.featured-card, .github-contributions, .contact-form, .contact-meta';
    const els = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => !el.closest('.xp-scroll'),
    );
    els.forEach((el) => el.classList.add('reveal'));
    // stagger items that share a parent (e.g. cards in a grid row)
    els.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const sibs = Array.from(parent.children).filter((c) => c.classList.contains('reveal'));
      const i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = `${Math.min(i, 4) * 110}ms`;
    });

    let raf = 0;
    const reveal = () => {
      raf = 0;
      const trigger = window.innerHeight * 0.9;
      for (const el of els) {
        if (el.classList.contains('is-in')) continue;
        if (el.getBoundingClientRect().top < trigger) el.classList.add('is-in');
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(reveal);
    };
    reveal(); // reveal whatever is already on screen at load
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [profile]);

  if (loading) {
    return (
      <div className="app-state">
        <div className="spinner" aria-hidden />
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="app-state error">
        <p>Something went wrong: {error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <TechBackdrop />
      <TechNav profile={profile} />
      <main ref={mainRef}>
        <HeroSection profile={profile} />
        <ExperienceSection experiences={profile.experience} />
        <EducationSection schools={profile.education} />
        <SpotlightGallery items={profile.spotlight} />
        <SkillsSection skills={profile.skills} />
        <CertificationsSection items={profile.certifications ?? []} />
        <FeaturedSection items={profile.featured ?? []} />
        <GithubShowcase profile={profile} />
        <ContactSection profile={profile} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
