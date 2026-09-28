/* =====================================================
   PROPERTY FINDER RE — Website Configuration
   =====================================================
   ★ BEFORE PUBLISHING — update these values:
   ─────────────────────────────────────────────────────
   1. FORMSPREE_ID     → Formspree form ID (e.g. "xpwrgkqz")
   2. TURNSTILE_SITEKEY → Cloudflare Turnstile site key
   3. API_KEY          → Laravel backend website key
   4. Flip FEATURES.* flags to true when backend is live
   ===================================================== */

(function (global) {
  'use strict';

  /* ── Detect Environment ── */
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

  /* ── Canonical Configuration ── */
  const PFRE_CONFIG = {
    /* ── Formspree Lead Routing ── */
    FORMSPREE_ID: 'YOUR_FORMSPREE_ID',

    /* ── Cloudflare Turnstile ── */
    // Default: Cloudflare public test key (always passes)
    TURNSTILE_SITEKEY: '1x00000000000000000000AA',

    /* ── API Backend Connection ── */
    API_BASE_URL: isLocal
      ? 'http://localhost:8000/api/website'
      : 'https://api.propertyfinderrealestate.com/api/website',

    // Generate via: php artisan pfre:generate-website-key
    API_KEY: 'pfre_ws_key_2026_change_me',

    API_VERSION: 'v1',
    TIMEOUT: 12000,

    /* ── Feature Flags ── */
    FEATURES: {
      LIVE_PROPERTIES:    false,
      LIVE_TESTIMONIALS:  false,
      LIVE_BLOG:          false,
      LIVE_PRICE_TRENDS:  false,
      LEAD_CAPTURE:       true,
      ANALYTICS:          true,
      CRM_SYNC:           false,
      PUSH_NOTIFICATIONS: false,
      LIVE_FINANCE:       false,
      LIVE_LEGAL:         false,
      LIVE_INVENTORY:     false,
      LIVE_AUTH:          false,
    },

    /* ── Business Details ── */
    BUSINESS: {
      name:     'Property Finder Real Estate',
      phone:    '+919326990050',
      whatsapp: '919326990050',
      email:    'propertyfinderre@gmail.com',
      website:  'https://www.propertyfinderrealestate.com',
      address:  'Shop No. 9, Ground Floor, Building No. 3, Deepanjali CHS, Baf-Hira Nagar, Lower Kharodi, Jankalyan Nagar Road, Malad West',
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

    /* ── State Inspection Helpers ── */
    isLocal: () => isLocal,
    isConfigured: () => {
      return (
        PFRE_CONFIG.API_BASE_URL.length > 0 &&
        PFRE_CONFIG.API_KEY !== 'pfre_ws_key_2026_change_me' &&
        !PFRE_CONFIG.API_KEY.startsWith('REPLACE_ME')
      );
    }
  };

  /* ── Deep Freeze Helper ── */
  function deepFreeze(obj) {
    Object.keys(obj).forEach((prop) => {
      if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
        deepFreeze(obj[prop]);
      }
    });
    return Object.freeze(obj);
  }

  /* ── Development Diagnostic Check ── */
  (function runDiagnostics() {
    // Surface setup instructions during development, stay quiet in production
    if (isLocal) {
      if (PFRE_CONFIG.FORMSPREE_ID === 'YOUR_FORMSPREE_ID') {
        console.warn(
          '%c[PFRE Config]%c FORMSPREE_ID is unset. Form submissions will fail or use local fallback.',
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
          '%c[PFRE Config]%c API backend not linked (mock/local fallback active).',
          'color:#64748B;font-weight:bold;',
          'color:inherit;'
        );
      }
    }
  })();

  /* ── Export Immutable Config to Window ── */
  global.PFRE_CONFIG = deepFreeze(PFRE_CONFIG);

})(typeof window !== 'undefined' ? window : this);