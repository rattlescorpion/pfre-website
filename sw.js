/* =====================================================
   PROPERTY FINDER RE — Service Worker v3.1
   Network-first strategy · Smart offline fallback
   Auto cache-bust via BUILD_ID — bump this on every deploy
   ===================================================== */

const BUILD_ID   = '2026-06-18-01';
const CACHE_NAME = `pfre-cache-${BUILD_ID}`;

/* Critical assets — required for the offline page itself to render */
const CORE_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/css/styles.css',
  '/css/theme.css',
  '/css/overrides.css',
  '/css/utils.css',
  '/css/mobile.css',
  '/css/widgets.css',
  '/js/theme.js',
  '/js/widgets.js',
  '/js/i18n.js',
  '/js/security.js',
  '/js/config.js',
  '/js/api.js',
  '/js/tracker.js',
  '/js/properties-filter.js',
  '/icons/icon.svg',
  '/icons/icon-maskable.svg',
  '/icons/favicon.svg'
];

/* Public pages worth precaching for instant offline browsing.
   Internal/admin tools (admin, crm, analytics, email-templates,
   agreement-registration, business-blueprint, card) are deliberately
   excluded — they are staff-only and not needed offline. */
const PRECACHE_PAGES = [
  '/index.html',
  '/properties.html',
  '/property-detail.html',
  '/projects.html',
  '/post-property.html',
  '/services.html',
  '/home-loan.html',
  '/insurance.html',
  '/about.html',
  '/team.html',
  '/careers.html',
  '/testimonials.html',
  '/faq.html',
  '/blog.html',
  '/neighbourhoods.html',
  '/nri.html',
  '/contact.html',
  '/calculators.html',
  '/tds-calculators.html',
  '/converter.html',
  '/price-trends.html',
  '/reminders.html',
  '/privacy-policy.html'
];

/* ── Install: precache core + public pages ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([...CORE_ASSETS, ...PRECACHE_PAGES]))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Precache error:', err))
  );
});

/* ── Activate: remove every cache that isn't this BUILD_ID ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME && k.startsWith('pfre-cache-'))
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: Network-first, fallback to cache, then offline page ── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  /* Skip cross-origin requests except fonts/CDN */
  if (url.origin !== self.location.origin &&
      !url.hostname.includes('fonts.googleapis') &&
      !url.hostname.includes('fonts.gstatic')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        /* Only cache valid same-origin responses */
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(async () => {
        /* Offline fallback */
        const cached = await caches.match(event.request);
        if (cached) return cached;

        /* For HTML documents, return offline page */
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }

        /* For images, return a placeholder SVG */
        if (event.request.destination === 'image') {
          return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F0F2F5"/><text x="100" y="105" font-family="sans-serif" font-size="14" fill="#94A3B8" text-anchor="middle">Image unavailable</text></svg>`,
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
        /* Otherwise let the rejection propagate */
      })
  );
});

/* ── Push Notifications ── */
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* non-JSON payload, ignore */ }
  const title = data.title || 'Property Finder Real Estate';
  event.waitUntil(
    self.registration.showNotification(title, {
      body:  data.body  || 'New property alert for you!',
      icon:  '/icons/icon.svg',
      badge: '/icons/favicon.svg',
      data:  { url: data.url || '/' },
      actions: [
        { action: 'view', title: '🏠 View Property' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      requireInteraction: false,
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action !== 'dismiss') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(wins => {
        const target = (event.notification.data && event.notification.data.url) || '/';
        for (const win of wins) {
          if (win.url.includes(self.location.origin) && 'focus' in win) {
            win.navigate(target); return win.focus();
          }
        }
        return clients.openWindow(target);
      })
    );
  }
});

/* ── Background Sync (enquiry form) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-enquiry') {
    event.waitUntil(syncPendingEnquiries());
  }
  if (event.tag === 'sync-alerts') {
    event.waitUntil(syncPendingAlerts());
  }
});

/* ── IndexedDB helpers ── */
const DB_NAME    = 'pfre_offline_db';
const DB_VERSION = 1;
const STORE_ENQUIRIES = 'pending_enquiries';
const STORE_ALERTS    = 'pending_alerts';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_ENQUIRIES))
        db.createObjectStore(STORE_ENQUIRIES, { keyPath:'id', autoIncrement:true });
      if (!db.objectStoreNames.contains(STORE_ALERTS))
        db.createObjectStore(STORE_ALERTS, { keyPath:'id', autoIncrement:true });
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

function getAllFromStore(db, store) {
  return new Promise((res, rej) => {
    const req = db.transaction(store,'readonly').objectStore(store).getAll();
    req.onsuccess = e => res(e.target.result || []);
    req.onerror   = e => rej(e.target.error);
  });
}

function deleteFromStore(db, store, id) {
  return new Promise((res, rej) => {
    const req = db.transaction(store,'readwrite').objectStore(store).delete(id);
    req.onsuccess = () => res();
    req.onerror   = e => rej(e.target.error);
  });
}

async function syncPendingEnquiries() {
  try {
    const db      = await openDB();
    const pending = await getAllFromStore(db, STORE_ENQUIRIES);
    if (!pending.length) return;
    const API = self.__PFRE_API_BASE || '';
    for (const item of pending) {
      try {
        const r = await fetch(API + '/api/website/leads', {
          method:'POST',
          headers:{'Content-Type':'application/json','X-PFRE-Key':self.__PFRE_API_KEY||'','X-Synced-Offline':'true'},
          body: JSON.stringify(item.data),
        });
        if (r.ok || r.status === 422) {
          await deleteFromStore(db, STORE_ENQUIRIES, item.id);
          const wins = await self.clients.matchAll({ type:'window' });
          wins.forEach(w => w.postMessage({ type:'SYNC_SUCCESS', payload:{ id:item.id } }));
        }
      } catch { /* retry next sync */ }
    }
  } catch(e) { console.error('[SW] sync error', e); }
}

async function syncPendingAlerts() {
  try {
    const db      = await openDB();
    const pending = await getAllFromStore(db, STORE_ALERTS);
    const API = self.__PFRE_API_BASE || '';
    for (const item of pending) {
      try {
        const r = await fetch(API + '/api/website/property-alerts', {
          method:'POST',
          headers:{'Content-Type':'application/json','X-PFRE-Key':self.__PFRE_API_KEY||''},
          body: JSON.stringify(item.data),
        });
        if (r.ok || r.status === 422) await deleteFromStore(db, STORE_ALERTS, item.id);
      } catch { /* retry */ }
    }
  } catch(e) { console.error('[SW] alert sync error', e); }
}

/* ── Push notifications ── */
self.addEventListener('push', event => {
  if (!event.data) return;
  let payload = { title:'Property Finder RE', body:'New matching property listed!', icon:'/icons/icon-192.png', badge:'/icons/icon-192.png', tag:'pfre-alert', url:'/properties.html' };
  try { payload = {...payload, ...event.data.json()}; } catch {}
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body:payload.body, icon:payload.icon, badge:payload.badge,
      tag:payload.tag, data:{ url:payload.url },
      actions:[{action:'view',title:'👀 View'},{action:'dismiss',title:'✕'}],
      vibrate:[200,100,200],
    })
  );
});

