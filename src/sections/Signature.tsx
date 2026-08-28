import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { FeaturedBadge } from "@/components/ui/Badges";

const featured: {
  name: string;
  desc: string;
  img: string;
  alt: string;
  tag: string;
  spotlight?: boolean;
}[] = [
  {
    name: "SOLARIS",
    desc: "A space-exploration educational game built in Unreal Engine and Blender over two years — planets, environments and interactive systems.",
    img: "/images/real/solaris-menu.png",
    alt: "SOLARIS — the game's main menu",
    tag: "Unreal Engine · Blender",
    spotlight: true,
  },
  {
    name: "Frank Architecture & Interiors",
    desc: "Professional architectural design work — Revit modeling, drafting and visualization workflows.",
    img: "/images/generated/arch-blueprint-house.png",
    alt: "Architectural blueprint transforming into a rendered building",
    tag: "Revit · Architecture",
  },
  {
    name: "Music & Performance",
    desc: "300+ hours performing as a volunteer guitarist — rhythm, acoustic and classical pieces.",
    img: "/images/real/guitar-performance.jpg",
    alt: "Simon Maxam playing his red cherry acoustic guitar",
    tag: "Guitar · 7 years",
  },
];

export function Signature() {
  return (
    <section
      id="work"
      aria-label="Featured work"
      className="mx-auto max-w-[1400px] px-5 py-24 scroll-mt-24 md:px-10 md:py-36"
    >
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading
          kicker="Featured work"
          title="Built over years, not weekends"
          className="max-w-2xl"
        />
        <Reveal>
          <Link
            href="/gallery"
            className="ink-underline inline-flex min-h-12 items-center whitespace-nowrap py-2 text-[0.72rem] uppercase tracking-wider2 text-ink"
          >
            View all projects →
          </Link>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {featured.map((item, i) => (
          <Reveal key={item.name} delay={i}>
            <article
              data-cursor="pick"
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-line/60 bg-surface/30 transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40"
            >
              <Photo
                src={item.img}
                alt={item.alt}
                className="aspect-[4/3]"
                rounded="rounded-none"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="flex flex-1 flex-col p-6">
                {item.spotlight && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    <FeaturedBadge />
                  </div>
                )}
                <h3 className="font-serif text-2xl text-ink">{item.name}</h3>
                <span className="mt-1 text-[0.68rem] uppercase tracking-wider2 text-accent">
                  {item.tag}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.desc}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
