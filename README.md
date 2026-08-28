# YŪGEN 幽玄 — Cinematic Omakase Experience

An award-worthy, immersive website for a fictional premium Japanese omakase
restaurant. Built to feel less like a webpage and more like stepping into a
Tokyo sushi counter at golden hour — with a live 3D dining room, a chopstick
cursor, koi that grow curious about your mouse, an ink-spread opening overture,
ambient sound, and a palette that shifts with **your local time of day**.

> **YŪGEN (幽玄)** — a core concept of Japanese aesthetics: the profound,
> mysterious grace of things felt but never fully seen.

---

## ✨ Highlights

- **Time-of-day theming** — the entire palette re-skins itself for morning,
  golden-hour evening, and an inverted Tokyo night, automatically from the
  visitor's clock (with a manual override in the control dock).
- **Cinematic opening overture** — paper warms in, ink bleeds outward, the
  kanji and wordmark settle, and an *Enter* gesture unmutes the soundtrack
  (respecting browser autoplay rules).
- **Custom chopstick cursor** — follows the pointer, opens & closes over food,
  and closes to a lacquer point over buttons (fine-pointer devices only).
- **Living ambient canvas** — luminous dust, rice grains repelled by the
  cursor, drifting sakura, water-ripple trails, and stylised **koi** that swim
  toward your pointer. All in one optimised `requestAnimationFrame` loop.
- **WebGL hero** — procedurally-modelled floating sushi with studio lighting,
  bloom, and mouse parallax (React Three Fiber).
- **Explorable 3D restaurant** — orbit the room, and click a glowing seat to
  open its omakase experience (counter / garden window / private tatami).
- **Full content** — Story, Chef, Signature dishes, filterable Menu, Gallery
  with lightbox, Reservations, Contact, FAQ, testimonials, awards, newsletter
  and an interactive map.
- **Engineered for 95–100 Lighthouse** — static export, code-split WebGL, lazy
  media, `prefers-reduced-motion` support, semantic HTML, full SEO + schema.

---

## 🧱 Tech stack

| Area            | Choice                                             |
| --------------- | -------------------------------------------------- |
| Framework       | **Next.js (App Router)** — static export (`out/`)  |
| Language        | **TypeScript**                                     |
| Styling         | **Tailwind CSS** with CSS-variable design tokens   |
| Animation       | **Framer Motion** + **GSAP**-ready + **Lenis**     |
| 3D / WebGL      | **Three.js**, **React Three Fiber**, **drei**, **postprocessing** |
| Forms           | **React Hook Form** + **Zod**                      |
| Email           | **EmailJS** (client-side)                          |
| Spam protection | **Cloudflare Turnstile**                           |
| Hosting         | **Cloudflare Pages** (git-push auto-deploy)        |

---

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. (optional) add credentials for live email + spam protection
cp .env.example .env.local   # then fill in the values

# 3. Run the dev server
npm run dev                  # http://localhost:3000

# 4. Production build (static export to ./out)
npm run build

# 5. Preview the exported static site locally
npm run preview
```

> The site runs fully **without** any environment variables — the forms fall
> back to a realistic "simulated success" so you can review the flows. Email
> delivery and spam protection activate automatically once the keys are set.

---

## 📁 Project structure

```
src/
├─ app/                     # Routes (App Router) + metadata routes
│  ├─ layout.tsx            # Fonts, SEO metadata, JSON-LD, providers, shell
│  ├─ page.tsx              # Home (composed from sections)
│  ├─ globals.css           # Design tokens + time-of-day themes
│  ├─ menu/ gallery/ reservations/ contact/
│  ├─ sitemap.ts robots.ts manifest.ts not-found.tsx
│  └─ fonts.ts
├─ components/
│  ├─ experience/           # Loader, Cursor, AmbientCanvas, ControlDock, shell
│  ├─ three/                # SushiScene, RestaurantScene, SushiModels (WebGL)
│  ├─ providers/            # Theme (time of day), Audio, SmoothScroll
│  ├─ layout/               # Nav, Footer, PageHero (breadcrumbs)
│  ├─ ui/                   # Reveal, Magnetic, AnimatedHeading, Plate, Badges…
│  ├─ menu/ gallery/        # Feature components
│  └─ forms/                # Field, Turnstile, Reservation & Contact forms
├─ sections/                # Home-page sections (Hero, Story, Chef, …)
└─ lib/                     # site config, menu, experiences, schema, faq, utils

public/
├─ audio/ambient.mp3        # Ambient soundtrack
├─ icon.svg                 # Brand favicon
├─ apple-touch-icon.png     # PWA / iOS icon
├─ og.jpg                   # Open Graph / Twitter share image
└─ _headers                 # Cloudflare Pages security + caching headers
```

To **rebrand**, edit `src/lib/site.ts` (name, address, hours, socials) and the
colour tokens in `src/app/globals.css`.

---

## 🔑 Environment variables

All are `NEXT_PUBLIC_*` because this is a static site and these services are
built for safe client-side use. See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | EmailJS service (contact + reservation delivery) |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID` | Template for contact messages |
| `NEXT_PUBLIC_EMAILJS_RESERVATION_TEMPLATE_ID` | Template for reservation requests |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile widget site key |

**What I need from you to make the forms send real email** (see the section at
the bottom of this file).

---

## ☁️ Deploy to Cloudflare Pages

### One-time: push to GitHub

```bash
git init
git add -A
git commit -m "feat: YŪGEN cinematic omakase website"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### Connect Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Select your repository.
3. Build settings:
   - **Framework preset:** `Next.js (Static HTML Export)`
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Node version:** set env var `NODE_VERSION` = `20` (or higher)
4. Add the environment variables from the table above (Production + Preview).
5. **Save and Deploy.** Every `git push` now builds and deploys automatically.

You'll get a free `*.pages.dev` development URL immediately. Add your custom
domain later under **Custom domains**.

> Remember to update `site.url` in `src/lib/site.ts` to your final domain so the
> canonical URLs, sitemap, Open Graph tags and JSON-LD are correct.

---

## 🔒 Security & performance (post-deploy checklist)

Most of this is automatic on Cloudflare, but confirm:

- **HTTPS + HSTS** — HSTS is set in `public/_headers`; enable *Always Use HTTPS*
  under SSL/TLS → Edge Certificates.
- **Security headers** — shipped in `public/_headers`
  (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS).
- **Brotli / compression** — on by default (SSL/TLS → … → *Speed → Optimization*).
- **Caching** — immutable `_next/static` assets cached for a year (`_headers`).
- **CDN** — Cloudflare's global edge serves the static export by default.
- **Turnstile** — add the site key to enable spam protection on both forms. For
  hard server-side verification, add a small Pages Function/Worker that checks
  the token with your Turnstile **secret** key before relaying to EmailJS.
- **Image optimization** — enable *Speed → Optimization → Polish (Lossy)* and
  consider Cloudflare Images if you swap in real photography.

---

## 🖼️ Swapping in real photography

The site ships with elegant, zero-payload gradient "plates" (`<Plate/>`) as
photography stand-ins plus one AI-generated hero (`public/og.jpg`). To use real
Michelin-grade images, replace `<Plate/>` usages with responsive `<img>`:

```tsx
<img
  src="/images/otoro-1280.avif"
  srcSet="/images/otoro-640.avif 640w, /images/otoro-1280.avif 1280w"
  sizes="(max-width: 768px) 100vw, 33vw"
  alt="Ōtoro nigiri brushed with soy, steam rising"
  loading="lazy"
  decoding="async"
/>
```

### Prompts for generating luxury food photography

Use these with your image generator of choice. Export as **AVIF/WebP**,
long-edge 1600–2000px, quality ~80.

- **Hero / OG (16:9):** *"Michelin-star omakase counter, single ōtoro nigiri on
  a dark hand-thrown ceramic plate, wisp of steam, 85mm f/1.4, warm golden-hour
  window light, concrete + hinoki background, deep charcoal shadows, cinematic
  amber grade, subtle film grain, photorealistic, negative space left third."*
- **Interior (4:3):** *"Minimalist Japanese sushi restaurant interior, hinoki
  wood counter, polished concrete walls, floor-to-ceiling windows, paper
  lanterns glowing warm, moss garden beyond, soft global illumination, 24mm,
  editorial architectural photography."*
- **Chef (3:4):** *"Portrait of a Japanese itamae behind the counter, focused,
  soft rim light, shallow depth of field, 50mm, muted warm tones, documentary
  fine-dining style."*
- **Dish detail (1:1):** *"Overhead macro of Hokkaido uni on cold-brined nori,
  glistening, dark slate, dramatic single-source light, hyper-detailed."*

---

## ♿ Accessibility

- Semantic landmarks, `H1→H6` hierarchy, skip-to-content link.
- Keyboard-navigable menus, forms, gallery lightbox (arrows + Esc) and FAQ.
- ARIA labels on interactive controls; visible focus rings.
- Respects `prefers-reduced-motion` (disables particles, smooth scroll & heavy
  animation).
- Colour tokens tuned for AA contrast in all three themes.

---

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Static production build → `out/` |
| `npm run preview` | Serve the built `out/` locally |
| `npm run lint` | Lint the project |

---

## 🙋 What I need from you

To make the contact & reservation forms deliver **real email**, and to finish
the deployment, please provide:

1. **EmailJS** — service ID, public key, and two template IDs (contact +
   reservation). Free at [emailjs.com](https://www.emailjs.com).
2. **Cloudflare Turnstile** — a widget **site key** (and secret key if you want
   server-side verification). Free in the Cloudflare dashboard.
3. **Final domain** — so I can set `site.url` for correct SEO/canonicals.
4. **(Optional) Real photography** — or I can generate a full set from the
   prompts above.

Until these are provided the site is fully functional in "demo mode" — nothing
is broken, forms simply simulate a successful send.
```
