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
    "Simon Maxam is a web developer and 3D artist in Calgary building immersive websites, interactive 3D worlds, and games using Three.js, Blender, and Unreal Engine 5.",
  // Canonical home of the SIMAX portfolio. This is the URL Google already
  // ranks #1 for "Simon Maxam", so it's the main one; the Vercel deploy below
  // serves the same site and canonicalises here so all authority consolidates.
  url: "https://simonmaxam.pages.dev",
  // Mirror deployment (same site, different host).
  hub: "https://maxam.vercel.app",
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
    linkedin: "https://www.linkedin.com/in/simonmaxam/",
    github: "https://github.com/wolliom",
  },
  founded: "2026", // SIMAX studio launch
  creatorSince: "2010", // Simon's personal creative journey start
} as const;

export type NavLink = { label: string; href: string; jp?: string };

// Music-only site: nav trimmed to the music sections + contact.
// Full portfolio nav preserved below for easy restore.
export const navLinks: NavLink[] = [
  { label: "Music", href: "/#music" },
  { label: "Guitar", href: "/#guitar" },
  { label: "Contact", href: "/contact" },
];

export const fullNavLinks: NavLink[] = [
  { label: "Story", href: "/#story" },
  { label: "Work", href: "/#work" },
  { label: "Projects", href: "/gallery" },
  { label: "Awards", href: "/#awards" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Consolidated per Simon's feedback: the two TÜBİTAK placements are one
// award, not two; Waterloo + Newton were the same award under two names
// (the Waterloo Newtonian Medal); the Grade 9 award was dropped entirely.
export const awards = [
  {
    year: "2024",
    title: "TÜBİTAK",
    org: "1st Place (Province) · 3rd Place (Turkey)",
  },
  {
    year: "",
    title: "Waterloo Newtonian Medal",
    org: "University of Waterloo (CEMC)",
  },
];

// Most relevant to the work shown on the site (3D/architecture/design)
// float to the top; the rest follow in completion order. Grouped by
// category so related certificates sit beside each other on the page.
export const certificates: {
  title: string;
  shortTitle: string;
  image: string;
  issuer: string;
  date: string;
  category: "3D & Design" | "Development" | "Data & AI" | "Business";
  blurb: string;
}[] = [
  {
    title: "Amazon Bedrock Customization, Optimization & Automation",
    shortTitle: "Amazon Bedrock Certificate",
    image: "/certificates/amazon-bedrock.png",
    issuer: "Amazon Web Services",
    date: "Sep 2026",
    category: "Data & AI",
    blurb:
      "Advanced generative AI on AWS — model fine-tuning, optimization, and automated evaluation with Amazon Bedrock.",
  },
  {
    title: "Google Business Intelligence",
    shortTitle: "Google Business Intelligence",
    image: "/certificates/google-business-intelligence.png",
    issuer: "Google · Coursera",
    date: "Sep 2026",
    category: "Data & AI",
    blurb:
      "Google's professional certificate in business intelligence — data pipelines, dashboards, and turning data into decisions.",
  },
  {
    title: "Practical GitHub Project Management and Collaboration",
    shortTitle: "GitHub Project Management",
    image: "/certificates/github-pm.png",
    issuer: "GitHub",
    date: "Aug 2026",
    category: "Development",
    blurb:
      "Managing software projects and collaborating with issues, pull requests and project boards on GitHub.",
  },
  {
    title: "Revit to Unreal for Architecture, Visualization, and VR",
    shortTitle: "Revit to Unreal Certificate",
    image: "/certificates/revit-to-unreal.png",
    issuer: "LinkedIn Learning",
    date: "Aug 2026",
    category: "3D & Design",
    blurb:
      "Workflow for taking a Revit architectural model into Unreal Engine for real-time visualization and VR — the pipeline behind the Frank Architecture & Interiors work on this site.",
  },
  {
    title: "Revit 2023: Essential Training for MEP",
    shortTitle: "Revit MEP Certificate",
    image: "/certificates/revit-2023-mep.png",
    issuer: "LinkedIn Learning",
    date: "Aug 2026",
    category: "3D & Design",
    blurb: "Mechanical, electrical and plumbing modeling fundamentals in Revit 2023.",
  },
  {
    title: "Unreal: Introduction to Lighting",
    shortTitle: "Unreal Lighting Certificate",
    image: "/certificates/unreal-lighting.png",
    issuer: "LinkedIn Learning",
    date: "Aug 2026",
    category: "3D & Design",
    blurb: "Lighting fundamentals in Unreal Engine — the same engine SOLARIS is built in.",
  },
  {
    title: "Blender 4.0 Essential Training",
    shortTitle: "Blender Certificate",
    image: "/certificates/blender-4.png",
    issuer: "LinkedIn Learning",
    date: "Aug 2026",
    category: "3D & Design",
    blurb: "Core modeling, materials and rendering in Blender 4.0.",
  },
  {
    title: "Essential Skills in Adobe Illustrator 2025",
    shortTitle: "Illustrator Certificate",
    image: "/certificates/adobe-illustrator.png",
    issuer: "LinkedIn Learning · Adobe",
    date: "Aug 2026",
    category: "3D & Design",
    blurb: "Professional certificate covering vector illustration and design in Illustrator 2025.",
  },
  {
    title: "Essential Skills in Adobe Photoshop 2025",
    shortTitle: "Photoshop Certificate",
    image: "/certificates/adobe-photoshop.png",
    issuer: "LinkedIn Learning · Adobe",
    date: "Aug 2026",
    category: "3D & Design",
    blurb: "Professional certificate covering image editing and compositing in Photoshop 2025.",
  },
  {
    title: "Essential Skills in Adobe Premiere Pro 2025",
    shortTitle: "Premiere Pro Certificate",
    image: "/certificates/adobe-premiere.png",
    issuer: "LinkedIn Learning · Adobe",
    date: "Aug 2026",
    category: "3D & Design",
    blurb: "Professional certificate covering non-linear video editing in Premiere Pro 2025.",
  },
  {
    title: "HTML, CSS, and JavaScript: Building the Web",
    shortTitle: "Web Development Certificate",
    image: "/certificates/html-css-js.png",
    issuer: "LinkedIn Learning",
    date: "Aug 2026",
    category: "Development",
    blurb: "Core front-end fundamentals — the same stack this portfolio site is built on.",
  },
  {
    title: "C++ Development: Advanced Concepts, Lambda Expressions, and Best Practices",
    shortTitle: "C++ Certificate",
    image: "/certificates/cpp-advanced.png",
    issuer: "LinkedIn Learning",
    date: "Aug 2026",
    category: "Development",
    blurb: "Advanced C++ — lambdas, modern best practices, deeper language concepts.",
  },
  {
    title: "Artificial Intelligence Foundations: Machine Learning",
    shortTitle: "Machine Learning Certificate",
    image: "/certificates/ai-foundations-ml.png",
    issuer: "LinkedIn Learning",
    date: "Aug 2026",
    category: "Data & AI",
    blurb: "Core machine learning concepts and how AI systems are trained.",
  },
  {
    title: "AI Agents for Cybersecurity",
    shortTitle: "AI Cybersecurity Certificate",
    image: "/certificates/ai-agents-cybersecurity.png",
    issuer: "LinkedIn Learning",
    date: "Aug 2026",
    category: "Data & AI",
    blurb: "How AI agents are applied to cybersecurity monitoring and response.",
  },
  {
    title: "Prompt Engineering: How to Talk to the AIs",
    shortTitle: "Prompt Engineering Certificate",
    image: "/certificates/prompt-engineering.png",
    issuer: "LinkedIn Learning",
    date: "Aug 2026",
    category: "Data & AI",
    blurb: "Practical techniques for getting reliable output from large language models.",
  },
  {
    title: "Career Essentials in Data Analysis by Microsoft and LinkedIn",
    shortTitle: "Data Analysis Certificate",
    image: "/certificates/data-analysis-microsoft.png",
    issuer: "LinkedIn Learning · Microsoft",
    date: "Aug 2026",
    category: "Data & AI",
    blurb: "Microsoft/LinkedIn learning path covering data analysis and visualization fundamentals.",
  },
  {
    title: "Data Analytics for Business Professionals",
    shortTitle: "Data Analytics Certificate",
    image: "/certificates/data-analytics-business.png",
    issuer: "LinkedIn Learning · IIBA",
    date: "Aug 2026",
    category: "Data & AI",
    blurb: "IIBA-endorsed course on applying data analytics to business decisions.",
  },
  {
    title: "Getting Started with Python for Finance",
    shortTitle: "Python for Finance Certificate",
    image: "/certificates/python-finance.png",
    issuer: "LinkedIn Learning",
    date: "Aug 2026",
    category: "Data & AI",
    blurb: "Python fundamentals applied to financial analysis.",
  },
  {
    title: "Google Ads Search Professional Certification",
    shortTitle: "Google Ads Search Certificate",
    image: "/certificates/google-ads-search.png",
    issuer: "Google · Skillshop",
    date: "Aug 2026",
    category: "Business",
    blurb: "Google Ads Search expertise — search campaigns, optimization, and performance measurement.",
  },
  {
    title: "Advanced SEO: Developing an SEO-Friendly Website",
    shortTitle: "SEO Certificate",
    image: "/certificates/advanced-seo.png",
    issuer: "LinkedIn Learning",
    date: "Jul 2026",
    category: "Business",
    blurb: "Technical SEO practices for building and structuring a search-friendly website.",
  },
  {
    title: "Project Management Foundations",
    shortTitle: "Project Management Certificate",
    image: "/certificates/project-management.png",
    issuer: "LinkedIn Learning · PMI",
    date: "Aug 2026",
    category: "Business",
    blurb: "PMI-aligned foundations of project management — scope, timeline and delivery.",
  },
  {
    title: "Solution Sales",
    shortTitle: "Solution Sales Certificate",
    image: "/certificates/solution-sales.png",
    issuer: "LinkedIn Learning",
    date: "Aug 2026",
    category: "Business",
    blurb: "Fundamentals of solution-based, consultative selling.",
  },
];
