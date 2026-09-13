"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { isTouchDevice } from "@/lib/device";
import { ControlDock } from "./ControlDock";
import { MusicDock } from "@/components/music/MusicDock";
import { Loader } from "./Loader";

// Ambient particles are nice but expensive — load after the shell is ready.
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
    const seen = sessionStorage.getItem("simax-entered");
    if (!seen) {
      setShowLoader(true);
      document.body.style.overflow = "hidden";
    }
    setChecked(true);

    // Never mount the pointer disc on touch devices — it should never
    // flash on phone, not even for a frame.
    setShowCursor(!isTouchDevice());

    if (isTouchDevice()) return;

    const t = window.setTimeout(() => setAmbience(true), seen ? 400 : 2600);
    return () => clearTimeout(t);
  }, []);

  function handleDone() {
    sessionStorage.setItem("simax-entered", "1");
    document.body.style.overflow = "";
    setShowLoader(false);
    if (!isTouchDevice()) setAmbience(true);
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
      {checked && showLoader && <Loader onDone={handleDone} />}
    </>
  );
}
