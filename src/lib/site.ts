/**
 * Single source of truth for brand, contact and SEO details.
 * Update these values to rebrand the entire site.
 */

export const site = {
  name: "SIMAX",
  nameJp: "", // removed — replace with SIMAX monogram/logo mark (S + M) instead
  tagline: "Where creativity becomes cinematic",
  // Meaning behind the name — used in the Story section.
  concept:
    "SIMAX — Simon Maxam. A creative studio where music, architecture, code, and storytelling come together to build immersive experiences.",
  description:
    "SIMAX is a multidisciplinary creative studio founded by Simon Maxam, combining 3D design, architecture visualization, music, technology, and digital experiences to create cinematic worlds and innovative solutions.",
  // Live production domain. Update this once a custom domain is attached.
  url: "https://simax.pages.dev", // placeholder — update when domain is chosen
  locale: "en_US",
  email: "", // add official contact email when available
  phoneDisplay: "",
  phone: "",
  address: {
    street: "",
    district: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    countryName: "",
  },
  geo: {
    latitude: 0,
    longitude: 0,
  },
  hours: [] as { day: string; value: string }[], // no longer used on the homepage (Visit section removed) — kept so nothing else breaks
  social: {
    instagram: "https://www.instagram.com/simonmaxam/",
    youtube: "",
    linkedin: "",
    github: "",
  },
  founded: "2026", // SIMAX studio launch
  creatorSince: "2010", // Simon's personal creative journey start
} as const;

export type NavLink = { label: string; href: string; jp?: string };

export const navLinks: NavLink[] = [
  { label: "Story", href: "/#story" },
  { label: "Work", href: "/#work" },
  { label: "Projects", href: "/gallery" },
  { label: "Awards", href: "/#awards" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const awards = [
  { year: "2024", title: "TÜBİTAK 2024 — 3rd Place (Turkey)", org: "TÜBİTAK" },
  { year: "2024", title: "TÜBİTAK 2024 — 1st Place (Province)", org: "TÜBİTAK" },
  { year: "", title: "Waterloo Award", org: "" },
  { year: "", title: "Newton Award", org: "" },
  { year: "", title: "Grade 9 Award", org: "" },
];

export type CertificateCategory =
  | "3D & Visualization"
  | "Design"
  | "Code & AI"
  | "Business & Marketing";

export type Certificate = {
  title: string;
  issuer: string;
  date: string;
  category: CertificateCategory;
  /** Short line of what the course actually covered — shown in the detail view. */
  summary: string;
  /** Skill chips, matches the source certificate. */
  skills: string[];
  /** PDF served from /public/certificates. */
  pdf: string;
  /** Optional #page=N anchor when several certificates share one PDF file. */
  pdfPage?: number;
  id: string;
};

// Grouped by discipline so the collection reads like a portfolio, not a list.
export const certificates: Certificate[] = [
  // 3D & Visualization
  { id: "blender", title: "Blender 4.0 Essential Training", issuer: "LinkedIn Learning", date: "Aug 2026", category: "3D & Visualization", summary: "Core Blender 4.0 workflow — modeling, materials and scene setup.", skills: ["Blender"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 1 },
  { id: "unreal-lighting", title: "Unreal: Introduction to Lighting", issuer: "LinkedIn Learning", date: "Aug 2026", category: "3D & Visualization", summary: "Lighting fundamentals inside Unreal Engine for real-time scenes.", skills: ["Unreal Engine"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 15 },
  { id: "revit-mep", title: "Revit 2023: Essential Training for MEP", issuer: "LinkedIn Learning", date: "Aug 2026", category: "3D & Visualization", summary: "Revit essentials for mechanical, electrical and plumbing design.", skills: ["Revit"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 12 },
  { id: "revit-unreal", title: "Revit to Unreal for Architecture, Visualization, and VR", issuer: "LinkedIn Learning", date: "Aug 2026", category: "3D & Visualization", summary: "Pipeline from Revit models into Unreal for architectural VR.", skills: ["Revit", "Unreal Engine"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 16 },

  // Design
  { id: "illustrator", title: "Essential Skills in Adobe Illustrator 2025", issuer: "LinkedIn Learning · Adobe", date: "Aug 2026", category: "Design", summary: "Professional certificate covering the Illustrator 2025 toolset.", skills: ["Adobe Illustrator"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 6 },
  { id: "photoshop", title: "Essential Skills in Adobe Photoshop 2025", issuer: "LinkedIn Learning · Adobe", date: "Aug 2026", category: "Design", summary: "Professional certificate covering Photoshop 2025 image editing.", skills: ["Adobe Photoshop", "Image Editing"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 7 },
  { id: "premiere", title: "Essential Skills in Adobe Premiere Pro 2025", issuer: "LinkedIn Learning · Adobe", date: "Aug 2026", category: "Design", summary: "Professional certificate covering non-linear video editing.", skills: ["Adobe Premiere Pro", "Video Editing", "Non-linear Editing"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 8 },

  // Code & AI
  { id: "html-css-js", title: "HTML, CSS, and JavaScript: Building the Web", issuer: "LinkedIn Learning", date: "Aug 2026", category: "Code & AI", summary: "Front-end fundamentals — semantic HTML, CSS and JavaScript.", skills: ["Web Development", "HTML", "CSS"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 17 },
  { id: "cpp-advanced", title: "C++ Development: Advanced Concepts, Lambda Expressions, and Best Practices", issuer: "LinkedIn Learning", date: "Aug 2026", category: "Code & AI", summary: "Advanced C++ patterns, lambda expressions and best practices.", skills: ["C++"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 2 },
  { id: "ai-foundations-ml", title: "Artificial Intelligence Foundations: Machine Learning", issuer: "LinkedIn Learning", date: "Aug 2026", category: "Code & AI", summary: "Machine learning fundamentals within the AI Foundations track.", skills: ["Machine Learning", "Artificial Intelligence (AI)"], pdf: "/certificates/ai-foundations-ml.pdf" },
  { id: "ai-agents-cyber", title: "AI Agents for Cybersecurity", issuer: "LinkedIn Learning", date: "Aug 2026", category: "Code & AI", summary: "Applying AI agents to cybersecurity workflows and defense.", skills: ["AI Agents", "Cybersecurity", "Artificial Intelligence (AI)"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 3 },
  { id: "prompt-engineering", title: "Prompt Engineering: How to Talk to the AIs", issuer: "LinkedIn Learning", date: "Aug 2026", category: "Code & AI", summary: "Practical prompt engineering for large language models.", skills: ["Large Language Models (LLM)", "Generative AI"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 10 },
  { id: "python-finance", title: "Getting Started with Python for Finance", issuer: "LinkedIn Learning", date: "Aug 2026", category: "Code & AI", summary: "Python fundamentals applied to financial analysis.", skills: ["Python (Programming Language)", "Financial Analysis"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 11 },

  // Business & Marketing
  { id: "data-analytics-biz", title: "Data Analytics for Business Professionals", issuer: "LinkedIn Learning · IIBA", date: "Aug 2026", category: "Business & Marketing", summary: "IIBA-endorsed data analytics for business decision-making.", skills: ["Business Analytics", "Data Analytics"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 4 },
  { id: "career-essentials-data", title: "Career Essentials in Data Analysis by Microsoft and LinkedIn", issuer: "LinkedIn Learning · Microsoft", date: "Aug 2026", category: "Business & Marketing", summary: "Microsoft/LinkedIn learning path across the full data analysis workflow.", skills: ["Data Analysis", "Data Visualization", "Data Analytics"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 5 },
  { id: "seo-advanced", title: "Advanced SEO: Developing an SEO-Friendly Website", issuer: "LinkedIn Learning", date: "Jul 2026", category: "Business & Marketing", summary: "Technical SEO strategy for building search-friendly sites.", skills: ["Search Engine Optimization (SEO)"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 13 },
  { id: "pm-foundations", title: "Project Management Foundations", issuer: "LinkedIn Learning · PMI", date: "Aug 2026", category: "Business & Marketing", summary: "PMI-registered introduction to core project management practice.", skills: ["Project Management"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 9 },
  { id: "solution-sales", title: "Solution Sales", issuer: "LinkedIn Learning", date: "Aug 2026", category: "Business & Marketing", summary: "Solution-selling technique for consultative sales conversations.", skills: ["Solution Selling"], pdf: "/certificates/linkedin-learning.pdf", pdfPage: 14 },
  { id: "google-ads-search", title: "Google Ads Search Professional Certification", issuer: "Google", date: "Aug 2026", category: "Business & Marketing", summary: "Google-certified proficiency in running Search ad campaigns.", skills: ["Google Ads", "Search Marketing"], pdf: "/certificates/google-ads-search.pdf" },
  { id: "google-ai-performance-ads", title: "AI-Powered Performance Ads Certification", issuer: "Google", date: "Aug 2026", category: "Business & Marketing", summary: "Google-certified proficiency in AI-driven performance ad campaigns.", skills: ["Google Ads", "AI-Powered Ads"], pdf: "/certificates/google-ai-powered-performance-ads.pdf" },
];
