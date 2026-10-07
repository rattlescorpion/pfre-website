/* =====================================================
   PROPERTY FINDER REAL ESTATE — Projects Loader Engine
   Dynamic Data Hydration, Interactive Filters & Grid Sync
   Production Build v3.1 · Zero-Dependency & Clean-URL Safe
   ===================================================== */

(function () {
  'use strict';

  let allProjects = [];
  let currentStatus = 'all';

  let DOM = {};

  function queryDOMElements() {
    DOM = {
      container: document.getElementById('projectsDirectory'),
      emptyState: document.getElementById('emptyProjectsState'),
      statusPills: document.querySelectorAll('.status-pill'),
      localitySelect: document.getElementById('localityFilterSelect'),
      developerSelect: document.getElementById('developerFilterSelect'),
      searchInput: document.getElementById('projectSearchInput'),
      resetBtn: document.getElementById('resetProjectFilters'),
      simpleGrids: document.querySelectorAll('.project-grid')
    };
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getStatusBadgeClass(status) {
    const s = String(status || '').toLowerCase();
    if (s.includes('launch')) return 'badge-launch';
    if (s.includes('ready')) return 'badge-ready';
    return 'badge-uc';
  }

  function checkStatusMatch(proj, filterStatus) {
    if (filterStatus === 'all') return true;
    const s = String(proj.status || '').toLowerCase();
    const label = String(proj.statusLabel || '').toLowerCase();

    if (filterStatus === 'uc') {
      return s === 'uc' || s.includes('under') || label.includes('under') || label.includes('finishing');
    }
    if (filterStatus === 'ready') {
      return s === 'ready' || s.includes('ready') || s.includes('oc') || label.includes('ready') || label.includes('oc');
    }
    if (filterStatus === 'launch') {
      return s === 'launch' || s.includes('launch') || label.includes('launch') || label.includes('pre-launch');
    }
    return s.includes(filterStatus) || label.includes(filterStatus);
  }

  /* ── 1. Render Card for Main Catalog (#projectsDirectory) ── */
  function renderPremiumProjectCard(proj) {
    const title = proj.title || proj.name || 'Featured Development';
    const image = proj.coverImage || proj.image || '/images/og-banner.jpg';
    const summary = proj.summary || proj.overview || '';
    const rera = proj.reraId || proj.reraNumber || 'Applied';
    const statusClass = getStatusBadgeClass(proj.status);
    const brochureText = encodeURIComponent(proj.brochureMessage || `Inquiry for ${title}`);

    const config = proj.specs?.configuration || (Array.isArray(proj.configurations) ? proj.configurations.join(', ') : '2, 3 BHK');
    const carpet = proj.specs?.carpetArea || proj.carpetAreaRange || 'On Request';
    const possession = proj.specs?.possession || proj.possessionDate || 'Under Construction';
    const metric = proj.specs?.specialMetric || proj.totalTowers || 'Prime Gated Community';

    const amenitiesHTML = (Array.isArray(proj.amenities) ? proj.amenities : [])
      .map(amenity => `<span class="amenity-pill">${escapeHTML(amenity)}</span>`)
      .join('');

    return `
      <article class="premium-project-card" 
               data-status="${escapeHTML(proj.status || '')}" 
               data-locality="${escapeHTML(proj.localityKey || proj.locality || '')}" 
               data-developer="${escapeHTML(proj.developerKey || proj.developer || '')}">
        <div class="project-media-wrap">
          <img src="${escapeHTML(image)}" 
               alt="${escapeHTML(title)}" 
               class="project-hero-img" 
               loading="lazy" 
               onerror="this.onerror=null;this.parentElement.style.background='linear-gradient(135deg, #1E3A8A, #3B82F6)';this.style.display='none';">
          <div class="project-badge-stack">
            <span class="status-badge ${statusClass}">${escapeHTML(proj.statusLabel || proj.status || 'Verified')}</span>
            <span class="rera-tag">MahaRERA: ${escapeHTML(rera)}</span>
          </div>
        </div>
        <div class="project-details-body">
          <div>
            <div class="project-header-top">
              <div>
                <div class="project-brand-meta">🏢 ${escapeHTML(proj.developer || 'Reputed Developer')}</div>
                <h2 class="project-title">${escapeHTML(title)}</h2>
                <div class="project-location">📍 ${escapeHTML(proj.address || proj.locality || 'Mumbai')}</div>
              </div>
              <div class="project-price-box">
                <div class="price-value">${escapeHTML(proj.priceDisplay || 'Price on Request')}</div>
                <div class="price-sub">${escapeHTML(proj.priceSub || '')}</div>
              </div>
            </div>
            <p class="project-summary">${escapeHTML(summary)}</p>
            
            <div class="spec-matrix">
              <div class="spec-node">
                <label>Configuration</label>
                <span>${escapeHTML(config)}</span>
              </div>
              <div class="spec-node">
                <label>Carpet Area</label>
                <span>${escapeHTML(carpet)}</span>
              </div>
              <div class="spec-node">
                <label>Possession</label>
                <span>${escapeHTML(possession)}</span>
              </div>
              <div class="spec-node">
                <label>Highlight</label>
                <span>${escapeHTML(metric)}</span>
              </div>
            </div>

            <div class="amenities-pills">
              ${amenitiesHTML}
            </div>
          </div>

          <div class="project-actions-row">
            <a href="/contact?project=${encodeURIComponent(proj.id || title)}" class="btn btn-primary btn-sm">Schedule VIP Site Tour</a>
            <a href="https://wa.me/919326990050?text=${brochureText}" target="_blank" rel="noopener noreferrer" class="btn btn-brochure btn-sm">
              💬 Instant Brochure &amp; Plans
            </a>
            <a href="tel:+919326990050" class="btn btn-outline btn-sm">📞 Call Desk</a>
          </div>
        </div>
      </article>
    `;
  }

  /* ── 2. Render Card for Lightweight Secondary Grids (.project-grid) ── */
  function renderSimpleProjectCard(p) {
    const title = p.title || p.name || 'Featured Project';
    const image = p.coverImage || p.image || '/images/og-banner.jpg';
    const rera = p.reraNumber || p.reraId || 'Verified';
    const status = p.statusLabel || p.status || 'Under Construction';
    const isReady = status.toLowerCase().includes('ready');
    const badgeClass = isReady ? 'badge-green' : 'badge-gold';
    const configs = p.specs?.configuration || (Array.isArray(p.configurations) ? p.configurations.join(', ') : '2, 3 BHK');
    const carpet = p.specs?.carpetArea || p.carpetAreaRange || 'On Request';
    const possession = p.specs?.possession || p.possessionDate || 'Under Construction';
    const subLoc = p.subLocality ? `${p.subLocality}, ` : '';

    return `
      <div class="project-card">
        <div class="project-img">
          <img src="${escapeHTML(image)}" 
               alt="${escapeHTML(title)} by ${escapeHTML(p.developer || '')} in ${escapeHTML(p.locality || 'Mumbai')}" 
               loading="lazy" 
               onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
               style="width:100%;height:100%;object-fit:cover;">
          <div class="project-placeholder" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:48px;background:var(--bg-secondary);">🏗️</div>
        </div>
        <div class="project-body">
          <div class="project-status" style="margin-bottom:12px;display:flex;gap:6px;flex-wrap:wrap;">
            <span class="badge ${badgeClass}">${escapeHTML(status)}</span>
            <span class="badge badge-blue">RERA: ${escapeHTML(rera)}</span>
          </div>
          <h3 class="project-name" style="font-size:18px;font-weight:700;margin-bottom:6px;">${escapeHTML(title)}</h3>
          <div class="project-dev" style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">🏢 ${escapeHTML(p.developer || '')} · ${escapeHTML(subLoc)}${escapeHTML(p.locality || 'Mumbai')}</div>
          
          <div class="project-meta" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:16px;">
            <div class="project-meta-item">
              <label style="display:block;font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:600;">Configs</label>
              <span style="font-weight:600;font-size:13.5px;">${escapeHTML(configs)}</span>
            </div>
            <div class="project-meta-item">
              <label style="display:block;font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:600;">Pricing</label>
              <span style="font-weight:700;color:var(--blue);font-size:13.5px;">${escapeHTML(p.priceDisplay || 'On Request')}</span>
            </div>
            <div class="project-meta-item">
              <label style="display:block;font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:600;">Carpet Area</label>
              <span style="font-weight:600;font-size:13.5px;">${escapeHTML(carpet)}</span>
            </div>
            <div class="project-meta-item">
              <label style="display:block;font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:600;">Possession</label>
              <span style="font-weight:600;font-size:13.5px;">${escapeHTML(possession)}</span>
            </div>
          </div>

          <div style="display:flex;gap:10px;">
            <a href="tel:+919326990050" class="btn btn-primary btn-sm" style="flex:1;justify-content:center;">Book Site Visit</a>
            <a href="https://wa.me/919326990050?text=${encodeURIComponent('Hello Property Finder Real Estate, I would like more information and a brochure for ' + title)}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="btn btn-outline btn-sm" 
               style="flex:1;justify-content:center;">WhatsApp</a>
          </div>
        </div>
      </div>
    `;
  }

  /* ── 3. Filter Application for Catalog View ── */
  function applyFilters() {
    if (!DOM.container) return;

    const selectedLocality = (DOM.localitySelect?.value || 'all').toLowerCase();
    const selectedDeveloper = (DOM.developerSelect?.value || 'all').toLowerCase();
    const searchQuery = (DOM.searchInput?.value || '').trim().toLowerCase();

    const filtered = allProjects.filter(proj => {
      // Status Match
      const matchesStatus = checkStatusMatch(proj, currentStatus);

      // Locality Match
      const locBlob = `${proj.localityKey || ''} ${proj.locality || ''} ${proj.subLocality || ''} ${proj.address || ''}`.toLowerCase();
      const matchesLocality = (selectedLocality === 'all') || locBlob.includes(selectedLocality);

      // Developer Match
      const devBlob = `${proj.developerKey || ''} ${proj.developer || ''}`.toLowerCase();
      const matchesDeveloper = (selectedDeveloper === 'all') || devBlob.includes(selectedDeveloper);

      // Search Query Match
      const searchBlob = `${proj.title || ''} ${proj.name || ''} ${proj.developer || ''} ${proj.locality || ''} ${proj.subLocality || ''} ${proj.address || ''} ${proj.summary || ''} ${proj.overview || ''} ${(proj.amenities || []).join(' ')} ${(proj.configurations || []).join(' ')} ${proj.reraId || ''} ${proj.reraNumber || ''}`.toLowerCase();
      const matchesSearch = !searchQuery || searchBlob.includes(searchQuery);

      return matchesStatus && matchesLocality && matchesDeveloper && matchesSearch;
    });

    if (filtered.length === 0) {
      DOM.container.innerHTML = '';
      if (DOM.emptyState) DOM.emptyState.style.display = 'block';
    } else {
      if (DOM.emptyState) DOM.emptyState.style.display = 'none';
      DOM.container.innerHTML = filtered.map(renderPremiumProjectCard).join('');
    }
  }

  /* ── 4. Bind DOM Interactive Filter Events ── */
  function bindEvents() {
    DOM.statusPills.forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.statusPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentStatus = pill.getAttribute('data-status') || 'all';
        applyFilters();
      });
    });

    DOM.localitySelect?.addEventListener('change', applyFilters);
    DOM.developerSelect?.addEventListener('change', applyFilters);

    let searchDebounce = null;
    DOM.searchInput?.addEventListener('input', () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(applyFilters, 150);
    });

    DOM.resetBtn?.addEventListener('click', () => {
      DOM.statusPills.forEach(p => p.classList.remove('active'));
      const allPill = document.querySelector('.status-pill[data-status="all"]');
      if (allPill) allPill.classList.add('active');
      currentStatus = 'all';

      if (DOM.localitySelect) DOM.localitySelect.value = 'all';
      if (DOM.developerSelect) DOM.developerSelect.value = 'all';
      if (DOM.searchInput) DOM.searchInput.value = '';

      applyFilters();
    });
  }

  /* ── 5. Sync Query Parameters from URL ── */
  function syncURLParameters() {
    const params = new URLSearchParams(window.location.search);
    const urlStatus = params.get('status');
    const urlLocality = params.get('locality');
    const urlDeveloper = params.get('developer');

    if (urlStatus) {
      const targetPill = document.querySelector(`.status-pill[data-status="${urlStatus}"]`);
      if (targetPill) {
        DOM.statusPills.forEach(p => p.classList.remove('active'));
        targetPill.classList.add('active');
        currentStatus = urlStatus;
      }
    }

    if (urlLocality && DOM.localitySelect) {
      DOM.localitySelect.value = urlLocality.toLowerCase();
    }

    if (urlDeveloper && DOM.developerSelect) {
      DOM.developerSelect.value = urlDeveloper.toLowerCase();
    }
  }

  /* ── 6. Populate Secondary Grids If Present ── */
  function renderSimpleGridsIfPresent() {
    if (!DOM.simpleGrids || DOM.simpleGrids.length === 0) return;
    DOM.simpleGrids.forEach(grid => {
      grid.innerHTML = allProjects.map(renderSimpleProjectCard).join('');
    });
  }

  /* ── 7. Initialize Engine ── */
  async function init() {
    queryDOMElements();

    if (!DOM.container && (!DOM.simpleGrids || DOM.simpleGrids.length === 0)) return;

    try {
      const response = await fetch('/data/projects.json');
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      allProjects = await response.json();

      if (DOM.container) {
        bindEvents();
        syncURLParameters();
        applyFilters();
      }

      renderSimpleGridsIfPresent();
    } catch (err) {
      console.error('Failed to load projects:', err);
      if (DOM.container) {
        DOM.container.innerHTML = `
          <div style="text-align:center;padding:48px 20px;color:var(--text-muted);grid-column:1/-1;">
            <p style="font-size:16px;">Unable to load project listings at this moment.</p>
            <p style="font-size:13.5px;">Please contact our advisory desk directly at 
              <a href="tel:+919326990050" style="color:var(--blue);font-weight:700;">+919326990050</a>.
            </p>
          </div>
        `;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();