/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'marz-pwa-v2';
const RUNTIME_CACHE = 'marz-runtime-v2';

const PRECACHE_ASSETS = [
  '/',
  '/marz/chat',
  '/manifest.json',
  '/icons/marz-icon-192.png',
  '/icons/marz-icon-512.png',
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);
  const path = url.pathname || '/';

  // Never cache Next.js build assets or API routes; caching these can break voice/video chat
  // after deployments by serving stale JS or stale configuration.
  if (path.startsWith('/_next/') || path.startsWith('/api/') || path === '/sw.js' || path === '/service-worker.js') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response for caching
        const responseClone = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/marz/chat');
          }
          
          // Return offline response
          return new Response('Offline - MARZ will be back soon', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? 'MARZ';
  const options = {
    body: data.body ?? 'MARZ has a message for you',
    icon: '/icons/marz-icon-192.png',
    badge: '/icons/marz-icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url ?? '/marz/chat',
    },
    actions: [
      {
        action: 'open',
        title: 'Open MARZ',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url ?? '/marz/chat';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline messages
self.addEventListener('sync', (event) => {
  if (event.tag === 'marz-messages') {
    event.waitUntil(
      // Sync offline messages when back online
      Promise.resolve()
    );
  }
});
