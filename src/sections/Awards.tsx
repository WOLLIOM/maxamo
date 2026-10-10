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
      className="border-y border-line/60 bg-surface/30 py-8 md:py-16 scroll-mt-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal>
          <p className="text-center text-[0.62rem] uppercase tracking-ultra text-faint">
            Recognition
          </p>
        </Reveal>
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 items-stretch gap-3 md:mt-10 md:gap-6">
          {awards.map((a, i) => {
            const featured = a.featured;
            return (
              <Reveal key={a.title} delay={i}>
                <div
                  className={`flex h-full flex-col items-center gap-2 rounded-2xl border px-3 py-6 text-center md:gap-4 md:px-6 md:py-10 backdrop-blur-sm transition-colors duration-500 ${
                    featured
                      ? "border-[#e0384a] bg-[#e0384a]/[0.08] shadow-lg shadow-[#e0384a]/15"
                      : "border-line/60 bg-elevated/40 hover:border-accent/50"
                  }`}
                >
                  {/* Featured (TÜBİTAK) gets a RED "top honor" ribbon — red is
                      fixed (not the theme accent) so it always pops as the
                      standout, and nods to the Turkish flag. */}
                  {featured && (
                    <span className="rounded-full bg-[#e0384a] px-3 py-1 text-[0.55rem] font-semibold uppercase tracking-wider2 text-white">
                      Top honor
                    </span>
                  )}
                  <span
                    aria-hidden
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-xl md:h-14 md:w-14 md:text-2xl ${
                      featured ? "border-[#e0384a] bg-[#e0384a]/15" : "border-accent/40"
                    }`}
                  >
                    🏅
                  </span>
                  {a.year && (
                    <span
                      className={`font-serif text-lg ${featured ? "text-[#e0384a]" : "text-accent"}`}
                    >
                      {a.year}
                    </span>
                  )}
                  <span
                    className={`font-serif leading-snug ${
                      featured
                        ? "text-xl text-[#ff5464] md:text-4xl"
                        : "text-xl text-ink md:text-3xl"
                    }`}
                  >
                    {a.title}
                  </span>
                  <span
                    className={`uppercase tracking-wider2 ${
                      featured
                        ? "text-[0.72rem] font-semibold text-ink"
                        : "text-[0.68rem] text-faint"
                    }`}
                  >
                    {a.org}
                  </span>
                  {a.sub && (
                    <span className="text-[0.62rem] uppercase tracking-wider2 text-faint">
                      {a.sub}
                    </span>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
