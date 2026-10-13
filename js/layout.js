/**
 * js/layout.js
 * Property Finder Real Estate - Mumbai
 * Global Layout Engine & Dynamic Shell Injector
 */

(function (window, document) {
  'use strict';

  const BRAND = {
    name: 'Property Finder Real Estate',
    phone: '+919326990050',
    displayPhone: '+91 93269 90050',
    email: 'propertyfinderre@gmail.com',
    rera: 'A51800000412',
    address: 'Shop No. 2, Ground Floor, Baf-Hira Nagar, Jankalyan Nagar Road, Malad West, Mumbai - 400095'
  };

  function renderNavbar() {
    const navMount = document.querySelector('header#mainHeader, [data-mount="header"], .site-header');
    if (!navMount || navMount.children.length > 0) return;

    navMount.className = 'navbar';
    navMount.innerHTML = `
      <a href="index.html" class="nav-logo" aria-label="${BRAND.name}">
        <img src="/images/logo.png" alt="${BRAND.name}" class="nav-logo-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="nav-logo-fallback" style="display:none;flex-direction:column">
          <span style="font-weight:900;font-size:16px;color:var(--text);letter-spacing:-0.5px">PROPERTY FINDER</span>
          <span style="font-size:10px;font-weight:700;color:var(--blue);letter-spacing:1px">REAL ESTATE MUMBAI</span>
        </div>
      </a>

      <ul class="nav-menu">
        <li class="nav-item"><a href="index.html" class="nav-link" data-i18n="nav.home">Home</a></li>
        <li class="nav-item">
          <a href="properties.html" class="nav-link" data-i18n="nav.properties">Properties &#9662;</a>
          <div class="dropdown">
            <a href="properties.html?type=buy"><span class="dd-icon">&#127968;</span> Buy Residential</a>
            <a href="properties.html?type=rent"><span class="dd-icon">&#128273;</span> Rent Residential</a>
            <a href="properties.html?type=commercial"><span class="dd-icon">&#127970;</span> Commercial Spaces</a>
            <a href="properties/flats-in-malad-west.html"><span class="dd-icon">&#128205;</span> Flats in Malad West</a>
            <a href="properties/flats-in-goregaon-east.html"><span class="dd-icon">&#128205;</span> Flats in Goregaon East</a>
            <a href="properties/flats-in-andheri-west.html"><span class="dd-icon">&#128205;</span> Flats in Andheri West</a>
          </div>
        </li>
        <li class="nav-item"><a href="projects.html" class="nav-link" data-i18n="nav.projects">Projects</a></li>
        <li class="nav-item"><a href="services.html" class="nav-link" data-i18n="nav.services">Services</a></li>
        <li class="nav-item">
          <a href="calculators.html" class="nav-link" data-i18n="nav.calculators">Calculators &#9662;</a>
          <div class="dropdown">
            <a href="calculators.html"><span class="dd-icon">&#128425;</span> Home Loan EMI</a>
            <a href="tds-calculators.html"><span class="dd-icon">&#128202;</span> Property TDS 1%</a>
            <a href="converter.html"><span class="dd-icon">&#128208;</span> Area Converter</a>
            <a href="agreement-registration.html"><span class="dd-icon">&#128221;</span> Stamp Duty Estimator</a>
          </div>
        </li>
        <li class="nav-item"><a href="about.html" class="nav-link" data-i18n="nav.about">About</a></li>
        <li class="nav-item"><a href="contact.html" class="nav-link" data-i18n="nav.contact">Contact</a></li>
      </ul>

      <div class="nav-actions">
        <button id="themeToggle" class="theme-toggle" aria-label="Toggle visual appearance">
          <span class="icon-light">&#9728;&#65039;</span>
          <span class="icon-dark">&#127769;</span>
        </button>
        <a href="tel:${BRAND.phone}" class="nav-phone">&#128222; ${BRAND.displayPhone}</a>
        <a href="post-property.html" class="btn btn-primary btn-sm">Post Property</a>
        <button class="hamburger" aria-label="Open mobile menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div class="mobile-menu">
        <div class="mob-section">Navigation</div>
        <a href="index.html">&#127968; Home</a>
        <a href="properties.html">&#127970; All Properties</a>
        <a href="projects.html">&#127959;&#65039; New Projects</a>
        <a href="services.html">&#128188; Agency Services</a>
        <a href="calculators.html">&#128425; EMI & Stamp Duty</a>
        <a href="agreement-registration.html">&#128221; Leave & License Registration</a>
        <a href="about.html">&#8505;&#65039; About Us</a>
        <a href="contact.html">&#128222; Contact Us</a>
        <div class="mob-section">Direct Contact</div>
        <a href="tel:${BRAND.phone}">&#128222; Call ${BRAND.displayPhone}</a>
        <a href="https://wa.me/${BRAND.phone.replace('+', '')}?text=Hello%20Property%20Finder%20Real%20Estate,%20I%20am%20looking%20for%20property%20assistance.">&#128172; WhatsApp Us</a>
        <a href="post-property.html" class="btn btn-primary mob-cta">Post Free Listing</a>
      </div>
    `;
  }

  function renderFooter() {
    const footerMount = document.querySelector('footer#mainFooter, [data-mount="footer"], .site-footer');
    if (!footerMount || footerMount.children.length > 0) return;

    footerMount.className = 'footer';
    footerMount.innerHTML = `
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            <div class="footer-logo-text">
              <div class="brand">${BRAND.name}</div>
              <div class="sub">MAHARERA REG. NO: ${BRAND.rera}</div>
            </div>
          </div>
          <p class="tagline">Your Trusted Real Estate Partner in Mumbai</p>
          <p>Assisting homebuyers, high-net-worth investors, and commercial tenants across Malad, Goregaon, Andheri, Borivali, and Kandivali with complete legal verification.</p>
          <div class="social-row">
            <a href="tel:${BRAND.phone}" class="social-btn" title="Phone Helpline">&#128222;</a>
            <a href="https://wa.me/${BRAND.phone.replace('+', '')}" target="_blank" rel="noopener" class="social-btn" title="WhatsApp Chat">&#128172;</a>
            <a href="mailto:${BRAND.email}" class="social-btn" title="Email Inquiries">&#9993;&#65039;</a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Micro-Markets</h4>
          <a href="properties/flats-in-malad-west.html">Flats in Malad West</a>
          <a href="properties/flats-in-goregaon-east.html">Flats in Goregaon East</a>
          <a href="properties/flats-in-andheri-west.html">Flats in Andheri West</a>
          <a href="properties/flats-in-kandivali-west.html">Flats in Kandivali West</a>
          <a href="properties/flats-in-borivali-west.html">Flats in Borivali West</a>
          <a href="properties/commercial-office-andheri.html">Offices in Andheri</a>
        </div>

        <div class="footer-col">
          <h4>Tools & Resources</h4>
          <a href="calculators.html">Home Loan EMI Calculator</a>
          <a href="tds-calculators.html">Property TDS 1% Calculator</a>
          <a href="converter.html">Carpet Area Converter</a>
          <a href="agreement-registration.html">Leave & License Registration</a>
          <a href="price-trends.html">Mumbai Price Trends</a>
          <a href="nri.html">NRI Real Estate Services</a>
        </div>

        <div class="footer-col">
          <h4>Head Office</h4>
          <div class="footer-contact-row">
            <span>&#128205;</span>
            <span>${BRAND.address}</span>
          </div>
          <div class="footer-contact-row">
            <span>&#128222;</span>
            <span><a href="tel:${BRAND.phone}">${BRAND.displayPhone}</a></span>
          </div>
          <div class="footer-contact-row">
            <span>&#9993;&#65039;</span>
            <span><a href="mailto:${BRAND.email}">${BRAND.email}</a></span>
          </div>
          <div class="footer-contact-row">
            <span>&#128337;</span>
            <span>Monday – Saturday: 10:00 AM – 8:00 PM</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div>&copy; 2018–2026 ${BRAND.name}. All rights reserved. MahaRERA: ${BRAND.rera}</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap">
          <a href="privacy-policy.html">Privacy Policy</a>
          <a href="terms.html">Terms of Service</a>
          <a href="sitemap.xml">XML Sitemap</a>
          <a href="admin.html">Staff Console</a>
        </div>
      </div>
    `;
  }

  function renderFloatingWidgets() {
    if (!document.querySelector('.floating-actions')) {
      const actions = document.createElement('div');
      actions.className = 'floating-actions';
      actions.innerHTML = `
        <div class="fab-wrap">
          <a href="https://wa.me/${BRAND.phone.replace('+', '')}?text=Hello%20Property%20Finder%20Real%20Estate,%20I%20am%20inquiring%20about%20a%20property." target="_blank" rel="noopener" class="fab fab-whatsapp" aria-label="Chat on WhatsApp">&#128172;</a>
        </div>
        <div class="fab-wrap">
          <a href="tel:${BRAND.phone}" class="fab fab-call" aria-label="Call Direct Helpline">&#128222;</a>
        </div>
      `;
      document.body.appendChild(actions);
    }

    if (!document.getElementById('backToTop')) {
      const btt = document.createElement('button');
      btt.id = 'backToTop';
      btt.setAttribute('aria-label', 'Back to top of page');
      btt.innerHTML = '&#8593;';
      document.body.appendChild(btt);
    }

    if (!document.getElementById('lightbox')) {
      const lightbox = document.createElement('div');
      lightbox.id = 'lightbox';
      lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close Lightbox" style="position:absolute;top:20px;right:24px;background:none;border:none;color:#FFFFFF;font-size:32px;cursor:pointer;line-height:1">&times;</button>
        <img id="lightboxImg" src="" alt="Property Visual Enclosure" style="max-width:92%;max-height:88vh;object-fit:contain;border-radius:8px">
      `;
      document.body.appendChild(lightbox);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderNavbar();
    renderFooter();
    renderFloatingWidgets();
  });
})(window, document);