"use client";

import { useRef } from "react";
import { useAnimationFrame } from "framer-motion";
import { useDeviceTiltRef } from "@/lib/useDeviceTilt";
import { isTouchDevice } from "@/lib/device";

/** A handful of static C++ snippets, scattered decoratively behind the
 *  "Elsewhere" cards — cheap (plain text, no syntax highlighting), and the
 *  WHOLE group moves as one on gyro tilt rather than each snippet
 *  animating individually, so it stays light on phones. */
const SNIPPETS = [
  { text: "#include <iostream>", top: "6%", left: "4%" },
  { text: "template<typename T>", top: "18%", left: "72%" },
  { text: "std::vector<int> v;", top: "38%", left: "10%" },
  { text: "for (int i = 0; i < n; ++i)", top: "58%", left: "66%" },
  { text: "class Simon {", top: "76%", left: "6%" },
  { text: "return 0;", top: "88%", left: "70%" },
];

export function CodeBackdrop() {
  const groupRef = useRef<HTMLDivElement>(null);
  const touch = useRef(isTouchDevice());
  const tilt = useDeviceTiltRef(touch.current);

  // One transform update for the whole group per frame — not per snippet —
  // to keep this cheap on phones. Skips entirely (no-op) on desktop.
  useAnimationFrame(() => {
    if (!touch.current || !groupRef.current) return;
    const x = tilt.current.x * 14;
    const y = tilt.current.y * 10;
    groupRef.current.style.transform = `translate(${y}px, ${x}px)`;
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.14]"
    >
      <div ref={groupRef} className="absolute inset-0 will-change-transform">
        {SNIPPETS.map((s) => (
          <span
            key={s.text}
            className="absolute whitespace-nowrap font-mono text-[0.7rem] text-accent sm:text-xs"
            style={{ top: s.top, left: s.left }}
          >
            {s.text}
          </span>
        ))}
      </div>
    </div>
  );
}
