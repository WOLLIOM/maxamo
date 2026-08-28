import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Photo } from "@/components/ui/Photo";
import { site } from "@/lib/site";

// TODO(Simon): swap these for real behind-the-scenes shots (studio setup,
// live performances, Revit sessions, game dev screenshots) as you get them —
// several tiles currently reuse the same generated images as placeholders.
const tiles: { img: string; alt: string; label: string; span?: string }[] = [
  { img: "/images/generated/guitar-hands-closeup.png", alt: "Close-up of hands playing the red cherry guitar", label: "Fingerstyle", span: "row-span-2" },
  { img: "/images/generated/arch-revit-desk.png", alt: "Architecture workstation with Revit models on screen", label: "In Revit" },
  { img: "/images/generated/code-wireframe-network.png", alt: "Abstract wireframe network representing code", label: "Building the web" },
  { img: "/images/real/solaris-menu.png", alt: "SOLARIS main menu", label: "SOLARIS", span: "row-span-2" },
  { img: "/images/generated/arch-model-lit.png", alt: "A lit architectural model", label: "Massing model" },
  { img: "/images/generated/bg-texture-red-gold.png", alt: "Ambient black, red and gold texture", label: "Mood" },
];

export function GalleryPreview() {
  return (
    <section
      aria-label="Gallery preview"
      className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-36"
    >
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading kicker="In frame" title="Moments from the work" className="max-w-2xl" />
        <Reveal>
          <Link
            href="/gallery"
            className="ink-underline inline-flex min-h-12 items-center whitespace-nowrap py-2 text-[0.72rem] uppercase tracking-wider2 text-ink"
          >
            Full gallery →
          </Link>
        </Reveal>
      </div>

      <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4 md:auto-rows-[200px]">
        {tiles.map((t, i) => (
          <Reveal key={t.label} delay={i % 4} className={t.span ?? ""}>
            <Photo
              src={t.img}
              alt={t.alt}
              label={t.label}
              className="h-full w-full"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </Reveal>
        ))}
      </div>

      {site.social.instagram && (
        <Reveal delay={2}>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
          >
            Follow along on Instagram
          </a>
        </Reveal>
      )}
    </section>
  );
}
