/**
 * js/app.js
 * Property Finder Real Estate - Mumbai
 * Core Client Application Controller
 */

(function (window, document) {
  'use strict';

  function initTheme() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const target = current === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', target);
      document.documentElement.classList.remove('theme-light', 'theme-dark');
      document.documentElement.classList.add('theme-' + target);
      localStorage.setItem('pfre_theme', target);

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', target === 'dark' ? '#070C14' : '#FFFFFF');
      }
    });
  }

  function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    const links = mobileMenu.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  function initBackToTop() {
    const backBtn = document.getElementById('backToTop');
    if (!backBtn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        backBtn.classList.add('show', 'visible');
      } else {
        backBtn.classList.remove('show', 'visible');
      }
    }, { passive: true });

    backBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function initCookieConsent() {
    const banner = document.getElementById('cookieBanner');
    if (!banner) return;

    const accepted = localStorage.getItem('pfre_cookie_consent');
    if (!accepted) {
      banner.classList.add('show');
    }

    const acceptBtn = banner.querySelector('.cookie-accept');
    const declineBtn = banner.querySelector('.cookie-decline');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        localStorage.setItem('pfre_cookie_consent', 'accepted');
        banner.classList.remove('show');
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        localStorage.setItem('pfre_cookie_consent', 'declined');
        banner.classList.remove('show');
      });
    }
  }

  function initInquiryForms() {
    const forms = document.querySelectorAll('form[data-pfre-inquiry], #enquiryForm, #contactForm, .pfre-lead-form');

    forms.forEach(function (form) {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';
        }

        const formData = new FormData(form);
        const payload = {
          name: formData.get('name') || '',
          phone: formData.get('phone') || '',
          email: formData.get('email') || '',
          intent: formData.get('intent') || 'buy',
          locality: formData.get('locality') || 'Malad West',
          budget: formData.get('budget') || '',
          message: formData.get('message') || formData.get('notes') || '',
          source: form.getAttribute('data-source') || window.location.pathname.replace(/^\/|\.html$/g, '') || 'website'
        };

        try {
          if (window.pfreApi && typeof window.pfreApi.submitInquiry === 'function') {
            await window.pfreApi.submitInquiry(payload);
          } else {
            const cached = JSON.parse(localStorage.getItem('pfre_enquiries') || '[]');
            cached.unshift({
              ...payload,
              id: 'lead-' + Date.now().toString(36),
              createdAt: new Date().toISOString()
            });
            localStorage.setItem('pfre_enquiries', JSON.stringify(cached));
          }

          if (typeof window.showToast === 'function') {
            window.showToast('Thank you! Our property advisor will call you shortly.', 'success');
          } else {
            alert('Thank you! Your property inquiry has been received. Our team will contact you shortly.');
          }

          form.reset();
        } catch (err) {
          console.error('Inquiry submission failed:', err);
          alert('Submission error. Please call +91 93269 90050 directly.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        }
      });
    });
  }

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const imgTarget = lightbox.querySelector('img') || document.getElementById('lightboxImg');
    const closeBtn = lightbox.querySelector('.lightbox-close') || lightbox;

    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('[data-lightbox-src]');
      if (!trigger) return;

      e.preventDefault();
      const src = trigger.getAttribute('data-lightbox-src') || trigger.src;
      if (imgTarget && src) {
        imgTarget.src = src;
        lightbox.classList.add('open', 'show');
        document.body.style.overflow = 'hidden';
      }
    });

    closeBtn.addEventListener('click', function (e) {
      if (e.target === closeBtn || e.target.classList.contains('lightbox-close')) {
        lightbox.classList.remove('open', 'show');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        lightbox.classList.remove('open', 'show');
        document.body.style.overflow = '';
      }
    });
  }

  function initAccordion() {
    document.addEventListener('click', function (e) {
      const header = e.target.closest('.accordion-header');
      if (!header) return;

      const item = header.closest('.accordion-item');
      if (!item) return;

      const isOpen = item.classList.contains('open');
      const parent = item.parentElement;

      if (parent) {
        parent.querySelectorAll('.accordion-item').forEach(function (sibling) {
          sibling.classList.remove('open');
        });
      }

      if (!isOpen) {
        item.classList.add('open');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initMobileMenu();
    initBackToTop();
    initCookieConsent();
    initInquiryForms();
    initLightbox();
    initAccordion();
  });
})(window, document);