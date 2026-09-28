/* =====================================================
   PROPERTY FINDER RE — Security Layer v2.0
   Protects against casual scraping, source theft
   and adds security headers via meta tags

   NOTE: True source-code protection is impossible in
   HTML/CSS/JS — anything sent to a browser can be read.
   This file deliberately does NOT block F12 / Ctrl+Shift+I /
   Ctrl+U / DevTools. An earlier version did; removed after
   review because keyboard-shortcut and window-size based
   "DevTools detection" provide zero real protection (trivially
   bypassed via menu, a second browser, or curl) while breaking
   legitimate debugging, accessibility tooling, and the site
   owner's own troubleshooting. Real protection belongs server-
   side: CSP, rate limiting, backend validation — see CSP meta
   tag in each page's <head> and the API-key gate in config.js.
   What remains below are low-cost, UX-preserving deterrents
   (image right-click, copy watermark, print watermark) plus
   genuine defensive utilities (XSS escaping, clickjacking guard,
   honeypot). Server-side headers (HSTS) need real hosting config.
   ===================================================== */
(() => {
  'use strict';

  /* ── 1. Console Warning (self-XSS deterrent) ──
     Standard practice (Facebook/Google use the same pattern):
     discourages social-engineering attacks where a scammer talks
     a victim into pasting malicious JS into their own console. */
  const style1 = 'color:#EF4444;font-size:44px;font-weight:900;text-shadow:2px 2px #000';
  const style2 = 'color:#F59E0B;font-size:16px;font-weight:600;line-height:2';
  const style3 = 'color:#10B981;font-size:13px;line-height:1.8';
  console.log('%c⚠ STOP!', style1);
  console.log('%cThis is a browser developer feature.\nPasting or running code here could compromise your account.', style2);
  console.log('%c© 2026 Property Finder Real Estate, Mumbai.\nAll content protected. Unauthorised copying is an offence.', style3);
  console.log('%c🔒 If you are a developer and found a security issue,\nplease contact: propertyfinderre@gmail.com', 'color:#6B7280;font-size:12px');

  /* ── 2. Disable Right-Click Context Menu — media only ──
     Scoped to images/video/canvas/svg so visitors can still
     right-click text, links, and paragraphs normally (copy,
     "open in new tab", translate, etc. all keep working). */
  document.addEventListener('contextmenu', e => {
    const tag = e.target.tagName.toLowerCase();
    if (['img','video','canvas','svg','picture'].includes(tag) || e.target.closest('svg')) {
      e.preventDefault();
      showSecurityToast('🔒 Right-click is disabled on images.');
      return false;
    }
    /* Everything else (text, links, forms) behaves normally */
  });

  /* ── 3. Disable Text Selection on key elements ── */
  const NO_SELECT_SELECTORS = [
    '.prop-price','.section-title','.hero h1','.nav-logo',
    '.footer-brand','.badge','.hero-badge','.brand'
  ];
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    ${NO_SELECT_SELECTORS.join(',')} {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    /* Allow selection on forms and content areas */
    input, textarea, p, .blog-content, .faq-a, .policy-content {
      -webkit-user-select: text !important;
      user-select: text !important;
    }
  `;
  document.head.appendChild(styleEl);

  /* ── 4. Disable Drag on images ── */
  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') { e.preventDefault(); return false; }
  });

  /* ── 5. Print Protection ── */
  window.addEventListener('beforeprint', () => {
    const notice = document.createElement('div');
    notice.id = 'printProtect';
    notice.style.cssText = 'position:fixed;inset:0;background:white;z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:sans-serif;color:#111';
    notice.innerHTML = `
      <svg width="64" height="64" viewBox="0 0 40 40" fill="none">
        <circle cx="17" cy="17" r="13" stroke="#2563EB" stroke-width="2.8"/>
        <path d="M17 22V18" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round"/>
        <rect x="14" y="18" width="6" height="4" rx="0.5" stroke="#2563EB" stroke-width="2.2"/>
        <path d="M12 18L17 13L22 18" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M27 27L33 33" stroke="#2563EB" stroke-width="2.8" stroke-linecap="round"/>
      </svg>
      <h2 style="margin:16px 0 8px;font-size:22px">Property Finder Real Estate</h2>
      <p style="color:#6B7280;font-size:14px">© 2026 All Rights Reserved · propertyfinderrealestate.com</p>
      <p style="color:#6B7280;font-size:13px;margin-top:8px">📞 +91 93269 90050 · 📧 propertyfinderre@gmail.com</p>
    `;
    document.body.appendChild(notice);
  });
  window.addEventListener('afterprint', () => {
    document.getElementById('printProtect')?.remove();
  });

  /* ── 6. Input Sanitization Helper (global) ── */
  window.sanitize = (str) => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#x27;')
      .replace(/\//g,'&#x2F;')
      .trim();
  };

  /* ── 6.5. Cloudflare Turnstile CAPTCHA check (lead forms) ──
     Fails OPEN by design: if the Turnstile script hasn't loaded
     (ad-blocker, privacy extension, Cloudflare CDN hiccup, or the
     site owner hasn't activated a real sitekey yet) this returns
     true rather than permanently blocking every legitimate lead.
     Spam-prevention should degrade gracefully, never become an
     outage for paying customers trying to submit an enquiry. */
  window.turnstileOK = function (containerSelector) {
    const widget = document.querySelector(containerSelector || '.cf-turnstile');
    if (!widget) return true;                          // no widget on this page
    if (typeof window.turnstile === 'undefined') return true; // script didn't load — fail open
    const response = widget.querySelector('input[name="cf-turnstile-response"]');
    if (!response || !response.value) {
      if (window.showToast) window.showToast('Please complete the verification check.', 'error');
      return false;
    }
    return true;
  };

  /* ── 7. Form Honeypot Auto-injection ── */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach(form => {
      if (form.querySelector('.hp-field')) return;
      const hp = document.createElement('div');
      hp.className = 'hp-field';
      hp.style.cssText = 'opacity:0;position:absolute;top:0;left:0;height:0;width:0;z-index:-1;overflow:hidden';
      hp.innerHTML = '<input type="text" name="website_url" tabindex="-1" autocomplete="off">';
      form.appendChild(hp);
    });
  });

  /* ── 8. XSS Protection for dynamic content ── */
  window.safeHTML = (html) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  };

  /* ── 9. Clickjacking Protection ── */
  if (window.self !== window.top) {
    /* Site is being loaded in an iframe */
    document.body.innerHTML = `
      <div style="font-family:sans-serif;text-align:center;padding:40px;background:#FEF2F2;min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column">
        <h1 style="color:#EF4444;font-size:28px">⚠ Blocked</h1>
        <p style="color:#6B7280;margin:12px 0">This website cannot be embedded in other sites.</p>
        <a href="https://www.propertyfinderrealestate.com" style="color:#2563EB;font-weight:600">
          Visit propertyfinderrealestate.com directly →
        </a>
      </div>`;
  }

  /* ── 10. Log security events locally ── */
  function logSecurityEvent(type, details = {}) {
    try {
      const events = JSON.parse(localStorage.getItem('pfre_sec_events') || '[]');
      events.unshift({ type, details, url: window.location.pathname, ts: new Date().toISOString() });
      localStorage.setItem('pfre_sec_events', JSON.stringify(events.slice(0, 50)));
    } catch { /* noop */ }
  }

  /* ── 11. Security Toast ── */
  function showSecurityToast(msg) {
    const existing = document.getElementById('secToast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.id = 'secToast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1E293B;color:white;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:5000;box-shadow:0 8px 24px rgba(0,0,0,.3);white-space:nowrap';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  /* ── 12. Copyright watermark in clipboard ── */
  document.addEventListener('copy', e => {
    const sel = window.getSelection()?.toString();
    if (!sel || sel.length < 30) return;
    const notice = `\n\n— Source: Property Finder Real Estate (propertyfinderrealestate.com)\n© 2026 All rights reserved. Unauthorised reproduction is prohibited.`;
    try {
      e.clipboardData.setData('text/plain', sel + notice);
      e.preventDefault();
    } catch { /* noop */ }
  });

})();
