export type TimeOfDay = "morning" | "evening" | "night";

/**
 * Derive the ambience from the visitor's *local* hour.
 *  - morning  05:00 – 16:59  → bright, warm daylight
 *  - evening  17:00 – 20:59  → golden-hour interior
 *  - night    21:00 – 04:59  → inverted, spotlit stage mode
 */
export function getTimeOfDay(date = new Date()): TimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 17) return "morning";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export const timeOfDayLabel: Record<TimeOfDay, string> = {
  morning: "Morning light",
  evening: "Golden hour",
  night: "Stage lights",
};

/** Milliseconds until the next boundary so we can re-theme automatically. */
export function msUntilNextPhase(date = new Date()): number {
  const boundaries = [5, 17, 21];
  const h = date.getHours();
  const next = boundaries.find((b) => b > h) ?? 24 + boundaries[0];
  const target = new Date(date);
  target.setHours(next, 0, 0, 0);
  return target.getTime() - date.getTime();
}
