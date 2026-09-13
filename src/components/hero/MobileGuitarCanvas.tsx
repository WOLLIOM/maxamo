"use client";

import { Suspense, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RealGuitar, CodeShape, ArchBlock } from "@/components/three/SimaxModels";

type Tilt = { x: number; y: number };

/**
 * Lets the device gyro (passed in as a tilt ref, see useDeviceTiltRef) gently
 * rotate whichever model sits inside it. Kept tiny — no drei Float, no
 * postprocessing — this is the "lite" mobile treatment.
 */
function TiltGroup({
  tilt,
  baseRotation = [0, 0, 0],
  idleAmp = 0.25,
  children,
}: {
  tilt?: MutableRefObject<Tilt>;
  baseRotation?: [number, number, number];
  idleAmp?: number;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (tilt) {
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        baseRotation[0] + tilt.current.x * 0.35,
        4,
        delta,
      );
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        baseRotation[1] + tilt.current.y * 0.45,
        4,
        delta,
      );
    } else {
      // No gyro (or permission not granted) — a gentle idle sway keeps it
      // alive. Small amplitude for the guitar so it stays facing the viewer.
      group.current.rotation.y = baseRotation[1] + Math.sin(state.clock.elapsedTime * 0.4) * idleAmp;
    }
  });

  return (
    <group ref={group} rotation={baseRotation}>
      {children}
    </group>
  );
}

/**
 * Phone-only 3D objects. Kept intentionally minimal — one model, two lights,
 * no ContactShadows / Environment / postprocessing — so it stays smooth even
 * on mid-range phones. This replaces the static top hero photos on mobile:
 * the red-cherry guitar (centerpiece) and a second, lighter "red polygon"
 * code-shape object, both nudged by the phone's gyro.
 */
export function MobileGuitarCanvas({
  className = "",
  variant = "guitar",
  tilt,
}: {
  className?: string;
  variant?: "guitar" | "code" | "box";
  tilt?: MutableRefObject<Tilt>;
}) {
  const isGuitar = variant === "guitar";
  const isBox = variant === "box";
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 2]}
        frameloop="always"
        // Guitar sits a little further back so the full body + neck fit with
        // margin (no cropping); the code polygon stays closer.
        camera={{ position: [0, 0.1, isGuitar ? 6.6 : 5.6], fov: 34 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[3, 5, 4]} intensity={1.6} color="#f0d8c4" />
          <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#8b5cf6" />
          {isGuitar && (
            // ===== MOBILE-ONLY: GUITAR 3D SCALE =====
            // `scale` here is the actual 3D model size (bigger number = bigger
            // guitar in the canvas). Combine with the outer div width in
            // HeroMobileStage.tsx for the final on-screen size.
            // `baseRotation` = [pitch, yaw, roll] in radians (Math.PI/2 ≈ 90°).
            // Small negative Z = a gentle left lean, matching the desktop
            // hero's guitar (which tilts the same way).
            <TiltGroup tilt={tilt} baseRotation={[0.1, Math.PI / 2, -0.16]} idleAmp={0.12}>
              <RealGuitar scale={4.4} recenter />
            </TiltGroup>
          )}
          {variant === "code" && (
            // ===== MOBILE-ONLY: RED POLYGON 3D SCALE =====
            <TiltGroup tilt={tilt} baseRotation={[0.3, 0.5, 0]}>
              <group scale={2.4}>
                <CodeShape lite />
              </group>
            </TiltGroup>
          )}
          {isBox && (
            // ===== MOBILE-ONLY: WHITE BOX (ArchBlock) SCALE/ROTATION =====
            // The same silvery wireframe-edged block from the desktop scene,
            // parked in the empty space on the left of the mobile hero.
            <TiltGroup tilt={tilt} baseRotation={[0.35, -0.4, 0.1]} idleAmp={0.2}>
              <group scale={1.7}>
                <ArchBlock lite />
              </group>
            </TiltGroup>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
