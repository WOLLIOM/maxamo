import { Reveal } from "@/components/ui/Reveal";
import { awards } from "@/lib/site";

// Down to just two consolidated awards now (see lib/site.ts), so this gets
// real card treatment instead of a cramped 5-up grid — big medal glyph,
// bigger type, real breathing room. Same layout on desktop and mobile
// (stacks to one column on narrow screens).
export function Awards() {
  return (
    <section
      id="awards"
      aria-label="Awards and recognition"
      data-section="awards"
      data-palette="blue"
      className="border-y border-line/60 bg-surface/30 py-16 md:py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal>
          <p className="text-center text-[0.62rem] uppercase tracking-ultra text-faint">
            Recognition
          </p>
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          {awards.map((a, i) => (
            <Reveal key={a.title} delay={i}>
              <div className="flex h-full flex-col items-center gap-4 rounded-2xl border border-line/60 bg-elevated/40 px-6 py-10 text-center backdrop-blur-sm transition-colors duration-500 hover:border-accent/50">
                <span
                  aria-hidden
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 text-2xl"
                >
                  🏅
                </span>
                {a.year && (
                  <span className="font-serif text-lg text-accent">{a.year}</span>
                )}
                <span className="font-serif text-2xl leading-snug text-ink md:text-3xl">
                  {a.title}
                </span>
                <span className="text-[0.68rem] uppercase tracking-wider2 text-faint">
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
