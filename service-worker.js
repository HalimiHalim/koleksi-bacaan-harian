const CACHE_NAME = "uwa-bacaan-harian-v300-centered-page-favourites";
const INDEX_URL = "./index.html";
const ROOT_URL = "./";
const APP_SHELL = [
  ROOT_URL,
  INDEX_URL,
  "./manifest.webmanifest",
  "./fonts/NotoNaskhArabic-wght.ttf",
  "./quran/reader.css?v=300",
  "./quran/reader.js?v=300",
  "./quran/chapters.json",
  "./quran/checklist.js?v=300",
  "./source-delete.js?v=300",
  "./quran/recent.js?v=300",
  "./quran/favourites.js?v=300",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: "no-store" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("uwa-bacaan-harian-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirstIndex(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request, { cache: "no-store" });
    if (networkResponse && networkResponse.ok) {
      await cache.put(INDEX_URL, networkResponse.clone());
      await cache.put(ROOT_URL, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedIndex = await cache.match(INDEX_URL) || await cache.match(ROOT_URL);
    return cachedIndex || Response.error();
  }
}

async function cacheFirstAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) return cachedResponse;

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.ok) {
    await cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  const scopeUrl = new URL(self.registration.scope);
  if (requestUrl.origin !== scopeUrl.origin || !requestUrl.pathname.startsWith(scopeUrl.pathname) || event.request.method !== "GET") {
    return;
  }

  const isNavigation = event.request.mode === "navigate";
  const isIndex = requestUrl.pathname.endsWith("/") || requestUrl.pathname.endsWith("/index.html");

  if (isNavigation || isIndex) {
    event.respondWith(networkFirstIndex(event.request));
    return;
  }

  event.respondWith(cacheFirstAsset(event.request));
});
