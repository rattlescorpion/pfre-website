
/**
 * js/auth-guard.js
 * Property Finder Real Estate — Server-Verified Access Control
 *
 * Browser storage is used only for display metadata.
 * Authorization is verified by /api/auth/session.
 */

(function (window, document) {
  'use strict';

  const LOGIN_ROUTE = '/login.html';
  const SESSION_ENDPOINT = '/api/auth/session';
  const LOGOUT_ENDPOINT = '/api/auth/logout';
  const SESSION_KEY = 'pfre_session';

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

  function getPageName() {
    const path = window.location.pathname;
    let name = path.split('/').pop() || 'index.html';

    if (!name.includes('.')) {
      name += '.html';
    }

    return name;
  }

  function clearLocalSession() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('pfre_auth_token');
    sessionStorage.removeItem('pfre_admin_authenticated');
  }

  function redirectToLogin(reason) {
    const page = getPageName();
    const query = new URLSearchParams({
      redirect: page,
      reason: reason
    });

    window.location.replace(`${LOGIN_ROUTE}?${query.toString()}`);
  }

  function saveDisplayMetadata(user) {
    const session = {
      name: String(user.name || user.email || 'Staff User'),
      email: String(user.email || ''),
      role: user.role,
      permissions: Array.isArray(user.permissions)
        ? user.permissions
        : [],
      expiresAt: Date.now() + (12 * 60 * 60 * 1000)
    };

    // Display information only. This is not proof of authorization.
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return session;
  }

  function applyUiDecorations(session) {
    document.querySelectorAll('[data-user-name]').forEach(function (el) {
      el.textContent = session.name || 'Staff User';
    });

    document.querySelectorAll('[data-user-email]').forEach(function (el) {
      el.textContent = session.email || '';
    });

    document.querySelectorAll('[data-user-role]').forEach(function (el) {
      const labels = {
        super_admin: 'Super Admin / Owner',
        admin: 'Operations Admin',
        agent: 'Consultant'
      };

      el.textContent = labels[session.role] || 'Staff User';
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

    const avatarEls = document.querySelectorAll(
      '#agentAvatar, .sb-avatar, .user-avatar-text'
    );

    if (session.name) {
      const parts = session.name.trim().split(/\s+/);
      const initials = parts.length > 1
        ? parts[0][0] + parts[parts.length - 1][0]
        : parts[0].slice(0, 2);

      avatarEls.forEach(function (el) {
        el.textContent = initials.toUpperCase();
      });
    }
  }

  async function verifyServerSession() {
    const response = await fetch(SESSION_ENDPOINT, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Session verification failed.');
    }

    const result = await response.json();

    if (
      result.success !== true ||
      !result.user ||
      !['super_admin', 'admin', 'agent'].includes(result.user.role) ||
      !result.user.email
    ) {
      throw new Error('Invalid session response.');
    }

    return result.user;
  }

  async function enforceRouteGuard() {
    const page = getPageName();
    const requiredRoles = ROUTE_PERMISSIONS[page];

    // Pages not listed here are not restricted by this client-side guard.
    if (!requiredRoles) return;

    // Avoid briefly displaying a protected page while checking the session.
    document.documentElement.style.visibility = 'hidden';

    try {
      const user = await verifyServerSession();
      const session = saveDisplayMetadata(user);

      if (!requiredRoles.includes(session.role)) {
        clearLocalSession();

        if (session.role === 'agent') {
          window.location.replace('/crm.html');
        } else {
          redirectToLogin('unauthorized');
        }

        return;
      }

      function showProtectedPage() {
        applyUiDecorations(session);
        document.documentElement.style.visibility = '';
      }

      if (document.readyState === 'loading') {
        document.addEventListener(
          'DOMContentLoaded',
          showProtectedPage,
          { once: true }
        );
      } else {
        showProtectedPage();
      }
    } catch (error) {
      clearLocalSession();
      redirectToLogin('unauthenticated');
    }
  }

  window.pfreLogout = async function () {
    try {
      await fetch(LOGOUT_ENDPOINT, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          Accept: 'application/json'
        }
      });
    } catch (error) {
      // Always clear local display data and leave the protected page.
    } finally {
      clearLocalSession();
      window.location.replace(LOGIN_ROUTE);
    }
  };

  window.pfreAuth = {
    getUser: function () {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        return null;
      }
    },
    logout: window.pfreLogout,
    hasRole: function (role) {
      const user = window.pfreAuth.getUser();
      return Boolean(user && user.role === role);
    }
  };

  enforceRouteGuard();
})(window, document);