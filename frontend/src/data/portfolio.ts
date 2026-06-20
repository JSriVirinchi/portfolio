// Presentation view-model for the scroll-driven portfolio.
// Content mirrors profile.json but adds curated display fields the design needs
// (logos, rounded metrics, accent gradients, short labels). Logos resolve from
// /public; cert badges use the live Credly images.

export interface XpMetric {
  display: string;
  value: number;
  suffix: string;
  label: string;
}

export interface XpRole {
  no: string;
  short: string;
  year: string;
  tag: string;
  company: string;
  title: string;
  period: string;
  logo: string;
  focus: string;
  metrics: XpMetric[];
  highlights: string[];
}

export interface EduItem {
  school: string;
  degree: string;
  location: string;
  period: string;
  gpa: string;
  logo: string;
  coursework: string[];
}

export interface SpotlightItem {
  title: string;
  category: string;
  image: string;
  accent: string;
  description: string;
  tags: string[];
}

export interface SkillItem {
  name: string;
  icon?: string;
}

export interface SkillGroup {
  name: string;
  items: SkillItem[];
}

export interface CertItem {
  name: string;
  issuer: string;
  image: string;
  url: string;
}

export interface FeaturedItem {
  title: string;
  subtitle: string;
  source: string;
  url: string;
}

export interface PortfolioData {
  name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  mailto: string;
  linkedin: string;
  github: string;
  resume: string;
  summary: string;
  specialties: string[];
  statements: string[];
  experience: XpRole[];
  education: EduItem[];
  spotlight: SpotlightItem[];
  skillGroups: SkillGroup[];
  certifications: CertItem[];
  featured: FeaturedItem[];
  languages: SkillItem[];
}

const dv = (slug: string) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}`;

export const PORTFOLIO: PortfolioData = {
  name: 'Satya Sri Virinchi Junuthula',
  headline: 'Software Development Engineer · AWS EC2 Auto Scaling',
  location: 'Seattle, WA, USA',
  email: 'virinchi.junuthula@gmail.com',
  phone: '+1 602 691 9735',
  mailto: 'mailto:virinchi.junuthula@gmail.com',
  linkedin: 'https://linkedin.com/in/virinchi-junuthula-21734618a',
  github: 'https://github.com/JsriVirinchi',
  resume: 'https://drive.google.com/file/d/1qZYc6x7CtHNlfUDe06WqT66zfguqjFHh/view',
  summary:
    'Builder focused on resilient cloud-native experiences, currently crafting data-driven scaling workflows for AWS EC2 Auto Scaling. Passionate about purposeful UX, thoughtful automation, and measurable engineering impact.',
  specialties: ['AWS', 'Amazon Robotics', 'Arizona State University', 'BITS Pilani', 'Quantiphi'],
  statements: [
    'orchestrate resilient cloud-native experiences',
    'infuse automation with human-centered design',
    'ship data-driven products with measurable impact',
  ],
  experience: [
    {
      no: '01', short: 'AWS', year: '’24', tag: 'Seattle, WA',
      company: 'Amazon Web Services', title: 'Software Development Engineer',
      period: 'Jul 2024 — Present', logo: '/images/aws.png',
      focus: 'Global instance-refresh & scaling guardrails',
      metrics: [
        { display: '4M+', value: 4, suffix: 'M+', label: 'customers served globally' },
        { display: '6000+', value: 6000, suffix: '+', label: 'runtime defects eliminated' },
        { display: '90%', value: 90, suffix: '%', label: 'test coverage held' },
      ],
      highlights: [
        'Shipped Bake Time and ODCR-aware instance refresh across all AWS regions, aligning Auto Scaling with enterprise change controls.',
        'Built attribute-based instance selection spanning 15+ EC2 dimensions.',
        'Raised accessibility & observability for the AnyScale widget via CloudWatch dashboards and policy automation.',
      ],
    },
    {
      no: '02', short: 'Robotics', year: '’24', tag: 'Boston, MA',
      company: 'Amazon Robotics', title: 'Software Development Engineer',
      period: 'Jan 2024 — Jul 2024', logo: '/images/amazon.webp',
      focus: 'Simulation tooling',
      metrics: [
        { display: '20%', value: 20, suffix: '%', label: 'ops efficiency gain' },
        { display: '40%', value: 40, suffix: '%', label: 'faster simulation setup' },
        { display: '30%', value: 30, suffix: '%', label: 'faster investigations' },
      ],
      highlights: [
        'Built Concept Explorer dashboards surfacing multi-account simulation health.',
        'Delivered lifecycle controls with auto-save, clone & templating workflows.',
        'Designed accessible multi-format file workflows with end-to-end telemetry.',
      ],
    },
    {
      no: '03', short: 'ASU', year: '’23', tag: 'Tempe, AZ · Hybrid',
      company: 'ASU Decision Theater', title: 'Data Analyst',
      period: 'Jan 2023 — Jan 2024', logo: '/images/asu-dtn.jpg',
      focus: 'NLP topic modeling & semantic clustering',
      metrics: [],
      highlights: [
        'Applied Top2Vec — word embeddings with HDBSCAN clustering — to PubMed COVID data, determining the optimal number of topics via semantic clustering for thorough topic identification and analysis.',
      ],
    },
    {
      no: '04', short: 'Quantiphi', year: '’21', tag: 'Bengaluru, India',
      company: 'Quantiphi', title: 'Machine Learning Engineer',
      period: 'Jul 2021 — Apr 2022', logo: '/images/quantiphi.jpg',
      focus: 'Conversational AI accelerators',
      metrics: [
        { display: '90%', value: 90, suffix: '%', label: 'more successful bookings' },
        { display: '82%', value: 82, suffix: '%', label: 'ASR transcription accuracy' },
      ],
      highlights: [
        'Crafted a GPT/BERT-backed appointment chatbot whose NLU lifted successful scheduling by 90%.',
        'Led ASR enablement for Fox Sports showcases, hitting 82% accuracy with hybrid data synthesis.',
      ],
    },
    {
      no: '05', short: 'ReferralYogi', year: '’20', tag: 'Chennai, India',
      company: 'ReferralYogi', title: 'Fullstack Web Developer',
      period: 'Aug 2020 — Jan 2021', logo: '/images/referralyogi.png',
      focus: 'WhatsApp automation studio',
      metrics: [
        { display: '40%', value: 40, suffix: '%', label: 'engagement uplift' },
      ],
      highlights: [
        'Launched a drag-and-drop WhatsApp chatbot builder with multi-language, multi-bot orchestration.',
        'Integrated real-time agent handoff and analytics across a global user base.',
      ],
    },
  ],
  education: [
    {
      school: 'Arizona State University', degree: 'M.S. Information Technology',
      location: 'Tempe, AZ', period: 'Aug 2022 — May 2024', gpa: '4.0', logo: '/images/asu.png',
      coursework: ['Advanced Big Data Analytics & AI', 'Cloud Architecture', 'Advanced Database Management', 'Cyber Security', 'Managing IoT Devices'],
    },
    {
      school: 'BITS Pilani', degree: 'B.E. Mechanical Engineering',
      location: 'Pilani, India', period: 'Aug 2017 — May 2021', gpa: '8.03', logo: '/images/bits.png',
      coursework: ['Computer Programming', 'Object-Oriented Programming'],
    },
  ],
  spotlight: [
    { title: 'Bake Time & ODCR Rollouts', category: 'AWS · EC2 Auto Scaling', image: '/images/aws.png', accent: 'linear-gradient(150deg,#1a2a52,#0a1530)', description: 'Shipped Bake Time and On-Demand Capacity Reservation–aware instance refresh across all AWS regions, aligning Auto Scaling with enterprise change controls.', tags: ['AWS', 'TypeScript', 'React'] },
    { title: 'Attribute-Based Instance Selection', category: 'AWS · EC2 Auto Scaling', image: '/images/aws.png', accent: 'linear-gradient(150deg,#1a2a52,#0a1530)', description: 'Built attribute-based instance selection spanning 15+ EC2 dimensions, driving a 20% adoption increase for stateful fleets.', tags: ['AWS', 'React', 'Telemetry'] },
    { title: 'Concept Explorer Simulation Hub', category: 'Amazon Robotics', image: '/images/amazon.webp', accent: 'linear-gradient(150deg,#3a2a12,#1a1206)', description: 'Unified multi-account robotics simulation telemetry with drill-down dashboards and lifecycle controls — unlocking 20% ops efficiency gains.', tags: ['React', 'Dashboards', 'Simulation'] },
    { title: 'Top2Vec COVID Topic Modeling', category: 'ASU Decision Theater', image: '/images/asu-dtn.jpg', accent: 'linear-gradient(150deg,#4a1a22,#1f0a10)', description: 'Applied Top2Vec — word embeddings with HDBSCAN clustering — to PubMed COVID data to find the optimal number of topics via semantic clustering.', tags: ['Python', 'NLP', 'HDBSCAN'] },
    { title: 'Clinical Scheduling Assistant', category: 'Quantiphi', image: '/images/quantiphi.jpg', accent: 'linear-gradient(150deg,#13324a,#08161f)', description: 'Crafted a GPT/BERT-backed appointment chatbot whose NLU lifted successful scheduling conversions by 90%.', tags: ['GPT', 'BERT', 'NLU'] },
    { title: 'WhatsApp Automation Studio', category: 'ReferralYogi', image: '/images/referralyogi.png', accent: 'linear-gradient(150deg,#143a2a,#081f14)', description: 'Launched a drag-and-drop WhatsApp chatbot builder with multi-bot orchestration and real-time agent handoff — a 40% engagement uplift.', tags: ['Node.js', 'Automation', 'Realtime'] },
  ],
  skillGroups: [
    { name: 'Languages', items: [
      { name: 'Python', icon: dv('python/python-original.svg') },
      { name: 'TypeScript', icon: dv('typescript/typescript-original.svg') },
      { name: 'JavaScript', icon: dv('javascript/javascript-original.svg') },
      { name: 'C', icon: dv('c/c-original.svg') },
      { name: 'C++', icon: dv('cplusplus/cplusplus-original.svg') },
      { name: 'Ruby', icon: dv('ruby/ruby-original.svg') },
      { name: 'HTML', icon: dv('html5/html5-original.svg') },
      { name: 'CSS', icon: dv('css3/css3-original.svg') },
    ] },
    { name: 'Frameworks', items: [
      { name: 'React', icon: dv('react/react-original.svg') },
      { name: 'AngularJS', icon: dv('angularjs/angularjs-original.svg') },
      { name: 'Node.js', icon: dv('nodejs/nodejs-original.svg') },
      { name: 'FastAPI', icon: dv('fastapi/fastapi-original.svg') },
      { name: 'Ruby on Rails', icon: dv('rails/rails-plain.svg') },
    ] },
    { name: 'ML & Tools', items: [
      { name: 'Redux', icon: dv('redux/redux-original.svg') },
      { name: 'TensorFlow', icon: dv('tensorflow/tensorflow-original.svg') },
      { name: 'Keras', icon: dv('keras/keras-original.svg') },
      { name: 'Scikit-learn', icon: dv('scikitlearn/scikitlearn-original.svg') },
      { name: 'Pandas', icon: dv('pandas/pandas-original.svg') },
      { name: 'Docker', icon: dv('docker/docker-original.svg') },
      { name: 'Kubernetes', icon: dv('kubernetes/kubernetes-plain.svg') },
      { name: 'Dialogflow' },
    ] },
    { name: 'Cloud', items: [
      { name: 'AWS', icon: '/icons/aws.svg' },
      { name: 'GCP', icon: dv('googlecloud/googlecloud-original.svg') },
    ] },
  ],
  certifications: [
    { name: 'AWS Certified Generative AI Developer – Professional', issuer: 'Amazon Web Services Training and Certification', image: 'https://images.credly.com/size/340x340/images/52c6e5ac-9516-4944-a4df-e31b23c9bbf2/blob', url: 'https://www.credly.com/badges/fd7bb99b-0aad-432d-9a16-7d07637f8c88/public_url' },
    { name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services Training and Certification', image: 'https://images.credly.com/size/340x340/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png', url: 'https://www.credly.com/badges/9775963b-75a4-47a1-9ef6-1b5b7a0ba90f/public_url' },
  ],
  featured: [
    { title: 'UW Buerk Student Startup Challenge', subtitle: 'Featured by Ankit Roshan Talluri', source: 'LinkedIn', url: 'https://www.linkedin.com/posts/ankit-roshan-talluri-08866a318_stundentstartup-uw-buerk-activity-7278501976869425152-7ire/' },
    { title: 'Seattle Data, AI & Security — Ambition Intelligence', subtitle: 'Community event highlight', source: 'LinkedIn', url: 'https://www.linkedin.com/posts/seattle-data-ai-and-security_ambition-intelligence-ugcPost-7406867456113205248-1Kl7/' },
    { title: 'Carnegie Mellon — NexHacks', subtitle: 'Hackathon feature', source: 'LinkedIn', url: 'https://www.linkedin.com/posts/ramanpreetsinghkhinda_carnegiemellonuniversity-nexhacks-cmu-activity-7420336588171149312-YedD/' },
    { title: 'Community Highlight', subtitle: 'LinkedIn feature', source: 'LinkedIn', url: 'https://www.linkedin.com/posts/activity-7398919072609906690-APtL/' },
  ],
  languages: [
    { name: 'Python', icon: dv('python/python-original.svg') },
    { name: 'TypeScript', icon: dv('typescript/typescript-original.svg') },
    { name: 'JavaScript', icon: dv('javascript/javascript-original.svg') },
    { name: 'React', icon: dv('react/react-original.svg') },
    { name: 'Docker', icon: dv('docker/docker-original.svg') },
  ],
};
