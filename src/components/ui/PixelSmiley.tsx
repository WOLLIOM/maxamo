/** Tiny pixel-grid smiley, built from squares like the rest of the pixel UI. */
export function PixelSmiley({
  mood,
  className,
}: {
  mood: "happy" | "sad";
  className?: string;
}) {
  const base = mood === "happy" ? "rgb(var(--c-gold))" : "rgb(var(--c-accent))";
  const dark = "rgb(var(--c-bg))";

  return (
    <svg
      className={className}
      viewBox="0 0 156 156"
      aria-hidden="true"
    >
      <circle cx="78" cy="78" r="76" fill={base} fillOpacity="0.14" />
      {mood === "happy" ? (
        <g>
          <rect x="48" y="60" width="12" height="12" fill={dark} />
          <rect x="96" y="60" width="12" height="12" fill={dark} />
          <rect x="48" y="84" width="12" height="12" fill={dark} />
          <rect x="96" y="84" width="12" height="12" fill={dark} />
          <rect x="60" y="96" width="12" height="12" fill={dark} />
          <rect x="72" y="96" width="12" height="12" fill={dark} />
          <rect x="84" y="96" width="12" height="12" fill={dark} />
        </g>
      ) : (
        <g>
          <rect x="48" y="60" width="12" height="12" fill={dark} />
          <rect x="96" y="60" width="12" height="12" fill={dark} />
          <rect x="60" y="84" width="12" height="12" fill={dark} />
          <rect x="72" y="84" width="12" height="12" fill={dark} />
          <rect x="84" y="84" width="12" height="12" fill={dark} />
          <rect x="48" y="96" width="12" height="12" fill={dark} />
          <rect x="96" y="96" width="12" height="12" fill={dark} />
        </g>
      )}
    </svg>
  );
}
