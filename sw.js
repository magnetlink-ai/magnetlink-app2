const CACHE = 'bms-shell-v1';
const SHELL_URLS = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for same-origin navigation/app-shell requests so updates
// deploy immediately; falls back to the cached shell only when offline.
// Cross-origin CDN requests (React/Tailwind/MSAL/Supabase) are left untouched.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  );
});

// Web Push: show a system notification even if the app tab is closed.
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Magnet Link BMS', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { section: data.section || null },
    })
  );
});

// Focus an already-open tab (and tell it where to navigate) or open a new one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const section = event.notification.data && event.notification.data.section;
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('focus' in client) {
        client.postMessage({ type: 'bms-notif-nav', section });
        return client.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(section ? `/?open=${section}` : '/');
  })());
});
