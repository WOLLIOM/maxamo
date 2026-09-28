/**
 * The SIMAX mark — a faceted wireframe hexagon echoing the glass cube that
 * already runs through the hero and the mobile ScrollBox (the site's one
 * recurring, well-liked visual motif). Was plain text-only before ("SIMAX",
 * no icon) — see the old `nameJp` comment in site.ts. Single-color, so it
 * reads cleanly at nav size (24-32px) and at favicon size.
 */
export function Logomark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <path
        d="M16 2 28 9v14L16 30 4 23V9Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 2v14M16 30V16M4 9l12 7M28 9l-12 7M4 23l12-7M28 23l-12-7" stroke="currentColor" strokeWidth="0.9" opacity="0.55" />
      <circle cx="16" cy="16" r="2.1" fill="currentColor" />
    </svg>
  );
}
