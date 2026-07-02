/* ═══════════ LINUX DOJO — Service Worker ═══════════
   Strategia: network-first per la pagina (index.html),
   cache-first per tutti gli altri asset statici.
   Aggiorna il cache name per forzare un re-fetch degli asset. */
'use strict';

const CACHE = 'linux-dojo-sw-v14';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './css/style.css',
  './js/vendor/supabase.min.js',
  './js/config.js',
  './js/notes-core.js',
  './js/quiz-core.js',
  './js/sync.js',
  './js/app.js',
  './js/modules.js',
  './js/cheatsheets.js',
  './js/data/module01.js',
  './js/data/module01_quiz.js',
  './js/data/module02.js',
  './js/data/module02_quiz.js',
  './js/data/module03.js',
  './js/data/module03_quiz.js',
  './js/data/module04.js',
  './js/data/module04_quiz.js',
  './js/data/module05.js',
  './js/data/module05_quiz.js',
  './js/data/module06.js',
  './js/data/module06_quiz.js',
  './js/data/module07.js',
  './js/data/module07_quiz.js',
  './js/data/module08.js',
  './js/data/module08_quiz.js',
  './js/data/module09.js',
  './js/data/module09_quiz.js',
  './js/data/module10.js',
  './js/data/module10_quiz.js',
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

// Fetch: network-first per la pagina, cache-first per il resto
self.addEventListener('fetch', e => {
  // Ignora richieste non-GET e schemi non-http
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  // La pagina va sempre tentata dalla rete: un deploy nuovo arriva subito
  // anche senza bump di CACHE (il bump resta necessario per gli asset JS/CSS)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
          return response;
        })
        .catch(() =>
          caches.match(e.request)
            .then(cached => cached || caches.match('./index.html'))
        )
    );
    return;
  }

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
