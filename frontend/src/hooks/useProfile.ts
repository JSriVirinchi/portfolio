import profileData from '../data/profile.json';
import type { Profile } from '../types';

// Profile content is bundled with the frontend, so the page renders instantly
// from the CDN with no backend round-trip (no cold-start delay on load).
const profile = profileData as unknown as Profile;

export function useProfile() {
  return { data: profile, loading: false, error: undefined as string | undefined };
}
