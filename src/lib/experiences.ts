/** Content shown in the "Explore my world" cards + detail modal. */
export interface WorldExperience {
  id: string;
  seat: string;
  name: string;
  summary: string;
  highlights: string[];
}

export const experiences: WorldExperience[] = [
  {
    id: "music",
    seat: "Music",
    name: "Guitar & Performance",
    summary:
      "I've played guitar for about 7 years — rhythm, acoustic and some classical pieces — and volunteer as a guitarist at my church.",
    highlights: [
      "Red cherry acoustic guitar, my main instrument",
      "300+ hours performed as a volunteer musician",
      "Rhythm, acoustic and classical repertoire",
    ],
  },
  {
    id: "architecture",
    seat: "Architecture",
    name: "Architectural Design",
    summary:
      "Professional experience with Frank Architecture and Interiors, creating architectural models and designs using Revit and related tools.",
    highlights: [
      "Revit, AutoCAD, SketchUp and Blender",
      "Professional workflows and precision drafting",
      "From digital design to real-world construction",
    ],
  },
  {
    id: "solaris",
    seat: "Game Development",
    name: "SOLARIS",
    summary:
      "An educational space-exploration game built over about two years in Unreal Engine 5, Blender and Photoshop — my largest personal project.",
    highlights: [
      "Space environments and planets",
      "Interactive gameplay and game design systems",
      "Two years from concept to playable build",
    ],
  },
];
