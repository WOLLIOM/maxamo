"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { certificates, type Certificate, type CertificateCategory } from "@/lib/site";

const categories: (CertificateCategory | "All")[] = [
  "All",
  "3D & Visualization",
  "Design",
  "Code & AI",
  "Business & Marketing",
];

/** Tilts + lifts a card toward the cursor — the "3D collection" feel. */
function CertCard({ cert, i, onOpen }: { cert: Certificate; i: number; onOpen: () => void }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: py * -10, y: px * 12 });
  }

  return (
    <Reveal delay={i} className="h-full">
      <motion.button
        type="button"
        onClick={onOpen}
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        animate={{ rotateX: tilt.x, rotateY: tilt.y, scale: tilt.x || tilt.y ? 1.035 : 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        style={{ transformStyle: "preserve-3d", perspective: 800 }}
        className="glass group flex h-full w-full flex-col gap-3 rounded-2xl border border-line/60 p-5 text-left transition-colors hover:border-gold/50 focus-visible:border-gold/60 focus-visible:outline-none"
      >
        <span className="text-[0.6rem] uppercase tracking-wider2 text-gold/80">
          {cert.category}
        </span>
        <span className="text-sm font-medium leading-snug text-ink">{cert.title}</span>
        <span className="mt-auto flex items-center justify-between text-[0.62rem] uppercase tracking-wider2 text-faint">
          <span>{cert.issuer}</span>
          <span>{cert.date}</span>
        </span>
      </motion.button>
    </Reveal>
  );
}

function CertDetail({ cert, onBack }: { cert: Certificate; onBack: () => void }) {
  const href = cert.pdfPage ? `${cert.pdf}#page=${cert.pdfPage}` : cert.pdf;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-wider2 text-faint transition-colors hover:text-gold"
      >
        ← Back to certificates
      </button>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-line/60 bg-surface/40">
          <iframe
            src={href}
            title={cert.title}
            className="h-[70vh] w-full min-h-[420px]"
            loading="lazy"
          />
        </div>

        <div className="glass flex flex-col gap-4 rounded-2xl border border-line/60 p-6">
          <span className="text-[0.62rem] uppercase tracking-wider2 text-gold/80">
            {cert.category}
          </span>
          <h3 className="font-serif text-2xl text-ink">{cert.title}</h3>
          <p className="text-sm leading-relaxed text-faint">{cert.summary}</p>
          <div className="flex flex-wrap gap-2">
            {cert.skills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-line/60 px-3 py-1 text-[0.62rem] uppercase tracking-wider2 text-faint"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-line/40 pt-4 text-[0.62rem] uppercase tracking-wider2 text-faint">
            <span>{cert.issuer}</span>
            <span>{cert.date}</span>
          </div>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-[0.68rem] uppercase tracking-wider2 text-gold transition-opacity hover:opacity-70"
          >
            Open PDF in new tab ↗
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export function Certificates() {
  const [active, setActive] = useState<CertificateCategory | "All">("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (active === "All" ? certificates : certificates.filter((c) => c.category === active)),
    [active],
  );
  const openCert = certificates.find((c) => c.id === openId) ?? null;

  return (
    <section
      id="certificates"
      aria-label="Certificates"
      className="border-y border-line/60 bg-surface/20 py-16 md:py-20 scroll-mt-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHeading
          kicker="Always learning"
          title="Certificates"
          lede="A collection spanning 3D & visualization, design, code & AI, and business — click any card for the full certificate."
        />

        <AnimatePresence mode="wait">
          {openCert ? (
            <CertDetail key={openCert.id} cert={openCert} onBack={() => setOpenId(null)} />
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mt-8 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActive(cat)}
                    className={`rounded-full border px-4 py-1.5 text-[0.65rem] uppercase tracking-wider2 transition-colors ${
                      active === cat
                        ? "border-gold/70 bg-gold/10 text-gold"
                        : "border-line/60 text-faint hover:text-ink"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((c, i) => (
                  <CertCard key={c.id} cert={c} i={i} onOpen={() => setOpenId(c.id)} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
