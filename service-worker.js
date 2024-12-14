const cacheName = "fittrack-cache-v2"; // Neue Version des Caches
const assets = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

// Installieren des Service Workers
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log("Caching app shell...");
            return cache.addAll(assets);
        })
    );
});

// Aktivieren des Service Workers
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== cacheName) // Alte Caches löschen
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// Abrufen der Ressourcen aus dem Cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
