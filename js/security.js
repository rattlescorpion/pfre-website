/**
 * js/security.js
 * Property Finder Real Estate - Mumbai
 * Client-Side Security, Sanitization & Input Guard
 */

(function (window, document) {
  'use strict';

  const rateLimitStore = new Map();

  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeHTML(dirty) {
    if (typeof dirty !== 'string') return '';
    const temp = document.createElement('div');
    temp.textContent = dirty;
    return temp.innerHTML;
  }

  function isValidIndianPhone(phone) {
    if (typeof phone !== 'string') return false;
    const cleaned = phone.replace(/[\s\-]/g, '');
    const regex = /^(?:\+91|91)?[6-9]\d{9}$/;
    return regex.test(cleaned);
  }

  function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(email.trim());
  }

  function isValidPAN(pan) {
    if (typeof pan !== 'string') return false;
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(pan.trim().toUpperCase());
  }

  function maskPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.length < 10) return cleaned;
    return cleaned.slice(0, cleaned.length - 10) + 'XXXXXX' + cleaned.slice(-4);
  }

  function maskEmail(email) {
    if (!email || !email.includes('@')) return email || '';
    const parts = email.split('@');
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return name[0] + '*@' + domain;
    return name[0] + '***' + name[name.length - 1] + '@' + domain;
  }

  function checkRateLimit(actionKey, limit = 5, windowMs = 60000) {
    const now = Date.now();
    const records = rateLimitStore.get(actionKey) || [];
    const validRecords = records.filter(ts => now - ts < windowMs);

    if (validRecords.length >= limit) {
      return false;
    }

    validRecords.push(now);
    rateLimitStore.set(actionKey, validRecords);
    return true;
  }

  function generateCSRFToken() {
    const array = new Uint8Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < 16; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function enforceFrameBusting() {
    if (window.self !== window.top) {
      window.top.location = window.self.location;
    }
  }

  window.pfreSecurity = {
    escapeHTML: escapeHTML,
    sanitizeHTML: sanitizeHTML,
    isValidIndianPhone: isValidIndianPhone,
    isValidEmail: isValidEmail,
    isValidPAN: isValidPAN,
    maskPhone: maskPhone,
    maskEmail: maskEmail,
    checkRateLimit: checkRateLimit,
    generateCSRFToken: generateCSRFToken,
    enforceFrameBusting: enforceFrameBusting
  };

  document.addEventListener('DOMContentLoaded', function () {
    enforceFrameBusting();
  });
})(window, document);