import { Reveal } from "@/components/ui/Reveal";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { Photo } from "@/components/ui/Photo";
import { WireframeMotif } from "@/components/ui/WireframeMotif";
import { PixelSmiley } from "@/components/ui/PixelSmiley";
import { site } from "@/lib/site";

export function Story() {
  return (
    <section
      id="story"
      aria-label="About Simon"
      data-section="story"
      data-palette="warm"
      className="relative mx-auto max-w-[1400px] px-5 py-24 scroll-mt-24 md:px-10 md:py-36"
    >
      <WireframeMotif
        size={160}
        opacity={0.14}
        duration={46}
        className="absolute -right-6 top-6 hidden md:block"
      />
      <WireframeMotif
        size={90}
        opacity={0.12}
        duration={34}
        reverse
        className="absolute bottom-8 left-2 hidden md:block"
      />
      <div className="grid items-center gap-14 md:grid-cols-2 md:gap-20">
        <div className="order-2 md:order-1">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent/60" />
              <span className="kicker">About me</span>
            </div>
          </Reveal>

          <AnimatedHeading
            text="A builder at the intersection of art and technology."
            className="mt-6 text-fluid-h2 leading-[1.05] text-ink"
          />

          <Reveal delay={1}>
            <p className="mt-8 max-w-lg text-base leading-relaxed text-muted md:text-lg">
              {site.concept}
            </p>
          </Reveal>

          <Reveal delay={2}>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted md:text-lg">
              Guitar is my main instrument — I play fingerstyle and lead
              worship as a volunteer musician at church, and it&apos;s the
              thread running through everything else I build, from web
              projects to the studio itself. Whether I&apos;m on stage or at
              a keyboard, I&apos;m always chasing the same thing: turning an
              idea into something you can actually step into.
            </p>
          </Reveal>

          <Reveal delay={3}>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line/60 pt-8">
              {[
                { k: "Creating since", v: site.creatorSince },
                { k: "Guitar", v: "7 yrs" },
                { k: "Performed", v: "300+ hrs" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[0.62rem] uppercase tracking-wider2 text-faint">
                    {s.k}
                  </dt>
                  <dd className="mt-2 font-serif text-3xl text-ink">{s.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={4}>
            <div className="mt-10 grid gap-8 border-t border-line/60 pt-8 sm:grid-cols-2">
              <div
                data-cursor-mood="happy"
                className="flex flex-col items-start gap-3"
              >
                <PixelSmiley mood="happy" className="h-11 w-11" />
                <div className="font-mono text-[0.68rem] uppercase tracking-wider2 text-gold">
                  Brilliant at
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  Producing a lot of work quickly, and getting a rough first
                  version of almost anything in front of you.
                </p>
              </div>
              <div
                data-cursor-mood="sad"
                className="flex flex-col items-start gap-3"
              >
                <PixelSmiley mood="sad" className="h-11 w-11" />
                <div className="font-mono text-[0.68rem] uppercase tracking-wider2 text-accent">
                  Hopeless at
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  Knowing which of those versions is actually any good, and
                  having the nerve to throw the rest away.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="order-1 md:order-2">
          <Reveal>
            <Photo
              src="/images/real/throne-portrait.jpg"
              alt="Simon Maxam portrait"
              label="Simon Maxam"
              className="aspect-[4/5] md:aspect-[3/4]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
