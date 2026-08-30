"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { RedStrat } from "./SimaxModels";
import { isTouchDevice } from "@/lib/device";
import { imageSources } from "@/lib/media";

/**
 * Small self-contained scene for the Guitar Corner section — Simon's real
 * red Strat, auto-spinning ("autoplay") the moment it scrolls into view, no
 * click required. Independent from the hero SimaxScene so it can mount
 * lazily without dragging in the whole cluster.
 *
 * This used to run a full WebGL <Canvas> unconditionally, on every device —
 * unlike the hero, which already skips WebGL on phones. That meant every
 * phone loaded a second live 3D scene (model + shadows + environment map),
 * which is a big part of why the site felt slow on mobile. It now falls
 * back to a static photo on touch devices, matching how the hero behaves.
 */
export function RedStratViewer() {
  const [touch, setTouch] = useState<boolean | null>(null);

  useEffect(() => {
    setTouch(isTouchDevice());
  }, []);

  // Avoid flashing the 3D version before we know the device type.
  if (touch === null) {
    return (
      <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-3xl border border-line/60 bg-surface/30" />
    );
  }

  if (touch) {
    const { fallback, webp } = imageSources("/images/real/guitar-performance.webp");
    return (
      <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-3xl border border-line/60 bg-surface/30">
        <picture>
          <source srcSet={webp} type="image/webp" />
          <img
            src={fallback}
            alt="Simon's red Stratocaster"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-3xl border border-line/60 bg-surface/30">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.1, 5.6], fov: 32 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 4]} intensity={1.6} color="#f0d8c4" />
          <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#a82026" />
          <RedStrat scale={1.7} />
          <ContactShadows position={[0, -1.6, 0]} opacity={0.35} scale={6} blur={2.4} />
          <Environment resolution={128} preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
