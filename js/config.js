/* =====================================================
   PROPERTY FINDER RE — Website Configuration
   =====================================================
   ★ BEFORE PUBLISHING — update these 2 values:
   ─────────────────────────────────────────────────────
   1. FORMSPREE_ID  →  sign up free at formspree.io,
      create a form, paste the ID (e.g. "xpwrgkqz")
      All 5 lead forms will email propertyfinderre@gmail.com

   2. TURNSTILE_SITEKEY  →  optional but recommended.
      dash.cloudflare.com/turnstile → New Widget → paste key.
      The test key below always passes (fine for launch).
   ─────────────────────────────────────────────────────
   When the Laravel backend is deployed later:
   3. API_KEY       →  php artisan pfre:generate-website-key
   4. Flip LIVE_PROPERTIES / LIVE_TESTIMONIALS / LIVE_BLOG
      / LIVE_PRICE_TRENDS / CRM_SYNC  →  true
   ===================================================== */

window.PFRE_CONFIG = {

  /* ══════════════════════════════════════════════════
     ★  STEP 1 — ADD YOUR FORMSPREE ID HERE (required)
     ══════════════════════════════════════════════════
     1. Go to formspree.io → Sign Up (free — 50 leads/month)
     2. Click "+ New Form" → name it "PFRE Website"
     3. Copy the form ID from the URL or form settings
        e.g. https://formspree.io/f/xpwrgkqz  →  ID is "xpwrgkqz"
     4. Paste it below between the quotes
     Every contact/enquiry/listing/career form will then
     email propertyfinderre@gmail.com with full details. */
  FORMSPREE_ID: 'YOUR_FORMSPREE_ID',

  /* ══════════════════════════════════════════════════
     ★  STEP 2 — ADD YOUR TURNSTILE SITEKEY (optional)
     ══════════════════════════════════════════════════
     Current key is Cloudflare's public TEST key —
     it always passes (no real spam protection yet).
     To get real protection:
     1. dash.cloudflare.com → Turnstile → Add Site
     2. Domain: propertyfinderrealestate.com
     3. Copy the Site Key and paste below */
  TURNSTILE_SITEKEY: '1x00000000000000000000AA',

  /* ── API Connection (configure when backend is deployed) ── */
  API_BASE_URL: (function() {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000/api/website';
    }
    return 'https://api.propertyfinderrealestate.com/api/website';
  })(),

  // Generate with: php artisan pfre:generate-website-key
  API_KEY: 'REPLACE_ME__pfre_ws_key_not_yet_configured',

  API_VERSION: 'v1',
  TIMEOUT: 12000,

  /* ── Feature Flags — flip to true when backend is live ── */
  FEATURES: {
    LIVE_PROPERTIES:    false,
    LIVE_TESTIMONIALS:  false,
    LIVE_BLOG:          false,
    LIVE_PRICE_TRENDS:  false,
    LEAD_CAPTURE:       true,
    ANALYTICS:          true,
    CRM_SYNC:           false,
    PUSH_NOTIFICATIONS: false,
    LIVE_FINANCE:       false, // finance.html — Chart of Accounts, Journal, P&L/Balance Sheet, Invoices
    LIVE_LEGAL:         false, // legal.html — Persons, Family Tree, Wills, POA, Deeds
    LIVE_INVENTORY:     false, // inventory.html — SKUs, stock, QR asset tags
    LIVE_AUTH:          false, // login.html — real session against /api/v1/auth/login
  },

  /* ── Business Details ── */
  BUSINESS: {
    name:    'Property Finder Real Estate',
    phone:   '+919326990050',
    whatsapp:'919326990050',
    email:   'propertyfinderre@gmail.com',
    website: 'https://www.propertyfinderrealestate.com',
    city:    'Mumbai',
    state:   'Maharashtra',
    country: 'India',
    pincode: '400095',
    currency:'INR',
  },

  /* ── Omni Platform Modules ── */
  OMNI_MODULES: {
    crm:       '/crm',
    leads:     '/crm/leads',
    deals:     '/crm/deals',
    properties:'/properties',
    finance:   '/finance',
    reports:   '/reports',
    settings:  '/settings',
  },

};

// Make config immutable at runtime
if (typeof Object.freeze === 'function') {
  Object.freeze(window.PFRE_CONFIG.FEATURES);
  Object.freeze(window.PFRE_CONFIG.BUSINESS);
}

// ── Runtime self-check ──
(function checkConfig() {
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
  if (isLocal) return;

  if (window.PFRE_CONFIG.FORMSPREE_ID === 'YOUR_FORMSPREE_ID') {
    console.warn(
      '%c⚠ PFRE: FORMSPREE_ID not set',
      'color:#92400E;background:#FEF3C7;padding:2px 6px;border-radius:4px;font-weight:bold',
      '\nLead forms will NOT reach the owner until FORMSPREE_ID is set in js/config.js'
    );
  }
  if (window.PFRE_CONFIG.TURNSTILE_SITEKEY === '1x00000000000000000000AA') {
    console.info(
      '%cℹ PFRE: Using Turnstile test key — forms are unprotected against spam.',
      'color:#1D4ED8;padding:2px 6px'
    );
  }
})();
