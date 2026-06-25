/* ═══════════ LINUX DOJO — Service Worker ═══════════
   Strategia: cache-first per tutti gli asset statici.
   Aggiorna il cache name per forzare un re-fetch. */
'use strict';

const CACHE = 'linux-dojo-sw-v3';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './css/style.css',
  './js/config.js',
  './js/sync.js',
  './js/app.js',
  './js/modules.js',
  './js/cheatsheets.js',
  './js/data/module01.js',
  './js/data/module02.js',
  './js/data/module03.js',
  './js/data/module04.js',
  './js/data/module05.js',
  './js/data/module06.js',
  './js/data/module07.js',
  './js/data/module08.js',
  './js/data/module09.js',
  './js/data/module10.js',
];

// Installa e pre-cacha tutti gli asset
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Attiva: elimina cache vecchie
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fallback network
self.addEventListener('fetch', e => {
  // Ignora richieste non-GET e schemi non-http
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Cacha solo risposte valide
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
