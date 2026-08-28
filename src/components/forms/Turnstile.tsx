"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cloudflare Turnstile — privacy-friendly, invisible-capable spam protection.
 * Renders only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; otherwise the form
 * treats verification as passed (useful in local dev). See README for setup.
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

export const turnstileEnabled = Boolean(SITE_KEY);

export function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!SITE_KEY) {
      onVerify("dev-mode");
      return;
    }
    const id = "cf-turnstile-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = () => setLoaded(true);
      document.head.appendChild(s);
    } else {
      setLoaded(true);
    }
  }, [onVerify]);

  useEffect(() => {
    if (!loaded || !SITE_KEY || !ref.current || !window.turnstile) return;
    window.turnstile.render(ref.current, {
      sitekey: SITE_KEY,
      theme: "auto",
      callback: (token: string) => onVerify(token),
    });
  }, [loaded, onVerify]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="mt-2" />;
}
