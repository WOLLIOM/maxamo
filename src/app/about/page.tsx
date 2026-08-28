import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { PortraitCard } from "@/components/about/PortraitCard";
import { site } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About — Simon Maxam",
  description:
    "Simon Maxam is a multidisciplinary creator in Calgary, Alberta, combining game development, architecture, music and web development into immersive experiences.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — Simon Maxam",
    description:
      "Game development, architecture, music and web development — the disciplines behind SIMAX.",
    url: `${site.url}/about`,
  },
};

const skillGroups: { label: string; items: string[] }[] = [
  {
    label: "Game development",
    items: ["Unreal Engine 5", "Blueprint Visual Scripting", "Nanite", "VR Development"],
  },
  {
    label: "3D & architecture",
    items: ["Revit", "AutoCAD", "SketchUp", "Blender"],
  },
  {
    label: "Design",
    items: ["Photoshop", "Illustrator", "After Effects", "FL Studio"],
  },
  {
    label: "Programming",
    items: ["HTML", "CSS", "JavaScript", "Three.js", "Python", "Flutter"],
  },
];

const journey: { label: string; body: string }[] = [
  {
    label: "Music",
    body: "I've played guitar for about 7 years — mainly rhythm and acoustic, with some classical pieces. My red cherry acoustic guitar has become one of the symbols of my creative identity. I volunteer as a guitarist at my church and have contributed over 300 hours through regular worship performances and events.",
  },
  {
    label: "Architecture",
    body: "I completed professional work with Frank Architecture and Interiors, creating architectural models and designs in Revit. That experience taught me professional workflows, precision, and how digital design becomes real-world construction — skills I also use in AutoCAD, SketchUp and Blender.",
  },
  {
    label: "Game development",
    body: "SOLARIS, an educational space-exploration game, is one of my largest personal projects — built over about two years in Unreal Engine 5, Blender and Photoshop. It combines education, storytelling and interactive gameplay, and it's the clearest proof of my ability to see a long-term technical and creative project through to the end.",
  },
  {
    label: "Web development",
    body: "I build websites that feel like experiences rather than pages — using HTML, CSS, JavaScript, Three.js, GSAP and Vite. Past projects include MuseumVerse, an interactive museum walkthrough, and BarberVerse, an interactive barbershop experience.",
  },
];

function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Simon Maxam",
    alternateName: site.name,
    jobTitle: "Multidisciplinary Creator",
    url: `${site.url}/about`,
    image: `${site.url}/images/real/guitar-performance.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Calgary",
      addressRegion: "AB",
      addressCountry: "CA",
    },
    knowsAbout: [
      "Game Development",
      "Unreal Engine",
      "Architecture",
      "3D Design",
      "Web Development",
      "Music",
    ],
  };
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: site.url },
              { name: "About", url: `${site.url}/about` },
            ]),
          ),
        }}
      />

      <PageHero
        kicker="Simon Maxam"
        title="Building at the edge of a few different worlds"
        lede="Multidisciplinary creator in Calgary, Alberta — game development, architecture, music and code, brought together into one creative identity: SIMAX."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />

      <div className="mx-auto max-w-[1400px] px-5 pb-24 md:px-10 md:pb-36">
        {/* Portrait + bio */}
        <div className="grid items-start gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <Reveal>
            <PortraitCard />
          </Reveal>

          <Reveal delay={1}>
            <div className="flex flex-col gap-6 text-base leading-relaxed text-muted md:text-lg">
              <p>
                I&apos;m <strong className="text-ink">Simon Maxam</strong>, born{" "}
                June 9, 2010, and based in{" "}
                <strong className="text-ink">Calgary, Alberta, Canada</strong>. I&apos;m
                a multidisciplinary creator with a passion for combining
                technology, creativity, architecture, game development, web
                design, music and digital experiences.
              </p>
              <p>
                I believe the best projects come from bringing different
                disciplines together rather than staying in one lane —
                architecture with Unreal Engine, programming with design,
                music with creativity, interactive technology with real-world
                experiences. That&apos;s the idea behind{" "}
                <strong className="text-ink">SIMAX</strong>.
              </p>
              <p>
                I hold a{" "}
                <span className="text-ink">Standard First Aid certificate (Calgary, AB)</span>{" "}
                and completed partial IB coursework, including ELA 20 and Math 20.
                I enjoy continuously learning new technologies and improving
                both my technical and creative abilities.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Toolkit */}
        <section aria-label="Skills and tools" className="mt-24 md:mt-32">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent/60" />
              <span className="kicker">The toolkit</span>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            {skillGroups.map((group, gi) => (
              <Reveal key={group.label} delay={gi + 1}>
                <div>
                  <h2 className="font-serif text-xl text-ink">{group.label}</h2>
                  <ul className="mt-5 flex flex-wrap gap-2.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-line/70 bg-surface/50 px-4 py-2 text-[0.72rem] uppercase tracking-wider2 text-muted transition-all duration-500 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Disciplines */}
        <section aria-label="What I do" className="mt-24 md:mt-32">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent/60" />
              <span className="kicker">The disciplines</span>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-x-16 md:gap-y-14">
            {journey.map((j, i) => (
              <Reveal key={j.label} delay={i + 1}>
                <div>
                  <h3 className="font-serif text-2xl text-ink">{j.label}</h3>
                  <p className="mt-3 text-base leading-relaxed text-muted md:text-lg">
                    {j.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Pull quote */}
        <Reveal>
          <blockquote className="mx-auto mt-24 max-w-3xl text-balance text-center font-serif text-3xl font-light leading-snug text-ink md:mt-32 md:text-5xl">
            &ldquo;Every project is an opportunity to become a better
            designer, developer, and creator.&rdquo;
            <footer className="mt-8 text-[0.72rem] uppercase tracking-ultra text-accent">
              — Simon Maxam
            </footer>
          </blockquote>
        </Reveal>

        {/* CTAs */}
        <Reveal>
          <div className="mt-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/gallery"
              className="rounded-full bg-accent px-9 py-4 text-[0.72rem] uppercase tracking-wider2 text-bg transition-all duration-500 hover:brightness-110"
            >
              View my work
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-ink/25 px-9 py-4 text-[0.72rem] uppercase tracking-wider2 text-ink transition-all duration-500 hover:border-accent hover:text-accent"
            >
              Get in touch
            </Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}
