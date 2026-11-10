const CACHE_NAME = "nsd-shell-v2";
const CORE = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./js/main.js",
  "./js/cars.js",
  "./js/world.js",
  "./js/controls.js",
  "./js/race.js",
  "./js/garage.js",
  "./assets/models/car-models.js",
  "./assets/textures/texture-generator.js",
  "./assets/audio/sound-engine.js"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
  )));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached =>
    cached || fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    })
  ));
});
