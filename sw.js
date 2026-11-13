const CACHE_PREFIX = 'chiaogoo-workspace-';
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/sw.js',
  '/img/tlkc-logo-192.png',
  '/img/tlkc-logo-512.png',
  '/favicon.ico',
  '/icon.png',
  '/icon.svg',
  '/js/apiQuery.js',
  '/js/basket/basket.js',
  '/js/basket/basketStorage.js',
  '/js/catalogue/data.js',
  '/js/checkout/shopify.js',
  '/js/compatibility/compatibility.js',
  '/js/compatibility/compatibilityFormatting.js',
  '/js/constants.js',
  '/js/main.js',
  '/js/state.js',
  '/js/ui/accessories.js',
  '/js/ui/cables.js',
  '/js/ui/compatibilityModal.js',
  '/js/ui/tips.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache.startsWith(CACHE_PREFIX) && cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      ).then(() => self.clients.claim());
    })
  );
});

function isAppAsset(request) {
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;

  return url.pathname === '/' ||
    /^\/(?:index\.html|style\.css|manifest\.json|site\.webmanifest|favicon\.ico|icon\.(?:png|svg))$/.test(url.pathname) ||
    /^\/(?:js\/.*\.js|img\/.*\.(?:png|svg))$/.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  if (!isAppAsset(event.request)) return;

  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        if (event.request.mode === 'navigate') {
          return cache.match('/index.html');
        }

        return Response.error();
      }
    })()
  );
});
