/* =====================================================
   PROPERTY FINDER REAL ESTATE — Global Layout Components
   Single-Source Header, Navigation, Footer & Widgets
   ===================================================== */

(function () {
  'use strict';

  // 1. Current URL detection for active menu highlighting
  function normalizePath(path) {
    const p = path.split('?')[0].split('#')[0].replace(/\/index\.html$/, '/').replace(/\/$/, '');
    return p === '' ? '/' : p;
  }

  const currentPath = normalizePath(window.location.pathname);

  function isActive(targetHref) {
    const target = normalizePath(targetHref);
    if (target === '/' && currentPath === '/') return true;
    if (target !== '/' && currentPath.includes(target.replace('.html', ''))) return true;
    return false;
  }

  // ── 2. SITE NAVBAR & MOBILE MENU COMPONENT ──
  class SiteNavbar extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <nav class="navbar" role="navigation" aria-label="Main navigation">
          <a href="/index.html" class="nav-logo" style="display:flex;align-items:center;">
            <img src="/images/logo.png" alt="Property Finder Real Estate" class="nav-logo-img" style="height:48px;width:auto;object-fit:contain" loading="eager">
          </a>
          <ul class="nav-menu" role="list">
            <li class="nav-item">
              <a href="/index.html" class="nav-link ${isActive('/index.html') ? 'active' : ''}">Home</a>
            </li>
            <li class="nav-item">
              <a href="/properties.html" class="nav-link ${isActive('/properties.html') ? 'active' : ''}">
                Properties <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </a>
              <div class="dropdown">
                <a href="/properties.html"><span class="dd-icon">🏠</span> All Properties</a>
                <a href="/projects.html"><span class="dd-icon">🏗️</span> Projects</a>
                <a href="/neighbourhoods.html"><span class="dd-icon">📍</span> Neighbourhoods</a>
              </div>
            </li>
            <li class="nav-item">
              <a href="/projects.html" class="nav-link ${isActive('/projects.html') ? 'active' : ''}">Projects</a>
            </li>
            <li class="nav-item">
              <a href="/services.html" class="nav-link ${isActive('/services.html') ? 'active' : ''}">Services</a>
            </li>
            <li class="nav-item">
              <a href="/about.html" class="nav-link ${isActive('/about.html') || isActive('/team.html') ? 'active' : ''}">
                About <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </a>
              <div class="dropdown">
                <a href="/about.html"><span class="dd-icon">🏢</span> About Us</a>
                <a href="/team.html"><span class="dd-icon">👥</span> Our Team</a>
                <a href="/testimonials.html"><span class="dd-icon">⭐</span> Testimonials</a>
                <a href="/faq.html"><span class="dd-icon">❓</span> FAQ</a>
                <a href="/careers.html"><span class="dd-icon">💼</span> Careers</a>
                <a href="/nri.html"><span class="dd-icon">🌍</span> NRI Corner</a>
              </div>
            </li>
            <li class="nav-item">
              <a href="/calculators.html" class="nav-link ${isActive('/calculators.html') ? 'active' : ''}">
                Tools <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </a>
              <div class="dropdown">
                <a href="/calculators.html"><span class="dd-icon">🧮</span> EMI Calculator</a>
                <a href="/tds-calculators.html"><span class="dd-icon">📋</span> TDS Calculators</a>
                <a href="/converter.html"><span class="dd-icon">📐</span> Measurement Converter</a>
                <a href="/insurance.html"><span class="dd-icon">🛡️</span> Property Insurance</a>
                <a href="/price-trends.html"><span class="dd-icon">📈</span> Price Trends</a>
                <a href="/reminders.html"><span class="dd-icon">🔔</span> Reminders</a>
              </div>
            </li>
            <li class="nav-item">
              <a href="/blog.html" class="nav-link ${isActive('/blog.html') ? 'active' : ''}">Blog</a>
            </li>
            <li class="nav-item">
              <a href="/contact.html" class="nav-link ${isActive('/contact.html') ? 'active' : ''}">Contact</a>
            </li>
          </ul>
          <div class="nav-actions">
            <a href="tel:+919326990050" class="nav-phone">📞 +919326990050</a>
            <a href="/post-property.html" class="btn btn-primary btn-sm btn-green-inline">+ Post Property</a>
            <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle theme" title="Toggle Light/Dark Mode">
              <span class="icon-light">☀️</span><span class="icon-dark" style="display:none">🌙</span>
            </button>
            <button class="hamburger" id="hamburger" type="button" aria-label="Toggle navigation" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </div>
        </nav>

        <!-- Mobile Menu Overlay -->
        <div class="mobile-menu" id="mobileMenu">
          <div class="mob-section">Navigation</div>
          <a href="/index.html">🏠 Home</a>
          <a href="/properties.html">🏘️ Properties</a>
          <a href="/projects.html">🏗️ Projects</a>
          <a href="/services.html">⚙️ Services</a>
          <a href="/about.html">🏢 About Us</a>
          <a href="/team.html">👥 Our Team</a>
          <a href="/testimonials.html">⭐ Testimonials</a>
          <a href="/calculators.html">🧮 Calculators</a>
          <a href="/blog.html">📝 Blog</a>
          <a href="/contact.html">📞 Contact</a>
          <a href="tel:+919326990050" class="btn btn-primary mob-cta">📞 Call +919326990050</a>
        </div>
      `;
    }
  }

  // ── 3. SITE FOOTER COMPONENT ──
  class SiteFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <footer class="footer">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="footer-logo">
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none"><circle cx="17" cy="17" r="13" stroke="#2563EB" stroke-width="2.8"/><path d="M17 22V18" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round"/><rect x="14" y="18" width="6" height="4" rx="0.5" stroke="#2563EB" stroke-width="2.2"/><path d="M12 18L17 13L22 18" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 27L33 33" stroke="#2563EB" stroke-width="2.8" stroke-linecap="round"/></svg>
                <div class="footer-logo-text"><div class="brand">Property Finder Real Estate</div><div class="sub">Mumbai, Maharashtra</div></div>
              </div>
              <p class="tagline">"Your Search Ends Here."</p>
              <p>Trusted real estate consultants in Mumbai's western suburbs since 2018. Helping families and businesses navigate transactions with clarity and integrity.</p>
              <div class="social-row">
                <a href="https://www.instagram.com/propertyfinderrealestate" class="social-btn" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg width="16" height="16" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
                <a href="https://www.facebook.com/PropertyFinderRealEstate/reviews" class="social-btn" target="_blank" rel="noopener noreferrer" aria-label="Facebook Reviews"><svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
                <a href="https://www.linkedin.com/company/propertyfinderrealestate" class="social-btn" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>
                <a href="https://www.youtube.com/@PropertyFinderRealEstate" class="social-btn" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
                <a href="https://x.com/PropertyFinderA" class="social-btn" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter"><svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                <a href="https://in.pinterest.com/propertyfinderrealestate/" class="social-btn" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg></a>
                <a href="https://jsdl.in/RSL-XGK1779888146" class="social-btn" target="_blank" rel="noopener noreferrer" aria-label="JustDial"><svg width="16" height="16" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#FF6B35"/><text x="12" y="17" font-family="Arial,sans-serif" font-size="10" font-weight="900" text-anchor="middle" fill="white">JD</text></svg></a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Top Localities</h4>
              <a href="/properties/flats-in-malad-west">Flats in Malad West</a>
              <a href="/properties/flats-in-goregaon-east">Flats in Goregaon East</a>
              <a href="/properties/flats-in-kandivali-west">Flats in Kandivali West</a>
              <a href="/properties/flats-in-borivali-west">Flats in Borivali West</a>
              <a href="/properties/commercial-office-andheri">Office in Andheri</a>
            </div>
            <div class="footer-col">
              <h4>Tools &amp; Insights</h4>
              <a href="/calculators.html">EMI Calculator</a>
              <a href="/tds-calculators.html">TDS Calculator</a>
              <a href="/converter.html">Area Converter</a>
              <a href="/price-trends.html">Price Trends</a>
              <a href="/blog.html">Market Blog</a>
            </div>
            <div class="footer-col">
              <h4>Contact Us</h4>
              <div class="footer-contact-row">
                <span class="footer-contact-icon">📍</span>
                <span>Shop No. 9, Ground Floor, Building No. 3, Deepanjali Co-operative Housing Society Limited, Baf-Hira Nagar, Lower Kharodi, Jankalyan Nagar Road, Malad West, Mumbai, Maharashtra, 400095, India</span>
              </div>
              <div class="footer-contact-row">
                <span class="footer-contact-icon">📞</span>
                <a href="tel:+919326990050">+919326990050</a>
              </div>
              <div class="footer-contact-row">
                <span class="footer-contact-icon">✉️️</span>
                <a href="mailto:propertyfinderre@gmail.com">propertyfinderre@gmail.com</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© 2026 Property Finder Real Estate. All rights reserved.</span>
            <span><a href="/privacy-policy.html">Privacy Policy</a> &nbsp;·&nbsp; <a href="/terms.html">Terms of Service</a></span>
          </div>
        </footer>

        <!-- Shared Global Widgets Stack -->
        <div id="progressBar"></div>
        <div id="toastContainer"></div>
        <button id="backToTop" type="button" title="Back to top" aria-label="Back to top">&#8593;</button>

        <div class="cookie-banner" id="cookieBanner" style="display: none;">
          <p class="cookie-text">We use cookies to improve your browsing experience and provide personalized services.</p>
          <div class="cookie-btns">
            <button class="cookie-accept" id="cookieAccept" type="button">Accept</button>
            <button class="cookie-decline" id="cookieDecline" type="button">Decline</button>
          </div>
        </div>

        <div class="floating-actions">
          <div class="fab-wrap">
            <span class="fab-label">WhatsApp Us</span>
            <a href="https://wa.me/919326990050" target="_blank" rel="noopener noreferrer" class="fab fab-whatsapp" aria-label="WhatsApp">💬</a>
          </div>
          <div class="fab-wrap">
            <span class="fab-label">Call Us</span>
            <a href="tel:+919326990050" class="fab fab-call" aria-label="Call Us">📞</a>
          </div>
          <div class="fab-wrap">
            <span class="fab-label">AI Assistant</span>
            <button class="fab fab-chat" id="chatToggle" type="button" aria-label="Open AI Assistant">🤖<span class="chat-badge">1</span></button>
          </div>
        </div>

        <div id="chatWidget" aria-hidden="true" style="display: none;">
          <div class="chat-header">
            <div class="chat-avatar">🏠</div>
            <div class="chat-header-info">
              <div class="chat-name">PFRE Assistant</div>
              <div class="chat-status"><span class="chat-status-dot"></span> Online — replies instantly</div>
            </div>
            <button class="chat-close" id="chatClose" type="button" aria-label="Close Chat">&times;</button>
          </div>
          <div class="chat-body" id="chatBody"></div>
          <div class="quick-replies" id="quickReplies"></div>
          <div class="chat-input-row">
            <input class="chat-input" id="chatInput" type="text" placeholder="Ask about properties, prices, loans…" aria-label="Chat input">
            <button class="chat-send" id="chatSend" type="button" aria-label="Send Message">&#10148;</button>
          </div>
        </div>

        <div id="lightbox" aria-hidden="true" style="display: none;">
          <div class="lightbox-inner">
            <button class="lightbox-close" id="lbClose" type="button" aria-label="Close Lightbox">&times;</button>
            <div class="lightbox-img-placeholder" id="lbImage">🏠</div>
            <button class="lightbox-nav lightbox-prev" id="lbPrev" type="button" aria-label="Previous Image">&#8249;</button>
            <button class="lightbox-nav lightbox-next" id="lbNext" type="button" aria-label="Next Image">&#8250;</button>
            <div class="lightbox-counter" id="lbCounter">1 / 1</div>
          </div>
        </div>
      `;
    }
  }

  // Define Custom Elements
  customElements.define('site-navbar', SiteNavbar);
  customElements.define('site-footer', SiteFooter);
})();