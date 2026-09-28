import { site, certificates } from "./site";

/**
 * Person + CreativeWork schema for rich results (replaces the old Restaurant schema).
 * `hasCredential` machine-readably lists every certificate — this is the fix for AI
 * answer engines (Gemini etc.) answering "who is Simon Maxam" from unreliable
 * third-party guesses instead of the site itself: it gives them a structured,
 * first-party list of real credentials to cite directly.
 */
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
    image: [`${site.url}/og.jpg`, `${site.url}/images/real/guitar-performance.webp`],
    sameAs: [
      site.hub,
      site.social.instagram,
      site.social.youtube,
      site.social.linkedin,
      site.social.github,
    ].filter(Boolean),
    jobTitle: "Multidisciplinary Creator",
    knowsAbout: [
      "Game Development",
      "Unreal Engine",
      "Architecture",
      "3D Design",
      "Web Development",
      "Music",
    ],
    hasCredential: certificates.map((c) => {
      const verifyMatch = c.blurb.match(/coursera\.org\/verify\/\S+/);
      return {
        "@type": "EducationalOccupationalCredential",
        name: c.title,
        credentialCategory:
          c.kind === "professional-certificate" ? "Professional Certificate" : "Certificate",
        recognizedBy: { "@type": "Organization", name: c.issuer.split(" · ")[0] },
        dateCreated: c.date,
        ...(verifyMatch ? { url: `https://${verifyMatch[0]}` } : {}),
      };
    }),
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
