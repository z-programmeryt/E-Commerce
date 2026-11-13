/* eslint-disable no-restricted-globals */
/**
 * SUPER Z SHOP service worker.
 *
 * Strategy, deliberately conservative because this is a store:
 *
 *  • Navigations  → network first, fall back to cache, then /offline.
 *                   Orders and stock must never be served stale if the
 *                   network is available.
 *  • Static assets (JS, CSS, fonts, images, icons)
 *                 → stale-while-revalidate. Safe: they are content-hashed
 *                   or versioned, so "stale" means "one refresh behind".
 *  • API / server actions / admin / checkout
 *                 → never cached. A cached POST or a cached price is a bug.
 *
 * Bump CACHE_VERSION whenever the offline page or shell changes.
 */
const CACHE_VERSION = "szs-v1";
const PRECACHE = `${CACHE_VERSION}-precache`;
const RUNTIME = `${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = ["/", "/offline", "/manifest.webmanifest"];

const NEVER_CACHE = [
  "/api/",
  "/admin",
  "/checkout",
  "/cart",
  "/account",
  "/order/",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // Individual failures must not abort the whole install.
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

function isNeverCache(url) {
  return NEVER_CACHE.some((prefix) => url.pathname.startsWith(prefix));
}

function isStaticAsset(url, request) {
  if (["style", "script", "font", "image"].includes(request.destination)) return true;
  return /\.(?:css|js|mjs|woff2?|png|jpe?g|svg|webp|avif|ico|webmanifest)$/i.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isNeverCache(url)) return;

  // 1. Navigations — network first.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(RUNTIME);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          return (await caches.match("/offline")) ?? Response.error();
        }
      })(),
    );
    return;
  }

  // 2. Static assets — stale while revalidate.
  if (isStaticAsset(url, request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res && res.status === 200) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached ?? network;
      })(),
    );
  }
});

// Let the page trigger an immediate update after a deploy.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
