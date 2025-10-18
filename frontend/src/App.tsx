import './App.css';
import { ContactSection } from './components/ContactSection';
import { EducationSection } from './components/EducationSection';
import { ExperienceSection } from './components/ExperienceSection';
import { Footer } from './components/Footer';
import { GithubShowcase } from './components/GithubShowcase';
import { HeroSection } from './components/HeroSection';
import { SkillsSection } from './components/SkillsSection';
import { SpotlightGallery } from './components/SpotlightGallery';
import { SummarySection } from './components/SummarySection';
import { TechBackdrop } from './components/TechBackdrop';
import { TechNav } from './components/TechNav';
import { useProfile } from './hooks/useProfile';

function App() {
  const { data: profile, loading, error } = useProfile();
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
      <main>
        <HeroSection profile={profile} />
        <SummarySection profile={profile} />
        <SpotlightGallery items={profile.spotlight} />
        <ExperienceSection experiences={profile.experience} />
        <SkillsSection skills={profile.skills} />
        <EducationSection schools={profile.education} />
        <GithubShowcase />
        <ContactSection profile={profile} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
