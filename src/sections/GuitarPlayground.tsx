"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { WireframeMotif } from "@/components/ui/WireframeMotif";

const RedStratViewer = dynamic(
  () => import("@/components/three/RedStratViewer").then((m) => m.RedStratViewer),
  { ssr: false, loading: () => null },
);

const FUN_FACTS = [
  "This red Strat was Simon's first guitar.",
  "Every fret above still gets played through a real Web Audio pluck — no samples.",
  "He's logged 300+ hours playing live, most of it as a church volunteer musician.",
  "The jazzier the section, the closer you are to where this all started.",
];

/* ---------------------------------------------------------------------------
   A small, real interactive guitar corner:
     · three open-chord diagrams (G, C, Em) with a one-line tip each
     · a clickable 6-string / 5-fret board that plays the actual pitch for
       that string+fret using the Web Audio API (no samples needed)
   Nobody asked us to fake it, so nothing here is decorative — every fret you
   click makes the correct note.
--------------------------------------------------------------------------- */

// Standard tuning, low to high, as MIDI note numbers: E2 A2 D3 G3 B3 E4
const OPEN_STRING_MIDI = [40, 45, 50, 55, 59, 64];
const STRING_LABELS = ["E", "A", "D", "G", "B", "e"];
const FRET_COUNT = 5;

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Simple plucked-string pluck: a decaying tone, no samples required. */
function pluck(ctx: AudioContext, freq: number) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = freq * 2; // a touch of harmonic body
  const gain2 = ctx.createGain();
  gain2.gain.value = 0.12;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

  osc.connect(gain).connect(ctx.destination);
  osc2.connect(gain2).connect(gain);

  osc.start(now);
  osc2.start(now);
  osc.stop(now + 1.35);
  osc2.stop(now + 1.35);
}

// Chord shapes: fret per string (low E → high e), -1 = don't play, 0 = open.
const CHORDS: { name: string; frets: number[]; tip: string }[] = [
  {
    name: "G major",
    frets: [3, 2, 0, 0, 3, 3],
    tip: "Anchor your middle finger on the low E first — the rest of the shape falls into place around it.",
  },
  {
    name: "C major",
    frets: [-1, 3, 2, 0, 1, 0],
    tip: "Keep your thumb low on the back of the neck so your fingers can arch and avoid muting the open strings.",
  },
  {
    name: "E minor",
    frets: [0, 2, 2, 0, 0, 0],
    tip: "The easiest full-sounding chord on the guitar — great for building strumming-hand rhythm before worrying about the fretting hand.",
  },
];

function ChordDiagram({ frets, name }: { frets: number[]; name: string }) {
  const w = 120;
  const h = 140;
  const stringGap = w / 5;
  const fretGap = (h - 20) / 4;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label={`${name} chord diagram`}>
        {/* nut */}
        <rect x={0} y={12} width={w} height={3} fill="currentColor" className="text-ink/70" />
        {/* frets */}
        {Array.from({ length: 4 }).map((_, i) => (
          <line
            key={i}
            x1={0}
            y1={12 + fretGap * (i + 1)}
            x2={w}
            y2={12 + fretGap * (i + 1)}
            stroke="currentColor"
            className="text-line"
          />
        ))}
        {/* strings */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={i}
            x1={stringGap * i}
            y1={12}
            x2={stringGap * i}
            y2={h - 8}
            stroke="currentColor"
            className="text-line"
          />
        ))}
        {/* dots + open/mute markers */}
        {frets.map((f, i) => {
          const x = stringGap * i;
          if (f === -1) {
            return (
              <text key={i} x={x} y={8} textAnchor="middle" fontSize="9" className="fill-muted">
                ×
              </text>
            );
          }
          if (f === 0) {
            return (
              <circle
                key={i}
                cx={x}
                cy={6}
                r={3.4}
                fill="none"
                stroke="currentColor"
                className="text-accent"
                strokeWidth={1.3}
              />
            );
          }
          return (
            <circle
              key={i}
              cx={x}
              cy={12 + fretGap * (f - 0.5)}
              r={5.5}
              className="fill-accent"
            />
          );
        })}
      </svg>
      <span className="font-serif text-lg text-ink">{name}</span>
    </div>
  );
}

export function GuitarPlayground() {
  const [activeChord, setActiveChord] = useState(0);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [factIndex, setFactIndex] = useState<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  function revealFact() {
    setFactIndex((i) => (i === null ? 0 : (i + 1) % FUN_FACTS.length));
  }

  function getCtx() {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }

  function playNote(stringIndex: number, fret: number) {
    const midi = OPEN_STRING_MIDI[stringIndex] + fret;
    pluck(getCtx(), midiToFreq(midi));
    setLastPlayed(`${STRING_LABELS[stringIndex]} string, fret ${fret}`);
  }

  function playChord(frets: number[]) {
    const ctx = getCtx();
    frets.forEach((f, i) => {
      if (f === -1) return;
      const midi = OPEN_STRING_MIDI[i] + f;
      // slight strum stagger, low to high
      setTimeout(() => pluck(ctx, midiToFreq(midi)), i * 28);
    });
    setLastPlayed(`Strummed ${CHORDS[activeChord].name}`);
  }

  return (
    <section
      id="guitar"
      aria-label="Guitar corner"
      data-section="guitar"
      data-palette="warm"
      data-cursor="box"
      className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32"
    >
      <WireframeMotif
        size={130}
        opacity={0.13}
        duration={38}
        className="absolute -left-4 top-2 hidden lg:block"
      />
      <WireframeMotif
        size={200}
        opacity={0.1}
        duration={52}
        reverse
        className="absolute -right-10 bottom-0 hidden lg:block"
      />
      <SectionHeading
        kicker="Strings & Stories"
        title="Learn a little guitar with me"
        align="center"
      />
      <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted">
        Every dot below plays a real note — click through a chord shape, or
        tap the fretboard and hear it for yourself.
      </p>

      <div className="mt-14 flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={revealFact}
          className="group relative"
          aria-label="Click for a fun fact about this guitar"
        >
          <RedStratViewer />
          <span className="absolute bottom-2 right-2 max-w-[calc(100%-1rem)] truncate rounded-full border border-line/60 bg-bg/70 px-2.5 py-1 text-[0.55rem] uppercase tracking-wider2 text-muted backdrop-blur-sm transition-colors group-hover:border-accent group-hover:text-accent sm:bottom-3 sm:right-3 sm:max-w-none sm:px-3 sm:py-1.5 sm:text-[0.6rem]">
            Click for a story
          </span>
        </button>

        {factIndex !== null && (
          <p
            key={factIndex}
            className="max-w-sm animate-[fadeUp_0.6s_ease] text-balance text-center font-serif text-lg italic text-accent"
            style={{
              textShadow: "0 0 18px rgb(var(--c-accent)/0.35)",
            }}
          >
            {FUN_FACTS[factIndex]}
          </p>
        )}
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
        {/* Chord picker */}
        <Reveal>
          <div
            className="flex flex-col items-center gap-6 rounded-3xl border p-8"
            style={{
              borderColor: "rgb(var(--c-gold)/0.3)",
              background:
                "linear-gradient(160deg, rgb(var(--c-gold)/0.08), rgb(var(--c-surface)/0.5))",
            }}
          >
            <div className="flex gap-2">
              {CHORDS.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setActiveChord(i)}
                  className={`rounded-full border px-4 py-2 text-[0.65rem] uppercase tracking-wider2 transition-colors ${
                    activeChord === i
                      ? "border-accent bg-accent text-bg"
                      : "border-line text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="text-ink">
              <ChordDiagram frets={CHORDS[activeChord].frets} name={CHORDS[activeChord].name} />
            </div>

            <button
              type="button"
              onClick={() => playChord(CHORDS[activeChord].frets)}
              className="rounded-full bg-accent px-6 py-3 text-[0.68rem] uppercase tracking-wider2 text-bg transition-all hover:brightness-110"
            >
              Strum it
            </button>

            <p className="max-w-xs text-center text-xs text-muted">{CHORDS[activeChord].tip}</p>
          </div>
        </Reveal>

        {/* Interactive fretboard */}
        <Reveal delay={1}>
          <div
            className="rounded-3xl border p-6 md:p-8"
            style={{
              borderColor: "rgb(var(--c-gold)/0.3)",
              background:
                "linear-gradient(160deg, rgb(var(--c-gold)/0.08), rgb(var(--c-surface)/0.5))",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-wider2 text-muted">
                Tap a fret to hear it
              </span>
              <span className="min-h-[1em] text-[0.65rem] uppercase tracking-wider2 text-accent">
                {lastPlayed ?? ""}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {STRING_LABELS.slice()
                .reverse()
                .map((label, revIdx) => {
                  const stringIndex = STRING_LABELS.length - 1 - revIdx;
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <span className="w-4 shrink-0 font-serif text-sm text-muted">{label}</span>
                      <div className="flex flex-1 gap-1.5">
                        {Array.from({ length: FRET_COUNT + 1 }).map((_, fret) => (
                          <button
                            key={fret}
                            type="button"
                            onClick={() => playNote(stringIndex, fret)}
                            aria-label={`Play ${label} string, fret ${fret}`}
                            className="flex h-9 flex-1 items-center justify-center rounded-md border text-[0.6rem] text-muted transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent active:translate-y-0"
                            style={{
                              borderColor: "rgb(var(--c-gold)/0.25)",
                              background: "rgb(var(--c-gold)/0.06)",
                            }}
                          >
                            {fret === 0 ? "○" : fret}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
            <p className="mt-5 text-xs text-muted">
              Tip: try clicking fret 3 on the low E, then open on the A, D, and
              high e strings — that&apos;s the skeleton of the G major shape above.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
