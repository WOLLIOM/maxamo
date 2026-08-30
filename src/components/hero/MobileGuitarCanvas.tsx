"use client";

import { Suspense, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RedStrat, CodeShape } from "@/components/three/SimaxModels";

type Tilt = { x: number; y: number };

/**
 * Lets the device gyro (passed in as a tilt ref, see useDeviceTiltRef) gently
 * rotate whichever model sits inside it. Kept tiny — no drei Float, no
 * postprocessing — this is the "lite" mobile treatment.
 */
function TiltGroup({
  tilt,
  baseRotation = [0, 0, 0],
  children,
}: {
  tilt?: MutableRefObject<Tilt>;
  baseRotation?: [number, number, number];
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
      // No gyro available (or permission not granted) — a slow idle spin
      // keeps the object feeling alive instead of static.
      group.current.rotation.y = baseRotation[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.25;
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
  variant?: "guitar" | "code";
  tilt?: MutableRefObject<Tilt>;
}) {
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
          {variant === "guitar" ? (
            <TiltGroup tilt={tilt} baseRotation={[0, 0, 0]}>
              <RedStrat scale={1.6} />
            </TiltGroup>
          ) : (
            <TiltGroup tilt={tilt} baseRotation={[0.3, 0.5, 0]}>
              <group scale={1.6}>
                <CodeShape lite />
              </group>
            </TiltGroup>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
