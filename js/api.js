/* =====================================================
   PROPERTY FINDER RE — API Client v1.0
   Full integration with PFRE Omni Platform
   GitHub: rattlescorpion/pfre-omni
   =====================================================
   Usage:
     const api = window.PFREApi;
     await api.leads.create({ name, phone, ... });
     const props = await api.properties.list({ intent:'buy' });
   ===================================================== */

window.PFREApi = (() => {
  'use strict';

  const CFG = () => window.PFRE_CONFIG || {};
  const BASE = () => CFG().API_BASE_URL || '';
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

    try {
      const headers = {
        'Content-Type':       'application/json',
        'Accept':             'application/json',
        'X-Website-API-Key':  KEY(),
        'X-Website-Version':  CFG().API_VERSION || 'v1',
        'X-Website-Origin':   window.location.hostname,
      };
      if (requiresAuth && Auth.getToken()) {
        headers['Authorization'] = `Bearer ${Auth.getToken()}`;
      }

      const opts = { method, headers, signal: controller.signal };
      if (data && method !== 'GET') opts.body = JSON.stringify(data);

      const url = `${BASE()}${endpoint}`;
      const res = await fetch(url, opts);
      clearTimeout(timeout);

      if (res.status === 401) { Auth.clearToken(); throw new Error('Unauthorised'); }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(err.message || `Request failed: ${res.status}`);
      }

      return await res.json();

    } catch (err) {
      clearTimeout(timeout);
      /* Queue for retry if offline */
      if (!navigator.onLine && data && method !== 'GET') {
        enqueue({ method, endpoint, data });
        console.warn('[PFRE API] Queued for retry (offline):', endpoint);
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
          await request(item.method, item.endpoint, item.data);
        } catch {
          if (item.retries < 3) {
            remaining.push({ ...item, retries: item.retries + 1 });
          }
        }
      }
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    } catch {}
  });

  /* ══════════════════════════════════════════
     LEAD MANAGEMENT
  ══════════════════════════════════════════ */
  const leads = {

    /** Create lead from contact/enquiry form → PF-LEAD-YYYY-NNNN */
    async create(data) {
      const payload = {
        name:         data.name?.trim(),
        phone:        data.phone?.trim(),
        email:        data.email?.trim() || null,
        source:       data.source || 'website',
        intent:       data.intent || 'buy',
        config:       data.config || null,
        budget_min:   data.budgetMin ? parseInt(data.budgetMin) : null,
        budget_max:   data.budgetMax ? parseInt(data.budgetMax) : null,
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

    /** Quick property enquiry (from listing card / property detail) */
    async enquire(propertyId, data) {
      return leads.create({ ...data, propertyId, source: 'property_enquiry' });
    },

    /** Post property (owner wants to list) → creates seller/rent/PG lead.
        Forwards the whole payload through rather than re-mapping a fixed
        list of field names — post-property.html's submitListing() already
        builds `data` with snake_case keys taken directly from each form
        field's name= attribute (carpet_area, primary_building_name,
        building_type, etc.), matching what PropertyController validates.
        A hand-maintained fixed list here is exactly what silently dropped
        most of this form's fields in an earlier version of this method. */
    async postProperty(data) {
      return request('POST', '/properties/submit', {
        ...data,
        owner_name:    data.name,
        owner_phone:   data.phone,
        owner_email:   data.email,
        property_type: data.propType,
        source:        'post_property_page',
      });
    },
  };

  /* ══════════════════════════════════════════
     PROPERTY LISTINGS
  ══════════════════════════════════════════ */
  const properties = {

    /** Fetch property listings with filters */
    async list(params = {}) {
      if (!FEAT().LIVE_PROPERTIES) return { data: [], meta: { total: 0, fallback: true } };
      const q = new URLSearchParams({
        intent:    params.intent    || '',
        config:    params.config    || '',
        locality:  params.locality  || '',
        min_price: params.minPrice  || '',
        max_price: params.maxPrice  || '',
        building:  params.building  || '',
        sort:      params.sort      || 'newest',
        per_page:  params.perPage   || 12,
        page:      params.page      || 1,
        q:         params.q         || '',
      }).toString();
      return request('GET', `/properties?${q}`);
    },

    /** Get property detail by ID or slug */
    async get(idOrSlug) {
      if (!FEAT().LIVE_PROPERTIES) return null;
      return request('GET', `/properties/${idOrSlug}`);
    },

    /** Get featured properties for homepage */
    async featured(limit = 6) {
      if (!FEAT().LIVE_PROPERTIES) return { data: [] };
      return request('GET', `/properties/featured?limit=${limit}`);
    },

    /** Get similar properties */
    async similar(propertyId, limit = 3) {
      if (!FEAT().LIVE_PROPERTIES) return { data: [] };
      return request('GET', `/properties/${propertyId}/similar?limit=${limit}`);
    },

    /** Search suggestions */
    async suggest(query) {
      if (!FEAT().LIVE_PROPERTIES || query.length < 2) return { data: [] };
      return request('GET', `/properties/suggest?q=${encodeURIComponent(query)}`);
    },
  };

  /* ══════════════════════════════════════════
     CONTENT (Blog, Testimonials, Price Data)
  ══════════════════════════════════════════ */
  const content = {

    async blogPosts(params = {}) {
      if (!FEAT().LIVE_BLOG) return { data: [] };
      const q = new URLSearchParams({ page: params.page||1, per_page: params.perPage||6, category: params.category||'' }).toString();
      return request('GET', `/blog?${q}`);
    },

    async testimonials(limit = 9) {
      if (!FEAT().LIVE_TESTIMONIALS) return { data: [] };
      return request('GET', `/testimonials?limit=${limit}&status=approved`);
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
        name:        data.name,
        phone:       data.phone,
        email:       data.email,
        income:      parseInt(data.income),
        loan_amount: parseInt(data.loanAmount),
        tenure:      parseInt(data.tenure),
        property_value: parseInt(data.propertyValue),
        employment:  data.employment || 'salaried',
        existing_emis: parseInt(data.existingEmis || 0),
        page_url:    window.location.href,
      });
    },
  };

  /* ══════════════════════════════════════════
     ANALYTICS
  ══════════════════════════════════════════ */
  const analytics = {
    /** Track page view */
    async trackView(data) {
      if (!FEAT().ANALYTICS) return;
      try {
        return await request('POST', '/analytics/pageview', {
          page:      data.page || window.location.pathname,
          title:     document.title,
          referrer:  document.referrer || null,
          ip:        data.ip || null,
          location:  data.location || null,
          device:    data.device || null,
          session_id:data.sessionId || null,
          utm:       data.utm || null,
        });
      } catch { /* Never break page for analytics */ }
    },

    /** Track custom event */
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
     CRM (Authenticated — requires login)
  ══════════════════════════════════════════ */
  const crm = {

    /** Login to Omni Platform */
    async login(email, password) {
      const res = await request('POST', '/auth/login', { email, password, source: 'website' });
      if (res.token) Auth.setToken(res.token);
      return res;
    },

    async logout() {
      try { await request('POST', '/auth/logout', null, true); } catch {}
      Auth.clearToken();
    },

    async me() {
      return request('GET', '/auth/me', null, true);
    },

    /** Get all leads (paginated) */
    async getLeads(params = {}) {
      const q = new URLSearchParams({
        stage:    params.stage    || '',
        source:   params.source   || '',
        search:   params.search   || '',
        sort:     params.sort     || 'latest',
        per_page: params.perPage  || 25,
        page:     params.page     || 1,
      }).toString();
      return request('GET', `/crm/leads?${q}`, null, true);
    },

    /** Update lead stage */
    async updateLead(id, data) {
      return request('PATCH', `/crm/leads/${id}`, data, true);
    },

    /** Log activity against a lead */
    async logActivity(leadId, data) {
      return request('POST', `/crm/leads/${leadId}/activities`, {
        type:        data.type,
        notes:       data.notes,
        outcome:     data.outcome,
        next_action: data.nextAction,
        follow_up:   data.followUp,
      }, true);
    },

    /** Get today's follow-ups */
    async getTodayFollowups() {
      return request('GET', '/crm/followups/today', null, true);
    },

    /** Get pipeline stats */
    async getPipelineStats() {
      return request('GET', '/crm/stats/pipeline', null, true);
    },

    /** Sync local CRM leads to backend */
    async syncLocalLeads(localLeads) {
      if (!FEAT().CRM_SYNC || !Auth.isLoggedIn()) return { synced: 0 };
      return request('POST', '/crm/sync', { leads: localLeads }, true);
    },
  };

  /* ══════════════════════════════════════════
     REMINDERS (sync with Omni Platform)
  ══════════════════════════════════════════ */
  const reminders = {
    async list() {
      return request('GET', '/reminders', null, true);
    },
    async create(data) {
      return request('POST', '/reminders', data, true);
    },
    async update(id, data) {
      return request('PATCH', `/reminders/${id}`, data, true);
    },
    async delete(id) {
      return request('DELETE', `/reminders/${id}`, null, true);
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
     Tries API first, falls back to localStorage
  ══════════════════════════════════════════ */
  async function smartSubmit(formType, data, onSuccess, onError) {
    const toastFn = window.showToast || (() => {});

    try {
      let result;
      if (formType === 'contact')     result = await leads.create({ ...data, source: 'contact_form' });
      if (formType === 'enquiry')     result = await leads.enquire(data.propertyId, data);
      if (formType === 'post_prop')   result = await leads.postProperty(data);
      if (formType === 'loan')        result = await loans.applyRequest(data);
      if (formType === 'testimonial') result = await content.submitTestimonial(data);
      if (formType === 'newsletter')  result = await newsletter.subscribe(data.email, data.name);

      /* Also save to localStorage as backup */
      try {
        const key = `pfre_${formType}_submissions`;
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        saved.unshift({ ...data, ts: new Date().toISOString(), synced: true, ref: result?.data?.reference });
        localStorage.setItem(key, JSON.stringify(saved.slice(0,20)));
      } catch {}

      toastFn(`✅ Submitted successfully! Reference: ${result?.data?.reference || 'Received'}`, 'success');
      if (onSuccess) onSuccess(result);
      return result;

    } catch (err) {
      console.warn('[PFRE API] Falling back to localStorage:', err.message);

      /* Fallback: save to localStorage */
      try {
        const key = `pfre_${formType}_submissions`;
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        saved.unshift({ ...data, ts: new Date().toISOString(), synced: false, error: err.message });
        localStorage.setItem(key, JSON.stringify(saved.slice(0,20)));
      } catch {}

      /* Still show success to user (data is saved locally for manual sync) */
      toastFn('✅ Request received! We will contact you within 2 hours.', 'success');
      if (onSuccess) onSuccess({ fallback: true });
    }
  }

  /* Public API */
  return {
    leads, properties, content, loans, analytics,
    newsletter, crm, reminders, health,
    auth: Auth,
    smartSubmit,
    request,
    isConfigured: () => BASE().length > 0 && KEY() !== 'pfre_ws_key_2026_change_me',
  };

})();

/* ── Auto-configure contact forms ── */
document.addEventListener('DOMContentLoaded', () => {
  /* Patch contact form if PFREApi is available */
  const contactForm = document.querySelector('#contactForm');
  if (contactForm && window.PFREApi) {
    const submitBtn = contactForm.querySelector('button[type=submit], .submit-btn');
    if (submitBtn && !submitBtn.dataset.apiPatched) {
      submitBtn.dataset.apiPatched = 'true';
      submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const name  = contactForm.querySelector('input[type=text]')?.value?.trim();
        const phone = contactForm.querySelector('input[type=tel]')?.value?.trim();
        const email = contactForm.querySelector('input[type=email]')?.value?.trim();
        const msg   = contactForm.querySelector('textarea')?.value?.trim();
        if (!name || !phone) return;
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Sending…';
        await window.PFREApi.smartSubmit('contact', { name, phone, email, message: msg });
        submitBtn.disabled = false;
        submitBtn.textContent = '📤 Send Enquiry';
      });
    }
  }

  /* Health check on load (silent) */
  if (window.PFREApi && window.PFRE_CONFIG?.FEATURES?.ANALYTICS) {
    window.PFREApi.health.ping().catch(() => {});
  }
});
