/* =====================================================
   PROPERTY FINDER RE — Visitor Tracker v1.0
   IP geolocation · Page analytics · UTM tracking
   Data stored in localStorage (client-side demo)
   For production: POST to your server/Firebase
   ===================================================== */
(() => {
  'use strict';

  const STORE_KEY = 'pfre_analytics';
  const SESSION_KEY = 'pfre_session';
  const MAX_EVENTS = 200;

  /* ── Session Management ── */
  function getSession() {
    try {
      let s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!s) {
        s = {
          id: 'S' + Date.now().toString(36) + Math.random().toString(36).substr(2,5).toUpperCase(),
          start: new Date().toISOString(),
          pages: []
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      }
      return s;
    } catch { return { id: 'unknown', start: new Date().toISOString(), pages: [] }; }
  }

  /* ── UTM Parameters ── */
  function getUTM() {
    const p = new URLSearchParams(window.location.search);
    return {
      source:   p.get('utm_source')   || '',
      medium:   p.get('utm_medium')   || '',
      campaign: p.get('utm_campaign') || '',
      term:     p.get('utm_term')     || '',
      content:  p.get('utm_content')  || ''
    };
  }

  /* ── Device Info ── */
  function getDevice() {
    const ua = navigator.userAgent;
    const isMobile  = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet  = /iPad|Android(?!.*Mobile)/i.test(ua);
    const isSafari  = /Safari/i.test(ua) && !/Chrome/i.test(ua);
    const isChrome  = /Chrome/i.test(ua);
    const isFirefox = /Firefox/i.test(ua);
    return {
      type:     isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
      browser:  isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'Other',
      os:       /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : /Android/i.test(ua) ? 'Android' : /iOS|iPhone|iPad/i.test(ua) ? 'iOS' : 'Unknown',
      screen:   `${screen.width}×${screen.height}`,
      lang:     navigator.language || 'unknown'
    };
  }

  /* ── Save visit event ── */
  function saveEvent(event) {
    try {
      const events = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      events.unshift(event);
      localStorage.setItem(STORE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
    } catch { /* quota exceeded or private mode */ }
  }

  /* ── Track page view (with IP lookup) ── */
  async function trackPageView() {
    const session = getSession();
    const utm = getUTM();
    const device = getDevice();
    const referrer = document.referrer;
    const page = window.location.pathname.split('/').pop() || 'index.html';

    /* Build base event */
    const event = {
      type:      'pageview',
      sessionId: session.id,
      page,
      title:     document.title.split('—')[0].trim(),
      referrer:  referrer || 'direct',
      utm,
      device,
      ts:        new Date().toISOString(),
      duration:  0,
      ip:        null,
      location:  null
    };

    /* Track time on page */
    const pageStart = Date.now();
    window.addEventListener('beforeunload', () => {
      event.duration = Math.round((Date.now() - pageStart) / 1000);
      saveEvent(event); /* Final save with duration */
    });

    /* Geo IP Lookup using free ipapi.co */
    try {
      const cached = JSON.parse(sessionStorage.getItem('pfre_geo') || 'null');
      if (cached) {
        event.ip       = cached.ip;
        event.location = cached.location;
        saveEvent(event);
      } else {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const geo = await res.json();
          if (!geo.error) {
            const location = {
              city:     geo.city     || '',
              region:   geo.region   || '',
              country:  geo.country_name || '',
              country_code: geo.country_code || '',
              postal:   geo.postal   || '',
              lat:      geo.latitude  || 0,
              lng:      geo.longitude || 0,
              timezone: geo.timezone || '',
              isp:      geo.org      || ''
            };
            event.ip       = geo.ip;
            event.location = location;
            /* Cache geo for session to avoid repeat API calls */
            sessionStorage.setItem('pfre_geo', JSON.stringify({ ip: geo.ip, location }));
            saveEvent(event);
          }
        }
      }
    } catch {
      /* API failed — save without geo */
      saveEvent(event);
    }

    /* Update session page list */
    session.pages = session.pages || [];
    if (!session.pages.includes(page)) session.pages.push(page);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch {}

    /* Expose for admin dashboard */
    window.__pfre_analytics_ready = true;
  }

  /* ── Track custom events ── */
  window.trackEvent = (category, action, label = '', value = 0) => {
    const session = getSession();
    const cached = JSON.parse(sessionStorage.getItem('pfre_geo') || 'null') || {};
    saveEvent({
      type: 'event',
      sessionId: session.id,
      category, action, label, value,
      page: window.location.pathname.split('/').pop() || 'index.html',
      ip: cached.ip || null,
      location: cached.location || null,
      device: getDevice(),
      ts: new Date().toISOString()
    });
  };

  /* ── Track form submissions ── */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => {
        trackEvent('Form', 'Submit', form.id || form.className || 'unknown');
      });
    });

    /* Track CTA button clicks */
    document.querySelectorAll('.btn-primary, .cta-section a').forEach(btn => {
      btn.addEventListener('click', () => {
        trackEvent('CTA', 'Click', btn.textContent?.trim()?.slice(0,40) || 'button');
      });
    });

    /* Track WhatsApp clicks */
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
      a.addEventListener('click', () => trackEvent('WhatsApp', 'Click', window.location.pathname));
    });

    /* Track phone calls */
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      a.addEventListener('click', () => trackEvent('Phone', 'Click', window.location.pathname));
    });
  });

  /* ── Analytics Helper: get stats ── */
  window.getAnalytics = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      const views = raw.filter(e => e.type === 'pageview');
      const events = raw.filter(e => e.type === 'event');
      const uniqueIPs = [...new Set(views.filter(e => e.ip).map(e => e.ip))];
      const pageCount = {};
      views.forEach(v => { pageCount[v.page] = (pageCount[v.page] || 0) + 1; });
      const topPages = Object.entries(pageCount).sort((a,b) => b[1]-a[1]).slice(0,10);
      const cities = {};
      views.filter(v => v.location?.city).forEach(v => {
        cities[v.location.city] = (cities[v.location.city] || 0) + 1;
      });
      const devices = { mobile:0, tablet:0, desktop:0 };
      views.forEach(v => { if (v.device?.type) devices[v.device.type]++; });
      const whatsappClicks = events.filter(e => e.category === 'WhatsApp').length;
      const phoneCalls = events.filter(e => e.category === 'Phone').length;
      const avgDuration = views.filter(v => v.duration > 0).reduce((a,v) => a+v.duration, 0) /
                          (views.filter(v => v.duration > 0).length || 1);
      return { raw, views, events, uniqueIPs, topPages, cities, devices, whatsappClicks, phoneCalls, avgDuration: Math.round(avgDuration) };
    } catch { return null; }
  };

  /* ── Start tracking ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView);
  } else {
    trackPageView();
  }

})();
