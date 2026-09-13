"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { certificates } from "@/lib/site";

/* ---------------------------------------------------------------------------
   Certificates, grouped by ISSUER so the prestige reads instantly:
   Google · AWS · Adobe · Microsoft · GitHub lead with their brand marks
   (in real brand colors — the pop of colour against the section), and the
   remaining coursework is tucked behind a "show all" toggle.
--------------------------------------------------------------------------- */

type BrandKey =
  | "google"
  | "aws"
  | "adobe"
  | "microsoft"
  | "github"
  | "pmi"
  | "iiba"
  | "linkedin";

const FEATURED: BrandKey[] = ["google", "aws", "adobe", "microsoft", "github"];

const BRAND: Record<BrandKey, { name: string; color: string; blurb: string }> = {
  google: { name: "Google", color: "#4285F4", blurb: "Business intelligence & search marketing" },
  aws: { name: "Amazon Web Services", color: "#FF9900", blurb: "Generative AI & cloud" },
  adobe: { name: "Adobe", color: "#FA0F00", blurb: "Creative tools — Photoshop, Illustrator, Premiere" },
  microsoft: { name: "Microsoft", color: "#00A4EF", blurb: "Data analysis" },
  github: { name: "GitHub", color: "#8b8b93", blurb: "Project management & collaboration" },
  pmi: { name: "PMI", color: "#6f7bd6", blurb: "Project management" },
  iiba: { name: "IIBA", color: "#57b894", blurb: "Business analysis" },
  linkedin: { name: "LinkedIn Learning", color: "#7ee0c3", blurb: "Development, 3D & more" },
};

function brandOf(issuer: string, title: string): BrandKey {
  if (/Amazon|AWS/i.test(issuer)) return "aws";
  if (/Adobe/i.test(issuer)) return "adobe";
  if (/Microsoft/i.test(issuer)) return "microsoft";
  if (/Google/i.test(issuer)) return "google";
  if (/GitHub/i.test(issuer) || /GitHub/i.test(title)) return "github";
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

  // Group certificate indices by brand.
  const groups = useMemo(() => {
    const g: Record<BrandKey, number[]> = {
      google: [], aws: [], adobe: [], microsoft: [], github: [],
      pmi: [], iiba: [], linkedin: [],
    };
    certificates.forEach((c, i) => g[brandOf(c.issuer, c.title)].push(i));
    return g;
  }, []);

  const featured = FEATURED.filter((b) => groups[b].length > 0);
  const rest = (Object.keys(groups) as BrandKey[]).filter(
    (b) => !FEATURED.includes(b) && groups[b].length > 0,
  );
  const restCount = rest.reduce((n, b) => n + groups[b].length, 0);

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
                src={c.image}
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

  const renderGroup = (brand: BrandKey) => {
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
            {groups[brand].length} cert{groups[brand].length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          {groups[brand].map((i, idx) => renderChip(i, meta.color, idx, brand))}
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
      className="relative border-y border-line/60 bg-surface/20 py-16 md:py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <SectionHeading
          kicker="Certified"
          title="Certificates"
          lede="Credentials from Google, Amazon, Adobe, Microsoft and GitHub — plus focused coursework across 3D, code and data. Tap any card to see the certificate."
        />

        <div className="mt-12 flex flex-col gap-12">
          {featured.map((b) => renderGroup(b))}
        </div>

        {restCount > 0 && (
          <div className="mt-12">
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs uppercase tracking-wider2 text-ink transition-colors hover:text-accent"
            >
              {showAll ? "Hide" : `Show all ${restCount} more`}
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
                    {rest.map((b) => renderGroup(b))}
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
