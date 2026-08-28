"use client";

import { AnimatedHeading } from "./AnimatedHeading";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

/** Consistent kicker + title + optional lede block for every section. */
export function SectionHeading({
  kicker,
  jp,
  title,
  lede,
  align = "left",
  as = "h2",
  className,
}: {
  kicker?: string;
  jp?: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {kicker && (
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-accent/60" />
            <span className="kicker">{kicker}</span>
            {jp && <span className="font-jp text-sm text-muted">{jp}</span>}
          </div>
        </Reveal>
      )}
      <AnimatedHeading
        text={title}
        as={as}
        className="text-fluid-h2 leading-[1.02] text-ink"
      />
      {lede && (
        <Reveal delay={1}>
          <p
            className={cn(
              "max-w-xl text-base leading-relaxed text-muted md:text-lg",
              align === "center" && "mx-auto",
            )}
          >
            {lede}
          </p>
        </Reveal>
      )}
    </div>
  );
}
