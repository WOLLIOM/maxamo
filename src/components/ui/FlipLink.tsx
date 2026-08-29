"use client";

/**
 * Two-line hover swap: the label slides up and out while an identical
 * copy slides up from below to take its place. A small, tactile surprise
 * on nav links instead of a plain color change — the kind of detail that
 * makes a site feel considered rather than templated.
 */
export function FlipLinkLabel({ children }: { children: string }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-bottom">
      <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1/2">
        <span className="block leading-[1em]">{children}</span>
        <span className="block leading-[1em]" aria-hidden>
          {children}
        </span>
      </span>
    </span>
  );
}
