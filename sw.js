// sw.js

const CACHE_VERSION = 8; // UBAH ANGKA INI (misalnya dari 6 menjadi 7)
const STATIC_CACHE = `ular-tangga-static-v${CACHE_VERSION}`;

// Aset inti yang wajib ada agar aplikasi bisa berjalan
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icons/icons-192x192.png', // Pastikan ikon juga di-cache
    './icons/icons-512x512.png'
];

// 1. Saat instalasi, simpan aset inti ke cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => {
            console.log('Service Worker: Menyimpan aset inti ke cache...');
            return cache.addAll(CORE_ASSETS);
        })
    );
});

// 2. Saat aktivasi, hapus semua cache lama yang tidak digunakan
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== STATIC_CACHE)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// 3. Strategi "Cache First" untuk menyajikan aset
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Kembalikan dari cache jika ada, jika tidak, ambil dari jaringan
            return response || fetch(event.request);
        })
    );
});