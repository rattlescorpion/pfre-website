/* =====================================================
   PROPERTY FINDER REAL ESTATE — Security Engine v3.0 (Unified)
   Client-side UX Protection · Anti-Spam · Multi-Turnstile
   XSS Sanitization · Rate-Limiting · Honeypot Validation
   ===================================================== */
(() => {
  'use strict';

  const CFG = () => window.PFRE_CONFIG || {};

  /* ══════════════════════════════════════════════
     1. CONSOLE SELF-XSS DETERRENT
  ═══════════════════════════════════════════════ */
  try {
    const style1 = 'color:#EF4444;font-size:40px;font-weight:900;text-shadow:2px 2px #000';
    const style2 = 'color:#F59E0B;font-size:15px;font-weight:600;line-height:1.8';
    const style3 = 'color:#10B981;font-size:13px;line-height:1.6';
    console.log('%c⚠ STOP!', style1);
    console.log('%cThis is a browser developer feature.\nPasting code here can compromise your account and private data.', style2);
    console.log('%c© 2026 Property Finder Real Estate, Mumbai. All rights reserved.', style3);
    console.log('%cSecurity queries: propertyfinderre@gmail.com', 'color:#6B7280;font-size:11px');
  } catch (_) {}

  /* ══════════════════════════════════════════════
     2. SANITIZATION ENGINE (XSS MITIGATION)
  ═══════════════════════════════════════════════ */
  function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  function escapeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /* ══════════════════════════════════════════════
     3. CLICKJACKING FRAME-BUSTER (Safe Body Access)
  ═══════════════════════════════════════════════ */
  if (window.self !== window.top) {
    const preventEmbedding = () => {
      try {
        if (window.top.location.hostname !== window.location.hostname) {
          window.top.location = window.self.location;
        }
      } catch (_) {
        // Cross-origin iframe execution detected
        const renderBlockScreen = () => {
          if (!document.body) {
            document.addEventListener('DOMContentLoaded', renderBlockScreen);
            return;
          }
          document.body.innerHTML = `
            <div style="font-family:sans-serif;text-align:center;padding:40px;background:#FEF2F2;min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column">
              <h1 style="color:#EF4444;font-size:28px;margin-bottom:8px">⚠ Embedding Restricted</h1>
              <p style="color:#6B7280;margin:12px 0 20px">This portal cannot be displayed inside external frames.</p>
              <a href="${location.href}" target="_blank" rel="noopener noreferrer" style="color:#2563EB;font-weight:600;text-decoration:none">
                Open website directly →
              </a>
            </div>`;
        };
        renderBlockScreen();
      }
    };
    preventEmbedding();
  }

  /* ══════════════════════════════════════════════
     4. RATE LIMITING & SUBMISSION COOLDOWN
  ═══════════════════════════════════════════════ */
  const SUBMISSION_COOLDOWN_MS = 5000;
  const LAST_SUBMIT_KEY = 'pfre_sec_last_submit';

  function isRateLimited(key = LAST_SUBMIT_KEY, cooldownMs = SUBMISSION_COOLDOWN_MS) {
    try {
      const last = parseInt(localStorage.getItem(key) || '0', 10);
      const now = Date.now();
      if (now - last < cooldownMs) {
        return true;
      }
      localStorage.setItem(key, String(now));
      return false;
    } catch (_) {
      return false;
    }
  }

  /* ══════════════════════════════════════════════
     5. MULTI-WIDGET CLOUDFLARE TURNSTILE CONTROLLER
  ═══════════════════════════════════════════════ */
  const widgetRegistry = new Map(); // Container Element -> Turnstile Widget ID

  function initTurnstileWidgets() {
    const siteKey = CFG().TURNSTILE_SITEKEY;
    if (!siteKey || typeof window.turnstile === 'undefined') return;

    document.querySelectorAll('.cf-turnstile').forEach(container => {
      if (container.dataset.turnstileBound) return;
      container.dataset.turnstileBound = 'true';

      try {
        const widgetId = window.turnstile.render(container, {
          sitekey: siteKey,
          theme: document.documentElement.getAttribute('data-theme') || 'auto',
          'response-field': true
        });
        widgetRegistry.set(container, widgetId);
      } catch (_) {
        // Turnstile script may have auto-rendered the container
      }
    });
  }

  function getTurnstileResponse(formOrContainer) {
    const el = formOrContainer || document.querySelector('.cf-turnstile');
    if (!el) return '';

    // Direct token check via hidden response input
    const input = el.querySelector('input[name="cf-turnstile-response"]');
    if (input && input.value) return input.value;

    // Registry ID fallback
    const container = el.classList.contains('cf-turnstile') ? el : el.querySelector('.cf-turnstile');
    if (container && widgetRegistry.has(container) && typeof window.turnstile !== 'undefined') {
      return window.turnstile.getResponse(widgetRegistry.get(container)) || '';
    }

    return '';
  }

  function resetTurnstile(formOrContainer) {
    if (typeof window.turnstile === 'undefined') return;

    if (formOrContainer) {
      const container = formOrContainer.classList.contains('cf-turnstile')
        ? formOrContainer
        : formOrContainer.querySelector('.cf-turnstile');
      if (container && widgetRegistry.has(container)) {
        window.turnstile.reset(widgetRegistry.get(container));
        return;
      }
    }

    // Reset all rendered widgets
    widgetRegistry.forEach(widgetId => {
      try { window.turnstile.reset(widgetId); } catch (_) {}
    });
  }

  /* Fails open if Turnstile was blocked by ad-blocker or CDN failure */
  function verifyTurnstile(formOrContainer) {
    const widget = formOrContainer
      ? (formOrContainer.classList.contains('cf-turnstile') ? formOrContainer : formOrContainer.querySelector('.cf-turnstile'))
      : document.querySelector('.cf-turnstile');

    if (!widget) return true; // No captcha container present
    if (typeof window.turnstile === 'undefined') return true; // Script blocked / failed to load: fail open

    const token = getTurnstileResponse(widget);
    if (!token) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please complete the verification security check.', 'error');
      }
      return false;
    }
    return true;
  }

  /* ══════════════════════════════════════════════
     6. HONEYPOT INJECTION & VERIFICATION
  ═══════════════════════════════════════════════ */
  function injectHoneypots() {
    document.querySelectorAll('form').forEach(form => {
      if (form.querySelector('.pfre-hp-wrap')) return;

      const hpWrap = document.createElement('div');
      hpWrap.className = 'pfre-hp-wrap';
      hpWrap.setAttribute('aria-hidden', 'true');
      hpWrap.style.cssText = 'position:absolute!important;opacity:0!important;pointer-events:none!important;left:-9999px!important;top:-9999px!important;height:0!important;width:0!important;z-index:-1!important;overflow:hidden!important;';

      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'website_url_hp';
      input.tabIndex = -1;
      input.setAttribute('autocomplete', 'new-password');

      hpWrap.appendChild(input);
      form.appendChild(hpWrap);
    });
  }

  function isHoneypotTriggered(form) {
    if (!form) return false;
    const hp = form.querySelector('input[name="website_url_hp"], input[name="website_url"]');
    return Boolean(hp && hp.value.trim().length > 0);
  }

  /* ══════════════════════════════════════════════
     7. UNIFIED FORM SUBMISSION GUARD
  ═══════════════════════════════════════════════ */
  function guardForm(form, asyncSubmitHandler) {
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Silent drop for automated honeypot bot submissions
      if (isHoneypotTriggered(form)) {
        console.warn('[Security] Submission blocked: automated honeypot response.');
        if (typeof window.showToast === 'function') {
          window.showToast('Request submitted successfully.', 'success');
        }
        form.reset();
        return;
      }

      // Submission cooldown rate-limit
      if (isRateLimited()) {
        if (typeof window.showToast === 'function') {
          window.showToast('Please wait a few moments before submitting again.', 'info');
        }
        return;
      }

      // CAPTCHA verification
      if (!verifyTurnstile(form)) {
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.disabled = true;
      }

      try {
        await asyncSubmitHandler(form, e);
      } catch (err) {
        console.error('[Security] Form handler error:', err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (originalText) submitBtn.textContent = originalText;
        }
        resetTurnstile(form);
      }
    });
  }

  /* ══════════════════════════════════════════════
     8. CLIENT UX & MEDIA SHIELDS
  ═══════════════════════════════════════════════ */
  function initUXShields() {
    // 1. Disable contextmenu on media assets only
    document.addEventListener('contextmenu', e => {
      const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (['img', 'video', 'canvas', 'svg', 'picture'].includes(tag) || e.target.closest('svg')) {
        e.preventDefault();
        showToastNotice('🔒 Image protected under copyright.');
      }
    });

    // 2. Prevent dragging images off page
    document.addEventListener('dragstart', e => {
      if (e.target && e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    });

    // 3. Inject CSS to protect brand markers from accidental drag-select
    const style = document.createElement('style');
    style.textContent = `
      .prop-price, .section-title, .hero h1, .nav-logo, .footer-brand, .badge, .hero-badge {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      input, textarea, p, .blog-content, .faq-a, .policy-content {
        -webkit-user-select: text !important;
        user-select: text !important;
      }
      @media print {
        body > *:not(#printProtect) { display: none !important; }
        #printProtect { display: flex !important; }
      }
    `;
    document.head.appendChild(style);

    // 4. Clean print preview protection
    window.addEventListener('beforeprint', () => {
      if (document.getElementById('printProtect')) return;
      const notice = document.createElement('div');
      notice.id = 'printProtect';
      notice.style.cssText = 'position:fixed;inset:0;background:white;z-index:999999;display:none;align-items:center;justify-content:center;flex-direction:column;font-family:sans-serif;color:#0F172A;text-align:center;padding:40px;';
      notice.innerHTML = `
        <h2 style="font-size:24px;margin-bottom:6px">Property Finder Real Estate</h2>
        <p style="color:#64748B;font-size:14px;margin:0 0 12px">Official Portfolio & Listings — Mumbai, Maharashtra</p>
        <p style="color:#0F172A;font-weight:600;font-size:13px">© 2026 All Rights Reserved · propertyfinderrealestate.com</p>
        <p style="color:#64748B;font-size:12px;margin-top:6px">Phone: +91 93269 90050 | Email: propertyfinderre@gmail.com</p>
      `;
      document.body.appendChild(notice);
    });

    window.addEventListener('afterprint', () => {
      document.getElementById('printProtect')?.remove();
    });

    // 5. Context-preserving clipboard copyright notice
    document.addEventListener('copy', e => {
      const selection = window.getSelection()?.toString();
      if (!selection || selection.length < 50) return;

      const notice = `\n\n— Source: Property Finder Real Estate (propertyfinderrealestate.com)\n© 2026 Property Finder Real Estate. Unauthorised reproduction is prohibited.`;
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', selection + notice);
        e.preventDefault();
      }
    });
  }

  function showToastNotice(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, 'info');
      return;
    }
    let toast = document.getElementById('secToast');
    if (toast) toast.remove();
    toast = document.createElement('div');
    toast.id = 'secToast';
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1E293B;color:#F8FAFC;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.3);white-space:nowrap;pointer-events:none;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  /* ══════════════════════════════════════════════
     9. GLOBAL PUBLIC INTERFACE & BOOT
  ═══════════════════════════════════════════════ */
  window.PFRESecurity = {
    sanitize: sanitizeString,
    escapeHTML,
    isRateLimited,
    isHoneypotTriggered,
    guardForm,
    verifyTurnstile,
    getTurnstileToken: getTurnstileResponse,
    resetTurnstile
  };

  // Backwards-compatible aliases
  window.sanitize = sanitizeString;
  window.safeHTML = escapeHTML;
  window.turnstileOK = verifyTurnstile;
  window.onloadTurnstileCallback = initTurnstileWidgets;

  // DOM initialization
  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  onReady(() => {
    injectHoneypots();
    initTurnstileWidgets();
    initUXShields();
  });
})();