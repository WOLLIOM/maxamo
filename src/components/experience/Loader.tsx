"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "@/components/providers/AudioProvider";
import { isTouchDevice } from "@/lib/device";
import { site } from "@/lib/site";

/**
 * A short, wordless overture (~2.4s): an ink bloom, a slowly spinning vinyl
 * disc with a guitar pick as the label, and the SIMAX wordmark settling into
 * place. It auto-dismisses — no spinner, no "enter with sound?" wall.
 * Clicking anywhere simply enters a touch sooner and, being a user gesture,
 * lets the ambient track begin immediately.
 */
export function Loader({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const audio = useAudio();
  const doneRef = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 200);
    const t2 = setTimeout(() => setStage(2), 900);
    const auto = setTimeout(() => leave(), isTouchDevice() ? 1400 : 2500);
    return () => [t1, t2, auto].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function leave(fromGesture = false) {
    if (doneRef.current) return;
    doneRef.current = true;
    if (fromGesture) audio.enable(); // begin the soundtrack on this gesture
    setLeaving(true);
    setTimeout(onDone, 900);
  }

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          role="button"
          tabIndex={0}
          aria-label={`Enter ${site.name}`}
          onClick={() => leave(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") leave(true);
          }}
          className="fixed inset-0 z-[10000] flex cursor-none flex-col items-center justify-center overflow-hidden bg-bg"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* ink bloom */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgb(var(--c-accent)/0.14), transparent 68%)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: stage >= 1 ? 240 : 0 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* the spinning vinyl */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={stage >= 1 ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 9, ease: "linear", repeat: Infinity }}
              className="relative h-24 w-24 md:h-28 md:w-28"
            >
              <Vinyl />
            </motion.div>
            {/* orbiting pick */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, ease: "linear", repeat: Infinity }}
              className="absolute inset-0"
            >
              <svg
                className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
                width="10"
                height="12"
                viewBox="0 0 24 30"
              >
                <path
                  d="M12 0C18.5 0 23 5.6 23 12.4C23 18 18 24.5 12.6 29.3C12.3 29.6 11.7 29.6 11.4 29.3C6 24.5 1 18 1 12.4C1 5.6 5.5 0 12 0Z"
                  fill="#c4a260"
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={stage >= 2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col items-center gap-2 text-center"
          >
            <span className="font-serif text-4xl text-ink md:text-5xl">
              {site.name}
            </span>
            <span className="text-[0.62rem] uppercase tracking-ultra text-muted">
              {site.name} · {site.tagline}
            </span>
          </motion.div>

          {/* corner marks */}
          <div className="pointer-events-none absolute inset-6 md:inset-10">
            {[
              "left-0 top-0 border-l border-t",
              "right-0 top-0 border-r border-t",
              "left-0 bottom-0 border-l border-b",
              "right-0 bottom-0 border-r border-b",
            ].map((c, i) => (
              <motion.span
                key={i}
                className={`absolute h-6 w-6 border-ink/25 ${c}`}
                initial={{ opacity: 0 }}
                animate={stage >= 2 ? { opacity: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.1 * i }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A vinyl record, label in cherry red/gold, rendered with nested rings (theme-independent colours). */
function Vinyl() {
  return (
    <div className="absolute inset-0 rounded-full" style={{ background: "#15110f" }}>
      {/* sheen */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(60% 40% at 32% 24%, rgba(255,255,255,0.14), transparent 60%)",
        }}
      />
      {/* grooves */}
      {[6, 14, 22, 30].map((inset) => (
        <div
          key={inset}
          className="absolute rounded-full border"
          style={{ inset, borderColor: "rgba(196,162,96,0.14)" }}
        />
      ))}
      {/* label */}
      <div
        className="absolute inset-[34px] rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 35%, #c23a34, #a82026 65%, #7c1a1f)",
        }}
      />
      {/* spindle hole */}
      <div
        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "#0d0c0e" }}
      />
    </div>
  );
}
