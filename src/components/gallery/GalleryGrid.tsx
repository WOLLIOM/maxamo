"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Photo } from "@/components/ui/Photo";
import { imageSources } from "@/lib/media";

interface Shot {
  img: string;
  alt: string;
  caption: string;
  category: string;
  ratio: string;
  /** Optional: renders as an inline <video> instead of a photo, both in the grid and the lightbox. */
  video?: string;
  poster?: string;
}

const shots: Shot[] = [
  { img: "/images/real/guitar-performance.jpg", alt: "Simon Maxam playing electric guitar on stage, black and white", caption: "Performing — Ironwood Stage, Calgary", category: "Music", ratio: "aspect-[4/5]" },
  { img: "/images/real/double-bass.jpg", alt: "Simon Maxam playing double bass in a church performance, in a tuxedo", caption: "Double bass — church recital", category: "Music", ratio: "aspect-[3/4]" },
  { img: "/images/real/friends-kinjo.jpg", alt: "Simon Maxam with a group of friends outside Kinjo", caption: "With friends at Kinjo", category: "Life", ratio: "aspect-[3/2]" },
  { img: "/images/real/friends-group.jpg", alt: "Simon Maxam and two friends at an outdoor table", caption: "Hanging out with friends", category: "Life", ratio: "aspect-[3/4]" },
  { img: "/images/real/mall-selfie.jpg", alt: "Simon Maxam taking a selfie with a friend inside a shopping mall", caption: "Mall run with a friend", category: "Life", ratio: "aspect-[3/4]" },
  { img: "/images/generated/arch-blueprint-house.png", alt: "Architectural blueprint transforming into a rendered building", caption: "Blueprint to reality", category: "Architecture", ratio: "aspect-[4/3]" },
  { img: "/images/generated/arch-revit-desk.png", alt: "Architecture workstation with Revit models on screen", caption: "Working in Revit", category: "Architecture", ratio: "aspect-[3/4]" },
  { img: "/images/generated/arch-model-lit.png", alt: "A lit architectural massing model", caption: "Massing model", category: "Architecture", ratio: "aspect-square" },
  { img: "/images/real/solaris-menu.png", alt: "SOLARIS — the game's main menu", caption: "SOLARIS — main menu", category: "Game Dev", ratio: "aspect-[4/5]" },
  { img: "/images/real/solaris-rover.png", alt: "A lunar rover on the moon in SOLARIS, with Earth on the horizon", caption: "SOLARIS — lunar surface", category: "Game Dev", ratio: "aspect-[4/3]" },
  { img: "/images/real/solaris-earth-moon.png", alt: "Earth and the Moon seen from orbit in SOLARIS", caption: "SOLARIS — Earth and Moon", category: "Game Dev", ratio: "aspect-square" },
  { img: "/images/real/solaris-library.png", alt: "An in-game library with interactive planet models in SOLARIS", caption: "SOLARIS — the study room", category: "Game Dev", ratio: "aspect-[4/3]" },
  { img: "/images/generated/code-wireframe-network.png", alt: "Abstract wireframe network representing code and web development", caption: "Building the web", category: "Web Dev", ratio: "aspect-[3/4]" },
  { img: "/images/real/climbing.jpg", alt: "Simon Maxam on an indoor climbing wall, reaching for a hold", caption: "Rock climbing", category: "Life", ratio: "aspect-[3/4]" },
  {
    img: "/video/climbing-parkour-poster.jpg",
    video: "/video/climbing-parkour.mp4",
    poster: "/video/climbing-parkour-poster.jpg",
    alt: "Simon Maxam parkour and climbing training clip",
    caption: "Parkour & climbing — training clip",
    category: "Life",
    ratio: "aspect-[9/16]",
  },
  { img: "/images/real/basketball-friend.jpg", alt: "Simon Maxam with a friend holding a high school basketball championship trophy", caption: "Celebrating a friend's championship win", category: "Life", ratio: "aspect-[3/4]" },
  { img: "/images/real/throne-portrait.jpg", alt: "Simon Maxam sitting on an oversized decorative throne at an outdoor festival", caption: "Downtown festival", category: "Life", ratio: "aspect-[3/4]" },
  { img: "/images/real/stampede-portrait.jpg", alt: "Simon Maxam at the Calgary Stampede holding a novelty item, midway lights behind him", caption: "Calgary Stampede — midway at night", category: "Life", ratio: "aspect-[4/3]" },
  { img: "/images/real/stampede-lights-1.jpg", alt: "The Calgary Stampede midway lit up at night with the Ferris wheel and rides", caption: "Stampede midway — Ferris wheel & rides", category: "Life", ratio: "aspect-[4/3]" },
  { img: "/images/real/stampede-lights-2.jpg", alt: "A crowded view of the Calgary Stampede midway from above at night", caption: "Stampede midway — the crowd below", category: "Life", ratio: "aspect-[4/3]" },
  { img: "/images/real/calgary-tower-mural.jpg", alt: "A colourful mural in downtown Calgary with the Calgary Tower in the background", caption: "Downtown Calgary — mural & the Tower", category: "Life", ratio: "aspect-[3/2]" },
  { img: "/images/real/calgary-tower-street.jpg", alt: "The Calgary Tower seen from Stephen Avenue at dusk", caption: "Calgary Tower from Stephen Ave", category: "Life", ratio: "aspect-[3/4]" },
  { img: "/images/real/travel-trabzon-1.jpg", alt: "A mosque courtyard in Trabzon, Turkey", caption: "Trabzon, Turkey — mosque courtyard", category: "Travel", ratio: "aspect-[3/4]" },
  { img: "/images/real/travel-trabzon-2.jpg", alt: "Hillside houses overlooking the Black Sea coast near Trabzon, Turkey", caption: "Trabzon — hillside above the Black Sea", category: "Travel", ratio: "aspect-[3/2]" },
  { img: "/images/real/travel-trabzon-3.jpg", alt: "Green tea plantation terraces in the hills near Trabzon, Turkey", caption: "Tea terraces in the hills", category: "Travel", ratio: "aspect-[3/4]" },
  { img: "/images/real/travel-trabzon-4.jpg", alt: "A coastal town view along the Black Sea near Trabzon, Turkey", caption: "Black Sea coastline", category: "Travel", ratio: "aspect-[3/2]" },
  { img: "/images/real/travel-trabzon-5.jpg", alt: "A mosque minaret and dome in Trabzon, Turkey", caption: "Trabzon — mosque architecture", category: "Travel", ratio: "aspect-[3/4]" },
  { img: "/images/real/travel-trabzon-6.jpg", alt: "A street scene in Trabzon, Turkey", caption: "Trabzon streets", category: "Travel", ratio: "aspect-[3/4]" },
  { img: "/images/real/travel-trabzon-7.jpg", alt: "A viewpoint over the hills of Trabzon, Turkey", caption: "Trabzon — up in the hills", category: "Travel", ratio: "aspect-[3/4]" },
  { img: "/images/real/travel-trabzon-8.jpg", alt: "A waterfront view in Trabzon, Turkey", caption: "Trabzon waterfront", category: "Travel", ratio: "aspect-[3/2]" },
];


const categories = ["All", ...Array.from(new Set(shots.map((s) => s.category)))];

export function GalleryGrid({ initialFilter = "All" }: { initialFilter?: string }) {
  const [filter, setFilter] = useState(initialFilter);
  const [open, setOpen] = useState<number | null>(null);

  const visible = shots
    .map((s, i) => ({ ...s, i }))
    .filter((s) => filter === "All" || s.category === filter);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((dir: number) => {
    setOpen((cur) => (cur === null ? cur : (cur + dir + shots.length) % shots.length));
  }, []);

  useEffect(() => {
    if (open === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
      <div className="scrollbar-none mb-10 flex gap-3 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={`shrink-0 min-h-12 rounded-full border px-5 py-3 text-[0.68rem] uppercase tracking-wider2 transition-all duration-300 ${
              filter === c
                ? "border-accent bg-accent text-bg"
                : "border-line text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {visible.map((s) => (
          <motion.button
            key={s.i}
            layout
            onClick={() => setOpen(s.i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.6 }}
            className="mb-4 block w-full break-inside-avoid text-left"
            aria-label={s.video ? `Play video: ${s.caption}` : `Open image: ${s.caption}`}
          >
            {s.video ? (
              <div className={`group relative overflow-hidden rounded-2xl bg-surface/50 ${s.ratio}`}>
                <video
                  src={s.video}
                  poster={s.poster}
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="absolute inset-0 h-full w-full object-cover"
                  onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_130%_at_50%_50%,transparent_58%,rgba(0,0,0,0.4))]" />
                <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </span>
                <span className="pointer-events-none absolute bottom-4 left-5 text-[0.62rem] uppercase tracking-wider2 text-white/85">
                  {s.caption}
                </span>
              </div>
            ) : (
              <Photo
                src={s.img}
                alt={s.alt}
                label={s.caption}
                className={s.ratio}
                parallax={false}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-bg/85 backdrop-blur-lg" onClick={close} />
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors hover:text-accent"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <button
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line text-ink transition-colors hover:text-accent md:left-8"
            >
              ‹
            </button>
            <button
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line text-ink transition-colors hover:text-accent md:right-8"
            >
              ›
            </button>

            <motion.figure
              key={open}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-[1] flex max-h-[85vh] w-full max-w-3xl flex-col items-center"
            >
              {shots[open].video ? (
                <video
                  src={shots[open].video}
                  poster={shots[open].poster}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[78vh] w-auto rounded-2xl object-contain"
                />
              ) : (
                <picture>
                  <source
                    srcSet={imageSources(shots[open].img).webp}
                    type="image/webp"
                  />
                  <img
                    src={shots[open].img}
                    alt={shots[open].alt}
                    width={1200}
                    height={1500}
                    decoding="async"
                    className="max-h-[78vh] w-auto rounded-2xl object-contain"
                  />
                </picture>
              )}
              <figcaption className="mt-4 text-center text-sm text-muted">
                {shots[open].caption}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
