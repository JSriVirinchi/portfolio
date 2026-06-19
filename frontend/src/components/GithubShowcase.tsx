import type { Profile } from '../types';
import { SectionHeader } from './SectionHeader';
import { GithubHeatmap } from './GithubHeatmap';

interface Props {
  profile: Profile;
}

export function GithubShowcase({ profile }: Props) {
  return (
    <section className="section" id="github">
      <SectionHeader
        eyebrow="Open Source"
        title="GitHub activity"
        description="Contributions over the past year, straight from GitHub."
      />
      <GithubHeatmap profile={profile} />
    </section>
  );
}
