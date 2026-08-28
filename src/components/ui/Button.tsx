"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Magnetic } from "./Magnetic";

type Variant = "solid" | "outline" | "ghost";

interface BaseProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const styles: Record<Variant, string> = {
  solid:
    "bg-accent text-bg hover:brightness-110 border border-transparent",
  outline:
    "border border-ink/25 text-ink hover:border-accent hover:text-accent bg-transparent",
  ghost: "text-ink hover:text-accent bg-transparent",
};

const base =
  "group relative inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 text-xs font-medium uppercase tracking-wider2 transition-all duration-500 ease-silk";

export function Button({
  children,
  href,
  onClick,
  type = "button",
  variant = "solid",
  className,
  ...rest
}: BaseProps & {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const content = (
    <span className="relative z-10 inline-flex items-center gap-3">{children}</span>
  );

  const cls = cn(base, styles[variant], className);

  if (href) {
    const external = href.startsWith("http");
    if (external) {
      return (
        <Magnetic strength={0.3}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cls}
            {...rest}
          >
            {content}
          </a>
        </Magnetic>
      );
    }
    return (
      <Magnetic strength={0.3}>
        <Link href={href} className={cls} {...rest}>
          {content}
        </Link>
      </Magnetic>
    );
  }

  return (
    <Magnetic strength={0.3}>
      <button type={type} onClick={onClick} className={cls} {...rest}>
        {content}
      </button>
    </Magnetic>
  );
}
