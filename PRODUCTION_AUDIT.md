# SIMAX — Final Production Audit & Cursor Action Plan

Audited: 2026-09-16 · Live target: https://simonmaxam.pages.dev/
Stack confirmed: Next.js 16 (static export, `output: "export"`), React 19, React-Three-Fiber + drei, Framer Motion, Lenis smooth scroll, Tailwind 3, deployed to Cloudflare Pages via the `SIMNII` repo (build → `out/` → copied into deploy repo).

This document is ordered by **impact ÷ effort**. Do P0 first — two of them are real production bugs with big payoff and tiny diffs. Each item has: the finding, why it matters, exact files, and a ready-to-paste Cursor instruction.

---

## HOW THE SITE IS BUILT (context for every change below)

- **Source repo:** `C:/Users/SimonMaxam/Documents/maxam` (branch `simax`).
- **Deploy repo:** `C:/Users/SimonMaxam/Documents/SIMNII` (branch `main`) — Cloudflare Pages serves this.
- **Build + deploy sequence:**
  1. `npx next build` (type-check / sanity)
  2. `rm -rf out && STATIC_EXPORT=1 npx next build` (emits static `out/`)
  3. `cp -r out/. ../SIMNII/` then commit + push `SIMNII` `main`.
- Home page composition lives in `src/app/page.tsx` behind a `FEATURE_FLAGS` object.
- The 3D hero is `src/sections/Hero.tsx` → `src/components/three/SimaxScene.tsx` (+ `SimaxModels.tsx`). Phones use `src/components/hero/HeroMobileStage.tsx`.

---

## P0 — CRITICAL (do these first; largest payoff, smallest diff)

### P0-1 · Ship 8.9 MB of dead weight on every desktop load (`saturn.glb`)

**Finding (verified):** `public/models/saturn.glb` is **8.9 MB** — bigger than the entire rest of the site's JS. Saturn was removed from the rendered scene, BUT it's still force-downloaded on every desktop visit because the preload call is still at module scope:

- `src/components/three/SimaxModels.tsx` line ~284: `useGLTF.preload("/models/saturn.glb");`
- `SaturnModel` (line ~275) and `VinylDisc` (line ~177) are still **imported** into `src/components/three/SimaxScene.tsx` (lines ~16 and ~20) even though nothing renders them.
- The 8.9 MB file is still copied into `out/models/` and shipped to production.

**Why it matters:** This is almost certainly the site's #1 performance problem. `useGLTF.preload` fires an immediate fetch on load. 8.9 MB over an average connection is seconds of wasted bandwidth + memory, hurts Largest Contentful Paint and mobile data users, and it's invisible — nobody ever sees Saturn. This is the highest impact-to-effort fix in the whole audit.

**Fix (Cursor prompt):**
> In `src/components/three/SimaxModels.tsx`, delete the `SaturnModel` function, the `VinylDisc` function, and the two lines `useGLTF.preload("/models/saturn.glb");` — but keep `music-note.glb`, `taylor-guitar.glb`, and `red-strat.glb` preloads. In `src/components/three/SimaxScene.tsx` remove `VinylDisc` and `SaturnModel` from the import list and delete any remaining references to `PIECE_CONFIG.vinyl` / `PIECE_CONFIG.saturn`. Then run `npx next build` and confirm no unused-import or type errors.

**Then also delete the asset:**
```bash
rm public/models/saturn.glb
```
Re-check nothing else references it: `grep -rn "saturn" src public/models`. Rebuild, redeploy. Verify in production with DevTools → Network that `saturn.glb` no longer appears.

**Also audit the other GLBs while you're here:** `taylor-guitar.glb` is ~1 MB (fine), `music-note.glb` 298 KB, `red-strat.glb` 43 KB. If `red-strat.glb` (the RedStratViewer) isn't actually mounted anywhere on the homepage, gate its preload too.

---

### P0-2 · Social link previews are broken — `og.jpg` 404s in production

**Finding (verified):** `src/app/layout.tsx` declares:
```ts
openGraph: { images: [{ url: "/og.jpg", ... }] },
twitter:   { card: "summary_large_image", images: ["/og.jpg"] },
```
…but `og.jpg` **does not exist** — not in `public/`, not in `out/`, not in the `SIMNII` deploy. `curl https://simonmaxam.pages.dev/og.jpg` → **404**.

**Why it matters:** Every time this link is shared — LinkedIn, X/Twitter, Discord, iMessage, WhatsApp, Slack — the preview card renders with a blank/broken image. For a personal portfolio whose whole job is to impress when shared, this is a silent credibility leak. (You just fixed the favicon-globe issue for the same reason; this is the bigger sibling of that bug.)

**Fix — two options:**

**Option A (fastest, static file):** Create a 1200×630 JPG/PNG named `og.jpg` (dark background, "SIMAX" wordmark + "Simon Maxam — Web developer & 3D artist"), drop it in `public/og.jpg`, rebuild, redeploy. Confirm `curl -I https://simonmaxam.pages.dev/og.jpg` returns `200` and `image/jpeg`.

**Option B (auto-generated, no design work):** Next.js supports a file-based OG image. Because this is a **static export**, the runtime `ImageResponse` route won't work — so generate it at build time instead. Simplest path that fits static export: render an `og.png` with `sharp` in `scripts/` (you already depend on `sharp`) from an SVG template, mirroring how `favicon.ico` was generated. Then reference `/og.png` in metadata.

**Recommendation:** Option A now (5 minutes, unblocks sharing today), consider B later. After deploy, validate with LinkedIn Post Inspector and X Card Validator so their caches refresh.

---

## P1 — HIGH (professional-polish blockers)

### P1-1 · Weak first impression: hero reads as near-empty at scroll top (desktop)

**Finding:** At `scrollY = 0` on desktop the hero shows the "SIMAX" wordmark on a dark field with only faint particles — the guitar/box/note only dolly into frame **after** you start scrolling (`ScrollCamera` keyframes in `SimaxScene.tsx` start wide and move in). A first-time visitor who doesn't scroll immediately sees a mostly empty screen.

**Why it matters:** The 3D scene is the single most memorable, differentiating asset on the site. Hiding it until scroll wastes the most valuable 3 seconds. Premium interactive portfolios (the bar you're aiming for) lead with the hero visual composed and legible on load, then enhance on scroll.

**Fix (design decision, then Cursor):** Recompose the **initial** camera keyframe (progress = 0) in `SimaxScene.tsx` so the guitar + box + note are already tastefully in frame and readable at scroll top, with the scroll dolly adding motion/depth rather than being the thing that first reveals them. Keep the objects clear of the centered wordmark (offset left/right as they are now). Verify at 1440px, 1024px, and 768px that nothing overlaps the "SIMAX" text or the CTA buttons.
> In `src/components/three/SimaxScene.tsx`, adjust the `ScrollCamera` keyframe at progress 0 so the guitar, arch block, and note are already composed within the viewport (not off-frame) on first paint, then let subsequent keyframes dolly/tilt for depth. Do not change the mobile (`lite`) camera. Screenshot-test at 1440/1024/768 widths.

---

### P1-2 · Two conflicting `next.config` files

**Finding:** Both `next.config.js` **and** `next.config.ts` exist.
- `next.config.js` sets `output: "export"` **unconditionally** (plus `trailingSlash`, `images.unoptimized`, `transpilePackages: ["three"]`).
- `next.config.ts` only exports when `STATIC_EXPORT=1`.

Next resolves one and ignores the other (and will warn), so your effective config is ambiguous and depends on resolution order. The `.ts` version's conditional logic (and the `transpilePackages`/`trailingSlash` settings in the `.js` one) may not both be taking effect as intended.

**Why it matters:** Fragile, confusing build config is exactly the kind of thing that silently breaks a deploy later. There should be exactly one source of truth.

**Fix:** Consolidate into a single `next.config.ts`. Decide the intended behaviour (the deploy path always uses `STATIC_EXPORT=1`, so keep the conditional export, but fold in the settings currently only in the `.js`: `transpilePackages: ["three"]`, and `reactStrictMode`). Delete `next.config.js`.
> Merge the two Next config files into a single `next.config.ts`: keep the `STATIC_EXPORT`-conditional `output: "export"` + `images.unoptimized` + `trailingSlash`, and also always apply `reactStrictMode: true` and `transpilePackages: ["three"]`. Delete `next.config.js`. Run both `npx next build` and `STATIC_EXPORT=1 npx next build` to confirm both modes still succeed.

---

### P1-3 · Project identity still says "YŪGEN / sushi" in `package.json`

**Finding:** `package.json` → `"name": "yugen"`, `"description": "YŪGEN — an award-winning cinematic omakase sushi experience."` Leftover from the template this was forked from.

**Why it matters:** Low functional impact, high professionalism signal. Anyone who opens the repo (recruiter, collaborator, future you) sees a sushi restaurant. It also leaks into any tooling that reads the package name.

**Fix:**
> In `package.json` set `"name": "simax"`, `"version"` as you like, and `"description": "SIMAX — Simon Maxam's interactive portfolio (web, apps, 3D)."` Search the repo for other stray "yugen"/"omakase"/"sushi" strings in comments or metadata and update them: `grep -rin "yugen\|omakase\|sushi" src public *.json *.ts *.js`.

---

### P1-4 · Dead dependency: `gsap` (installed, imported nowhere)

**Finding (verified):** `gsap` is in `dependencies` but `grep` finds **0** source imports. You animate with Framer Motion + Lenis already.

**Why it matters:** Dead deps slow installs, enlarge the lockfile, and mislead readers about what the project uses. If it ever gets tree-shaken incorrectly or a transitive import sneaks in, it's unnecessary bundle weight.

**Fix:**
```bash
npm remove gsap
```
Then `npx next build` to confirm nothing broke. While there, sanity-check the other heavier deps are all actually used (verified in use: `@emailjs/browser`, `lenis`, `@react-three/postprocessing`, `react-hook-form`, `zod`, `framer-motion`, `three`, drei/fiber). Only `gsap` is dead.

---

## P2 — MEDIUM (performance, accessibility, SEO refinement)

### P2-1 · Audio payload: 6 files at 3–5 MB each (~24 MB total)

**Finding:** `public/audio/` holds `freedom-rises.mp3` (5.0 MB), `1.mp3` (4.7 MB), `the-greatest-gift.mp3` (4.8 MB), `replay.mp3` (3.3 MB), `ambient.mp3` (3.1 MB), `the-trumpets-sound.mp3` (3.1 MB). `ambient.mp3` is the auto-arming soundtrack (`AudioProvider`), the rest are the recordings.

**Why it matters:** Mitigated already — recordings are `preload="none"` and there's a service worker caching layer, so they only download on play. But `ambient.mp3` can begin on first gesture, and the recordings are large for mobile data. This isn't a bug, it's a budget consideration.

**Fix (optional):** Re-encode to a smaller bitrate (e.g. 96–128 kbps mono/joint-stereo for ambient, 128–160 kbps for songs) — often halves size with no perceptible quality loss on laptop/phone speakers. Keep originals. Verify `ambient.mp3` especially, since it's the one that can auto-play.

### P2-2 · Confirm no unused sections are shipping empty/placeholder content

**Finding:** `src/app/page.tsx` renders many sections via `FEATURE_FLAGS` (Story, Gallery, Awards, Certificates, Signature, HomeExperience, ProjectLinks, Testimonials, Newsletter, FAQ all `true`; `processSpectrum: false`). Testimonials are **self-authored principles** (good — not fabricated press quotes). Newsletter renders a real form.

**Why it matters:** With this many stacked sections, the risk is a section that "feels empty" or repeats. Two to verify by eye on the live site:
- **Newsletter** — does submit actually go somewhere (EmailJS wired), or is it a dead input? A newsletter box that silently does nothing is worse than not having one.
- **FAQ + Testimonials + HomeExperience** near the page bottom — check the rhythm isn't three low-density text sections in a row.

**Fix:** Verify Newsletter submit path in `src/sections/Newsletter.tsx` (does `submit` post to EmailJS / a real endpoint?). If it's not wired, either wire it to the same EmailJS setup the contact form uses, or remove the section. Then eyeball section order for pacing; consider setting `newsletter: false` if it's not functional.

### P2-3 · `<img>` alt spot-check

**Finding:** A grep for `<img` lines without inline `alt=` returns 6 hits, but these are multi-line JSX where `alt` is on the following line (Photo, PortraitCard, GalleryGrid, HeroMobileStage, RedStratViewer). Likely all covered — but confirm none slipped through, and that **decorative** images use `alt=""` (empty, not missing) so screen readers skip them.

**Fix:** Open each of the 6 files at the cited `<img>` and confirm a meaningful `alt` (content images) or `alt=""` + `aria-hidden` (decorative). Files: `src/components/ui/Photo.tsx`, `src/components/about/PortraitCard.tsx`, `src/components/gallery/GalleryGrid.tsx`, `src/components/hero/HeroMobileStage.tsx`, `src/components/three/RedStratViewer.tsx`.

### P2-4 · Reduced-motion & gyro-permission polish

**Finding:** The site is animation-heavy (scroll dolly, cursor field, tilt, marquees). Confirm `prefers-reduced-motion` is respected end-to-end. The gyro permission flow (iOS) is now correct (listener re-attaches on grant) — good.

**Fix:** Audit that the biggest motion systems (`SimaxScene` scroll dolly, `PixelCursorField`, marquees) degrade under `prefers-reduced-motion: reduce`. `AmbientCanvas`/hero already check it in places; make it consistent. This protects accessibility and motion-sensitive users.

---

## P3 — NICE-TO-HAVE (final gloss)

- **P3-1 · Cursor heat-grid stray "stamp".** A large pixelated square blob was seen mid-section on desktop (blueprint theme). It's the `PixelCursorField` heat grid holding a large deposit that hasn't decayed. Consider a faster decay floor or a max-heat clamp so a big click/hover deposit fades quicker and never sits as a static block. File: `src/components/ui/PixelCursorField.tsx` (the `dep()` deposit + decay loop; a `MAX_DEP_RAD` cap already exists — add/verify a per-cell decay minimum).
- **P3-2 · Verify favicon propagation.** The new `favicon.ico` (SM monogram) was added; confirm production now serves it (`curl -I .../favicon.ico` → `image/x-icon`, ~1 KB not 32 bytes) and the browser tab shows the monogram, not the globe.
- **P3-3 · Single source of truth for tilt strength.** Gyro amplification constants are now duplicated across `PortraitCard`, `Photo`, `CodeBackdrop`, `SimaxScene`. Consider centralizing tilt sensitivity in one constant/util so future tuning is one edit.
- **P3-4 · Lighthouse pass.** After P0/P1, run Lighthouse (mobile + desktop) on the deployed URL and record Performance / Accessibility / Best-Practices / SEO. Removing `saturn.glb` alone should visibly move Performance/LCP.
- **P3-5 · `red-strat.glb` / RedStratViewer.** Confirm it's actually reachable on the site; if it's an orphaned component, remove it and its preload to shave another module + 43 KB.

---

## SUGGESTED EXECUTION ORDER (one Cursor session)

1. **P0-1** remove Saturn/Vinyl code + delete `saturn.glb` → rebuild, confirm Network no longer fetches it.
2. **P0-2** add `public/og.jpg` (1200×630) → confirm `200` live + revalidate LinkedIn/X.
3. **P1-4** `npm remove gsap`.
4. **P1-2** merge Next config into one `next.config.ts`, delete the `.js`.
5. **P1-3** fix `package.json` identity + stray "yugen" strings.
6. **P1-1** recompose hero initial camera keyframe (the one design-judgment item — screenshot-test).
7. **P2** items as time allows; **P3** last.

## VERIFICATION CHECKLIST (run after the batch)

- [ ] `grep -rn "saturn" src public` → no hits; `saturn.glb` gone from `out/models/`.
- [ ] DevTools Network on desktop hero: no `saturn.glb`; total transferred noticeably smaller.
- [ ] `curl -I https://simonmaxam.pages.dev/og.jpg` → `200 image/jpeg`.
- [ ] `curl -I https://simonmaxam.pages.dev/favicon.ico` → `200 image/x-icon`, ~1 KB.
- [ ] Only one `next.config.*` file; both `npx next build` and `STATIC_EXPORT=1 npx next build` succeed.
- [ ] `package.json` name/description = SIMAX; no "yugen/sushi" strings remain.
- [ ] `gsap` absent from `package.json` + lockfile; build still green.
- [ ] Hero: guitar/box/note composed and legible at scroll top on 1440/1024/768.
- [ ] Newsletter submit either works or the section is removed.
- [ ] Lighthouse mobile Performance re-measured and recorded.
- [ ] No console errors in production (currently clean — keep it that way).

## WHAT'S ALREADY GOOD (don't touch)

- No production console errors. All routes (`/`, `/about/`, `/gallery/`, `/contact/`) + `robots.txt` + `sitemap.xml` return `200`; unknown paths return `404` correctly.
- Semantics: `lang="en"`, a "Skip to content" link, exactly one `<h1>` on the home page, per-page `title`/`description` on subpages.
- Testimonials are genuine self-authored principles, not fabricated quotes — keep that integrity.
- Static-export + Cloudflare edge is a fast, cheap, appropriate architecture for this site.
- iOS gyro permission flow and cross-section tilt are now wired correctly.

---
---

# PART 2 — MAXAM.VERCEL.APP · MOBILE + SPATIAL EXPERIENCE AUDIT

> **Scope note:** This part audits a **different codebase** than everything above. `maxam.vercel.app` is the "Field Notes" index site — a **Vite** static build (hand-written HTML/CSS/JS), *not* the Next.js SIMAX app. Its source is not in this repo; the Cursor instructions below therefore reference the **live DOM contract** (class names/structure I verified) so Cursor can locate the right files in whichever repo builds `maxam.vercel.app`. Everything here was verified against the live production site on 2026-09-16 at emulated phone widths.

## THE SITE, AS BUILT (verified DOM contract)
Single scrolling "sheet". Top bar `.bar` (S. MAXAM · Work · Credentials · Notes · Contact · Light/Dark `.theme-btn`). A **fixed full-screen `<canvas>`** background (`position:fixed; z-index:0; opacity:0.9`, 2D — **not** WebGL) renders the technical grid/field texture. Content lives in `.sheet` > `.hero` (coordinates `CALGARY, AB — 51.0447° N…`, kicker `FIELD NOTES · SHEET 01`, `<h1>` "Simon / Maxam", tagline, "SCROLL FOR THE DRAWING SET"), then four `<section>`s: `01 Working notes` (about + `.facts` metadata grid + `.marquee`), `02 The drawing set` (`.work` list of `.work-row` A-01…A-06, G-01, B-01 with `.n`/`.title`/`.arrow`/`.blurb`/`.spec`), `03 Credentials` ("19 ON FILE", 5 shown + "SEE ALL 19 →"), `04 Get in touch` (email + ELSEWHERE links), and a title-block `<footer>` (PROJECT / DRAWN BY / SCALE / SHEET). A `.xhair` crosshair-cursor element exists (desktop only). The content and metaphor are **strong and specific** — do not dilute them.

---

## P0 (MAXAM) — THE ONE BUG THAT BREAKS THE ENTIRE PHONE EXPERIENCE

### M0-1 · There is NO `<meta name="viewport">` tag — all mobile CSS is inert
**Evidence (verified two ways):**
- `document.querySelector('meta[name=viewport]')` → **null** (not in HTML source, not injected at runtime).
- On an emulated 390px phone, `window.innerWidth` reports **980**, and the page + background canvas render at **980×2121** scaled down to the device — i.e. the browser falls back to the legacy ~980px layout viewport and shrinks the whole desktop page to fit.
- Yet the stylesheet **already contains** `@media (max-width: 900/800/700/640/480px)`, `@media (hover: none)`, and `@media (prefers-reduced-motion: reduce)` — a full responsive/touch design **that never activates on a real phone.**

**Why it matters:** This is *the* reason "mobile isn't nearly as good as desktop." It isn't that mobile was never designed — it's that the mobile design the developer already wrote is **switched off**. Phones get the desktop composition optically zoomed out: microscopic 11px technical labels become ~4–5px, tap targets shrink below the 44px minimum, and the careful field-note details are illegible. Every other mobile problem is downstream of this. **One line fixes it and instantly unlocks the existing mobile CSS.**

**Fix:** In the site's HTML `<head>` (the Vite `index.html`), add:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```
`viewport-fit=cover` lets the fixed canvas and title-block reach into the iPhone safe-area notch/home-indicator zones (pair with `env(safe-area-inset-*)` padding on the top bar and footer). Deploy, then **re-audit on a real phone** — because until this ships, neither I nor you can see the *intended* mobile layout; we've only ever seen the broken 980px fallback.

**Immediately after M0-1 ships, verify these (the existing breakpoints should handle most; fix any that don't):**
- `<h1>` "Simon Maxam" is 117.6px on desktop — confirm it clamps down (e.g. `clamp(2.75rem, 14vw, 7rem)`) and the "Simon / Maxam" line split still reads intentionally, not like an accidental wrap.
- `.facts` metadata grid (9 pairs: BASED/STUDIO/ROLE/SINCE/WEB/3D/DRAFTING/ALSO/MUSIC) collapses to 1 column → a ~344px tall ladder. On phone prefer a **2-column** compact grid so it reads as an instrument panel, not a list.
- 11px labels: bump the mobile floor to **12–13px** (still "technical", but legible). 18 elements currently compute below 11.5px.
- `.xhair` crosshair cursor is correctly hidden under `@media (hover:none)` (verified `display:none`) — good, keep it off touch.
- Top `.bar` nav (S.MAXAM · Work · Credentials · Notes · Contact · Light/Dark) at ≤480px: confirm it doesn't overflow; if tight, make it a **horizontally-scrollable tab strip** (on-brand: like a drawing's sheet tabs) rather than a hamburger.

---

## THE SPATIAL CONCEPT — "THE SHEET FLOATS" (recommended)

I inspected the existing design before deciding, per the brief. The site **already tells you what the spatial metaphor must be:** it is literally a technical **drawing sheet** — `.sheet`, `SCALE 1:1`, registration language, `SHEET 01 of 01 · Rev. B` title block, a fixed grid canvas behind everything. So the correct, non-gimmick spatial idea is not "spin a 3D object" — it's:

> **The reading sheet sits a few millimetres in front of the technical grid. Tilting/moving the device (or pointer) parallaxes the depth layers by a *tiny* amount, so the page feels like a physical drawing floating just above its underlay — a spatial instrument, not a toy.**

### Depth layers (3, cheap, transform-only)
1. **Underlay (deepest, moves most, still subtle):** the existing fixed background `<canvas>` grid + coordinate ticks. Add a second faint layer here: a slow-drifting architectural **section-line / wireframe** motif (2D canvas strokes — no WebGL needed) so there's something with parallax to feel.
2. **Register marks (mid depth):** the giant section numbers `01/02/03/04`, corner registration crosshairs, the `CALGARY … 51.0447° N` coordinates, `.idx` marks, `SCALE 1:1`. These drift at ~40% of the underlay's offset.
3. **Reading plane (shallowest, essentially fixed):** `.hero` `<h1>`, body copy, `.work-row` titles/blurbs, credentials. Max ±2px so **legibility is never harmed** — text must not visibly swim.

Offsets are **translate3d only** (GPU, no layout/reflow), clamped hard (≤ ±10px underlay, ≤ ±5px mid, ≤ ±2px reading), eased toward target (lerp ~0.08) so it's silky, never jittery.

### Input ladder (graceful degradation — the effect must NEVER require a sensor)
| Context | Driver | Behaviour |
|---|---|---|
| **Desktop (pointer)** | mouse position → normalized −1..1 from viewport centre | live parallax on move; recentre on mouse-leave. Mirrors the SIMAX portrait-tilt pattern. |
| **Touch phone, default** | **scroll velocity + position** (zero permission, always works) | layers parallax as you scroll — the reliable base everyone gets. Optional: 1-finger drag on the hero nudges the grid, snaps back on release. |
| **Gyro phone, opt-in** | `deviceorientation` (β/γ), clamped | adds tilt-to-peek *on top of* scroll parallax. iOS 13+ needs a user-gesture `requestPermission()` — reuse the SIMAX pattern (a quiet "◳ spatial view" toggle or first-tap request; broadcast a `granted` event; attach listener **after** grant, or it silently never fires — this exact bug was already hit and fixed on SIMAX). |
| **Reduced motion / denied / unsupported / low-power** | none | layers rest at neutral depth. Because the base composition is already complete and beautiful, **nothing looks broken** — it just looks like a crisp static drawing. |

### Why this is on-brand and not a gimmick
It *reinforces* the existing concept (a physical sheet over a grid), stays quiet (sub-10px), is monochrome/technical, and reads as a *precision instrument*. It is the antithesis of a flashy game hero. It also becomes the **shared spatial language** between the two sites (see below).

---

## TECHNICAL FEASIBILITY / BROWSER MATRIX / PERFORMANCE / A11Y

**Feasibility:** High. The fixed canvas already exists; we add (a) a normalized "tilt vector" source with the input ladder, (b) a single `requestAnimationFrame` lerp loop writing `transform: translate3d()` to ≤3 layer wrappers and offsetting the canvas draw. No framework, no WebGL, fits the vanilla Vite stack.

**Browser/permission reality (verified current behaviour):**
- **iOS Safari 13+**: `DeviceOrientationEvent.requestPermission()` required, **must** be called from a real user gesture, **HTTPS only** (Vercel is HTTPS ✓). A listener added *before* the grant frequently never fires — attach/re-attach *after* `granted`.
- **Android Chrome**: no permission prompt, but still HTTPS-gated; `deviceorientation` fires once listened.
- **Desktop**: no orientation → pointer path.
- **Denied / unsupported / in-app browsers**: `requestPermission` rejects or is absent → fall straight to touch/scroll path. Never show an error.

**Performance:** one rAF loop; pause via `IntersectionObserver` when the hero/section is off-screen; skip entirely when `navigator.hardwareConcurrency <= 4` OR `prefers-reduced-motion: reduce`; throttle `deviceorientation` to ~30–40Hz; transforms only (no top/left, no box-shadow animation). Battery impact negligible when scoped to the hero and paused off-screen.

**Accessibility:** gate the whole system behind `prefers-reduced-motion: no-preference`; keep contrast/legibility independent of motion (reading plane barely moves); the gyro opt-in is a real focusable control with a label; no motion is ever required to read or navigate.

**Layout-shift safety:** transforms don't affect layout → zero CLS. Give layer wrappers `will-change: transform` only while active; remove it when paused.

**Clean removal:** implement as one self-contained module (`spatial.js`) that a single import toggles; if it ever misbehaves, delete the import and the layers fall back to static with no other change.

---

## SECTION-BY-SECTION MOBILE RECOMMENDATIONS (post-viewport-fix)

- **Hero:** it's only 0.33× viewport tall in the broken state; on a real phone give it ~72–80svh so the coordinates + `SHEET 01` + big name + tagline form a deliberate title block above the fold. Clamp `<h1>`. Keep "SCROLL FOR THE DRAWING SET" as the single call-to-scroll. This is the answer to "first 3 seconds": name → role → place → the promise of the drawing set, with the grid breathing behind it.
- **Working notes (about):** 4 paragraphs is a wall on a phone. Keep para 1 (the positioning statement) full; make paras 2–4 (intersection / SEO / music) **progressive-disclosure**: show para 1 + the `.facts` panel, put the rest behind a quiet "＋ more notes" expander. Preserve the music line — it's personality — just don't front-load all of it.
- **`.facts` panel:** 2-column compact grid of LABEL/value pairs on phone; treat it as the instrument readout. This is more memorable than a 9-row stack and half the height.
- **The drawing set (projects):** the row list is good and on-brand — keep the `A-01 · title · discipline · Live` structure. Mobile upgrades: (1) make the **whole row a large tap target** (≥56px) with a clear pressed state; (2) add a small **thumbnail or 1-line wireframe glyph** per row so it's not pure text; (3) consider **tap-to-expand** the `.blurb` (collapsed to title+discipline+status by default) for scannability; (4) keep the discipline prefixes (A/G/B) as a subtle left rail so the "drawing set" grouping reads.
- **Credentials:** you already do the right thing (5 shown + "SEE ALL 19"). On phone, render the 5 as **compact metadata-first rows** (issuer · date small, title prominent) and make "SEE ALL 19 →" a real expander or a route — don't dump all 19 inline (vertical fatigue). The "19 ON FILE" framing is excellent; keep it.
- **Contact:** minimal already — ensure the email is a big `mailto:` tap target and the ELSEWHERE links are ≥44px rows.
- **Footer title block:** keep the PROJECT/DRAWN BY/SCALE/SHEET grid but 2-col on phone; add `env(safe-area-inset-bottom)` padding so it clears the home indicator.

---

## TWO SITES — SHARED LANGUAGE (make them feel like one person)
Keep them distinct in role (SIMAX = direct portfolio; Maxam = experimental index) but unify the *craft*:
- **Spatial language:** SIMAX has gyro-tilt on photos/3D; Maxam gets the "floating sheet" parallax. Same restraint, same permission ladder, same reduced-motion discipline → they feel like the same hand.
- **Type:** both pair a serif display with mono technical labels — make the mono label treatment (letter-spacing, size floor, opacity) numerically identical across both.
- **Motif cross-pollination:** SIMAX could borrow Maxam's **title-block / SHEET / SCALE** vocabulary as a subtle footer or section marker; Maxam could borrow SIMAX's **tilt-on-media**. They already cross-link ("studio work lives under SIMAX") — reinforce that with one shared visual token (e.g. the coordinate/registration mark).
- **Motion timing:** standardize easing (e.g. lerp 0.08, 150–200ms UI transitions) so interactions "weigh" the same on both.

---

# FINAL CURSOR IMPLEMENTATION PLAN (MAXAM.VERCEL.APP)

> Each feature is specified so Cursor can implement without follow-up questions. Files are named by the live DOM contract — Cursor: locate the Vite `index.html` + main stylesheet + main JS/module that renders these classes.

### FEATURE A — Viewport meta (P0, do first, ~1 line)
- **File:** `index.html` `<head>`.
- **Current:** no viewport meta; phones render 980px desktop scaled down; all `@media` rules inert.
- **Desired:** phones use `width=device-width`; existing mobile breakpoints activate; safe-area aware.
- **Approach:** add `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. Add `padding-top: env(safe-area-inset-top)` to `.bar` and `padding-bottom: env(safe-area-inset-bottom)` to `footer`.
- **Responsive/timing/interaction/a11y/perf/fallback:** n/a (structural). **Test:** load on a real iPhone Safari + Android Chrome; confirm `innerWidth===device width`, labels legible, no horizontal scroll, breakpoints firing (DevTools device mode is *not* sufficient proof — the bug is viewport-specific).

### FEATURE B — Mobile typography + layout pass (P1)
- **Files:** main stylesheet (the `@media (max-width: 640/480px)` blocks).
- **Current:** desktop sizes; 11px labels; `.facts` 1-col; `.hero` short.
- **Desired:** `<h1>` `clamp(2.75rem,14vw,7rem)`; label floor 12–13px; `.facts` 2-col; `.hero` ~72–80svh; work rows ≥56px tap height; credentials/contact/footer rows ≥44px.
- **Approach:** extend existing `≤480`/`≤640` media blocks (don't add a new system). Use `svh` not `vh` for hero to avoid iOS URL-bar jump.
- **A11y:** maintain ≥4.5:1 text contrast at new sizes. **Perf:** none. **Fallback:** pure CSS. **Test:** 360/390/414px widths; check line-wrapping of h1 and blurbs; no clipped labels.

### FEATURE C — Progressive disclosure (about + credentials) (P1)
- **Files:** the `01 Working notes` and `03 Credentials` section markup + a few lines of JS.
- **Current:** 4 about paragraphs always shown; 5 credentials + link.
- **Desired:** about shows para 1 + `.facts`, rest behind "＋ more notes"; credentials show 5 as compact rows, "SEE ALL 19 →" expands inline or routes.
- **Approach:** `<details>/<summary>` (zero-JS, accessible) styled to match, OR a small toggle that animates `max-height`. Prefer `<details>` for a11y + no-JS resilience.
- **Timing:** 180–220ms height/opacity ease. **A11y:** `<summary>` is focusable, `aria-expanded` native. **Perf:** trivial. **Fallback:** `<details>` works with JS off. **Test:** keyboard toggle, screen-reader announces expand/collapse, no layout jump above the toggle.

### FEATURE D — "The Sheet Floats" spatial system (P2, the signature feature)
- **Files:** new `src/spatial.js` (self-contained module) + minimal wrapper elements/classes in `index.html` + a few CSS `will-change`/layer rules. One import line to enable, delete to remove.
- **Current:** fixed background canvas is static; no depth; no device motion anywhere.
- **Desired:** 3 depth layers parallax by tiny clamped offsets, driven by the input ladder (pointer / scroll+drag / opt-in gyro), static under reduced-motion/denied/low-power.
- **Approach:**
  1. Wrap into 3 layers: `.layer-underlay` (existing canvas + new faint section-line strokes), `.layer-marks` (section numbers, coordinates, registration crosshairs, SCALE), `.layer-read` (existing content — barely moves).
  2. A `tiltSource` producing `{x,y}` in −1..1: **desktop** = pointer vs centre; **touch** = scroll-velocity + optional drag; **gyro (opt-in)** = clamped β/γ added on top.
  3. One `requestAnimationFrame` lerp (`cur += (target-cur)*0.08`) writing `translate3d()` per layer with per-layer gain (underlay 10px, marks 5px, read 2px) and offsetting the canvas draw origin.
  4. Gate: skip if `matchMedia('(prefers-reduced-motion: reduce)').matches` or `navigator.hardwareConcurrency<=4`. Pause via `IntersectionObserver` when hero off-screen. Throttle gyro ~30–40Hz.
  5. Gyro opt-in: a quiet labelled control (e.g. `◳ SPATIAL`) that calls `DeviceOrientationEvent.requestPermission()` inside the tap handler; on `granted`, attach the listener **then** (not before); persist choice in `localStorage`.
- **Responsive:** desktop pointer; phone scroll/drag base + optional gyro; tablet same as phone.
- **Timing:** lerp 0.08; recentre 300ms on pointer-leave/drag-release. **Interaction:** never blocks scroll/tap; passive listeners. **A11y:** whole system behind `no-preference`; gyro control focusable + labelled; reading plane ≤±2px so text never swims. **Perf:** transform-only, paused off-screen, single rAF, disabled low-core. **Fallback:** no sensor/denied/reduced-motion → neutral static layers, zero error UI. **Test:** iPhone Safari (grant + deny + never-asked), Android Chrome, desktop mouse, reduced-motion on, low-core throttle, off-screen pause (CPU drops), and "delete the import → site still perfect, just static."

### FEATURE E — Drawing-set row upgrade (Polish)
- **Files:** `.work-row` markup + CSS (+ optional tiny thumbnails/SVG glyphs).
- **Current:** text rows.
- **Desired:** ≥56px tap rows with pressed state, a small per-project wireframe glyph/thumbnail, optional tap-to-expand blurb, discipline (A/G/B) left rail.
- **Approach:** CSS grid row `[glyph] [n title/discipline status] [arrow]`; `<details>` for expand; inline SVG glyphs (cheap, on-brand) rather than raster where possible.
- **Timing:** 150ms press feedback, 200ms expand. **A11y:** row is one `<a>`/`<button>`; expand via `<details>`. **Perf:** SVG/inline only; lazy-load any raster thumbnails. **Fallback:** collapses to current text rows if glyphs absent. **Test:** tap targets, expand, keyboard, no CLS.

---

# EXECUTION ORDER

**P0 (ship today — both sites):**
1. SIMAX: remove `saturn.glb` preload/import + delete the 8.9 MB file (P0-1).
2. SIMAX: add real `og.jpg` (P0-2).
3. **MAXAM: add the viewport meta tag (M0-1)** — single biggest mobile win anywhere in this audit.

**P1:**
4. SIMAX: `npm remove gsap`; merge Next config to one file; fix `package.json` identity.
5. MAXAM: mobile type/layout pass (Feature B) + progressive disclosure for about & credentials (Feature C).
6. SIMAX: recompose hero initial camera keyframe (P1-1).

**P2:**
7. MAXAM: "The Sheet Floats" spatial system (Feature D) — the signature phone feature.
8. SIMAX: audio re-encode, reduced-motion consistency, Newsletter-submit verification.

**Polish:**
9. MAXAM: drawing-set row upgrade (Feature E); nav tab-strip at ≤480px; footer safe-area.
10. SIMAX: cursor heat-grid decay, favicon propagation check, centralize tilt constants, Lighthouse.

**Optional / experimental:**
11. Shared visual token between both sites (registration/coordinate mark); SIMAX borrows the SHEET/SCALE title-block motif; standardize mono-label + easing tokens across both.

---

# MASTER CURSOR PROMPT

> You are working on my "Field Notes" personal index site that deploys to **maxam.vercel.app** (a **Vite** static build — vanilla HTML/CSS/JS, not React/Next). Do the following in order. After each numbered item, build and verify before moving on. Do not change the site's visual identity — it is a technical architectural **drawing sheet / field notebook**; preserve that language, typography, and content. Ask me nothing; make reasonable decisions.
>
> **1 — CRITICAL viewport fix.** In `index.html` `<head>`, add `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. This is currently missing, which is why phones render the 980px desktop layout scaled down and none of the existing `@media (max-width: …)` rules fire. Add `padding-top: env(safe-area-inset-top)` to `.bar` and `padding-bottom: env(safe-area-inset-bottom)` to the `<footer>`. Verify on a real phone width that `innerWidth` equals the device width and the existing mobile breakpoints activate.
>
> **2 — Mobile type/layout pass.** In the existing `@media (max-width: 640px)` / `(max-width: 480px)` blocks only (don't invent a new system): set `<h1>` to `clamp(2.75rem, 14vw, 7rem)`; raise the technical-label font floor from 11px to 12–13px; make `.facts` a 2-column compact grid; give `.hero` `min-height: 78svh` (use `svh`, not `vh`); ensure every `.work-row`, credential row, contact link, and nav item is ≥44–56px tall for touch; guarantee no horizontal overflow at 360/390/414px.
>
> **3 — Progressive disclosure.** In `01 Working notes`, keep paragraph 1 + the `.facts` panel visible; move paragraphs 2–4 into a styled `<details><summary>＋ more notes</summary>…</details>`. In `03 Credentials`, show the 5 existing credentials as compact metadata-first rows and make "SEE ALL 19 →" expand the rest inline via `<details>` (or route if a credentials page exists). Match the site's styling; 180–220ms ease; keep it keyboard/screen-reader accessible.
>
> **4 — "The Sheet Floats" spatial system** (self-contained `src/spatial.js`, one import to enable/remove). Wrap the page into three depth layers: `.layer-underlay` (the existing fixed background canvas + a new faint drifting architectural section-line motif drawn on the same 2D canvas), `.layer-marks` (the big section numbers 01–04, the `CALGARY … 51.0447° N` coordinates, `SCALE 1:1`, and corner registration crosshairs), and `.layer-read` (all reading content). Create a tilt source giving `{x,y}` in −1..1 with this exact fallback ladder: desktop → pointer position vs viewport centre; touch phone default → scroll velocity + optional one-finger hero drag (no permission); gyro-capable phone → an opt-in labelled `◳ SPATIAL` control that calls `DeviceOrientationEvent.requestPermission()` inside the tap handler and, only after `granted`, attaches the `deviceorientation` listener (attaching before the grant silently fails on iOS) and adds clamped β/γ on top of the scroll parallax, persisting the choice in `localStorage`. Drive one `requestAnimationFrame` lerp (`cur += (target-cur)*0.08`) writing `transform: translate3d()` with per-layer gain clamped to ±10px (underlay), ±5px (marks), ±2px (read — text must never visibly swim). Gate the entire system off if `matchMedia('(prefers-reduced-motion: reduce)').matches` or `navigator.hardwareConcurrency <= 4`; pause it via `IntersectionObserver` when the hero is off-screen; throttle gyro to ~30–40Hz; use only transforms (no layout properties); passive listeners; never block scroll or taps. When no sensor / denied / reduced-motion, layers rest at neutral depth with no error UI. Confirm that deleting the single import returns the site to a correct static state.
>
> **5 — Drawing-set row upgrade.** Make each `.work-row` a ≥56px tap target with a clear pressed state, add a small inline-SVG wireframe glyph per project, keep the `A-01 · title · discipline · Live` structure with the A/G/B discipline prefix as a subtle left rail, and optionally collapse `.blurb` behind tap-to-expand via `<details>`. Lazy-load any raster thumbnails; prefer inline SVG.
>
> Test matrix for items 4–5: iPhone Safari (permission granted, denied, and never requested), Android Chrome, desktop mouse, `prefers-reduced-motion: reduce`, a ≤4-core throttle, and off-screen pause (verify CPU drops). Keep Lighthouse mobile Performance ≥ its current value. Do not regress the desktop experience.
