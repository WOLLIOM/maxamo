/** Client-only device hints for performance routing. */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 900)
  );
}

/** Phones / tablets should not auto-start WebGL (Lighthouse + battery). */
export function shouldAutoLoad3D(): boolean {
  if (typeof window === "undefined") return false;
  if (isTouchDevice()) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  return cores > 2;
}
