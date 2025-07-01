// sw.js

const CACHE_VERSION = 4; // Versi cache dinaikkan untuk memaksa pembaruan
const STATIC_CACHE_NAME = `ular-tangga-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `ular-tangga-dynamic-v${CACHE_VERSION}`;

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
                .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
                .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Strategi "Network First, falling back to Cache"
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            return fetch(event.request).then(networkResponse => {
                // Jika berhasil dari jaringan, simpan ke cache dinamis dan kembalikan
                cache.put(event.request.url, networkResponse.clone());
                return networkResponse;
            }).catch(() => {
                // Jika jaringan gagal, cari di cache
                return caches.match(event.request).then(cacheResponse => {
                    // Jika ada di cache, kembalikan. Jika tidak, akan gagal (sesuai standar)
                    return cacheResponse;
                });
            });
        })
    );
});