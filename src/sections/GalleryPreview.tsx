import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { site } from "@/lib/site";

export function GalleryPreview() {
  return (
    <section
      aria-label="Gallery"
      data-section="gallery"
      data-palette="blue"
      className="mx-auto max-w-[1400px] px-5 pt-24 md:px-10 md:pt-36"
    >
      <SectionHeading kicker="In frame" title="Moments from the work" className="max-w-2xl" />

      <div className="mt-12">
        <GalleryGrid initialFilter="Travel" />
      </div>

      {site.social.instagram && (
        <Reveal delay={2}>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-24 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent md:mb-36"
          >
            Follow along on Instagram
          </a>
        </Reveal>
      )}
    </section>
  );
}
