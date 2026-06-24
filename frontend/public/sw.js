const CACHE = 'resumind-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    (async () => {
      try {
        const cached = await caches.match(request);
        const fetchPromise = fetch(request).then(async (response) => {
          if (response.ok) {
            try {
              const cache = await caches.open(CACHE);
              cache.put(request, response.clone());
            } catch {
              /* ignore non-http scheme */
            }
          }
          return response;
        });
        return cached || (await fetchPromise);
      } catch {
        return fetch(request);
      }
    })(),
  );
});
