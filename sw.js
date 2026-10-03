/* =====================================================
   PROPERTY FINDER REAL ESTATE — Production Service Worker v3.3
   Unified Caching · Resilient Pre-cache · Background Sync
   Network-First Inventory/HTML · Cache-First Assets
   Offline Fallbacks · Push Notifications
   ===================================================== */

const BUILD_ID   = '2026-10-03-01';
const CACHE_NAME = `pfre-cache-${BUILD_ID}`;

/* Core UI shell & fallback templates (Guaranteed precache) */
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/manifest.json',
  '/css/styles.css',
  '/css/theme.css',
  '/css/overrides.css',
  '/css/utils.css',
  '/css/mobile.css',
  '/css/widgets.css',
  '/js/config.js',
  '/js/theme.js',
  '/js/widgets.js',
  '/js/i18n.js',
  '/js/security.js',
  '/js/api.js',
  '/js/tracker.js',
  '/js/properties-filter.js',
  '/data/properties.json',
  '/data/projects.json',
  '/icons/favicon.svg',
  '/icons/icon-192.png'
];

/* Optional secondary pages (Cached gracefully in background) */
const OPTIONAL_PAGES = [
  '/properties.html',
  '/projects.html',
  '/about.html',
  '/contact.html',
  '/services.html',
  '/calculators.html',
  '/terms.html',
  '/privacy-policy.html'
];

/* ── 1. INSTALL: Resilient Pre-caching ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Cache critical UI shell with individual error tolerance
      await Promise.allSettled(
        CORE_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res.ok) await cache.put(url, res);
          } catch (err) {
            console.warn(`[SW] Pre-cache item skipped: ${url}`, err);
          }
        })
      );

      // 2. Pre-warm optional routes without blocking service worker activation
      await Promise.allSettled(
        OPTIONAL_PAGES.map(async (url) => {
          try {
            const res = await fetch(url);
            if (res.ok) await cache.put(url, res);
          } catch (_) {}
        })
      );
    }).then(() => self.skipWaiting())
  );
});

/* ── 2. ACTIVATE: Cleanup Stale Caches ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((k) => (k.startsWith('pfre-cache-') || k.startsWith('pfre-static-')) && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

/* ── 3. FETCH: Strategy Routing ── */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip dynamic backend API endpoints (handled via offline IndexedDB queue)
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/website')) {
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;
  const isFontCDN = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');

  if (!isSameOrigin && !isFontCDN) return;

  // STRATEGY A: Dynamic Content, JSON Datastores & Navigation (Network-First)
  const isDynamicContent =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.json') ||
    url.pathname === '/';

  if (isDynamicContent) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;

          // Fallback hierarchy for page navigation failures
          if (event.request.mode === 'navigate' || event.request.destination === 'document') {
            const cached404 = await caches.match('/404.html');
            if (cached404) return cached404;
            return caches.match('/index.html');
          }

          return new Response('Content unavailable offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }

  // STRATEGY B: Static Assets, Fonts & Images (Cache-First with Network Fallback)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => {
          // Fallback placeholder image when offline
          if (event.request.destination === 'image') {
            return new Response(
              `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="#F1F5F9"/><text x="150" y="105" font-family="sans-serif" font-size="14" fill="#94A3B8" text-anchor="middle">Image Offline</text></svg>`,
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        });
    })
  );
});

/* ── 4. PUSH NOTIFICATIONS ── */
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: 'Property Finder Real Estate', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Property Finder Real Estate';
  const options = {
    body: data.body || 'New property match available in Mumbai!',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    data: { url: data.url || '/properties.html' },
    actions: [
      { action: 'view', title: '👀 View Details' },
      { action: 'dismiss', title: '✕ Close' }
    ],
    vibrate: [150, 80, 150]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action !== 'dismiss') {
    const targetUrl = (event.notification.data && event.notification.data.url) || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
    );
  }
});

/* ── 5. INDEXEDDB CONFIG & BACKGROUND SYNC ── */
let runtimeApiBase = 'https://api.propertyfinderrealestate.com/api/website';
let runtimeApiKey  = 'pfre_ws_key_2026_change_me';

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CONFIG_SYNC') {
    if (event.data.apiBase) runtimeApiBase = event.data.apiBase;
    if (event.data.apiKey)  runtimeApiKey  = event.data.apiKey;
  }
});

const DB_NAME = 'pfre_offline_db';
const DB_VERSION = 1;
const STORE_ENQUIRIES = 'pending_enquiries';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_ENQUIRIES)) {
        db.createObjectStore(STORE_ENQUIRIES, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function syncPendingEnquiries() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_ENQUIRIES, 'readonly');
    const store = tx.objectStore(STORE_ENQUIRIES);
    const items = await new Promise((res) => {
      const r = store.getAll();
      r.onsuccess = () => res(r.result || []);
      r.onerror   = () => res([]);
    });

    if (!items.length) return;

    for (const item of items) {
      try {
        const response = await fetch(`${runtimeApiBase}/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Website-API-Key': runtimeApiKey,
            'X-Synced-Offline': 'true'
          },
          body: JSON.stringify(item.data)
        });

        if (response.ok || response.status === 422) {
          const delTx = db.transaction(STORE_ENQUIRIES, 'readwrite');
          delTx.objectStore(STORE_ENQUIRIES).delete(item.id);

          const clientsList = await self.clients.matchAll({ type: 'window' });
          clientsList.forEach((c) =>
            c.postMessage({ type: 'SYNC_SUCCESS', payload: { id: item.id } })
          );
        }
      } catch (_) {
        // Automatically retries on next connection
      }
    }
  } catch (err) {
    console.error('[SW Sync Error]:', err);
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-enquiry') {
    event.waitUntil(syncPendingEnquiries());
  }
});