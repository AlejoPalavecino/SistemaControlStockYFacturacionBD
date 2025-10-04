// Service Worker para cache estático
const CACHE_NAME = 'arca-app-v1';
const STATIC_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/assets/logo.svg'
];

// Cache de recursos dinámicos
const DYNAMIC_CACHE = 'arca-dynamic-v1';

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar fetch requests
self.addEventListener('fetch', (event) => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Firebase requests
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('firestore')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retornar desde cache si existe
        if (response) {
          return response;
        }

        // Fetch desde red y cachear
        return fetch(event.request)
          .then(response => {
            // Solo cachear respuestas válidas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar la respuesta para cache
            const responseToCache = response.clone();

            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Retornar página offline si está disponible
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});