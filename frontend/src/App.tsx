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
    const sections = Array.from(root.querySelectorAll<HTMLElement>(':scope > section'));
    let raf = 0;
    const reveal = () => {
      raf = 0;
      const trigger = window.innerHeight * 0.88;
      for (const section of sections) {
        if (section.classList.contains('in-view')) continue;
        if (section.getBoundingClientRect().top < trigger) section.classList.add('in-view');
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
        <SpotlightGallery items={profile.spotlight} />
        <SkillsSection skills={profile.skills} />
        <CertificationsSection items={profile.certifications ?? []} />
        <EducationSection schools={profile.education} />
        <FeaturedSection items={profile.featured ?? []} />
        <GithubShowcase profile={profile} />
        <ContactSection profile={profile} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
