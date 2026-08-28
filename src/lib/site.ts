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

// Most relevant to the work shown on the site (3D/architecture/design)
// float to the top; the rest follow in completion order.
export const certificates = [
  { title: "Revit to Unreal for Architecture, Visualization, and VR", issuer: "LinkedIn Learning", date: "Aug 2026" },
  { title: "Revit 2023: Essential Training for MEP", issuer: "LinkedIn Learning", date: "Aug 2026" },
  { title: "Unreal: Introduction to Lighting", issuer: "LinkedIn Learning", date: "Aug 2026" },
  { title: "Blender 4.0 Essential Training", issuer: "LinkedIn Learning", date: "Aug 2026" },
  { title: "Essential Skills in Adobe Illustrator 2025", issuer: "LinkedIn Learning · Adobe", date: "Aug 2026" },
  { title: "Essential Skills in Adobe Photoshop 2025", issuer: "LinkedIn Learning · Adobe", date: "Aug 2026" },
  { title: "Essential Skills in Adobe Premiere Pro 2025", issuer: "LinkedIn Learning · Adobe", date: "Aug 2026" },
  { title: "HTML, CSS, and JavaScript: Building the Web", issuer: "LinkedIn Learning", date: "Aug 2026" },
  { title: "C++ Development: Advanced Concepts, Lambda Expressions, and Best Practices", issuer: "LinkedIn Learning", date: "Aug 2026" },
  { title: "Artificial Intelligence Foundations: Machine Learning", issuer: "LinkedIn Learning", date: "Aug 2026" },
  { title: "AI Agents for Cybersecurity", issuer: "LinkedIn Learning", date: "Aug 2026" },
  { title: "Prompt Engineering: How to Talk to the AIs", issuer: "LinkedIn Learning", date: "Aug 2026" },
  { title: "Career Essentials in Data Analysis by Microsoft and LinkedIn", issuer: "LinkedIn Learning · Microsoft", date: "Aug 2026" },
  { title: "Data Analytics for Business Professionals", issuer: "LinkedIn Learning · IIBA", date: "Aug 2026" },
  { title: "Getting Started with Python for Finance", issuer: "LinkedIn Learning", date: "Aug 2026" },
  { title: "Advanced SEO: Developing an SEO-Friendly Website", issuer: "LinkedIn Learning", date: "Jul 2026" },
  { title: "Project Management Foundations", issuer: "LinkedIn Learning · PMI", date: "Aug 2026" },
  { title: "Solution Sales", issuer: "LinkedIn Learning", date: "Aug 2026" },
];
