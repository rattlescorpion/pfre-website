/**
 * js/app-shell.js
 * Property Finder Real Estate - Mumbai
 * Progressive Web App Shell & Service Worker Controller
 */

(function (window, document) {
  'use strict';

  let deferredPrompt = null;

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(function (registration) {
          registration.onupdatefound = function () {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.onstatechange = function () {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  notifyUpdateAvailable(registration);
                }
              }
            };
          };
        })
        .catch(function (error) {
          console.warn('Service worker registration failed:', error.message);
        });
    });
  }

  function notifyUpdateAvailable(registration) {
    if (typeof window.showToast === 'function') {
      window.showToast('A newer version of the website is available. Refreshing in 3 seconds...', 'info');
    }
    setTimeout(function () {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    }, 3000);
  }

  function initPwaInstallPrompt() {
    const installBtns = document.querySelectorAll('#pwaInstallBtn, .pwa-install-btn');

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredPrompt = e;

      installBtns.forEach(function (btn) {
        btn.style.display = 'inline-flex';
        btn.addEventListener('click', async function () {
          if (!deferredPrompt) return;
          deferredPrompt.prompt();
          const choiceResult = await deferredPrompt.userChoice;
          if (choiceResult.outcome === 'accepted') {
            console.log('User installed Property Finder Real Estate app shell.');
          }
          deferredPrompt = null;
          btn.style.display = 'none';
        });
      });
    });

    window.addEventListener('appinstalled', function () {
      deferredPrompt = null;
      installBtns.forEach(function (btn) {
        btn.style.display = 'none';
      });
      if (typeof window.showToast === 'function') {
        window.showToast('Property Finder app installed successfully.', 'success');
      }
    });
  }

  function initNetworkStatusWatcher() {
    function createOfflineBanner() {
      let banner = document.getElementById('offlineNoticeBar');
      if (banner) return banner;

      banner = document.createElement('div');
      banner.id = 'offlineNoticeBar';
      banner.style.cssText = [
        'position: fixed',
        'bottom: 0',
        'left: 0',
        'right: 0',
        'background: #EF4444',
        'color: #FFFFFF',
        'font-size: 13px',
        'font-weight: 700',
        'text-align: center',
        'padding: 8px 16px',
        'z-index: 9999',
        'box-shadow: 0 -2px 10px rgba(0,0,0,0.15)',
        'display: none'
      ].join(';');
      banner.textContent = 'You are currently offline. Showing cached Mumbai properties and contacts.';
      document.body.appendChild(banner);
      return banner;
    }

    const noticeBanner = createOfflineBanner();

    function updateOnlineStatus() {
      if (!navigator.onLine) {
        noticeBanner.style.display = 'block';
        if (typeof window.showToast === 'function') {
          window.showToast('Internet disconnected. Operating in offline cache mode.', 'error');
        }
      } else {
        noticeBanner.style.display = 'none';
      }
    }

    window.addEventListener('online', function () {
      noticeBanner.style.display = 'none';
      if (typeof window.showToast === 'function') {
        window.showToast('Back online. Synchronizing data...', 'success');
      }
    });

    window.addEventListener('offline', updateOnlineStatus);
    if (!navigator.onLine) {
      updateOnlineStatus();
    }
  }

  function highlightActiveNavigation() {
    const currentPath = window.location.pathname.replace(/^\/|\.html$/g, '') || 'index';
    const navLinks = document.querySelectorAll('.nav-link, .mobile-menu a, .sb-item');

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;
      const target = href.split('?')[0].split('#')[0].replace(/^\/|\.html$/g, '');

      if (target === currentPath || (currentPath === 'index' && target === '')) {
        link.classList.add('active');
      }
    });
  }

  function prefetchCriticalRoutes() {
    if (!('requestIdleCallback' in window)) return;

    window.requestIdleCallback(function () {
      const routes = [
        '/data/properties.json',
        '/data/projects.json',
        '/properties.html',
        '/contact.html'
      ];

      routes.forEach(function (url) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = url;
        prefetchLink.as = url.endsWith('.json') ? 'fetch' : 'document';
        document.head.appendChild(prefetchLink);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    registerServiceWorker();
    initPwaInstallPrompt();
    initNetworkStatusWatcher();
    highlightActiveNavigation();
    prefetchCriticalRoutes();
  });
})(window, document);