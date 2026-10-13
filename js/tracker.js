/**
 * js/tracker.js
 * Property Finder Real Estate - Mumbai
 * Real Estate Conversion & User Interaction Tracker
 */

(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'pfre_analytics_events';
  const SESSION_KEY = 'pfre_visitor_session';
  const MAX_STORED_EVENTS = 200;

  function generateId(prefix = 'ev') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
  }

  function getSessionInfo() {
    let session = null;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) session = JSON.parse(raw);
    } catch (e) {
      session = null;
    }

    if (!session) {
      const urlParams = new URLSearchParams(window.location.search);
      session = {
        sessionId: generateId('sess'),
        startedAt: new Date().toISOString(),
        referrer: document.referrer || 'direct',
        utmSource: urlParams.get('utm_source') || 'organic',
        utmMedium: urlParams.get('utm_medium') || 'none',
        utmCampaign: urlParams.get('utm_campaign') || 'none'
      };
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch (e) {
        console.warn('Session storage inaccessible for analytics:', e.message);
      }
    }
    return session;
  }

  function storeEventLocally(eventData) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push(eventData);

      if (list.length > MAX_STORED_EVENTS) {
        list.splice(0, list.length - MAX_STORED_EVENTS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage error while storing event:', e.message);
    }
  }

  function trackEvent(category, action, label = '', metadata = {}) {
    const session = getSessionInfo();
    const eventPayload = {
      id: generateId('evt'),
      sessionId: session.sessionId,
      timestamp: new Date().toISOString(),
      category: category,
      action: action,
      label: label,
      pageUrl: window.location.pathname,
      referrer: session.referrer,
      utmSource: session.utmSource,
      metadata: metadata
    };

    storeEventLocally(eventPayload);

    if (navigator.onLine && window.pfreConfig && window.pfreConfig.API && window.pfreConfig.API.ENDPOINTS.ANALYTICS) {
      try {
        navigator.sendBeacon(
          window.pfreConfig.API.ENDPOINTS.ANALYTICS,
          JSON.stringify(eventPayload)
        );
      } catch (err) {
        // Fallback handled by local cache
      }
    }

    const customEvt = new CustomEvent('pfre:event-tracked', { detail: eventPayload });
    window.dispatchEvent(customEvt);
  }

  function trackPageView() {
    const title = document.title || 'Property Finder Real Estate';
    trackEvent('navigation', 'page_view', title, {
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent
    });
  }

  function setupAutomatedTracking() {
    document.addEventListener('click', function (e) {
      const waButton = e.target.closest('a[href*="wa.me"], .fab-whatsapp, [data-track="whatsapp"]');
      if (waButton) {
        trackEvent('conversion', 'whatsapp_click', waButton.getAttribute('href') || 'whatsapp', {
          propertyId: waButton.getAttribute('data-property-id') || null
        });
        return;
      }

      const callButton = e.target.closest('a[href^="tel:"], .fab-call, [data-track="call"]');
      if (callButton) {
        trackEvent('conversion', 'call_click', callButton.getAttribute('href') || 'tel', {
          propertyId: callButton.getAttribute('data-property-id') || null
        });
        return;
      }

      const propertyCard = e.target.closest('.prop-card, .project-card-lg');
      if (propertyCard && e.target.closest('a:not(.btn-primary):not(.btn-green-inline)')) {
        const propId = propertyCard.getAttribute('data-id');
        trackEvent('engagement', 'property_card_click', propId || 'unknown');
        return;
      }

      const postPropertyBtn = e.target.closest('a[href*="post-property.html"]');
      if (postPropertyBtn) {
        trackEvent('conversion', 'post_property_click', 'navbar_or_hero');
      }
    });

    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (form.matches('form[data-pfre-inquiry], #enquiryForm, #contactForm, .pfre-lead-form')) {
        const formSource = form.getAttribute('data-source') || window.location.pathname;
        trackEvent('conversion', 'lead_form_submitted', formSource);
      }
    });
  }

  function getRecentEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function clearEvents() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear analytics log:', e.message);
    }
  }

  window.pfreTracker = {
    track: trackEvent,
    getEvents: getRecentEvents,
    clearEvents: clearEvents
  };

  document.addEventListener('DOMContentLoaded', function () {
    trackPageView();
    setupAutomatedTracking();
  });
})(window, document);