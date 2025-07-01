// sw.js

const CACHE_VERSION = 5; // Versi cache dinaikkan untuk memaksa pembaruan
const STATIC_CACHE_NAME = `ular-tangga-static-v${CACHE_VERSION}`;

// Aset inti aplikasi yang harus selalu ada untuk mode offline
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './images/icon-192x192.png',
    './images/icon-512x512.png'
];

// Saat Service Worker diinstal, simpan semua aset inti ke cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            console.log('Service Worker: Menyimpan aset inti ke cache...');
            return cache.addAll(CORE_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Saat Service Worker diaktifkan, hapus cache versi lama
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== STATIC_CACHE_NAME)
                .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Strategi "Cache First, falling back to Network"
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cacheResponse => {
            // Jika aset ditemukan di cache, langsung kembalikan (Cache First)
            // Jika tidak, ambil dari jaringan
            return cacheResponse || fetch(event.request);
        })
    );
});