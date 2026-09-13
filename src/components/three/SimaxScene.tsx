"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import {
  Guitar,
  RealGuitar,
  MusicNote,
  VinylDisc,
  Planet,
  ArchBlock,
  CodeShape,
  SaturnModel,
  NotaGLB,
  GOLD,
} from "./SimaxModels";

type Look = { x: number; y: number };

export type ScrollProgressRef = React.MutableRefObject<number>;

/* ─────────────────────────────────────────────────────────────────
   3D PIECE CONFIGURATION — Edit positions, scales, rotations here.
   Each piece is named so you can easily adjust them locally.

   HOW TO EDIT LOCALLY:
   1. Change any [x, y, z] position, rotation, or scale below
   2. Run: npm run dev
   3. Reload browser to see changes in real-time
   4. When happy, tell Claude to push it out

   Parameters:
   - position: [x-left/right, y-up/down, z-forward/back]
   - rotation: [pitch, yaw, roll] in radians (use Math.PI/N)
   - scale: size multiplier (1 = default)
   - speed: float animation speed (higher = faster bobbing)
   - depth: parallax depth during scroll (higher = moves more)
   ───────────────────────────────────────────────────────────────── */
const PIECE_CONFIG = {
  guitar: {
    name: "Guitar",
    position: [0, 0.3, 0.6] as const,
    // Mobile: nudged left + shrunk a touch so it's centered and fits the
    // narrower portrait frame instead of feeling off-center/oversized.
    mobilePosition: [-0.7, 0.3, 0.6] as const,
    mobileScale: 4.4,
    rotation: [Math.PI / 2.5, 2, Math.PI / -2] as const,
    scale: 5.2,
    speed: 1.7,
    depth: 0.6,
    modelScale: undefined, // RealGuitar uses scale prop
  },
  vinyl: {
    name: "Vinyl Disc",
    position: [-3.5, -1.5, -0.1] as const,
    rotation: [1.15, 0.5, 0.15] as const,
    scale: 1,
    speed: 8.1,
    depth: 2.1,
  },
  saturn: {
    name: "Saturn",
    position: [3.5, 0.1, -1.2] as const,
    rotation: [0.15, -0.55, 0.08] as const,
    scale: 1,
    speed: 2.2,
    depth: 1.4,
    modelScale: 0.42,
  },
  archBlock: {
    name: "Architecture Block",
    position: [-3.8, 1.3, -0.5] as const,
    mobilePosition: [-2.1, -1.1, -0.5] as const,
    rotation: [0.15, 0.35, 0] as const,
    scale: 1.2,
    speed: 3.35,
    depth: 1.8,
  },
  codeShape: {
    name: "Code Shape",
    position: [4.5, -1.4, -0.3] as const,
    // Mobile: pulled inward from the desktop-only far-right spot so it's
    // actually inside the narrower portrait frame instead of clipped off.
    mobilePosition: [2.3, 0.9, -0.3] as const,
    rotation: [0.35, -0.2, 0.15] as const,
    scale: 1.2,
    speed: 1.15,
    depth: 2.2,
  },
  notaGLB: {
    name: "Music Note (GLB)",
    position: [2.0, 1.55, -1.2] as const,
    rotation: [0.2, -0.3, 0.1] as const,
    scale: 1.05,
    speed: 1.05,
    depth: 1.0,
    modelScale: 0.85,
  },
  noteRed: {
    name: "Music Note (Red)",
    position: [-2.1, -2.1, 0.35] as const,
    mobilePosition: [1.4, -1.9, 0.35] as const,
    rotation: [0.25, 0.5, -0.1] as const,
    scale: 1.05,
    speed: 1.25,
    depth: 2.0,
    modelScale: 0.65,
    color: "#a82026",
  },
};

/**
 * Camera dollies through the object arrangement as the page scrolls —
 * same idea as the Horizon demo, but warm / restaurant, not cosmos.
 * Scroll up reverses it smoothly via the shared progress ref.
 */
function ScrollCamera({
  progressRef,
  lite,
}: {
  progressRef: ScrollProgressRef;
  lite: boolean;
}) {
  const { camera } = useThree();
  const smooth = useRef(0);
  const look = useRef(new THREE.Vector3(0, 0, 0));

  // Keyframes: start wide → glide in → intimate close-up.
  //
  // GENTLE-ZOOM EXPERIMENT (2026-09-12): the camera now stays much further
  // back so the models only get a little bigger as you scroll, instead of
  // the guitar zooming huge on the first flick. To revert to the old strong
  // dolly, swap the `keys` assignment back to OLD_KEYS below.
  const OLD_KEYS = lite
    ? [
        { p: 0, pos: [0, 0.25, 8.4] as const, look: [0, 0, 0] as const },
        { p: 1, pos: [0.4, 0.55, 5.2] as const, look: [0, 0.1, 0] as const },
      ]
    : [
        { p: 0, pos: [0, 0.2, 8.4] as const, look: [0, 0, 0] as const },
        { p: 0.45, pos: [1.1, 0.55, 5.8] as const, look: [0.1, 0.1, -0.2] as const },
        { p: 1, pos: [-0.6, 0.9, 3.6] as const, look: [0, 0.15, 0] as const },
      ];
  void OLD_KEYS; // kept for easy revert — see comment above
  const keys = lite
    ? [
        { p: 0, pos: [0, 0.25, 8.4] as const, look: [0, 0, 0] as const },
        { p: 1, pos: [0.3, 0.45, 7.4] as const, look: [0, 0.1, 0] as const },
      ]
    : [
        { p: 0, pos: [0, 0.2, 8.4] as const, look: [0, 0, 0] as const },
        { p: 0.45, pos: [0.5, 0.4, 7.8] as const, look: [0.05, 0.1, -0.1] as const },
        { p: 1, pos: [-0.3, 0.55, 6.9] as const, look: [0, 0.12, 0] as const },
      ];

  useFrame((_, delta) => {
    const target = progressRef.current;
    smooth.current = THREE.MathUtils.damp(smooth.current, target, 3.2, delta);
    const t = smooth.current;

    // Find surrounding keyframes and lerp
    let a = keys[0];
    let b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (t >= keys[i].p && t <= keys[i + 1].p) {
        a = keys[i];
        b = keys[i + 1];
        break;
      }
    }
    const span = Math.max(0.0001, b.p - a.p);
    const u = THREE.MathUtils.clamp((t - a.p) / span, 0, 1);
    const e = u * u * (3 - 2 * u); // smoothstep

    camera.position.x = THREE.MathUtils.lerp(a.pos[0], b.pos[0], e);
    camera.position.y = THREE.MathUtils.lerp(a.pos[1], b.pos[1], e);
    camera.position.z = THREE.MathUtils.lerp(a.pos[2], b.pos[2], e);

    look.current.set(
      THREE.MathUtils.lerp(a.look[0], b.look[0], e),
      THREE.MathUtils.lerp(a.look[1], b.look[1], e),
      THREE.MathUtils.lerp(a.look[2], b.look[2], e),
    );
    camera.lookAt(look.current);
  });

  return null;
}

/**
 * Deep-red / gold floating dust motes + soft mist sheets for depth —
 * SIMAX cinematic studio atmosphere, halfway between a stage and a starfield.
 */
function Atmosphere({
  progressRef,
  lite,
}: {
  progressRef: ScrollProgressRef;
  lite: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const mist = useRef<THREE.Mesh>(null);
  const mistMat = useRef<THREE.MeshBasicMaterial>(null);

  const positions = useMemo(() => {
    const count = lite ? 80 : 220;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
    }
    return arr;
  }, [lite]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = progressRef.current;
    if (group.current) {
      group.current.position.z = THREE.MathUtils.damp(
        group.current.position.z,
        p * 2.4,
        2.5,
        delta,
      );
      group.current.rotation.y = t * 0.02;
    }
    if (mist.current) {
      mist.current.position.z = -4 - p * 3;
    }
    if (mistMat.current) {
      mistMat.current.opacity = 0.08 + p * 0.1;
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#c4a260"
          size={lite ? 0.04 : 0.055}
          sizeAttenuation
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={mist} position={[0, 0, -4]}>
        <planeGeometry args={[22, 14]} />
        <meshBasicMaterial
          ref={mistMat}
          color="#7a2a2e"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>
      {!lite && (
        <>
          <mesh position={[-5, -1.5, -6]} rotation={[0.1, 0.3, 0]}>
            <planeGeometry args={[10, 8]} />
            <meshBasicMaterial
              color="#a82026"
              transparent
              opacity={0.05}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[5, 1, -7]} rotation={[-0.1, -0.25, 0]}>
            <planeGeometry args={[9, 7]} />
            <meshBasicMaterial
              color="#b0b6be"
              transparent
              opacity={0.04}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

/**
 * Scroll-driven depth only — the cluster no longer tilts as a whole
 * toward the cursor. Each object now reacts individually on hover
 * instead (see Piece below), which reads as a much more "3D" feel
 * than the whole group swinging together.
 */
function ParallaxRig({
  gyro,
  progressRef,
  children,
}: {
  gyro: React.MutableRefObject<Look>;
  progressRef: ScrollProgressRef;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    const p = progressRef.current;
    const damp = 1 - p * 0.35;
    // Only device-tilt (mobile/tablet gyro) nudges the whole cluster now —
    // desktop cursor movement no longer rotates it.
    const targetX = gyro.current.x * 0.35 * damp;
    const targetY = gyro.current.y * 0.4 * damp;
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      THREE.MathUtils.clamp(targetX, -0.35, 0.35),
      4,
      delta,
    );
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      THREE.MathUtils.clamp(targetY, -0.55, 0.55),
      4,
      delta,
    );
    // Parallax depth: whole cluster drifts toward camera a little on scroll.
    // Gentle-zoom experiment: was `p * 1.2` — reduced so the cluster barely
    // creeps forward. Restore 1.2 to bring the old feel back.
    group.current.position.z = THREE.MathUtils.damp(
      group.current.position.z,
      p * 0.5,
      2.8,
      delta,
    );
  });
  return <group ref={group}>{children}</group>;
}

function Piece({
  position,
  rotation = [0, 0, 0],
  speed = 1,
  scale = 1,
  float = true,
  depth = 1,
  progressRef,
  children,
}: {
  position: readonly [number, number, number];
  rotation?: readonly [number, number, number];
  speed?: number;
  scale?: number;
  float?: boolean;
  depth?: number;
  progressRef?: ScrollProgressRef;
  children: React.ReactNode;
}) {
  const offset = useRef<THREE.Group>(null);
  const hoverGroup = useRef<THREE.Group>(null);
  const wasHovered = useRef(false);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!offset.current || !progressRef) return;
    const p = progressRef.current;
    // Gentle-zoom experiment: was `p * depth * 1.8` — halved so individual
    // pieces don't rush the camera on scroll. Restore 1.8 for the old feel.
    offset.current.position.z = THREE.MathUtils.damp(
      offset.current.position.z,
      p * depth * 0.8,
      3,
      delta,
    );

    // The hovered piece pops toward the viewer, grows noticeably bigger,
    // and keeps spinning slowly while hovered — reads as a genuinely
    // present, "pick me up" 3D object rather than a flat hover tint.
    if (hoverGroup.current) {
      const targetScale = hovered ? 1.35 * scale : scale;  // Multiply by config scale, not replace
      const s = THREE.MathUtils.damp(hoverGroup.current.scale.x, targetScale, 6, delta);
      hoverGroup.current.scale.setScalar(s);
      // IMPORTANT: add the hover-pop offset on top of the piece's own
      // base position[1]/[2] — don't replace it, or every config Y/Z
      // you set gets silently damped back to 0 within about a second.
      hoverGroup.current.position.y = THREE.MathUtils.damp(
        hoverGroup.current.position.y,
        position[1] + (hovered ? 0.18 : 0),
        6,
        delta,
      );
      hoverGroup.current.position.z = THREE.MathUtils.damp(
        hoverGroup.current.position.z,
        position[2] + (hovered ? 0.9 : 0),
        5,
        delta,
      );
      if (hovered) {
        hoverGroup.current.rotation.y += delta * 0.9;
        wasHovered.current = true;
      } else {
        // The spin above can wind rotation.y many turns past the resting
        // angle. Snap it to the closest equivalent angle the instant hover
        // ends, so it settles back quickly instead of visibly "unwinding"
        // for a second or two after the cursor has already left.
        if (wasHovered.current) {
          const twoPi = Math.PI * 2;
          let diff = (hoverGroup.current.rotation.y - rotation[1]) % twoPi;
          if (diff > Math.PI) diff -= twoPi;
          if (diff < -Math.PI) diff += twoPi;
          hoverGroup.current.rotation.y = rotation[1] + diff;
          wasHovered.current = false;
        }
        hoverGroup.current.rotation.y = THREE.MathUtils.damp(
          hoverGroup.current.rotation.y,
          rotation[1],
          4,
          delta,
        );
      }
    }
  });

  const body = (
    <group
      ref={hoverGroup}
      position={position}
      rotation={rotation}
      scale={scale}
      data-cursor="food"
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      {children}
    </group>
  );

  return (
    <group ref={offset}>
      {float ? (
        <Float speed={speed} rotationIntensity={0.35} floatIntensity={0.55}>
          {body}
        </Float>
      ) : (
        body
      )}
    </group>
  );
}

function Scene({
  lite,
  progressRef,
}: {
  lite: boolean;
  progressRef: ScrollProgressRef;
}) {
  const gyro = useRef<Look>({ x: 0, y: 0 });

  useEffect(() => {
    let baseBeta: number | null = null;
    let baseGamma: number | null = null;

    function onOrient(e: DeviceOrientationEvent) {
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;
      if (baseBeta === null) {
        baseBeta = beta;
        baseGamma = gamma;
      }
      gyro.current.x = THREE.MathUtils.clamp((beta - (baseBeta ?? 0)) / 28, -1, 1);
      gyro.current.y = THREE.MathUtils.clamp((gamma - (baseGamma ?? 0)) / 28, -1, 1);
    }

    window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  return (
    <>
      <ScrollCamera progressRef={progressRef} lite={lite} />
      <Atmosphere progressRef={progressRef} lite={lite} />

      <ambientLight intensity={lite ? 0.7 : 0.45} />
      <hemisphereLight args={["#3a2430", "#1a1418", lite ? 0.5 : 0.3]} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={lite ? 1.6 : 2.1}
        castShadow={!lite}
        shadow-mapSize={lite ? [512, 512] : [1024, 1024]}
        color="#f0d8c4"
      />
      {!lite && (
        <>
          <directionalLight position={[-6, 3, -4]} intensity={0.6} color="#a82026" />
          <spotLight
            position={[0, 6, 2]}
            angle={0.55}
            penumbra={0.7}
            intensity={1.4}
            color="#c4a260"
          />
        </>
      )}

      <ParallaxRig gyro={gyro} progressRef={progressRef}>
        {/* Guitar */}
        <Piece
          position={lite ? PIECE_CONFIG.guitar.mobilePosition : PIECE_CONFIG.guitar.position}
          rotation={PIECE_CONFIG.guitar.rotation}
          speed={PIECE_CONFIG.guitar.speed}
          scale={1}
          float={!lite}
          depth={PIECE_CONFIG.guitar.depth}
          progressRef={progressRef}
        >
          <RealGuitar
            scale={
              (lite ? PIECE_CONFIG.guitar.mobileScale : undefined) ||
              PIECE_CONFIG.guitar.modelScale ||
              PIECE_CONFIG.guitar.scale
            }
          />
        </Piece>

        {/* Vinyl */}
        <Piece
          position={PIECE_CONFIG.vinyl.position}
          rotation={PIECE_CONFIG.vinyl.rotation}
          speed={PIECE_CONFIG.vinyl.speed}
          float={!lite}
          depth={PIECE_CONFIG.vinyl.depth}
          progressRef={progressRef}
        >
          <VinylDisc lite={lite} />
        </Piece>

        {/* Saturn */}
        <Piece
          position={PIECE_CONFIG.saturn.position}
          rotation={PIECE_CONFIG.saturn.rotation}
          speed={PIECE_CONFIG.saturn.speed}
          float={!lite}
          depth={PIECE_CONFIG.saturn.depth}
          progressRef={progressRef}
        >
          <SaturnModel scale={PIECE_CONFIG.saturn.modelScale} />
        </Piece>

        {/* Architecture Block */}
        <Piece
          position={lite ? PIECE_CONFIG.archBlock.mobilePosition : PIECE_CONFIG.archBlock.position}
          rotation={PIECE_CONFIG.archBlock.rotation}
          speed={PIECE_CONFIG.archBlock.speed}
          scale={PIECE_CONFIG.archBlock.scale}
          float={!lite}
          depth={PIECE_CONFIG.archBlock.depth}
          progressRef={progressRef}
        >
          <ArchBlock lite={lite} />
        </Piece>

        {/* Code Shape */}
        <Piece
          position={lite ? PIECE_CONFIG.codeShape.mobilePosition : PIECE_CONFIG.codeShape.position}
          rotation={PIECE_CONFIG.codeShape.rotation}
          speed={PIECE_CONFIG.codeShape.speed}
          scale={PIECE_CONFIG.codeShape.scale}
          float={!lite}
          depth={PIECE_CONFIG.codeShape.depth}
          progressRef={progressRef}
        >
          <CodeShape lite={lite} />
        </Piece>

        {!lite && (
          <>
            {/* Music Note (GLB) — the heavier of the two note models, kept
                desktop-only for performance. */}
            <Piece
              position={PIECE_CONFIG.notaGLB.position}
              rotation={PIECE_CONFIG.notaGLB.rotation}
              speed={PIECE_CONFIG.notaGLB.speed}
              scale={PIECE_CONFIG.notaGLB.scale}
              depth={PIECE_CONFIG.notaGLB.depth}
              progressRef={progressRef}
            >
              <NotaGLB scale={PIECE_CONFIG.notaGLB.modelScale} />
            </Piece>
          </>
        )}

        {/* Music Note (Red) — the lighter procedural note. Simon wanted this
            visible on mobile too, so it's not gated behind `!lite`. */}
        <Piece
          position={lite ? PIECE_CONFIG.noteRed.mobilePosition : PIECE_CONFIG.noteRed.position}
          rotation={PIECE_CONFIG.noteRed.rotation}
          speed={PIECE_CONFIG.noteRed.speed}
          scale={PIECE_CONFIG.noteRed.scale}
          depth={PIECE_CONFIG.noteRed.depth}
          progressRef={progressRef}
        >
          <MusicNote color={PIECE_CONFIG.noteRed.color} scale={PIECE_CONFIG.noteRed.modelScale} />
        </Piece>
      </ParallaxRig>

      {!lite && (
        <>
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.32}
            scale={14}
            blur={2.8}
            far={5}
            resolution={256}
            color="#1a0a0c"
          />
          <Environment resolution={256}>
            <Lightformer intensity={1.8} position={[0, 4, 2]} scale={[8, 3, 1]} color="#c4a260" />
            <Lightformer intensity={1.2} position={[-4, 1, 2]} scale={[3, 5, 1]} color="#a82026" />
            <Lightformer intensity={1} position={[4, -1, 3]} scale={[4, 4, 1]} color="#b0b6be" />
          </Environment>
        </>
      )}
    </>
  );
}

function useIsLiteDevice() {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const touch =
      window.matchMedia("(pointer: coarse)").matches ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 900);
    const cores = navigator.hardwareConcurrency ?? 8;
    setLite(touch || cores <= 2);
  }, []);
  return lite;
}

export default function SimaxScene({
  progressRef,
}: {
  progressRef: ScrollProgressRef;
}) {
  const lite = useIsLiteDevice();

  return (
    <Canvas
      shadows={!lite}
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      gl={{
        antialias: !lite,
        alpha: true,
        powerPreference: lite ? "low-power" : "high-performance",
        stencil: false,
        premultipliedAlpha: true,
      }}
      // Mobile portrait has a much narrower aspect ratio than desktop, so a
      // wider FOV (and slightly further-back camera) keeps the repositioned
      // pieces from clipping at the edges of the frame.
      camera={{ position: lite ? [0, 0.2, 9.6] : [0, 0.2, 8.4], fov: lite ? 44 : 36 }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
      }}
      frameloop={lite ? "demand" : "always"}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.style.pointerEvents = "none";
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => e.preventDefault(),
          false,
        );
      }}
    >
      <Suspense fallback={null}>
        <Scene lite={lite} progressRef={progressRef} />
      </Suspense>
    </Canvas>
  );
}
