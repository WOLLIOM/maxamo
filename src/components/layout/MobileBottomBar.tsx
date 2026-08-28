"use client";

import Link from "next/link";

/** Primary mobile actions — always visible above the safe area. */
export function MobileBottomBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-line/50 bg-bg/75 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden"
      role="navigation"
      aria-label="Quick actions"
    >
      <div className="mx-auto flex max-w-md gap-3">
        <Link
          href="/gallery"
          prefetch={false}
          className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-ink/25 bg-elevated/60 text-[0.68rem] uppercase tracking-wider2 text-ink transition-all duration-500 hover:border-accent hover:text-accent"
        >
          Projects
        </Link>
        <Link
          href="/contact"
          prefetch={false}
          className="group flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-[0.68rem] uppercase tracking-wider2 text-bg shadow-lg shadow-accent/25 transition-all duration-500 hover:brightness-110"
        >
          Contact
          <span
            aria-hidden
            className="inline-block transition-transform duration-500 group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
