"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { certificates } from "@/lib/site";

/* ---------------------------------------------------------------------------
   Certificates, grouped by ISSUER so the prestige reads instantly:
   Google · AWS · Adobe · Microsoft · GitHub · Siemens · Revit lead with their brand marks
   (in real brand colors — the pop of colour against the section), and the
   remaining coursework is tucked behind a "show all" toggle.
--------------------------------------------------------------------------- */

type BrandKey =
  | "google"
  | "aws"
  | "adobe"
  | "microsoft"
  | "github"
  | "siemens"
  | "revit"
  | "cpp"
  | "python"
  | "uol"
  | "ibm"
  | "pmi"
  | "iiba"
  | "linkedin";

const FEATURED: BrandKey[] = ["google", "aws", "adobe", "microsoft", "github", "siemens", "revit", "cpp", "python", "uol", "ibm"];

const BRAND: Record<BrandKey, { name: string; color: string; blurb: string }> = {
  google: { name: "Google", color: "#4285F4", blurb: "Business intelligence & search marketing" },
  aws: { name: "Amazon Web Services", color: "#FF9900", blurb: "Generative AI & cloud" },
  adobe: { name: "Adobe", color: "#FA0F00", blurb: "Creative tools — Photoshop, Illustrator, Premiere" },
  microsoft: { name: "Microsoft", color: "#00A4EF", blurb: "Data analysis" },
  github: { name: "GitHub", color: "#8b8b93", blurb: "Project management & collaboration" },
  siemens: { name: "Siemens", color: "#009999", blurb: "NX — advanced product design & engineering" },
  revit: { name: "Autodesk Revit", color: "#0696D7", blurb: "Architecture & BIM modelling" },
  cpp: { name: "C++", color: "#00599C", blurb: "Systems, game engines & performance code" },
  python: { name: "Python", color: "#3776AB", blurb: "Data, automation & AI" },
  uol: { name: "University of London", color: "#c8102e", blurb: "Discover Acting -- Royal Central School of Speech and Drama" },
  ibm: { name: "IBM", color: "#0f62fe", blurb: "Deep learning, LLMs & generative AI engineering" },
  pmi: { name: "PMI", color: "#6f7bd6", blurb: "Project management" },
  iiba: { name: "IIBA", color: "#57b894", blurb: "Business analysis" },
  linkedin: { name: "LinkedIn Learning", color: "#7ee0c3", blurb: "Development, 3D & more" },
};

function thumbOf(image: string): string {
  return image.replace(/\.png$/, "-thumb.webp");
}

function brandOf(issuer: string, title: string): BrandKey {
  // Issuer checks come first: a company's own program (e.g. Google's "IT
  // Automation with Python") must be attributed to that company, not to a
  // technology name that happens to appear in its title. Title-based checks
  // below only catch plain LinkedIn Learning courses about that technology.
  if (/Siemens/i.test(issuer) || /Siemens/i.test(title)) return "siemens";
  if (/University of London/i.test(issuer)) return "uol";
  if (/IBM/i.test(issuer)) return "ibm";
  if (/Amazon|AWS/i.test(issuer)) return "aws";
  if (/Adobe/i.test(issuer)) return "adobe";
  if (/Microsoft/i.test(issuer)) return "microsoft";
  if (/Google/i.test(issuer)) return "google";
  if (/GitHub/i.test(issuer) || /GitHub/i.test(title)) return "github";
  if (/Revit/i.test(title)) return "revit";
  if (/C\+\+/.test(title)) return "cpp";
  if (/Python/i.test(title)) return "python";
  if (/PMI/i.test(issuer)) return "pmi";
  if (/IIBA/i.test(issuer)) return "iiba";
  return "linkedin";
}

/** Recognisable brand lockups — real logo colors give the section its pop. */
function BrandLogo({ brand }: { brand: BrandKey }) {
  switch (brand) {
    case "google":
      return (
        <span className="font-sans text-3xl font-medium tracking-tight" style={{ fontFamily: "var(--font-sans), sans-serif" }}>
          <span style={{ color: "#4285F4" }}>G</span>
          <span style={{ color: "#EA4335" }}>o</span>
          <span style={{ color: "#FBBC05" }}>o</span>
          <span style={{ color: "#4285F4" }}>g</span>
          <span style={{ color: "#34A853" }}>l</span>
          <span style={{ color: "#EA4335" }}>e</span>
        </span>
      );
    case "microsoft":
      return (
        <span className="inline-flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 18 18" aria-hidden>
            <rect x="0" y="0" width="8" height="8" fill="#F25022" />
            <rect x="10" y="0" width="8" height="8" fill="#7FBA00" />
            <rect x="0" y="10" width="8" height="8" fill="#00A4EF" />
            <rect x="10" y="10" width="8" height="8" fill="#FFB900" />
          </svg>
          <span className="text-2xl font-semibold text-ink">Microsoft</span>
        </span>
      );
    case "adobe":
      return (
        <span className="inline-flex items-center gap-2.5">
          <svg width="28" height="25" viewBox="0 0 20 18" aria-hidden>
            <rect width="20" height="18" rx="4" fill="#FA0F00" />
            <path d="M8.2 4.5 4.4 13.5h1.9l.8-2h3l-1.1-2.6H8.3l1-2.4 2.6 6.9h1.9L10 4.5H8.2Z" fill="#fff" />
          </svg>
          <span className="text-2xl font-semibold" style={{ color: "#FA0F00" }}>Adobe</span>
        </span>
      );
    case "aws":
      return (
        <span className="inline-flex items-end gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-ink">aws</span>
          <svg width="34" height="13" viewBox="0 0 26 10" aria-hidden className="mb-1">
            <path d="M1 4c7 4 17 4 24 0" stroke="#FF9900" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M21 3l4 1-2 3z" fill="#FF9900" />
          </svg>
        </span>
      );
    case "siemens":
      // Siemens wordmark: heavy caps in Siemens petrol (#009999), wide tracking
      return (
        <span
          className="text-[1.7rem] font-extrabold uppercase leading-none"
          style={{ color: "#009999", letterSpacing: "0.09em", fontFamily: "var(--font-sans), sans-serif" }}
        >
          Siemens
        </span>
      );
    case "revit":
      // Official Revit icon + wordmark, "Autodesk" as the small parent label
      return (
        <span className="inline-flex items-center gap-2.5">
          {/* Official Autodesk Revit mark (supplied by Simon) */}
          <svg width="32" height="32" viewBox="0 0 512 512" aria-hidden>
            <path d="M496 479.546H88.278c-13.853 0-25.081-11.23-25.081-25.083v-335.96H496v361.043z" fill="#0b3c8f" />
            <path d="M94.276 32.454h345.501c13.853 0 25.083 11.23 25.083 25.083v335.96H94.276V32.454z" fill="#1a6afe" />
            <path d="M16 444.29l78.277-50.794V32.456L16 83.252v361.04z" fill="#699bea" />
            <path d="M240.203 211.807h30.11a42.521 42.521 0 0025.997-7.142 23.996 23.996 0 009.599-20.397v-14.341a23.829 23.829 0 00-9.599-20.34 42.506 42.506 0 00-25.998-7.2h-30.11v69.42zm113.357 80.675v23.484a38.448 38.448 0 01-15.54 2.914 37.888 37.888 0 01-20.34-5.314 42.454 42.454 0 01-14.914-17.655l-29.653-57.135h-32.91v77.19h-36.168V115.133h67.706a83.462 83.462 0 0151.08 14.456 46.163 46.163 0 0119.255 39.023v16.626a43.643 43.643 0 01-9.37 27.54 61.33 61.33 0 01-25.654 18.97l26.683 51.08a18.052 18.052 0 0017.14 9.769l2.685-.115z" fill="#fff" />
          </svg>
          <span className="flex flex-col leading-none">
            <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-faint">Autodesk</span>
            <span className="mt-0.5 text-2xl font-semibold" style={{ color: "#0696D7" }}>Revit</span>
          </span>
        </span>
      );
    case "cpp":
      // Official C++ mark: blue hexagon with white "C++", plus the wordmark
      return (
        <span className="inline-flex items-center gap-2.5">
          <svg width="28" height="32" viewBox="0 0 30 34" aria-hidden>
            <path d="M15 1 28 8.5v17L15 33 2 25.5v-17L15 1Z" fill="#00599C" />
            <path d="M15 1 28 8.5v17L15 33V1Z" fill="#004482" opacity="0.55" />
            <text x="15" y="21.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="10.5" fill="#fff">C++</text>
          </svg>
          <span className="text-2xl font-semibold" style={{ color: "#3b9de0" }}>C++</span>
        </span>
      );
    case "python":
      // Python logo: interlocked blue + yellow snakes (vector), plus wordmark
      return (
        <span className="inline-flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 128 128" aria-hidden>
            <path d="M49.33 62h29.159C86.606 62 93 55.132 93 46.981V19.183c0-7.912-6.632-13.856-14.555-15.176-5.014-.835-10.195-1.215-15.187-1.191-4.99.023-9.612.448-13.805 1.191C37.098 6.188 35 10.758 35 19.183V30h29v4H23.776c-8.484 0-15.914 5.108-18.237 14.811-2.681 11.12-2.8 17.919 0 29.53C7.614 86.983 12.569 93 21.054 93H31V79.952C31 70.315 39.428 62 49.33 62zm-1.838-39.11c-3.026 0-5.478-2.479-5.478-5.545 0-3.079 2.451-5.581 5.478-5.581 3.015 0 5.479 2.502 5.479 5.581-.001 3.066-2.465 5.545-5.479 5.545z" fill="#3776AB" />
            <path d="M122.281 48.811C120.183 40.363 116.178 34 107.682 34H97v12.981C97 57.031 88.206 65 78.489 65H49.33C41.342 65 35 72.326 35 80.326v27.8c0 7.91 6.745 12.564 14.462 14.834 9.242 2.717 17.994 3.208 29.051 0C85.901 120.892 93 116.72 93 108.126V97H64v-4h43.682c8.484 0 11.647-5.776 14.599-14.66 3.047-9.145 2.916-17.799 0-29.529zm-41.955 55.606c3.027 0 5.479 2.479 5.479 5.547 0 3.076-2.451 5.579-5.479 5.579-3.015 0-5.478-2.502-5.478-5.579 0-3.068 2.463-5.547 5.478-5.547z" fill="#FFD43B" />
          </svg>
          <span className="text-2xl font-semibold" style={{ color: "#4b8bbe" }}>Python</span>
        </span>
      );
    case "uol":
      // University of London crest (from Simon's reference image): open book on blue,
      // red cross on white, crowned Tudor rose + star in a gold sunburst at the centre.
      return (
        <span className="inline-flex items-center gap-2.5">
          <svg width="30" height="39" viewBox="0 0 100 130" aria-hidden>
            <defs>
              <clipPath id="uol-shield"><path d="M2 2h96v55c0 42-38 62-48 68C40 119 2 99 2 57V2Z" /></clipPath>
            </defs>
            <g clipPath="url(#uol-shield)">
              <rect x="0" y="0" width="100" height="130" fill="#fff" />
              <rect x="0" y="0" width="100" height="26" fill="#1b3f8f" />
              <rect x="44" y="26" width="12" height="104" fill="#d81f2a" />
              <rect x="0" y="48" width="100" height="18" fill="#d81f2a" />
              <g transform="translate(50,26)">
                <rect x="-15" y="4" width="30" height="10" rx="2" fill="#fff" stroke="#1b3f8f" strokeWidth="1.5" />
                <line x1="-11" y1="6" x2="-11" y2="12" stroke="#1b3f8f" strokeWidth="0.7" />
                <line x1="-7" y1="6" x2="-7" y2="12.5" stroke="#1b3f8f" strokeWidth="0.7" />
                <line x1="-3" y1="6" x2="-3" y2="13" stroke="#1b3f8f" strokeWidth="0.7" />
                <line x1="3" y1="6" x2="3" y2="13" stroke="#1b3f8f" strokeWidth="0.7" />
                <line x1="7" y1="6" x2="7" y2="12.5" stroke="#1b3f8f" strokeWidth="0.7" />
                <line x1="11" y1="6" x2="11" y2="12" stroke="#1b3f8f" strokeWidth="0.7" />
                <path d="M-15 6 l-6 2 6 2Z" fill="#f2a13a" />
                <path d="M15 6 l6 2-6 2Z" fill="#f2a13a" />
              </g>
              <g transform="translate(50,57)">
                <g stroke="#f2a13a" strokeWidth="1.2">
                  <line x1="0" y1="-18" x2="0" y2="18" />
                  <line x1="-18" y1="0" x2="18" y2="0" />
                  <line x1="-13" y1="-13" x2="13" y2="13" />
                  <line x1="13" y1="-13" x2="-13" y2="13" />
                </g>
                <circle cx="0" cy="0" r="9" fill="#d81f2a" />
                <circle cx="0" cy="0" r="6.4" fill="#fff" />
                <circle cx="0" cy="0" r="2.6" fill="#f2a13a" />
              </g>
            </g>
            <path d="M2 2h96v55c0 42-38 62-48 68C40 119 2 99 2 57V2Z" fill="none" stroke="#000" strokeWidth="2.5" />
          </svg>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold text-ink">University</span>
            <span className="text-lg font-bold text-ink -mt-0.5">of London</span>
          </span>
        </span>
      );
    case "ibm":
      // Plain bold wordmark in IBM blue -- safer than guessing the exact
      // 8-bar striped logo, which is easy to get subtly wrong.
      return (
        <span className="text-3xl font-black tracking-tight" style={{ color: "#0f62fe" }}>
          IBM
        </span>
      );
    case "github":
      return (
        <span className="inline-flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 16 16" aria-hidden className="text-ink" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="text-2xl font-semibold text-ink">GitHub</span>
        </span>
      );
    default:
      return <span className="text-xl font-semibold text-ink">{BRAND[brand].name}</span>;
  }
}

export function Certificates() {
  const [active, setActive] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const activeCert = active !== null ? certificates[active] : null;

  // Ranked best -> worst by `tier` (see site.ts), then original order.
  const ranked = useMemo(() => {
    const idx = certificates.map((_, i) => i);
    idx.sort((a, b) => certificates[a].tier - certificates[b].tier || a - b);
    return idx;
  }, []);

  // Multi-course programs (Professional Certificates) get their own highlighted box.
  const programs = ranked.filter((i) => certificates[i].kind === "professional-certificate");

  // Everything else grouped by brand: strong ones shown, supporting ones behind "Show more".
  const { top, more } = useMemo(() => {
    const mk = () =>
      ({
        google: [], aws: [], adobe: [], microsoft: [], github: [], siemens: [], revit: [], cpp: [], python: [], uol: [], ibm: [],
        pmi: [], iiba: [], linkedin: [],
      }) as Record<BrandKey, number[]>;
    const top = mk();
    const more = mk();
    ranked.forEach((i) => {
      const c = certificates[i];
      if (c.kind === "professional-certificate") return; // shown in the programs box
      (c.tier <= 2 ? top : more)[brandOf(c.issuer, c.title)].push(i);
    });
    return { top, more };
  }, [ranked]);

  const order = (g: Record<BrandKey, number[]>) => {
    const all = Object.keys(g) as BrandKey[];
    return [...FEATURED, ...all.filter((b) => !FEATURED.includes(b))].filter((b) => g[b].length > 0);
  };
  const topBrands = order(top);
  const moreBrands = order(more);
  const moreCount = moreBrands.reduce((n, b) => n + more[b].length, 0);

  // Card layout: the cert NAME leads, big and bold — the scanned certificate
  // itself is a small proof-of-work thumbnail tucked inside the card rather
  // than the dominant visual (it used to fill most of the card).
  const renderChip = (i: number, color: string, idx: number, brand: BrandKey) => {
    const c = certificates[i];
    return (
      <Reveal key={c.title} delay={idx} variant="scale" className="flex-1 basis-[280px]">
        <button
          type="button"
          onClick={() => setActive(i)}
          className="group relative flex h-full w-full flex-col gap-4 overflow-hidden rounded-2xl border bg-surface/40 p-4 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 md:p-5"
          style={{ borderColor: `${color}55` }}
        >
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 z-10 h-[3px] opacity-80"
            style={{ background: color }}
          />
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <span className="mb-2 block text-[0.6rem] uppercase tracking-wider2 text-faint">
                {BRAND[brand].name}
              </span>
              <span className="block text-lg font-semibold leading-tight text-ink md:text-xl">
                {c.shortTitle}
              </span>
            </div>
            {/* the scanned certificate — a small proof-of-work thumbnail */}
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-line/60 bg-white md:h-[4.5rem] md:w-24">
              <Image
                src={thumbOf(c.image)}
                alt={`${c.title} certificate`}
                fill
                sizes="96px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
              />
            </div>
          </div>
          <span className="mt-auto text-[0.62rem] uppercase tracking-wider2 text-faint">
            {c.date}
          </span>
        </button>
      </Reveal>
    );
  };

  const renderGroup = (brand: BrandKey, list: number[]) => {
    const meta = BRAND[brand];
    return (
      <div key={brand} className="relative">
        <div
          className="mb-4 flex items-center gap-3 border-l-2 pl-4"
          style={{ borderColor: meta.color }}
        >
          <BrandLogo brand={brand} />
          <span className="hidden text-xs uppercase tracking-wider2 text-faint sm:inline">
            {meta.blurb}
          </span>
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[0.6rem] font-semibold"
            style={{ background: `${meta.color}22`, color: meta.color }}
          >
            {list.length} cert{list.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          {list.map((i, idx) => renderChip(i, meta.color, idx, brand))}
        </div>
      </div>
    );
  };

  return (
    <section
      id="certificates"
      aria-label="Certificates"
      data-cursor="heart"
      data-section="certificates"
      className="relative border-y border-line/60 bg-surface/20 py-12 md:py-16 scroll-mt-24"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <SectionHeading
          kicker="Certified"
          title="Certificates"
          lede="Credentials from Google, Amazon, Adobe, Microsoft, IBM, GitHub, Siemens, Autodesk Revit, C++, Python and the University of London — plus focused coursework across 3D, code and data. Tap any card to see the certificate."
        />

        {/* PROFESSIONAL CERTIFICATES — the multi-course programs, in their own box.
            Neutral outer shell; each card carries its own issuer's colour and logo
            so they read as distinct, premium credentials rather than one flat block. */}
        {programs.length > 0 && (
          <div className="relative mt-12 overflow-hidden rounded-3xl border border-line bg-surface/30 p-5 md:p-7">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-ink/20 bg-ink px-3 py-1 text-[0.58rem] font-semibold uppercase tracking-wider2 text-bg">
                Professional Certificates
              </span>
              <span className="text-xs uppercase tracking-wider2 text-faint">
                Full multi-course programs, not single classes
              </span>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {programs.map((i) => {
                const c = certificates[i];
                const brand = brandOf(c.issuer, c.title);
                const color = BRAND[brand].color;
                return (
                  <button
                    key={c.title}
                    type="button"
                    onClick={() => setActive(i)}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border bg-bg/60 p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5"
                    style={{
                      borderColor: `${color}55`,
                      boxShadow: "0 0 0 0 transparent",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 16px 40px -12px ${color}55`)}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 0 0 transparent")}
                  >
                    {/* per-issuer glow, top-right — this is where each card gets its own vibe */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-25 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
                      style={{ background: color }}
                    />
                    <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: color }} />

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 scale-[0.62] origin-left opacity-90">
                          <BrandLogo brand={brand} />
                        </div>
                        <span className="block text-[0.6rem] uppercase tracking-wider2 text-faint">
                          {BRAND[brand].name}
                          {" · Professional Certificate"}
                          {c.courses ? ` · ${c.courses} courses` : ""}
                        </span>
                        <span className="mt-2 block text-xl font-semibold leading-tight text-ink md:text-2xl">
                          {c.shortTitle}
                        </span>
                      </div>
                      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-line/60 bg-white shadow-lg md:h-24 md:w-32">
                        <Image
                          src={thumbOf(c.image)}
                          alt={`${c.title} certificate`}
                          fill
                          sizes="128px"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                        />
                      </div>
                    </div>
                    {c.plain && (
                      <span className="relative mt-3 block text-sm leading-snug text-muted">{c.plain}</span>
                    )}
                    <span className="relative mt-4 block text-[0.62rem] uppercase tracking-wider2 text-faint">
                      {c.date}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-col gap-12">
          {topBrands.map((b) => renderGroup(b, top[b]))}
        </div>

        {moreCount > 0 && (
          <div className="mt-12">
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs uppercase tracking-wider2 text-ink transition-colors hover:text-accent"
            >
              {showAll ? "Hide" : `Show ${moreCount} more`}
              <span className={`transition-transform ${showAll ? "rotate-180" : ""}`}>↓</span>
            </button>

            <AnimatePresence initial={false}>
              {showAll && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-8 flex flex-col gap-12">
                    {moreBrands.map((b) => renderGroup(b, more[b]))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detail popup -- shows the actual certificate image */}
      <AnimatePresence>
        {activeCert && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center p-4 md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-bg/70 backdrop-blur-md"
              onClick={() => setActive(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={activeCert.title}
              initial={{ y: 60, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="glass relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl p-5 md:max-h-[80vh] md:p-8"
            >
              <button
                onClick={() => setActive(null)}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-10 w-10 min-h-10 min-w-10 items-center justify-center rounded-full border border-line bg-bg/70 text-ink backdrop-blur-sm transition-colors hover:text-accent md:right-5 md:top-5 md:h-12 md:w-12 md:min-h-12 md:min-w-12"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="relative mx-auto aspect-[4/3] w-[min(82vw,360px)] overflow-hidden rounded-xl border border-line/60 bg-white">
                  <Image
                    src={activeCert.image}
                    alt={`${activeCert.title} certificate`}
                    fill
                    sizes="min(82vw, 360px)"
                    className="object-contain"
                  />
                </div>

                <span className="kicker mt-5 block">{activeCert.category}</span>
                <h3 className="mt-2 font-serif text-xl text-ink md:text-2xl">
                  {activeCert.title}
                </h3>
                <p className="mt-2 text-[0.68rem] uppercase tracking-wider2 text-faint">
                  {activeCert.issuer} - {activeCert.date}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-muted">{activeCert.blurb}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
