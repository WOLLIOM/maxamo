"use client";

import { useEffect, useRef, useState } from "react";

/** Mounts children only when the placeholder nears the viewport (saves mobile TBT). */
export function DeferredSection({
  children,
  className = "",
  minHeight = "min-h-[420px]",
  rootMargin = "280px",
}: {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {show ? children : <div className={minHeight} aria-hidden />}
    </div>
  );
}
