import { Reveal } from "@/components/ui/Reveal";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { Photo } from "@/components/ui/Photo";
import { WireframeMotif } from "@/components/ui/WireframeMotif";
import { PixelSmiley } from "@/components/ui/PixelSmiley";
import { TiltCard } from "@/components/ui/TiltCard";
import { site, certificates } from "@/lib/site";

const focus: { title: string; body: string; tools: string; color: string }[] = [
  {
    title: "Web & apps",
    body: "Immersive websites and web apps, built to feel like experiences rather than pages.",
    tools: "Next.js · React · Three.js · TypeScript",
    color: "#8b5cf6",
  },
  {
    title: "3D & games",
    body: "Interactive 3D worlds and the SOLARIS space-exploration game, made over two years.",
    tools: "Unreal Engine 5 · Blender · Blueprint",
    color: "#22d3ee",
  },
  {
    title: "Architecture",
    body: "Professional modelling work with Frank Architecture and Interiors.",
    tools: "Revit · AutoCAD · SketchUp",
    color: "#f59e0b",
  },
  {
    title: "Cloud & AI",
    body: "Certified in cloud architecture, data and deep learning from AWS, Google and IBM.",
    tools: "AWS · Python · PyTorch · LangChain",
    color: "#34d399",
  },
];

const links = [
  { label: "GitHub", href: site.social.github },
  { label: "LinkedIn", href: site.social.linkedin },
  { label: "Instagram", href: site.social.instagram },
];

export function Story() {
  return (
    <section
      id="story"
      aria-label="About Simon"
      data-section="story"
      data-palette="warm"
      className="relative mx-auto max-w-[1400px] px-5 py-14 scroll-mt-24 md:px-10 md:py-20"
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
              <strong className="text-ink">Simon Maxam</strong> is a web
              developer, 3D artist and musician in Calgary, Alberta. {site.concept}
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
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line/60 pt-8 sm:grid-cols-4">
              {[
                { k: "Based in", v: "Calgary" },
                { k: "Guitar", v: "7 yrs" },
                { k: "Performed", v: "300+ hrs" },
                { k: "Certificates", v: `${certificates.length}` },
              ].map((x) => (
                <div key={x.k}>
                  <dt className="text-[0.62rem] uppercase tracking-wider2 text-faint">
                    {x.k}
                  </dt>
                  <dd className="mt-2 font-serif text-3xl text-ink">{x.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={3}>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {focus.map((f) => (
                <TiltCard
                  key={f.title}
                  glow={f.color}
                  max={8}
                  className="rounded-2xl border bg-surface/40 p-4 backdrop-blur-sm"
                  style={{ borderColor: `${f.color}44` }}
                >
                  <h3 className="font-serif text-lg text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-snug text-muted">{f.body}</p>
                  <p className="mt-3 text-[0.6rem] uppercase tracking-wider2" style={{ color: f.color }}>
                    {f.tools}
                  </p>
                </TiltCard>
              ))}
            </div>
          </Reveal>

          <Reveal delay={3}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="rounded-full border border-line px-5 py-2.5 text-[0.68rem] uppercase tracking-wider2 text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
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
              src="/images/real/throne-portrait.webp"
              alt="Simon Maxam as a kid"
              label="Simon Maxam · as a kid"
              className="aspect-[4/5] md:aspect-[3/4]"
              data-cursor-heart
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
