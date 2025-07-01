const CACHE_VERSION = 3; // Ubah angka ini setiap kali ada pembaruan besar
const CURRENT_CACHE = `ular-tangga-cache-v${CACHE_VERSION}`;

// Daftar semua file yang dibutuhkan aplikasi untuk berjalan offline
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './images/icon-192x192.png',
    './images/icon-512x512.png'
];

// Saat Service Worker diinstal, simpan semua aset ke cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CURRENT_CACHE)
            .then(cache => {
                console.log('Service Worker: Menyimpan aset ke cache...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting()) // Aktifkan Service Worker baru segera
    );
});

// Saat Service Worker diaktifkan, hapus semua cache lama
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CURRENT_CACHE) {
                        console.log('Service Worker: Menghapus cache lama:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Ambil alih kontrol halaman
    );
});

// Intercept permintaan jaringan (fetch)
self.addEventListener('fetch', event => {
    // Hanya proses permintaan GET
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Jika berhasil dari jaringan, simpan ke cache dan kembalikan respons
                return caches.open(CURRENT_CACHE).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // Jika jaringan gagal, coba ambil dari cache
                console.log(`Service Worker: Gagal mengambil dari jaringan, mencari di cache untuk ${event.request.url}`);
                return caches.match(event.request);
            })
    );
});