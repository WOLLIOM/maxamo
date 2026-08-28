/**
 * Minimal offline cache for SIMAX audio.
 * Cache-first for anything under /audio/ — once a track has been played
 * once (or is pre-cached on install), it works with no network connection.
 * Bump CACHE_NAME to invalidate old cached audio after you swap files.
 */
const CACHE_NAME = "simax-audio-v1";
const AUDIO_PATH = "/audio/";
const PRECACHE = ["/audio/ambient.mp3"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.includes(AUDIO_PATH)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      } catch (err) {
        return cached || Response.error();
      }
    }),
  );
});
