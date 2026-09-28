/* =====================================================
   PROPERTY FINDER RE — Unified Analytics & Tracker v2.0
   Session Tracking · UTM Capture · Geolocation (Fallback)
   Conversion Auditing · Scroll Depth · Local Storage Sync
   ===================================================== */
(() => {
  'use strict';

  const STORE_KEY   = 'pfre_analytics';
  const SESSION_KEY = 'pfre_tracker_session';
  const GEO_KEY     = 'pfre_geo_cache';
  const MAX_EVENTS  = 250;

  /* ── 1. Session Management ── */
  function getSession() {
    try {
      let s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!s || !s.id) {
        s = {
          id: 'S_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          start: new Date().toISOString(),
          pages: []
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      }
      return s;
    } catch (_) {
      return { id: 'S_fallback_' + Date.now(), start: new Date().toISOString(), pages: [] };
    }
  }

  /* ── 2. UTM Parameter Extraction ── */
  function getUTMParams() {
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source:   p.get('utm_source')   || '',
      utm_medium:   p.get('utm_medium')   || '',
      utm_campaign: p.get('utm_campaign') || '',
      utm_term:     p.get('utm_term')     || '',
      utm_content:  p.get('utm_content')  || ''
    };
  }

  /* ── 3. Device & Browser Fingerprinting ── */
  function getDeviceInfo() {
    const ua = navigator.userAgent || '';
    const isMobile  = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet  = /iPad|Android(?!.*Mobile)/i.test(ua);
    const isSafari  = /Safari/i.test(ua) && !/Chrome/i.test(ua);
    const isChrome  = /Chrome/i.test(ua);
    const isFirefox = /Firefox/i.test(ua);

    return {
      type:     isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
      browser:  isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'Other',
      os:       /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : /Android/i.test(ua) ? 'Android' : /iOS|iPhone|iPad/i.test(ua) ? 'iOS' : 'Unknown',
      screen:   `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      lang:     navigator.language || 'unknown'
    };
  }

  /* ── 4. Local Storage Event Logger ── */
  function saveLocalEvent(event) {
    try {
      const events = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      events.unshift(event);
      localStorage.setItem(STORE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
    } catch (_) {}
  }

  function updateLocalEvent(eventId, patch) {
    try {
      const events = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      const idx = events.findIndex(e => e.id === eventId);
      if (idx !== -1) {
        events[idx] = { ...events[idx], ...patch };
        localStorage.setItem(STORE_KEY, JSON.stringify(events));
      }
    } catch (_) {}
  }

  /* ── 5. Safe Geo-IP Lookup (Fails Open on CSP / Adblock Blocks) ── */
  async function fetchGeoData() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(GEO_KEY) || 'null');
      if (cached) return cached;

      // Abort controller fallback for legacy browser compatibility
      let signal;
      let timer;
      if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
        signal = AbortSignal.timeout(3500);
      } else {
        const controller = new AbortController();
        timer = setTimeout(() => controller.abort(), 3500);
        signal = controller.signal;
      }

      const res = await fetch('https://ipapi.co/json/', { signal });
      if (timer) clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (!data.error) {
          const geo = {
            ip: data.ip || null,
            city: data.city || '',
            region: data.region || '',
            country: data.country_name || '',
            postal: data.postal || '',
            lat: data.latitude || 0,
            lng: data.longitude || 0,
            org: data.org || ''
          };
          sessionStorage.setItem(GEO_KEY, JSON.stringify(geo));
          return geo;
        }
      }
    } catch (_) {
      // Graceful fail on CSP restriction or network timeout
    }
    return null;
  }

  /* ══════════════════════════════════════════════
     6. CORE TRACKING DISPATCHERS
  ═══════════════════════════════════════════════ */
  async function trackPageView() {
    const session  = getSession();
    const utm      = getUTMParams();
    const device   = getDeviceInfo();
    const cleanPath = window.location.pathname.split('/').pop() || 'index.html';
    const pageId   = 'pv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const pageStart = Date.now();

    const event = {
      id:        pageId,
      type:      'pageview',
      sessionId: session.id,
      page:      cleanPath,
      path:      window.location.pathname,
      title:     document.title.split('—')[0].split('|')[0].trim(),
      referrer:  document.referrer || 'direct',
      utm,
      device,
      ts:        new Date().toISOString(),
      duration:  0,
      ip:        null,
      location:  null
    };

    // Save initial pageview immediately
    saveLocalEvent(event);

    // Update Session Pages
    session.pages = session.pages || [];
    if (!session.pages.includes(cleanPath)) {
      session.pages.push(cleanPath);
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (_) {}
    }

    // Forward to Remote API if active
    if (window.PFREApi?.analytics) {
      window.PFREApi.analytics.trackView({
        page: window.location.pathname,
        sessionId: session.id,
        device: device.type,
        utm
      }).catch(() => {});
    }

    // Background Geolocation enrich
    fetchGeoData().then(geo => {
      if (geo) {
        event.ip = geo.ip;
        event.location = {
          city: geo.city,
          region: geo.region,
          country: geo.country,
          postal: geo.postal
        };
        updateLocalEvent(pageId, { ip: event.ip, location: event.location });
      }
    });

    // Update duration on exit (without creating duplicate events)
    window.addEventListener('beforeunload', () => {
      const finalDuration = Math.round((Date.now() - pageStart) / 1000);
      updateLocalEvent(pageId, { duration: finalDuration });
    });

    window.__pfre_analytics_ready = true;
  }

  function trackEvent(category, action, label = '', value = 0) {
    const session = getSession();
    const device  = getDeviceInfo();
    let geo = null;
    try { geo = JSON.parse(sessionStorage.getItem(GEO_KEY) || 'null'); } catch (_) {}

    const eventRecord = {
      id:        'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type:      'event',
      sessionId: session.id,
      category,
      action,
      label:     String(label),
      value:     Number(value) || 0,
      page:      window.location.pathname.split('/').pop() || 'index.html',
      path:      window.location.pathname,
      device,
      ip:        geo?.ip || null,
      location:  geo ? { city: geo.city, region: geo.region, country: geo.country } : null,
      ts:        new Date().toISOString()
    };

    saveLocalEvent(eventRecord);

    // Forward to Backend API
    if (window.PFREApi?.analytics) {
      window.PFREApi.analytics.trackEvent(category, action, label, value).catch(() => {});
    }
  }

  /* ══════════════════════════════════════════════
     7. INTERACTION HOOKS (SINGLE ATTACHMENT)
  ═══════════════════════════════════════════════ */
  function initDOMHooks() {
    // Phone Call CTA
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.addEventListener('click', () => {
        trackEvent('Conversion', 'Call Click', link.getAttribute('href') || '');
      });
    });

    // WhatsApp CTA
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
      link.addEventListener('click', () => {
        trackEvent('Conversion', 'WhatsApp Click', window.location.pathname);
      });
    });

    // Post Property CTA
    document.querySelectorAll('a[href*="post-property"]').forEach(btn => {
      btn.addEventListener('click', () => {
        trackEvent('Funnel', 'Post Property Click', btn.textContent.trim().slice(0, 30));
      });
    });

    // General CTA Buttons
    document.querySelectorAll('.btn-primary, .cta-section a').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.getAttribute('href')?.startsWith('tel:') && !btn.getAttribute('href')?.includes('wa.me')) {
          trackEvent('CTA', 'Button Click', btn.textContent.trim().slice(0, 35));
        }
      });
    });

    // Form Submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => {
        trackEvent('Form', 'Submit', form.id || form.getAttribute('name') || 'Unnamed Form');
      });
    });
  }

  /* ── 8. Scroll Depth Engine ── */
  function initScrollTracking() {
    const milestones = [25, 50, 75, 100];
    const reached = new Set();

    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      milestones.forEach(m => {
        if (scrollPercent >= m && !reached.has(m)) {
          reached.add(m);
          trackEvent('Engagement', 'Scroll Depth', `${m}%`, m);
        }
      });
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════
     9. ANALYTICS QUERY HELPER (ADMIN / STATS)
  ═══════════════════════════════════════════════ */
  function getAnalyticsData() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      const views = raw.filter(e => e.type === 'pageview');
      const events = raw.filter(e => e.type === 'event');

      const uniqueIPs = [...new Set(views.filter(e => e.ip).map(e => e.ip))];

      const pageCount = {};
      views.forEach(v => { pageCount[v.page] = (pageCount[v.page] || 0) + 1; });
      const topPages = Object.entries(pageCount).sort((a, b) => b[1] - a[1]).slice(0, 10);

      const cities = {};
      views.filter(v => v.location?.city).forEach(v => {
        cities[v.location.city] = (cities[v.location.city] || 0) + 1;
      });

      const devices = { mobile: 0, tablet: 0, desktop: 0 };
      views.forEach(v => { if (v.device?.type && devices[v.device.type] !== undefined) devices[v.device.type]++; });

      const whatsappClicks = events.filter(e => e.category === 'Conversion' && e.action === 'WhatsApp Click').length;
      const phoneCalls = events.filter(e => e.category === 'Conversion' && e.action === 'Call Click').length;

      const durationViews = views.filter(v => v.duration > 0);
      const avgDuration = durationViews.length
        ? Math.round(durationViews.reduce((acc, curr) => acc + curr.duration, 0) / durationViews.length)
        : 0;

      return {
        raw,
        views,
        events,
        uniqueVisitors: uniqueIPs.length || views.length,
        topPages,
        cities,
        devices,
        whatsappClicks,
        phoneCalls,
        avgDuration
      };
    } catch (_) {
      return null;
    }
  }

  /* ══════════════════════════════════════════════
     10. GLOBAL EXPORT & INITIALIZATION
  ═══════════════════════════════════════════════ */
  window.PFRETracker = {
    event: trackEvent,
    trackView: trackPageView,
    getSessionId: () => getSession().id,
    getSession,
    getUTMParams,
    getDevice: getDeviceInfo,
    getAnalytics: getAnalyticsData
  };

  // Global backward-compatible aliases for admin dashboard & widgets
  window.trackEvent = trackEvent;
  window.getAnalytics = getAnalyticsData;

  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  onReady(() => {
    trackPageView();
    initDOMHooks();
    initScrollTracking();
  });
})();