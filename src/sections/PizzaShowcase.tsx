"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

// Three.js is already in the app; the pizza scene itself loads only when the section nears the screen.
const PizzaScene = dynamic(() => import("@/components/three/PizzaScene").then((m) => m.PizzaScene), {
  ssr: false,
  loading: () => null,
});

const LIVE_URL = "https://forfranny.vercel.app/";

/**
 * "Ovenlight" — a pizzeria site Simon built. A small live 3D pizza you can lean, tap and slice,
 * with a link out to the full site. Sits in the black-and-white (mono) part of the page.
 */
export function PizzaShowcase() {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false); // mount the 3D scene
  const [visible, setVisible] = useState(false); // render frames
  const [left, setLeft] = useState(8);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="pizza"
      aria-label="Ovenlight pizzeria — 3D pizza demo"
      data-section="pizza"
      className="relative mx-auto max-w-[1200px] scroll-mt-24 px-5 py-20 md:px-10 md:py-28"
    >
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <SectionHeading
            kicker="Built for a pizzeria"
            title="Ovenlight"
            lede="A pizza restaurant site I designed and coded — with a 3D pizza you can spin, tilt and slice. Tap it to pull a slice out."
          />
          <Reveal delay={2}>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li>· Next.js + Three.js, no video — a real 3D scene</li>
              <li>· Leans toward your mouse, or your phone when you tilt it</li>
              <li>· Menu, custom pizza builder and cart on the full site</li>
            </ul>
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/10 px-6 py-3 text-xs uppercase tracking-wider2 text-ink transition-colors hover:bg-accent/25"
            >
              See the full site
              <span aria-hidden>↗</span>
            </a>
          </Reveal>
        </div>

        <div
          ref={box}
          className="relative mx-auto aspect-square w-full max-w-[460px] select-none rounded-3xl border border-line/60 bg-surface/30"
        >
          {near && (
            <div className="absolute inset-0">
              <PizzaScene visible={visible} onTake={setLeft} />
            </div>
          )}
          <span className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[0.62rem] uppercase tracking-wider2 text-faint">
            {left === 8 ? "Tap the pizza" : left === 0 ? "Fresh pie coming…" : `${left} slice${left > 1 ? "s" : ""} left`}
          </span>
        </div>
      </div>
    </section>
  );
}
