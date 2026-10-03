/* =====================================================
   PROPERTY FINDER REAL ESTATE — Central Configuration Engine
   Enterprise Client Setup · Production & Local Routing
   Immutable Settings · Lead Pipeline & Backend Sync
   ===================================================== */

(function (global) {
  'use strict';

  /* ── 1. Environment Detection ── */
  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) || '';
  const isLocal = Boolean(
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.test') ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );

  /* ── 2. Unified Master Configuration ── */
  const PFRE_CONFIG = {
    /* ── Core Identity ── */
    SITE_NAME: 'Property Finder Real Estate',
    BASE_URL: 'https://www.propertyfinderrealestate.com',
    PHONE: '+919326990050',
    PHONE_FORMATTED: '+919326990050',
    WHATSAPP: '919326990050',
    EMAIL: 'propertyfinderre@gmail.com',
    ADDRESS: 'Shop No. 9, Ground Floor, Building No. 3, Deepanjali Co-operative Housing Society Limited, Baf-Hira Nagar, Lower Kharodi, Jankalyan Nagar Road, Malad West, Mumbai, Maharashtra, 400095, India',

    /* ── Geolocation & Map Coordinates ── */
    GEO: {
      LATITUDE: 19.1886,
      LONGITUDE: 72.8485
    },

    /* ── Lead Routing & Cloudflare Turnstile ── */
    // Replace with your Formspree form ID (e.g. "xaygkqle")
    FORMSPREE_ID: 'YOUR_FORMSPREE_ID',
    // Default: Cloudflare Turnstile test key (passes automatically; replace with live dashboard key in production)
    TURNSTILE_SITEKEY: '1x00000000000000000000AA',

    /* ── API Backend Connection ── */
    API_BASE_URL: isLocal
      ? 'http://localhost:8000/api/website'
      : 'https://api.propertyfinderrealestate.com/api/website',

    API_KEY: 'pfre_ws_key_2026_change_me',
    API_VERSION: 'v1',
    TIMEOUT: 12000,

    /* ── Feature Toggles ── */
    FEATURES: {
      LIVE_PROPERTIES:    false,
      LIVE_TESTIMONIALS:  false,
      LIVE_BLOG:          false,
      LIVE_PRICE_TRENDS:  false,
      LEAD_CAPTURE:       true,
      ANALYTICS:          true,
      CRM_SYNC:           false,
      PUSH_NOTIFICATIONS: true,
      LIVE_FINANCE:       false,
      LIVE_LEGAL:         false,
      LIVE_INVENTORY:     false,
      LIVE_AUTH:          false,
    },

    /* ── Structured Business Record ── */
    BUSINESS: {
      name:     'Property Finder Real Estate',
      phone:    '+919326990050',
      whatsapp: '919326990050',
      email:    'propertyfinderre@gmail.com',
      website:  'https://www.propertyfinderrealestate.com',
      address:  'Shop No. 9, Ground Floor, Building No. 3, Deepanjali Co-operative Housing Society Limited, Baf-Hira Nagar, Lower Kharodi, Jankalyan Nagar Road, Malad West, Mumbai, Maharashtra, 400095, India',
      locality: 'Malad West',
      city:     'Mumbai',
      state:    'Maharashtra',
      country:  'India',
      pincode:  '400095',
      currency: 'INR',
    },

    /* ── Omni Platform Route Map ── */
    OMNI_MODULES: {
      crm:        '/crm',
      leads:      '/crm/leads',
      deals:      '/crm/deals',
      properties: '/properties',
      finance:    '/finance',
      reports:    '/reports',
      settings:   '/settings',
    },

    /* ── Runtime Helper Methods ── */
    isLocal: () => isLocal,
    isConfigured: () => {
      return (
        PFRE_CONFIG.API_BASE_URL.length > 0 &&
        PFRE_CONFIG.API_KEY !== 'pfre_ws_key_2026_change_me' &&
        !PFRE_CONFIG.API_KEY.startsWith('REPLACE_ME')
      );
    }
  };

  /* ── 3. Deep Freeze Helper ── */
  function deepFreeze(obj) {
    Object.keys(obj).forEach((prop) => {
      if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
        deepFreeze(obj[prop]);
      }
    });
    return Object.freeze(obj);
  }

  /* ── 4. Development Diagnostics ── */
  (function runDiagnostics() {
    if (isLocal) {
      if (PFRE_CONFIG.FORMSPREE_ID === 'YOUR_FORMSPREE_ID') {
        console.warn(
          '%c[PFRE Config]%c FORMSPREE_ID is unset. Forms will rely on local storage/Omni fallback queue.',
          'color:#D97706;font-weight:bold;',
          'color:inherit;'
        );
      }
      if (PFRE_CONFIG.TURNSTILE_SITEKEY === '1x00000000000000000000AA') {
        console.info(
          '%c[PFRE Config]%c Turnstile is running with Cloudflare test keys.',
          'color:#2563EB;font-weight:bold;',
          'color:inherit;'
        );
      }
      if (!PFRE_CONFIG.isConfigured()) {
        console.info(
          '%c[PFRE Config]%c API backend not linked (mock/local data fallback active).',
          'color:#64748B;font-weight:bold;',
          'color:inherit;'
        );
      }
    }
  })();

  /* ── 5. Service Worker Sync (Syncs API Keys to Worker) ── */
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CONFIG_SYNC',
          apiBase: PFRE_CONFIG.API_BASE_URL,
          apiKey: PFRE_CONFIG.API_KEY
        });
      }
    });
  }

  /* ── 6. Export to Global Scope ── */
  global.PFRE_CONFIG = deepFreeze(PFRE_CONFIG);

})(typeof window !== 'undefined' ? window : this);