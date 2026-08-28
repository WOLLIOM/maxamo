import Link from "next/link";
import { AnimatedHeading } from "@/components/ui/AnimatedHeading";
import { Reveal } from "@/components/ui/Reveal";

interface Crumb {
  name: string;
  href: string;
}

/** Inner-page hero with semantic breadcrumbs + animated H1. */
export function PageHero({
  kicker,
  jp,
  title,
  lede,
  crumbs,
}: {
  kicker: string;
  jp?: string;
  title: string;
  lede?: string;
  crumbs: Crumb[];
}) {
  return (
    <header className="relative overflow-hidden px-5 pb-14 pt-36 md:px-10 md:pb-20 md:pt-48">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 0%, rgb(var(--glow)/0.4), transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-[1400px]">
        <Reveal>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-[0.62rem] uppercase tracking-wider2 text-faint">
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden>/</span>}
                  {i < crumbs.length - 1 ? (
                    <Link href={c.href} className="transition-colors hover:text-accent">
                      {c.name}
                    </Link>
                  ) : (
                    <span className="text-muted" aria-current="page">
                      {c.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-8 flex items-center gap-3">
            <span className="h-px w-8 bg-accent/60" />
            <span className="kicker">{kicker}</span>
            {jp && <span className="font-jp text-sm text-muted">{jp}</span>}
          </div>
        </Reveal>

        <AnimatedHeading
          text={title}
          as="h1"
          className="mt-5 text-fluid-hero leading-[0.92] text-ink"
        />

        {lede && (
          <Reveal delay={2}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {lede}
            </p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
