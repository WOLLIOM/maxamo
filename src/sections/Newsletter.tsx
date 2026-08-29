"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    // Wire this to your ESP (Mailchimp/Buttondown/Resend) — see README.
    setDone(true);
  }

  return (
    <section
      aria-label="Newsletter"
      data-section="newsletter"
      data-palette="pink"
      className="border-y border-line/60 bg-surface/30 py-20 md:py-28"
    >
      <div className="mx-auto max-w-2xl px-5 text-center md:px-10">
        <Reveal>
          <span className="kicker">Stay in the loop</span>
          <h2 className="mt-5 font-serif text-fluid-h3 text-ink">
            Get updates on new projects
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted">
            An occasional note when I ship something new — a game update, a
            new build, or a project worth sharing.
          </p>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-10">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.p
                  key="done"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-serif text-2xl text-accent"
                >
                  Thanks — you'll hear from me when there's something new.
                </motion.p>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <label htmlFor="nl-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="nl-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 rounded-full border border-line bg-bg/60 px-6 py-3.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-accent px-7 py-3.5 text-[0.7rem] uppercase tracking-wider2 text-bg transition-all duration-500 hover:brightness-110"
                  >
                    Subscribe
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
            {error && <p className="mt-3 text-sm text-accent">{error}</p>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
