"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { isTouchDevice } from "@/lib/device";
import { ReferenceParticleField } from "./ReferenceParticleField";
import { ControlDock } from "./ControlDock";
import { MusicDock } from "@/components/music/MusicDock";
import { Loader } from "./Loader";
import { ScrollComet } from "./ScrollComet";

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
      <ScrollComet />
      {showCursor && <ReferenceParticleField />}
      <ControlDock />
      <MusicDock />
      {checked && showLoader && <Loader onDone={handleDone} />}
    </>
  );
}
