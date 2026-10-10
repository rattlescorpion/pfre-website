/* =====================================================
   PROPERTY FINDER REAL ESTATE — RBAC Auth Guard
   Client-Side Session Verification & Role Enforcement
   ===================================================== */

(function () {
  'use strict';

  const LOGIN_PAGE = 'login.html';

  // Define route-level role requirements
  const ROUTE_PERMISSIONS = {
    'admin.html': ['super_admin', 'admin'],
    'crm.html': ['super_admin', 'admin', 'agent'],
    'finance.html': ['super_admin'],
    'hrms.html': ['super_admin', 'admin'],
    'schedule.html': ['super_admin', 'admin', 'agent'],
    'agreement-registration.html': ['super_admin', 'admin']
  };

  function getCurrentPageName() {
    const path = window.location.pathname;
    const file = path.split('/').pop().split('?')[0].split('#')[0];
    return file || 'index.html';
  }

  function getSession() {
    try {
      const raw = localStorage.getItem('pfre_session');
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session || !session.expiresAt) return null;
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem('pfre_session');
        return null;
      }
      return session;
    } catch (_) {
      return null;
    }
  }

  function redirectToLogin(reason) {
    const currentPage = encodeURIComponent(getCurrentPageName());
    window.location.replace(`${LOGIN_PAGE}?redirect=${currentPage}&reason=${reason}`);
  }

  function enforceRouteAccess() {
    const page = getCurrentPageName();
    const session = getSession();

    // 1. Check if user is authenticated
    if (!session) {
      redirectToLogin('unauthenticated');
      return;
    }

    // 2. Check role permissions for the current page
    const allowedRoles = ROUTE_PERMISSIONS[page];
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      // If an agent tries to access admin.html, reroute them to CRM
      if (session.role === 'agent') {
        window.location.replace('crm.html');
      } else {
        redirectToLogin('unauthorized');
      }
      return;
    }

    // 3. Populate user profile details into UI if placeholders exist
    document.addEventListener('DOMContentLoaded', () => {
      applyUIPermissions(session);
    });
  }

  function applyUIPermissions(session) {
    // Populate user indicators
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = session.name || 'User');
    document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = session.email || '');
    document.querySelectorAll('[data-user-role]').forEach(el => {
      const formattedRole = session.role === 'super_admin' ? 'Owner / Super Admin'
                          : session.role === 'admin' ? 'Operations Manager'
                          : 'Field Consultant';
      el.textContent = formattedRole;
    });

    // Hide elements restricted to higher roles
    // Example: <button data-min-role="super_admin">Delete Listing</button>
    document.querySelectorAll('[data-min-role]').forEach(el => {
      const minRole = el.getAttribute('data-min-role');
      if (minRole === 'super_admin' && session.role !== 'super_admin') {
        el.style.display = 'none';
      }
      if (minRole === 'admin' && session.role === 'agent') {
        el.style.display = 'none';
      }
    });
  }

  // Global helper to log out
  window.pfreLogout = function () {
    localStorage.removeItem('pfre_session');
    sessionStorage.removeItem('pfre_auth_token');
    window.location.replace(LOGIN_PAGE);
  };

  // Expose current session object globally
  window.pfreAuth = {
    getUser: getSession,
    logout: window.pfreLogout
  };

  // Run immediately before the DOM finishes rendering to prevent content flash
  enforceRouteAccess();
})();