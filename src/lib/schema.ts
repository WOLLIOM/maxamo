import { site } from "./site";

/** Person + CreativeWork schema for rich results (replaces the old Restaurant schema). */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.url}/#person`,
    name: "Simon Maxam",
    alternateName: site.name, // "SIMAX"
    description: site.description,
    url: site.url,
    email: site.email || undefined,
    image: [`${site.url}/og.jpg`],
    sameAs: [site.social.instagram, site.social.youtube, site.social.linkedin, site.social.github].filter(
      Boolean
    ),
    jobTitle: "Multidisciplinary Creator",
    knowsAbout: [
      "Game Development",
      "Unreal Engine",
      "Architecture",
      "3D Design",
      "Web Development",
      "Music",
    ],
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: "en",
  };
}
