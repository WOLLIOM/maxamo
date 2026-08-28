import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { site } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Gallery — In Frame",
  description:
    "A visual walk through Simon Maxam's work: music, architecture, SOLARIS, and web builds.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: site.url },
              { name: "Gallery", url: `${site.url}/gallery` },
            ]),
          ),
        }}
      />
      <PageHero
        kicker="In frame"
        jp="写真"
        title="Gallery"
        lede="Fragments of the experience — the room, the season on the board, and the quiet craft behind the counter."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Gallery", href: "/gallery" },
        ]}
      />
      <GalleryGrid />
    </>
  );
}
