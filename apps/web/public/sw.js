// Minimal service worker: its only job is to show a friendly page when a
// visitor opens (or navigates within) the site with no internet connection.
// It never caches or serves page content otherwise — every request still goes
// to the network first, so edits made in the admin appear immediately.
const CACHE = "nbc-offline-v6";
const OFFLINE_ASSETS = ["/offline.html", "/offline.js", "/images/404.svg", "/logo-mark.png", "/logo-wordmark.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(OFFLINE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  // The offline page's own files (logo, illustration, script) must also load
  // with no network, so serve those cache-first.
  const url = new URL(request.url);
  if (url.origin === self.location.origin && OFFLINE_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(url.pathname).then((hit) => hit || fetch(request))
    );
    return;
  }
  if (request.mode !== "navigate") return;
  event.respondWith(
    fetch(request).catch(() => caches.open(CACHE).then((cache) => cache.match("/offline.html")))
  );
});
