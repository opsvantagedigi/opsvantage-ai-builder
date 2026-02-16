self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open('opsvantage-runtime-v1').then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) {
        return cached;
      }

      const response = await fetch(event.request);
      if (response && response.status === 200 && response.type === 'basic') {
        cache.put(event.request, response.clone());
      }
      return response;
    })
  );
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : 'MARZ sent a proactive thought.' };
  }

  const title = payload.title || 'MARZ • Proactive Thought';
  const tier = payload.tier === 'tier2' ? 'tier2' : 'tier1';
  const body = payload.body || 'I am with you. I found something useful for the Legacy.';
  const url = payload.url || '/admin/dashboard';

  const options = {
    body,
    icon: '/icon.png',
    badge: '/icon.png',
    data: { url, tier },
    tag: tier === 'tier2' ? 'marz-sovereign-tier2' : 'marz-sentinel-tier1',
    renotify: tier === 'tier2',
    requireInteraction: tier === 'tier2',
    vibrate: tier === 'tier2' ? [80, 40, 120, 40, 120] : [40, 20, 40],
    silent: false,
    sound: tier === 'tier2' ? '/audio/sovereign-tone.mp3' : undefined,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification?.data?.url || '/admin/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.postMessage({ type: 'MARZ_NOTIFICATION_CLICK', tier: event.notification?.data?.tier || 'tier1' });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(target);
      }
      return undefined;
    })
  );
});
