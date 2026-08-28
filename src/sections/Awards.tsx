import { Reveal } from "@/components/ui/Reveal";
import { awards } from "@/lib/site";

export function Awards() {
  return (
    <section
      id="awards"
      aria-label="Awards and recognition"
      className="border-y border-line/60 bg-surface/30 py-16 md:py-20 scroll-mt-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal>
          <p className="text-center text-[0.62rem] uppercase tracking-ultra text-faint">
            Recognition
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5">
          {awards.map((a, i) => (
            <Reveal key={a.title} delay={i} className="text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="font-serif text-xl text-accent">{a.year}</span>
                <span className="text-sm font-medium text-ink">{a.title}</span>
                <span className="text-[0.62rem] uppercase tracking-wider2 text-faint">
                  {a.org}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
