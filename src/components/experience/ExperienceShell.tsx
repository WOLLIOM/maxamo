"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { isTouchDevice } from "@/lib/device";
import { ControlDock } from "./ControlDock";
import { MusicDock } from "@/components/music/MusicDock";
import { Loader } from "./Loader";
import { QuickNav } from "@/components/hero/QuickNav";

// Ambient particles are nice but expensive — load after the shell is ready.
// The real 3D box that comes out of the hero on phones (replaces the flat cube +
// Pac-Man). Three.js is already in the hero chunk; load this lazily, client-only.
const ScrollBox = dynamic(() => import("@/components/hero/ScrollBox").then((m) => m.ScrollBox), {
  ssr: false,
  loading: () => null,
});

const AmbientCanvas = dynamic(() => import("./AmbientCanvas").then((m) => m.AmbientCanvas), {
  ssr: false,
  loading: () => null,
});

/**
 * Mounts client-only ambience layers and gates the opening overture so it
 * plays once per browsing session.
 */
export function ExperienceShell() {
  const [showLoader, setShowLoader] = useState(false);
  const [checked, setChecked] = useState(false);
  const [ambience, setAmbience] = useState(false);
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    // Kick off the 3D scene's JS chunk + GLB models (guitar, saturn, note)
    // as early as possible, in parallel with the loader animation, instead
    // of waiting for Hero to decide to mount SimaxScene. Both desktop and
    // mobile import the same module, so one prefetch covers both — this is
    // why shortening the loader (see Loader.tsx) doesn't mean landing on an
    // empty/unfinished scene once it dismisses.
    import("@/components/three/SimaxScene").catch(() => {});

    const seen = sessionStorage.getItem("simax-entered");
    if (!seen) {
      setShowLoader(true);
      document.body.style.overflow = "hidden";
    }
    setChecked(true);

    // Never mount the pointer disc on touch devices — it should never
    // flash on phone, not even for a frame.
    setShowCursor(!isTouchDevice());

    // AmbientCanvas already scales its particle count down for mobile
    // (9 dust motes vs 46 on desktop) -- Simon wants that ambient dust on
    // phones too, matching the desktop hero's look, so no more early-return
    // here for touch devices.
    const t = window.setTimeout(() => setAmbience(true), seen ? 400 : 2600);
    return () => clearTimeout(t);
  }, []);

  function handleDone() {
    sessionStorage.setItem("simax-entered", "1");
    document.body.style.overflow = "";
    setShowLoader(false);
    setAmbience(true);
  }

  return (
    <>
      <div className="grain pointer-events-none" aria-hidden />
      {ambience && <AmbientCanvas />}
      {/* HalftonePanel side dots now live inside <main> (layout.tsx) so they
          scroll with the content instead of being pinned to the viewport. */}
      {/* ScrollComet removed — Simon hated the yellow meteor-ish streak that
          slid left/right on scroll (leftover from the old blueprint-hub
          deployment). Component file kept in case a redesigned version is
          wanted later, just not mounted. */}
      {/* ReferenceParticleField removed — PixelCursorField (in layout.tsx) is the
          single cursor particle system now; running both was redundant. */}
      <ControlDock />
      <MusicDock />
      {/* Phones: the real 3D silver box travels out of the hero as you scroll
          and docks in the corner, reacting to gyro. */}
      <ScrollBox />
      {/* Phones: fixed four-pill quick-jump bar (T / M / C / G) after the hero. */}
      <QuickNav variant="dock" />
      {checked && showLoader && <Loader onDone={handleDone} />}
    </>
  );
}
