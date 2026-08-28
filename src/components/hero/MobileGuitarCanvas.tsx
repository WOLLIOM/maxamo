"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { RedStrat } from "@/components/three/SimaxModels";

/**
 * Phone-only 3D guitar. Kept intentionally minimal — one model, two lights,
 * no ContactShadows / Environment / postprocessing — so it stays smooth even
 * on mid-range phones. This is what replaces the static top hero photo on
 * mobile, so scrolling to the hero still shows a real, live 3D guitar
 * instead of a flat picture, but without the weight of the full desktop
 * SimaxScene (which stays WebGL-heavy and desktop-only).
 */
export function MobileGuitarCanvas({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        dpr={1}
        frameloop="always"
        camera={{ position: [0, 0.1, 5.6], fov: 34 }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 5, 4]} intensity={1.5} color="#f0d8c4" />
          <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#a82026" />
          <RedStrat scale={1.6} />
        </Suspense>
      </Canvas>
    </div>
  );
}
