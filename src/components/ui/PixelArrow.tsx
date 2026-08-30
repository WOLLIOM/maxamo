/**
 * A cursor arrow built from little dots, matching the deepseek pixel-cursor
 * demo's circular dot-grid rendering (it draws every heat cell with
 * ctx.arc, not a filled square) — so instead of one solid stroke, the
 * arrow is a cluster of individual round dots that assemble in with a
 * stagger when it appears.
 *
 * Grid is 9 cols x 7 rows; a thin shaft on the left, a chevron head on the
 * right — this shape points "east" (angle 0) by default, then the parent
 * rotates the whole SVG to aim at whatever headline it's near.
 */
const CELL = 5.5;
const GAP = 1.4;
const STEP = CELL + GAP;
const R = CELL / 2;

// [col, row] pairs for every lit dot of the arrow, left (shaft) to right (tip).
const PIXELS: [number, number][] = [
  // shaft
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3],
  [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
  // head
  [5, 3], [6, 3], [7, 3], [8, 3],
  [5, 2], [6, 2], [7, 2],
  [5, 4], [6, 4], [7, 4],
  [6, 1], [6, 5],
];

const COLS = 9;
const ROWS = 7;

export function PixelArrow({
  className,
  active,
}: {
  className?: string;
  active: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${COLS * STEP} ${ROWS * STEP}`}
      width={COLS * STEP * 2.1}
      height={ROWS * STEP * 2.1}
      aria-hidden="true"
    >
      {PIXELS.map(([c, r], i) => {
        // distance from the tip (rightmost column) so dots assemble tip-first
        const delay = active ? ((COLS - c) * 0.012).toFixed(3) : "0";
        const cx = c * STEP + CELL / 2;
        const cy = r * STEP + CELL / 2;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={R}
            fill="rgb(var(--c-gold))"
            className={active ? "animate-pixel-assemble" : ""}
            style={{
              animationDelay: `${delay}s`,
              transformOrigin: `${cx}px ${cy}px`,
            }}
          />
        );
      })}
    </svg>
  );
}
