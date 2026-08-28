/**
 * Simon's own recordings — the offline "mixtape" player (see MusicDock)
 * and the full Music section on the home page.
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
}

export const tracks: Track[] = [
  { id: "headlines", title: "Headlines", subtitle: "Original recording", src: "/audio/headlines.mp3" },
  { id: "love-me", title: "Love Me", subtitle: "Original recording", src: "/audio/love-me.mp3" },
  { id: "freaks", title: "Freaks", subtitle: "Original recording", src: "/audio/freaks.mp3" },
  { id: "in-the-morning", title: "In The Morning", subtitle: "Original recording", src: "/audio/in-the-morning.mp3" },
  { id: "dont-leave", title: "Don't Leave", subtitle: "Original recording", src: "/audio/dont-leave.mp3" },
  { id: "human-sacrifice", title: "Human Sacrifice", subtitle: "Original recording", src: "/audio/human-sacrifice.mp3" },
  { id: "emilys-song", title: "Emily's Song", subtitle: "Original recording", src: "/audio/emilys-song.mp3" },
  { id: "die-trying", title: "Die Trying", subtitle: "Original recording", src: "/audio/die-trying.mp3" },
];

/** Ambient loop used only for the site's background soundscape, not the song list. */
export const ambientTrack: Track = {
  id: "ambient-theme",
  title: "SIMAX — site theme",
  subtitle: "Ambient background",
  src: "/audio/ambient.mp3",
};
