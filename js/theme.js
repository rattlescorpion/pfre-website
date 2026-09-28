/* =====================================================
   PROPERTY FINDER RE — Theme Engine v3.1 (Unified)
   Zero-FOUC · Dark/Light Modes · OS Sync · Cross-Tab Sync
   Works standalone in <head> or at end of <body>
   ===================================================== */
(() => {
  'use strict';

  const STORAGE_KEY = 'pfre_theme';
  const root = document.documentElement;

  /* ── 1. Safe Storage Utilities ── */
  function getSystemPreference() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
  }

  /* ── 2. Core Theme Applier (Immediate: Prevents FOUC) ── */
  function applyTheme(theme) {
    const validTheme = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', validTheme);
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${validTheme}`);

    // Update browser address bar meta color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', validTheme === 'dark' ? '#0F172A' : '#2563EB');
    }

    updateUIElements(validTheme);
  }

  /* ── 3. Update Toggle Buttons & Icons ── */
  function updateUIElements(theme) {
    const isDark = theme === 'dark';
    const buttons = document.querySelectorAll('#themeToggle, .theme-toggle');

    buttons.forEach((btn) => {
      const iconLight = btn.querySelector('.icon-light');
      const iconDark  = btn.querySelector('.icon-dark');

      if (iconLight && iconDark) {
        iconLight.style.display = isDark ? 'none' : 'inline-block';
        iconDark.style.display  = isDark ? 'inline-block' : 'none';
      } else if (btn.tagName !== 'A' && !btn.children.length) {
        btn.textContent = isDark ? '🌙' : '☀️';
      }

      btn.setAttribute('aria-pressed', String(isDark));
      const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      btn.title = label;
      btn.setAttribute('aria-label', label);
    });
  }

  /* ── 4. Toggle Handler ── */
  function toggleTheme() {
    const current = root.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    applyTheme(next);
  }

  /* ── 5. Attach Event Listeners ── */
  function attachListeners() {
    document.querySelectorAll('#themeToggle, .theme-toggle').forEach((btn) => {
      if (btn._pfreThemeAttached) return;
      btn._pfreThemeAttached = true;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    });

    updateUIElements(root.getAttribute('data-theme') || 'light');
  }

  /* ── 6. Initial Theme Boot (Executes Synchronously) ── */
  const activeTheme = getSavedTheme() || getSystemPreference();
  applyTheme(activeTheme);

  /* ── 7. DOM-Ready Hook for UI Binding ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListeners);
  } else {
    attachListeners();
  }

  /* ── 8. OS Color-Scheme Change Watcher ── */
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Auto-switch only if the user hasn't explicitly set a preference
      if (!getSavedTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /* ── 9. Cross-Tab Storage Sync ── */
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      applyTheme(e.newValue);
    }
  });

  /* ── 10. Global Interface ── */
  window.PFRETheme = {
    get: () => root.getAttribute('data-theme') || 'light',
    set: (theme) => {
      saveTheme(theme);
      applyTheme(theme);
    },
    apply: applyTheme,
    toggle: toggleTheme,
  };
})();