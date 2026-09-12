// Named visual presets the visitor can toggle between. (Kept in this file so
// existing imports keep working; the site no longer switches by clock.)
export type TimeOfDay = "evening" | "mono" | "vivid" | "blueprint";

/** Order the switcher cycles through. */
export const THEME_ORDER: TimeOfDay[] = ["evening", "mono", "vivid", "blueprint"];

export const timeOfDayLabel: Record<TimeOfDay, string> = {
  evening: "Golden hour",
  mono: "Monochrome",
  vivid: "Vivid",
  blueprint: "Blueprint",
};

export function isTheme(v: unknown): v is TimeOfDay {
  return v === "evening" || v === "mono" || v === "vivid" || v === "blueprint";
}
