export interface Experience {
  company: string;
  title: string;
  location?: string;
  start: string;
  end: string;
  focus?: string;
  highlights: string[];
}

export interface Education {
  school: string;
  degree: string;
  location?: string;
  period: string;
  gpa?: string;
  coursework: string[];
}

export interface SkillItem {
  name: string;
  icon?: string;
}

export type SkillEntry = SkillItem | string;

export interface Skills {
  languages: SkillEntry[];
  frameworks: SkillEntry[];
  cloud: SkillEntry[];
  tools: SkillEntry[];
}

export interface SpotlightItem {
  title: string;
  description: string;
  image?: string;
  category?: string;
  tags?: string[];
  link?: string;
}

export interface TimelineItem {
  year: string;
  label: string;
  description: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issued?: string;
  image: string;
  url?: string;
}

export interface Featured {
  title: string;
  subtitle?: string;
  source?: string;
  url: string;
}

export interface Profile {
  name: string;
  headline: string;
  location?: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  resume?: string;
  summary: string;
  specialties: string[];
  experience: Experience[];
  education: Education[];
  skills: Skills;
  spotlight: SpotlightItem[];
  timeline: TimelineItem[];
  certifications?: Certification[];
  featured?: Featured[];
}

export interface GithubRepo {
  name: string;
  description?: string;
  html_url: string;
  homepage?: string;
  stargazers_count: number;
  language?: string;
  topics: string[];
  updated_at: string;
}

export interface GithubResponse {
  query?: string;
  results: GithubRepo[];
}
