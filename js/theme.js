/* =====================================================
   PFRE THEME MANAGER v3.0 — Standalone
   Usage: include as FIRST script in <head>
   Works independently of widgets.js
   ===================================================== */
(function() {
  'use strict';

  var STORE_KEY = 'pfre_theme';
  var root = document.documentElement;

  /* ── 1. Apply theme immediately (before paint) ── */
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add('theme-' + t);
  }

  var stored   = localStorage.getItem(STORE_KEY);
  var preferred = (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches) ? 'dark' : 'light';
  var theme = stored || preferred;
  applyTheme(theme);

  /* ── 2. Update all toggle buttons ── */
  function updateToggles(t) {
    document.querySelectorAll('#themeToggle, .theme-toggle').forEach(function(btn) {
      var light = btn.querySelector('.icon-light');
      var dark  = btn.querySelector('.icon-dark');
      if (light && dark) {
        light.style.display = (t === 'dark') ? 'none' : '';
        dark.style.display  = (t === 'dark') ? '' : 'none';
      } else if (btn.tagName !== 'A') {
        btn.textContent = (t === 'dark') ? '🌙' : '☀️';
      }
      btn.setAttribute('aria-pressed', String(t === 'dark'));
      btn.title = (t === 'dark') ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      btn.setAttribute('aria-label', btn.title);
    });
    /* Update meta theme-color */
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = (t === 'dark') ? '#0F172A' : '#2563EB';
  }

  /* ── 3. Toggle function ── */
  function toggleTheme() {
    var cur = root.getAttribute('data-theme') || 'light';
    var nxt = (cur === 'dark') ? 'light' : 'dark';
    applyTheme(nxt);
    try { localStorage.setItem(STORE_KEY, nxt); } catch(e) {}
    updateToggles(nxt);
  }

  /* ── 4. Attach to toggle buttons after DOM ready ── */
  function attachToggles() {
    document.querySelectorAll('#themeToggle, .theme-toggle').forEach(function(btn) {
      if (btn._pfre_attached) return;
      btn._pfre_attached = true;
      btn.addEventListener('click', toggleTheme);
      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
      });
    });
    updateToggles(root.getAttribute('data-theme') || 'light');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachToggles);
  } else {
    attachToggles();
  }

  /* ── 5. Watch OS preference changes ── */
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', function(e) {
      /* Only auto-switch if user hasn't manually selected */
      if (!localStorage.getItem(STORE_KEY)) {
        var nxt = e.matches ? 'dark' : 'light';
        applyTheme(nxt);
        updateToggles(nxt);
      }
    });
  }

  /* ── 6. Expose globally ── */
  window.PFRETheme = { toggle: toggleTheme, apply: applyTheme, get: function() { return root.getAttribute('data-theme'); } };

})();

/* Cross-tab theme sync — when one tab changes theme, all others follow */
window.addEventListener('storage', function(e) {
  if (e.key === 'pfre_theme' && e.newValue) {
    const root = document.documentElement;
    root.setAttribute('data-theme', e.newValue);
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add('theme-' + e.newValue);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-pressed', e.newValue === 'dark' ? 'true' : 'false');
  }
});
