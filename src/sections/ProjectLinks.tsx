import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Four editable link-out cards to Simon's own projects/sites.
 * Just swap the `href` (and label/desc if you want) for each — no other
 * code needs to change.
 */
const links: { label: string; desc: string; href: string }[] = [
  { label: "SIMAX", desc: "Premium Three.js / WebGL showcase", href: "https://wolliom.github.io/vite-threejs-premium/" },
  { label: "MuseumVerse", desc: "Interactive museum experience", href: "https://wolliom.github.io/museumverse/" },
  { label: "BarberVerse", desc: "Interactive barber shop experience", href: "https://wolliom.github.io/Barber/" },
  { label: "Aurelio", desc: "Boutique hotel website", href: "https://wolliom.github.io/aurelio/" },
];

export function ProjectLinks() {
  return (
    <section
      aria-label="More projects"
      data-section="projects"
      data-palette="blue"
      className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32"
    >
      <SectionHeading kicker="Elsewhere" title="More things I've built" align="center" />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((l, i) => (
          <Reveal key={l.label} delay={i}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-full min-h-[160px] flex-col justify-between overflow-hidden rounded-3xl border border-line/60 bg-surface/30 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/50"
            >
              <div>
                <h3 className="font-serif text-xl text-ink">{l.label}</h3>
                <p className="mt-2 text-sm text-muted">{l.desc}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-wider2 text-accent">
                Visit
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-500 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0"
              />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
