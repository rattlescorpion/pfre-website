/**
 * js/theme.js
 * Property Finder Real Estate - Mumbai
 * Theme Management Engine & System Preference Synchronization
 */

(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'pfre_theme';
  const THEME_DARK = 'dark';
  const THEME_LIGHT = 'light';

  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_DARK;
    }
    return THEME_LIGHT;
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function resolveEffectiveTheme() {
    const stored = getStoredTheme();
    if (stored === THEME_DARK || stored === THEME_LIGHT) {
      return stored;
    }
    return getSystemPreference();
  }

  function updateMetaThemeColor(theme) {
    const metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) return;
    metaTag.setAttribute('content', theme === THEME_DARK ? '#070C14' : '#FFFFFF');
  }

  function updateToggleButtons(theme) {
    const buttons = document.querySelectorAll('.theme-toggle, #themeToggle');
    buttons.forEach(btn => {
      btn.setAttribute('aria-label', theme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('data-current-theme', theme);
    });
  }

  function applyTheme(theme, persist = true) {
    const targetTheme = theme === THEME_DARK ? THEME_DARK : THEME_LIGHT;
    const root = document.documentElement;

    root.setAttribute('data-theme', targetTheme);
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${targetTheme}`);

    updateMetaThemeColor(targetTheme);
    updateToggleButtons(targetTheme);

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, targetTheme);
      } catch (e) {
        console.warn('LocalStorage unavailable for theme persistence:', e.message);
      }
    }

    const event = new CustomEvent('pfre:theme-changed', {
      detail: { theme: targetTheme }
    });
    window.dispatchEvent(event);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || resolveEffectiveTheme();
    const nextTheme = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    applyTheme(nextTheme, true);
    return nextTheme;
  }

  function listenToSystemChanges() {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e) => {
      const stored = getStoredTheme();
      if (!stored) {
        applyTheme(e.matches ? THEME_DARK : THEME_LIGHT, false);
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handler);
    }
  }

  function bindToggles() {
    document.querySelectorAll('.theme-toggle, #themeToggle').forEach(btn => {
      if (btn.hasAttribute('data-theme-bound')) return;
      btn.setAttribute('data-theme-bound', 'true');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleTheme();
      });
    });
  }

  function init() {
    const initialTheme = resolveEffectiveTheme();
    applyTheme(initialTheme, false);
    listenToSystemChanges();
    bindToggles();
  }

  window.pfreTheme = {
    get: resolveEffectiveTheme,
    set: applyTheme,
    toggle: toggleTheme,
    init: init
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);