/* =====================================================
   PROPERTY FINDER REAL ESTATE — Production Service Worker v3.2
   Unified Caching · Resilient Pre-cache · Background Sync
   Offline HTML/Image Fallbacks · Push Notifications
   ===================================================== */

const BUILD_ID   = '2026-06-18-02';
const CACHE_NAME = `pfre-cache-${BUILD_ID}`;

/* Core UI shell — required for offline rendering */
const CORE_ASSETS = [
  '/',
  '/index.html',
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
  '/icons/favicon.png'
];

/* Optional public pages to pre-warm in cache */
const OPTIONAL_PAGES = [
  '/properties.html',
  '/about.html',
  '/contact.html',
  '/services.html',
  '/calculators.html',
  '/privacy-policy.html'
];

/* ── 1. INSTALL: Resilient Pre-caching ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Guarantee core assets are cached
      try {
        await cache.addAll(CORE_ASSETS);
      } catch (err) {
        console.warn('[SW] Core pre-cache item missing, continuing gracefully:', err);
      }

      // 2. Fetch optional pages individually without failing the install step
      await Promise.allSettled(
        OPTIONAL_PAGES.map((url) =>
          fetch(url)
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch(() => {})
        )
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
          .filter((k) => k.startsWith('pfre-cache-') && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

/* ── 3. FETCH: Strategy Routing ── */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip dynamic API and backend endpoints (handled via offline queue in api.js)
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/website')) {
    return;
  }

  // Check if same origin or trusted font CDN
  const isSameOrigin = url.origin === self.location.origin;
  const isFontCDN = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');

  if (!isSameOrigin && !isFontCDN) return;

  // STRATEGY A: Static Assets & Fonts (Cache-First with Network Fallback)
  const isStaticAsset =
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    isFontCDN;

  if (isStaticAsset) {
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
            // Image fallback placeholder
            if (event.request.destination === 'image') {
              return new Response(
                `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F1F5F9"/><text x="100" y="105" font-family="sans-serif" font-size="13" fill="#94A3B8" text-anchor="middle">Image Offline</text></svg>`,
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
          });
      })
    );
    return;
  }

  // STRATEGY B: Navigation / HTML Pages (Network-First with Cache Fallback)
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

        // Fall back to offline page, then cached index
        if (event.request.destination === 'document' || event.request.mode === 'navigate') {
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) return offlinePage;
          return caches.match('/index.html');
        }

        return new Response('Network unavailable', { status: 503, statusText: 'Service Unavailable' });
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
    icon: data.icon || '/icons/favicon.png',
    badge: data.badge || '/icons/favicon.png',
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

// Listen for config sync from main thread
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
        // Will retry automatically on next network connection
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