/**
 * Small decorative wireframe polyhedron — a flat SVG echo of the 3D
 * "code shape" from the hero, sprinkled into section backgrounds at
 * different sizes so the motif keeps showing up as you scroll, without
 * paying for another live WebGL canvas. Pure CSS spin, no JS.
 */
export function WireframeMotif({
  size = 220,
  className = "",
  opacity = 0.16,
  duration = 40,
  reverse = false,
}: {
  size?: number;
  className?: string;
  opacity?: number;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
      style={{
        width: size,
        height: size,
        opacity,
        animation: `wireframe-spin ${duration}s linear infinite ${reverse ? "reverse" : ""}`,
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none">
        <g stroke="rgb(var(--c-accent))" strokeWidth="0.6">
          <polygon points="50,4 90,28 90,72 50,96 10,72 10,28" />
          <polygon points="50,4 76,20 50,50 24,20" />
          <polygon points="50,4 90,28 50,50 76,20" />
          <polygon points="10,28 50,50 24,20" />
          <polygon points="10,72 50,50 10,28" />
          <polygon points="90,72 50,50 90,28" />
          <polygon points="50,96 50,50 76,80" />
          <polygon points="50,96 50,50 24,80" />
          <polygon points="10,72 50,50 24,80" />
          <polygon points="90,72 50,50 76,80" />
          <line x1="50" y1="4" x2="50" y2="96" />
          <line x1="10" y1="28" x2="90" y2="72" />
          <line x1="10" y1="72" x2="90" y2="28" />
        </g>
      </svg>
    </div>
  );
}
