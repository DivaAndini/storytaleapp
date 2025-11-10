import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BASE_URL } from './config';

const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'storytale-api',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'storytale-api-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => {
    return url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome');
  },
  new CacheFirst({
    cacheName: 'fontawesome',
  }),
);

registerRoute(
  ({ url }) => url.origin.includes('tile.openstreetmap.org'),
  new CacheFirst({
    cacheName: 'osm-tiles',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  }),
);

self.addEventListener('push', async (event) => {
  let payload = { 
    title: 'StoryTale App | Story berhasil dibuat!', 
    options: { 
      body: '',
      icon: '/favicon.png',
    } 
  };

  try {
    if (event.data) payload = event.data.json();
  } catch {
    const text = event.data ? await event.data.text() : '';
    payload = { 
      title: 'StoryTale App | Story berhasil dibuat!', 
      options: { 
        body: text,
        icon: '/favicon.png',  
      } 
    };
  }

  if (!payload.options.actions) {
    payload.options.actions = [
      { action: 'open', title: 'Lihat Story' },
      { action: 'close', title: 'Tutup' }
    ];
  }
  
  if (!payload.options.data) {
    payload.options.data = { url: '/#/story' };
  }

  await self.registration.showNotification(payload.title, payload.options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notifData = event.notification.data || {};
  const targetUrl = (action && notifData.actions && notifData.actions[action]) || notifData.url || '/';

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if (client.url.includes(location.origin)) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE', url: targetUrl });
          return;
        }
      }

      await clients.openWindow(targetUrl);
    })(),
  );
});
