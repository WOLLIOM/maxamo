/**
 * Simon's own songs — written, recorded and produced by Simon.
 * Powers the offline "mixtape" player (see MusicDock) and the full
 * Music section on the home page.
 *
 * To add a song:
 *  1. Drop the mp3 file into /public/audio/
 *  2. Add a row below with a matching `src`
 * That's it — the player, the offline cache list (sw.js) and the UI all
 * read from this one array.
 */
export interface Track {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  /** Two colours used to build the generated cover-art tile for this song. */
  art: [string, string];
}

export const tracks: Track[] = [
  { id: "freedom-rises", title: "Freedom Rises", subtitle: "Written & produced by Simon", src: "/audio/freedom-rises.mp3", art: ["#f97316", "#7c2d12"] },
  { id: "the-greatest-gift", title: "The Greatest Gift", subtitle: "Written & produced by Simon", src: "/audio/the-greatest-gift.mp3", art: ["#38bdf8", "#1e3a8a"] },
  { id: "the-trumpets-sound", title: "The Trumpets Sound", subtitle: "Written & produced by Simon", src: "/audio/the-trumpets-sound.mp3", art: ["#facc15", "#854d0e"] },
  { id: "replay", title: "Replay", subtitle: "Written & produced by Simon", src: "/audio/replay.mp3", art: ["#a78bfa", "#4c1d95"] },
  { id: "one", title: "1", subtitle: "Written & produced by Simon", src: "/audio/1.mp3", art: ["#34d399", "#065f46"] },
];

/** Ambient loop used only for the site's background soundscape, not the song list. */
export const ambientTrack: Track = {
  id: "ambient-theme",
  title: "SIMAX — site theme",
  subtitle: "Ambient background",
  src: "/audio/ambient.mp3",
  art: ["#94a3b8", "#334155"],
};
