import { Reveal } from "@/components/ui/Reveal";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { Photo } from "@/components/ui/Photo";
import { WireframeMotif } from "@/components/ui/WireframeMotif";
import { site } from "@/lib/site";

export function Story() {
  return (
    <section
      id="story"
      aria-label="About Simon"
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
              I&apos;m a multidisciplinary creator working across game
              development, architecture, music and web development. Whether
              it&apos;s building a space-exploration game in Unreal Engine,
              designing a building in Revit, or playing guitar at church as a
              volunteer musician, I&apos;m always chasing the same thing:
              turning an idea into something you can actually step into.
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
        </div>

        <div className="order-1 grid grid-cols-2 gap-4 md:order-2">
          <Reveal className="col-span-2">
            <Photo
              src="/images/real/guitar-performance.jpg"
              alt="Simon Maxam playing his red cherry acoustic guitar"
              label="Guitar — my main instrument"
              className="aspect-[16/10]"
            />
          </Reveal>
          <Reveal delay={1}>
            <Photo
              src="/images/generated/arch-blueprint-house.png"
              alt="Architectural blueprint transforming into a rendered building"
              label="Architecture"
              className="aspect-square"
            />
          </Reveal>
          <Reveal delay={2}>
            <Photo
              src="/images/real/solaris-earth-moon.png"
              alt="Earth and the Moon seen from orbit in SOLARIS"
              label="SOLARIS — game dev"
              className="aspect-square"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
