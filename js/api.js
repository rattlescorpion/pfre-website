/* =====================================================
   PROPERTY FINDER RE — API Client v1.1 (Rectified)
   Full integration with PFRE Omni Platform
   GitHub: rattlescorpion/pfre-omni
   ===================================================== */

window.PFREApi = (() => {
  'use strict';

  const CFG  = () => window.PFRE_CONFIG || {};
  const BASE = () => (CFG().API_BASE_URL || '').replace(/\/+$/, '');
  const KEY  = () => CFG().API_KEY || '';
  const FEAT = () => CFG().FEATURES || {};

  /* ── Offline queue for failed requests ── */
  const QUEUE_KEY = 'pfre_api_queue';

  function enqueue(item) {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      q.push({ ...item, ts: Date.now(), retries: 0 });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-50)));
    } catch {}
  }

  /* ── Auth token management ── */
  const Auth = {
    getToken: () => { try { return localStorage.getItem('pfre_omni_token'); } catch { return null; } },
    setToken: (t) => { try { localStorage.setItem('pfre_omni_token', t); } catch {} },
    clearToken:() => { try { localStorage.removeItem('pfre_omni_token'); } catch {} },
    isLoggedIn:() => !!Auth.getToken(),
  };

  /* ── Core request function ── */
  async function request(method, endpoint, data = null, requiresAuth = false) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CFG().TIMEOUT || 12000);
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    try {
      const headers = {
        'Content-Type':      'application/json',
        'Accept':            'application/json',
        'X-Website-API-Key': KEY(),
        'X-Website-Version': CFG().API_VERSION || 'v1',
        'X-Website-Origin':  window.location.hostname,
      };

      if (requiresAuth && Auth.getToken()) {
        headers['Authorization'] = `Bearer ${Auth.getToken()}`;
      }

      const opts = { method, headers, signal: controller.signal };
      if (data && method !== 'GET') opts.body = JSON.stringify(data);

      const url = `${BASE()}${cleanEndpoint}`;
      const res = await fetch(url, opts);
      clearTimeout(timeout);

      if (res.status === 401) {
        Auth.clearToken();
        throw new Error('Unauthorised');
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        const error = new Error(err.message || `Request failed: ${res.status}`);
        error.status = res.status;
        error.data = err;
        throw error;
      }

      /* Handle 204 No Content or empty bodies safely */
      if (res.status === 204 || res.headers.get('content-length') === '0') {
        return null;
      }

      const text = await res.text();
      return text ? JSON.parse(text) : null;

    } catch (err) {
      clearTimeout(timeout);

      /* Queue non-GET requests only when connection fails or is offline */
      const isNetworkError = !navigator.onLine || err.name === 'AbortError' || err.message === 'Failed to fetch';
      if (isNetworkError && data && method !== 'GET') {
        enqueue({ method, endpoint: cleanEndpoint, data, requiresAuth });
        console.warn('[PFRE API] Queued for retry (network offline):', cleanEndpoint);
      }
      throw err;
    }
  }

  /* ── Retry queued requests when back online ── */
  window.addEventListener('online', async () => {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      if (!q.length) return;
      const remaining = [];
      for (const item of q) {
        try {
          await request(item.method, item.endpoint, item.data, !!item.requiresAuth);
        } catch {
          if (item.retries < 3) {
            remaining.push({ ...item, retries: item.retries + 1 });
          }
        }
      }
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    } catch {}
  });

  /* ── Helper: Clean query strings ── */
  function buildQuery(params) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) q.append(k, v);
    });
    const str = q.toString();
    return str ? `?${str}` : '';
  }

  /* ══════════════════════════════════════════
     LEAD MANAGEMENT
  ══════════════════════════════════════════ */
  const leads = {
    async create(data) {
      const payload = {
        name:         data.name?.trim(),
        phone:        data.phone?.trim(),
        email:        data.email?.trim() || null,
        source:       data.source || 'website',
        intent:       data.intent || 'buy',
        config:       data.config || null,
        budget_min:   Number.isInteger(parseInt(data.budgetMin)) ? parseInt(data.budgetMin) : null,
        budget_max:   Number.isInteger(parseInt(data.budgetMax)) ? parseInt(data.budgetMax) : null,
        localities:   data.localities || null,
        message:      data.message || data.notes || null,
        property_id:  data.propertyId || null,
        page_url:     window.location.href,
        referrer:     document.referrer || null,
        utm_source:   new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium:   new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
      };
      return request('POST', '/leads', payload);
    },

    async enquire(propertyId, data) {
      return leads.create({ ...data, propertyId, source: 'property_enquiry' });
    },

    async postProperty(data) {
      return request('POST', '/properties/submit', {
        ...data,
        owner_name:    data.owner_name || data.name,
        owner_phone:   data.owner_phone || data.phone,
        owner_email:   data.owner_email || data.email,
        property_type: data.property_type || data.propType,
        source:        'post_property_page',
      });
    },
  };

  /* ══════════════════════════════════════════
     PROPERTY LISTINGS
  ══════════════════════════════════════════ */
  const properties = {
    async list(params = {}) {
      if (!FEAT().LIVE_PROPERTIES) return { data: [], meta: { total: 0, fallback: true } };
      const q = buildQuery({
        intent:    params.intent,
        config:    params.config,
        locality:  params.locality,
        min_price: params.minPrice,
        max_price: params.maxPrice,
        building:  params.building,
        sort:      params.sort || 'newest',
        per_page:  params.perPage || 12,
        page:      params.page || 1,
        q:         params.q,
      });
      return request('GET', `/properties${q}`);
    },

    async get(idOrSlug) {
      if (!FEAT().LIVE_PROPERTIES) return null;
      return request('GET', `/properties/${encodeURIComponent(idOrSlug)}`);
    },

    async featured(limit = 6) {
      if (!FEAT().LIVE_PROPERTIES) return { data: [] };
      return request('GET', `/properties/featured?limit=${parseInt(limit)}`);
    },

    async similar(propertyId, limit = 3) {
      if (!FEAT().LIVE_PROPERTIES) return { data: [] };
      return request('GET', `/properties/${encodeURIComponent(propertyId)}/similar?limit=${parseInt(limit)}`);
    },

    async suggest(query) {
      if (!FEAT().LIVE_PROPERTIES || query.length < 2) return { data: [] };
      return request('GET', `/properties/suggest?q=${encodeURIComponent(query)}`);
    },
  };

  /* ══════════════════════════════════════════
     CONTENT
  ══════════════════════════════════════════ */
  const content = {
    async blogPosts(params = {}) {
      if (!FEAT().LIVE_BLOG) return { data: [] };
      const q = buildQuery({ page: params.page || 1, per_page: params.perPage || 6, category: params.category });
      return request('GET', `/blog${q}`);
    },

    async testimonials(limit = 9) {
      if (!FEAT().LIVE_TESTIMONIALS) return { data: [] };
      return request('GET', `/testimonials?limit=${parseInt(limit)}&status=approved`);
    },

    async submitTestimonial(data) {
      return request('POST', '/testimonials', {
        name: data.name, rating: data.rating, review: data.review,
        service: data.service, page_url: window.location.href
      });
    },

    async priceTrends(locality = '') {
      if (!FEAT().LIVE_PRICE_TRENDS) return { data: [] };
      return request('GET', `/market-data/price-trends?locality=${encodeURIComponent(locality)}`);
    },

    async marketStats() {
      if (!FEAT().LIVE_PRICE_TRENDS) return null;
      return request('GET', '/market-data/stats');
    },
  };

  /* ══════════════════════════════════════════
     HOME LOAN
  ══════════════════════════════════════════ */
  const loans = {
    async applyRequest(data) {
      return request('POST', '/loan-applications', {
        name:           data.name?.trim(),
        phone:          data.phone?.trim(),
        email:          data.email?.trim() || null,
        income:         Number(data.income) || 0,
        loan_amount:    Number(data.loanAmount) || 0,
        tenure:         Number(data.tenure) || 0,
        property_value: Number(data.propertyValue) || 0,
        employment:     data.employment || 'salaried',
        existing_emis:  Number(data.existingEmis) || 0,
        page_url:       window.location.href,
      });
    },
  };

  /* ══════════════════════════════════════════
     ANALYTICS
  ══════════════════════════════════════════ */
  const analytics = {
    async trackView(data = {}) {
      if (!FEAT().ANALYTICS) return;
      try {
        return await request('POST', '/analytics/pageview', {
          page:       data.page || window.location.pathname,
          title:      document.title,
          referrer:   document.referrer || null,
          ip:         data.ip || null,
          location:   data.location || null,
          device:     data.device || null,
          session_id: data.sessionId || null,
          utm:        data.utm || null,
        });
      } catch {}
    },

    async trackEvent(category, action, label = '', value = 0) {
      if (!FEAT().ANALYTICS) return;
      try {
        return await request('POST', '/analytics/event', {
          category, action, label, value,
          page: window.location.pathname,
        });
      } catch {}
    },
  };

  /* ══════════════════════════════════════════
     NEWSLETTER
  ══════════════════════════════════════════ */
  const newsletter = {
    async subscribe(email, name = '', preferences = []) {
      return request('POST', '/newsletter/subscribe', { email, name, preferences, source: window.location.pathname });
    },
    async unsubscribe(email, token) {
      return request('POST', '/newsletter/unsubscribe', { email, token });
    },
  };

  /* ══════════════════════════════════════════
     CRM (Authenticated)
  ══════════════════════════════════════════ */
  const crm = {
    async login(email, password) {
      const res = await request('POST', '/auth/login', { email, password, source: 'website' });
      if (res?.token) Auth.setToken(res.token);
      return res;
    },

    async logout() {
      try { await request('POST', '/auth/logout', {}, true); } catch {}
      Auth.clearToken();
    },

    async me() {
      return request('GET', '/auth/me', null, true);
    },

    async getLeads(params = {}) {
      const q = buildQuery({
        stage:    params.stage,
        source:   params.source,
        search:   params.search,
        sort:     params.sort || 'latest',
        per_page: params.perPage || 25,
        page:     params.page || 1,
      });
      return request('GET', `/crm/leads${q}`, null, true);
    },

    async updateLead(id, data) {
      return request('PATCH', `/crm/leads/${encodeURIComponent(id)}`, data, true);
    },

    async logActivity(leadId, data) {
      return request('POST', `/crm/leads/${encodeURIComponent(leadId)}/activities`, {
        type:        data.type,
        notes:       data.notes,
        outcome:     data.outcome,
        next_action: data.nextAction,
        follow_up:   data.followUp,
      }, true);
    },

    async getTodayFollowups() {
      return request('GET', '/crm/followups/today', null, true);
    },

    async getPipelineStats() {
      return request('GET', '/crm/stats/pipeline', null, true);
    },

    async syncLocalLeads(localLeads) {
      if (!FEAT().CRM_SYNC || !Auth.isLoggedIn()) return { synced: 0 };
      return request('POST', '/crm/sync', { leads: localLeads }, true);
    },
  };

  /* ══════════════════════════════════════════
     REMINDERS
  ══════════════════════════════════════════ */
  const reminders = {
    async list() {
      return request('GET', '/reminders', null, true);
    },
    async create(data) {
      return request('POST', '/reminders', data, true);
    },
    async update(id, data) {
      return request('PATCH', `/reminders/${encodeURIComponent(id)}`, data, true);
    },
    async delete(id) {
      return request('DELETE', `/reminders/${encodeURIComponent(id)}`, null, true);
    },
    async getToday() {
      return request('GET', '/reminders/today', null, true);
    },
  };

  /* ══════════════════════════════════════════
     HEALTH CHECK
  ══════════════════════════════════════════ */
  const health = {
    async ping() {
      try {
        const res = await request('GET', '/health');
        return { online: true, ...res };
      } catch {
        return { online: false };
      }
    },
  };

  /* ══════════════════════════════════════════
     HELPER: Smart form submission
  ══════════════════════════════════════════ */
  async function smartSubmit(formType, data, onSuccess, onError) {
    const toastFn = window.showToast || (() => {});

    try {
      let result;
      switch (formType) {
        case 'contact':     result = await leads.create({ ...data, source: 'contact_form' }); break;
        case 'enquiry':     result = await leads.enquire(data.propertyId, data); break;
        case 'post_prop':   result = await leads.postProperty(data); break;
        case 'loan':        result = await loans.applyRequest(data); break;
        case 'testimonial': result = await content.submitTestimonial(data); break;
        case 'newsletter':  result = await newsletter.subscribe(data.email, data.name); break;
        default: throw new Error(`Unknown form submission type: ${formType}`);
      }

      /* Store record backup */
      try {
        const key = `pfre_${formType}_submissions`;
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        saved.unshift({ ...data, ts: new Date().toISOString(), synced: true, ref: result?.data?.reference });
        localStorage.setItem(key, JSON.stringify(saved.slice(0, 20)));
      } catch {}

      toastFn(`✅ Submitted successfully! Reference: ${result?.data?.reference || 'Received'}`, 'success');
      if (typeof onSuccess === 'function') onSuccess(result);
      return result;

    } catch (err) {
      const isOfflineOrNetwork = !navigator.onLine || err.name === 'AbortError' || err.message === 'Failed to fetch';

      if (isOfflineOrNetwork) {
        console.warn('[PFRE API] Offline/network failure. Storing locally:', err.message);
        try {
          const key = `pfre_${formType}_submissions`;
          const saved = JSON.parse(localStorage.getItem(key) || '[]');
          saved.unshift({ ...data, ts: new Date().toISOString(), synced: false, error: err.message });
          localStorage.setItem(key, JSON.stringify(saved.slice(0, 20)));
        } catch {}

        toastFn('✅ Connection offline. Request saved and will sync automatically!', 'info');
        if (typeof onSuccess === 'function') onSuccess({ fallback: true });
        return { fallback: true };
      }

      /* Validation / 4xx / 5xx server rejection */
      console.error('[PFRE API] Submission error:', err.message);
      toastFn(`❌ Submission failed: ${err.message}`, 'error');
      if (typeof onError === 'function') onError(err);
      throw err;
    }
  }

  return {
    leads, properties, content, loans, analytics,
    newsletter, crm, reminders, health,
    auth: Auth,
    smartSubmit,
    request,
    isConfigured: () => BASE().length > 0 && KEY() !== 'pfre_ws_key_2026_change_me',
  };
})();

/* ── DOM Bindings ── */
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('#contactForm');
  if (contactForm && window.PFREApi) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput  = contactForm.querySelector('[name="name"], input[type="text"]');
      const phoneInput = contactForm.querySelector('[name="phone"], input[type="tel"]');
      const emailInput = contactForm.querySelector('[name="email"], input[type="email"]');
      const msgInput   = contactForm.querySelector('[name="message"], textarea');
      const submitBtn  = contactForm.querySelector('button[type="submit"], .submit-btn');

      const name  = nameInput?.value.trim();
      const phone = phoneInput?.value.trim();
      const email = emailInput?.value.trim();
      const msg   = msgInput?.value.trim();

      if (!name || !phone) return;

      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Sending…';
      }

      try {
        await window.PFREApi.smartSubmit('contact', { name, phone, email, message: msg });
        contactForm.reset();
      } catch (err) {
        // Error handling handled by smartSubmit toast
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }

  /* Silent backend ping when configured */
  if (window.PFREApi?.isConfigured()) {
    window.PFREApi.health.ping().catch(() => {});
  }
});