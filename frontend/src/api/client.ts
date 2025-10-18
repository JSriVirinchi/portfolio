import type { GithubResponse, Profile } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getProfile(): Promise<Profile> {
  return request<Profile>('/api/profile');
}

export function searchRepos(query: string): Promise<GithubResponse> {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  return request<GithubResponse>(`/api/github/repos${params}`);
}

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export function sendContactMessage(payload: ContactPayload) {
  return request<{ status: string; timestamp: string }>(`/api/contact`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getResumeUrl(profile: Profile): string | undefined {
  if (!profile.resume) return undefined;
  if (profile.resume.startsWith('http')) return profile.resume;
  return `${API_BASE}/resume`;
}
