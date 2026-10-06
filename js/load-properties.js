/* =====================================================
   PROPERTY FINDER REAL ESTATE — Resilient Property Loader Engine
   Dynamic Data Hydration, Interactive Filters & URL Parameter Sync
   ===================================================== */

(function () {
  'use strict';

  let propertiesData = [];
  let activeIntent = 'all';
  let activeBhk = 'all';

  const DOM = {
    container: document.getElementById('propertiesContainer') || document.querySelector('.prop-grid-4') || document.querySelector('.prop-grid'),
    count: document.getElementById('resultsCount'),
    noResults: document.getElementById('noResults'),
    localitySelect: document.getElementById('localitySelect'),
    sortSelect: document.getElementById('sortSelect'),
    searchInput: document.getElementById('propertySearchInput'),
    resetBtn: document.getElementById('resetFiltersBtn'),
    intentPills: document.querySelectorAll('#intentFilters .filter-pill, [data-filter-intent]'),
    bhkPills: document.querySelectorAll('#bhkFilters .filter-pill, [data-filter-bhk]')
  };

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderCard(p) {
    const title = p.title || p.name || 'Verified Mumbai Property';
    const locality = p.locality || 'Mumbai';
    const subLoc = p.subLocality ? `${p.subLocality}, ` : '';
    const fullLocality = `${subLoc}${locality}`;
    const image = (Array.isArray(p.images) && p.images[0]) || p.coverImage || '/images/og-banner.jpg';
    
    // Resolve transaction intent & badges
    const isCommercial = (p.use === 'commercial') || (p.type === 'commercial') || (p.intent === 'commercial');
    let intentLabel = 'For Sale';
    let intentBadgeClass = 'badge-blue';

    if (p.intent === 'rent' || p.transactionType === 'rent') {
      intentLabel = 'For Rent';
      intentBadgeClass = 'badge-green';
    } else if (isCommercial && p.intent !== 'rent' && p.transactionType !== 'rent') {
      intentLabel = 'Commercial Sale';
      intentBadgeClass = 'badge-gold';
    }

    const detailUrl = `/property-detail.html?id=${encodeURIComponent(p.id)}`;
    const bhkBadge = p.bhk ? `<span class="badge badge-gray">${escapeHTML(p.bhk)} BHK</span>` : (isCommercial ? `<span class="badge badge-gray">Commercial</span>` : '');
    const carpetDisplay = p.carpetArea ? `${Number(p.carpetArea).toLocaleString('en-IN')} sq.ft Carpet` : 'On Request';

    return `
      <a href="${detailUrl}" class="prop-card-link">
        <article class="prop-card" 
                 data-id="${escapeHTML(p.id)}"
                 data-intent="${escapeHTML(p.intent || '')}" 
                 data-bhk="${escapeHTML(p.bhk || '')}" 
                 data-proptype="${escapeHTML(p.propType || '')}" 
                 data-use="${escapeHTML(p.use || p.type || '')}" 
                 data-price="${escapeHTML(p.price || 0)}" 
                 data-area="${escapeHTML(p.carpetArea || 0)}"
                 data-locality="${escapeHTML(locality.toLowerCase())}">
          <div class="prop-img">
            <img src="${escapeHTML(image)}" 
                 alt="${escapeHTML(title)} in ${escapeHTML(fullLocality)}" 
                 class="prop-photo" 
                 loading="lazy" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="prop-placeholder" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:48px;background:var(--bg-secondary);">${isCommercial ? '🏬' : '🏠'}</div>
            <div class="prop-badges">
              <span class="badge ${intentBadgeClass}">${intentLabel}</span>
              ${bhkBadge}
            </div>
            <button class="prop-fav" 
                    type="button" 
                    aria-label="Add to Favorites"
                    onclick="event.preventDefault(); this.textContent = this.textContent === '❤️' ? '🤍' : '❤️';">🤍</button>
          </div>
          <div class="prop-body">
            <div class="prop-price">${escapeHTML(p.priceDisplay || 'Price on Request')}</div>
            <h3 class="prop-name">${escapeHTML(title)}</h3>
            <div class="prop-loc">📍 ${escapeHTML(fullLocality)}</div>
            <div class="prop-meta">
              ${p.bhk ? `<div class="prop-meta-item">🛏 <strong>${escapeHTML(p.bhk)}</strong> Beds</div>` : ''}
              ${p.bathrooms ? `<div class="prop-meta-item">🛁 <strong>${escapeHTML(p.bathrooms)}</strong> Baths</div>` : ''}
              <div class="prop-meta-item">📐 <strong>${escapeHTML(carpetDisplay)}</strong></div>
            </div>
          </div>
        </article>
      </a>
    `;
  }

  function applyFilters() {
    if (!DOM.container) return;

    const selectedLocality = (DOM.localitySelect?.value || 'all').toLowerCase();
    const query = (DOM.searchInput?.value || '').trim().toLowerCase();
    const sort = DOM.sortSelect?.value || 'featured';

    let filtered = propertiesData.filter(p => {
      // 1. Purpose / Intent filter
      if (activeIntent !== 'all') {
        const intent = String(p.intent || '').toLowerCase();
        const transType = String(p.transactionType || '').toLowerCase();
        const useType = String(p.use || p.type || '').toLowerCase();

        if (activeIntent === 'commercial') {
          if (!useType.includes('commercial') && intent !== 'commercial') return false;
        } else if (activeIntent === 'buy') {
          if (intent !== 'buy' && transType !== 'buy') return false;
        } else if (activeIntent === 'rent') {
          if (intent !== 'rent' && transType !== 'rent') return false;
        }
      }

      // 2. Configuration (BHK) filter
      if (activeBhk !== 'all') {
        const bhkVal = Number(p.bhk);
        if (activeBhk === '4') {
          if (!bhkVal || bhkVal < 4) return false;
        } else {
          if (String(p.bhk) !== activeBhk) return false;
        }
      }

      // 3. Locality dropdown filter
      if (selectedLocality !== 'all') {
        const locString = `${p.locality || ''} ${p.subLocality || ''} ${p.address || ''}`.toLowerCase();
        if (!locString.includes(selectedLocality)) return false;
      }

      // 4. Keyword search input
      if (query) {
        const searchBlob = `${p.title || ''} ${p.locality || ''} ${p.subLocality || ''} ${p.address || ''} ${p.bhk || ''} ${p.reraId || ''}`.toLowerCase();
        if (!searchBlob.includes(query)) return false;
      }

      return true;
    });

    // 5. Sorting
    if (sort === 'price-asc') {
      filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sort === 'area-desc') {
      filtered.sort((a, b) => (Number(b.carpetArea) || 0) - (Number(a.carpetArea) || 0));
    }

    // 6. Update results count indicator
    if (DOM.count) {
      DOM.count.textContent = `Showing ${filtered.length} of ${propertiesData.length} Verified Properties`;
    }

    // 7. Render cards or empty state
    if (filtered.length === 0) {
      DOM.container.innerHTML = '';
      if (DOM.noResults) DOM.noResults.style.display = 'block';
    } else {
      if (DOM.noResults) DOM.noResults.style.display = 'none';
      DOM.container.innerHTML = filtered.map(renderCard).join('');
    }

    // Secondary hook if external filter scripts are present
    if (window.PFREPropertyFilter && typeof window.PFREPropertyFilter.init === 'function') {
      try { window.PFREPropertyFilter.init(); } catch (_) {}
    }
  }

  function bindEvents() {
    // Intent pill triggers
    DOM.intentPills.forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.intentPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeIntent = pill.getAttribute('data-filter-intent') || 'all';
        applyFilters();
      });
    });

    // BHK pill triggers
    DOM.bhkPills.forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.bhkPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeBhk = pill.getAttribute('data-filter-bhk') || 'all';
        applyFilters();
      });
    });

    DOM.localitySelect?.addEventListener('change', applyFilters);
    DOM.sortSelect?.addEventListener('change', applyFilters);

    // Debounced search input
    let searchDebounce = null;
    DOM.searchInput?.addEventListener('input', () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(applyFilters, 150);
    });

    // Reset button
    DOM.resetBtn?.addEventListener('click', () => {
      activeIntent = 'all';
      activeBhk = 'all';

      DOM.intentPills.forEach(p => p.classList.remove('active'));
      document.querySelector('[data-filter-intent="all"]')?.classList.add('active');

      DOM.bhkPills.forEach(p => p.classList.remove('active'));
      document.querySelector('[data-filter-bhk="all"]')?.classList.add('active');

      if (DOM.localitySelect) DOM.localitySelect.value = 'all';
      if (DOM.sortSelect) DOM.sortSelect.value = 'featured';
      if (DOM.searchInput) DOM.searchInput.value = '';

      applyFilters();
    });
  }

  function syncURLParameters() {
    const params = new URLSearchParams(window.location.search);
    const intentParam = params.get('intent');
    const bhkParam = params.get('bhk');
    const locParam = params.get('locality');
    const queryParam = params.get('q');

    if (intentParam) {
      const target = document.querySelector(`[data-filter-intent="${intentParam.toLowerCase()}"]`);
      if (target) {
        DOM.intentPills.forEach(p => p.classList.remove('active'));
        target.classList.add('active');
        activeIntent = intentParam.toLowerCase();
      }
    }

    if (bhkParam) {
      const target = document.querySelector(`[data-filter-bhk="${bhkParam}"]`);
      if (target) {
        DOM.bhkPills.forEach(p => p.classList.remove('active'));
        target.classList.add('active');
        activeBhk = bhkParam;
      }
    }

    if (locParam && DOM.localitySelect) {
      DOM.localitySelect.value = locParam.toLowerCase();
    }

    if (queryParam && DOM.searchInput) {
      DOM.searchInput.value = queryParam;
    }
  }

  async function init() {
    if (!DOM.container) return;

    try {
      const res = await fetch('/data/properties.json');
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: Failed to fetch /data/properties.json`);
      }

      propertiesData = await res.json();
      bindEvents();
      syncURLParameters();
      applyFilters();
    } catch (err) {
      console.error('Properties load error:', err);
      DOM.container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; background: var(--card, #FFF); border-radius: 16px; border: 1.5px solid var(--border);">
          <div style="font-size: 40px; margin-bottom: 12px;">⚠️</div>
          <h3 style="font-size: 18px; margin-bottom: 8px;">Unable to load property catalog</h3>
          <p style="font-size: 13.5px; color: var(--text-muted); max-width: 480px; margin: 0 auto 16px;">
            ${err.message.includes('Failed to fetch')
              ? 'If testing locally, please run through a local server (e.g., Live Server or "npx serve") instead of opening file:// directly.'
              : 'Could not fetch /data/properties.json. Verify that the file is located in your public/data/ folder.'}
          </p>
          <a href="tel:+919326990050" class="btn btn-primary btn-sm">📞 Call Desk (+919326990050)</a>
        </div>
      `;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();