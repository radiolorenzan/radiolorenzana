const CACHE_NAME = "radio-cache-v3";
const urlsToCache = ["/", "/index.html"];

// Instalar y guardar en caché
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar cachés antiguas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Estrategia de fetch
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    // Para index.html → network first
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
  } else {
    // Para otros archivos → cache first
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
