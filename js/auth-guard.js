/**
 * js/auth-guard.js
 * Property Finder Real Estate - Mumbai
 * Role-Based Access Control & Session Guard
 */

(function (window, document) {
  'use strict';

  const LOGIN_ROUTE = 'login.html';

  const ROUTE_PERMISSIONS = {
    'admin.html': ['super_admin', 'admin'],
    'crm.html': ['super_admin', 'admin', 'agent'],
    'contacts.html': ['super_admin', 'admin', 'agent'],
    'finance.html': ['super_admin'],
    'hrms.html': ['super_admin', 'admin'],
    'schedule.html': ['super_admin', 'admin', 'agent'],
    'agreement-registration.html': ['super_admin', 'admin'],
    'inventory.html': ['super_admin', 'admin'],
    'analytics.html': ['super_admin', 'admin'],
    'price-trends.html': ['super_admin', 'admin'],
    'reminders.html': ['super_admin', 'admin', 'agent'],
    'email-templates.html': ['super_admin', 'admin'],
    'cms.html': ['super_admin', 'admin']
  };

  function getNormalizedPageName() {
    const rawPath = window.location.pathname;
    let fileName = rawPath.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
    if (!fileName.includes('.')) {
      fileName = fileName + '.html';
    }
    return fileName;
  }

  function getActiveSession() {
    try {
      const raw = localStorage.getItem('pfre_session');
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session || !session.expiresAt) return null;
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem('pfre_session');
        sessionStorage.removeItem('pfre_auth_token');
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  }

  function redirectToLogin(reason) {
    const currentPage = encodeURIComponent(getNormalizedPageName());
    window.location.replace(`${LOGIN_ROUTE}?redirect=${currentPage}&reason=${reason}`);
  }

  function enforceRouteGuard() {
    const currentPage = getNormalizedPageName();
    const requiredRoles = ROUTE_PERMISSIONS[currentPage];

    if (!requiredRoles) {
      return;
    }

    const session = getActiveSession();

    if (!session) {
      redirectToLogin('unauthenticated');
      return;
    }

    if (!requiredRoles.includes(session.role)) {
      if (session.role === 'agent') {
        window.location.replace('crm.html');
      } else {
        redirectToLogin('unauthorized');
      }
      return;
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        applyUiDecorations(session);
      });
    } else {
      applyUiDecorations(session);
    }
  }

  function applyUiDecorations(session) {
    document.querySelectorAll('[data-user-name]').forEach(function (el) {
      el.textContent = session.name || 'Staff User';
    });

    document.querySelectorAll('[data-user-email]').forEach(function (el) {
      el.textContent = session.email || '';
    });

    document.querySelectorAll('[data-user-role]').forEach(function (el) {
      let roleLabel = 'Consultant';
      if (session.role === 'super_admin') roleLabel = 'Super Admin / Owner';
      if (session.role === 'admin') roleLabel = 'Operations Admin';
      el.textContent = roleLabel;
    });

    document.querySelectorAll('[data-min-role]').forEach(function (el) {
      const minRole = el.getAttribute('data-min-role');
      if (minRole === 'super_admin' && session.role !== 'super_admin') {
        el.style.display = 'none';
      }
      if (minRole === 'admin' && session.role === 'agent') {
        el.style.display = 'none';
      }
    });

    const avatarEls = document.querySelectorAll('#agentAvatar, .sb-avatar, .user-avatar-text');
    if (session.name) {
      const parts = session.name.trim().split(/\s+/);
      const initials = parts.length > 1
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();

      avatarEls.forEach(function (el) {
        el.textContent = initials;
      });
    }
  }

  window.pfreLogout = function () {
    localStorage.removeItem('pfre_session');
    sessionStorage.removeItem('pfre_auth_token');
    window.location.replace(LOGIN_ROUTE);
  };

  window.pfreAuth = {
    getUser: getActiveSession,
    logout: window.pfreLogout,
    hasRole: function (role) {
      const session = getActiveSession();
      return Boolean(session && session.role === role);
    }
  };

  enforceRouteGuard();
})(window, document);