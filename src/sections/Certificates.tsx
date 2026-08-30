"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { certificates } from "@/lib/site";
import { PixelCluster } from "@/components/ui/PixelCluster";
import { Photo } from "@/components/ui/Photo";

const CATEGORY_ORDER = ["3D & Design", "Development", "Data & AI", "Business"] as const;

// A representative photo/illustration beside each category, always on the
// right as a small accent next to the cards. Swap these `src` paths for your
// own images any time — see the prompts in the PR notes for what each one is
// going for.
const CATEGORY_IMAGE: Record<
  (typeof CATEGORY_ORDER)[number],
  { src: string; alt: string }
> = {
  "3D & Design": {
    src: "/images/real/cert-3d-design.webp",
    alt: "3D and design work",
  },
  Development: {
    src: "/images/real/cert-development.webp",
    alt: "Code and development work",
  },
  "Data & AI": {
    src: "/images/real/cert-data-ai.webp",
    alt: "Data and AI work",
  },
  Business: {
    src: "/images/real/cert-business.webp",
    alt: "Business and strategy work",
  },
};

// Each category gets its own permanent gradient background + glow, so the
// grid reads at a glance instead of being one uniform wall of cards — and
// the color doesn't wait for a hover to show up.
const CATEGORY_STYLE: Record<
  (typeof CATEGORY_ORDER)[number],
  { gradient: string; dot: string; label: string; titleGlow: string; border: string }
> = {
  "3D & Design": {
    gradient: "from-accent/20 via-accent/5 to-transparent",
    dot: "bg-accent",
    label: "text-accent",
    titleGlow: "text-accent [text-shadow:0_0_18px_rgba(196,162,96,0.55)]",
    border: "border-accent/30",
  },
  Development: {
    gradient: "from-[#7ee0c3]/20 via-[#7ee0c3]/5 to-transparent",
    dot: "bg-[#7ee0c3]",
    label: "text-[#7ee0c3]",
    titleGlow: "text-[#7ee0c3] [text-shadow:0_0_18px_rgba(126,224,195,0.55)]",
    border: "border-[#7ee0c3]/30",
  },
  "Data & AI": {
    gradient: "from-[#9fb4ff]/20 via-[#9fb4ff]/5 to-transparent",
    dot: "bg-[#9fb4ff]",
    label: "text-[#9fb4ff]",
    titleGlow: "text-[#9fb4ff] [text-shadow:0_0_18px_rgba(159,180,255,0.55)]",
    border: "border-[#9fb4ff]/30",
  },
  Business: {
    gradient: "from-[#e0b86a]/20 via-[#e0b86a]/5 to-transparent",
    dot: "bg-[#e0b86a]",
    label: "text-[#e0b86a]",
    titleGlow: "text-[#e0b86a] [text-shadow:0_0_18px_rgba(224,184,106,0.55)]",
    border: "border-[#e0b86a]/30",
  },
};

// Courses whose issuer/tooling is a well-known brand (Adobe, Microsoft) get a
// small colored badge next to the issuer line so they stand out from the
// generic LinkedIn Learning listings.
const BRAND_BADGE: Record<string, { label: string; className: string }> = {
  Adobe: { label: "Adobe", className: "bg-[#FF0000]/15 text-[#ff5c5c] border border-[#FF0000]/30" },
  Microsoft: { label: "Microsoft", className: "bg-[#00A4EF]/15 text-[#5fc4ff] border border-[#00A4EF]/30" },
};

function brandBadgeFor(issuer: string) {
  const brand = Object.keys(BRAND_BADGE).find((b) => issuer.includes(b));
  return brand ? BRAND_BADGE[brand] : null;
}

export function Certificates() {
  const [active, setActive] = useState<number | null>(null);
  const activeCert = active !== null ? certificates[active] : null;

  return (
    <section
      id="certificates"
      aria-label="Certificates"
      data-cursor="heart"
      data-section="certificates"
      data-palette="pink"
      className="relative border-y border-line/60 bg-surface/20 py-16 md:py-20 scroll-mt-24"
    >
      <PixelCluster
        seed={3}
        className="absolute -left-6 top-24 hidden lg:block"
      />
      <PixelCluster
        seed={9}
        className="absolute -right-6 bottom-16 hidden lg:block"
      />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHeading
          kicker="Always learning"
          title="Certificates"
          lede="Coursework completed across 3D, architecture, code and creative tools. Tap any card to see the certificate."
        />

        <div className="mt-10 flex flex-col gap-14 md:gap-16">
          {CATEGORY_ORDER.map((category) => {
            const items = certificates
              .map((c, i) => ({ ...c, i }))
              .filter((c) => c.category === category);
            if (items.length === 0) return null;
            const style = CATEGORY_STYLE[category];
            const img = CATEGORY_IMAGE[category];

            return (
              <div key={category}>
                <p className={`flex items-center gap-2 text-[0.62rem] uppercase tracking-ultra text-faint`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {category}
                </p>
                <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1 grid gap-4 sm:grid-cols-2">
                    {items.map(({ i, ...c }, idx) => {
                    const badge = brandBadgeFor(c.issuer);
                    return (
                      <Reveal key={c.title} delay={idx} className="h-full">
                        <button
                          type="button"
                          onClick={() => setActive(i)}
                          className={`group relative flex h-full min-h-[112px] w-full flex-col gap-3 overflow-hidden rounded-2xl border ${style.border} bg-gradient-to-br ${style.gradient} p-4 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:brightness-110 md:min-h-[132px] md:p-5`}
                        >
                          <span
                            aria-hidden
                            className="absolute right-4 top-4 translate-x-1 text-lg opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                          >
                            →
                          </span>
                          <span
                            className={`text-base font-bold leading-snug pr-6 md:text-lg ${style.titleGlow}`}
                          >
                            {c.shortTitle}
                          </span>
                          <span className="mt-auto flex items-center justify-between text-[0.62rem] uppercase tracking-wider2 text-faint">
                            <span className="flex items-center gap-1.5">
                              {c.issuer}
                              {badge && (
                                <span
                                  className={`rounded-full px-1.5 py-0.5 text-[0.55rem] font-semibold tracking-wide ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                              )}
                            </span>
                            <span>{c.date}</span>
                          </span>
                        </button>
                      </Reveal>
                    );
                  })}
                  </div>
                  <div className="hidden shrink-0 lg:block lg:w-[150px]">
                    <Photo
                      src={img.src}
                      alt={img.alt}
                      className="aspect-[3/4] w-full"
                      parallax={false}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
