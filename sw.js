const CACHE_NAME = "gymtracker-cache-v1";
const urlsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png"
];

// Installationsereignis
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Caching App Ressourcen");
            return cache.addAll(urlsToCache);
        })
    );
});

// Abrufen von Ressourcen aus dem Cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Alte Caches entfernen
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Alten Cache löschen:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
