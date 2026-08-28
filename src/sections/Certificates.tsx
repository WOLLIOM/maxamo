import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { certificates } from "@/lib/site";

export function Certificates() {
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
          lede="Coursework completed across 3D, architecture, code and creative tools."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((c, i) => (
            <Reveal key={c.title} delay={i} className="h-full">
              <div className="glass flex h-full flex-col gap-2 rounded-2xl border border-line/60 p-5">
                <span className="text-sm font-medium leading-snug text-ink">
                  {c.title}
                </span>
                <span className="mt-auto flex items-center justify-between text-[0.62rem] uppercase tracking-wider2 text-faint">
                  <span>{c.issuer}</span>
                  <span>{c.date}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
