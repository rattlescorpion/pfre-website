/* =====================================================
   PROPERTY FINDER REAL ESTATE — Client-Side Property Filter v3.0
   Universal Compatibility: Dynamic JSON & Static DOM Listings
   Zero-Collision Sorting, Observer-Safe, Full URL Sync
   ===================================================== */
(() => {
  'use strict';

  let isMutatingDOM = false;
  let observer = null;

  /* ── DOM Ready Utility ── */
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* ── Debounce Utility ── */
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  /* ── String & Number Sanitizers ── */
  function normalizeText(str) {
    return (str || '').toLowerCase().trim();
  }

  function cleanNumber(val) {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const num = parseFloat(String(val).replace(/,/g, '').replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  /* ── Helper: Resolve Top-Level Grid Item (Prevents Link Detachment) ── */
  function getGridItem(card) {
    return card.closest('.prop-card-link') || card;
  }

  /* ══════════════════════════════════════════════
     1. CARD ENRICHMENT ENGINE
  ═══════════════════════════════════════════════ */
  function enrichCards() {
    const cards = document.querySelectorAll('.prop-card');

    cards.forEach(card => {
      if (card.dataset.enriched === 'true') return;
      card.dataset.enriched = 'true';

      const fullText = normalizeText(card.textContent);
      const name = normalizeText(card.querySelector('.prop-name, .prop-title, h3')?.textContent);
      const locText = normalizeText(card.querySelector('.prop-loc, .property-location')?.textContent);

      /* Preserve pre-populated data attributes from load-properties.js if present */
      if (!card.dataset.intent) {
        const badgeTxt = normalizeText(card.querySelector('.badge')?.textContent);
        if (badgeTxt.includes('rent') || fullText.includes('/ month') || fullText.includes('/mo')) {
          card.dataset.intent = 'rent';
        } else if (badgeTxt.includes('commercial') || fullText.includes('office') || fullText.includes('shop')) {
          card.dataset.intent = 'commercial';
        } else {
          card.dataset.intent = 'buy';
        }
      }

      if (!card.dataset.bhk) {
        const bhkMatch = (name + ' ' + fullText).match(/(\d+)\s*(bhk|bed|beds)/i);
        card.dataset.bhk = bhkMatch ? bhkMatch[1] : '';
      }

      if (!card.dataset.proptype) {
        let propType = 'flat';
        if (fullText.includes('row house')) propType = 'row house';
        else if (fullText.includes('bungalow') || fullText.includes('villa')) propType = 'bungalow';
        else if (fullText.includes('plot') || fullText.includes('land')) propType = 'plot';
        else if (fullText.includes('commercial') || fullText.includes('office') || fullText.includes('shop')) propType = 'commercial';
        card.dataset.proptype = propType;
      }

      if (!card.dataset.use) {
        card.dataset.use = (card.dataset.proptype === 'commercial' || card.dataset.intent === 'commercial') ? 'commercial' : 'residential';
      }

      if (!card.dataset.locality) {
        card.dataset.locality = locText.replace(/^📍\s*/, '');
      }

      if (!card.dataset.price || card.dataset.price === '0') {
        const priceEl = card.querySelector('.prop-price');
        if (priceEl) {
          const rawPrice = priceEl.textContent;
          const val = cleanNumber(rawPrice);

          if (rawPrice.includes('Cr')) {
            card.dataset.price = String(Math.round(val * 10000000));
          } else if (rawPrice.includes('Lakh') || rawPrice.includes('L')) {
            card.dataset.price = String(Math.round(val * 100000));
          } else {
            card.dataset.price = String(val);
          }
        } else {
          card.dataset.price = '0';
        }
      }

      if (!card.dataset.area || card.dataset.area === '0') {
        const areaMatch = card.textContent.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft)/i);
        card.dataset.area = areaMatch ? String(cleanNumber(areaMatch[1])) : '0';
      }
    });
  }

  /* ══════════════════════════════════════════════
     2. FILTER & SORT LOGIC
  ═══════════════════════════════════════════════ */
  function getScopedChecked(container, filterType) {
    if (!container) return [];
    const selectors = [
      `[data-filter="${filterType}"] input[type="checkbox"]:checked`,
      `input[type="checkbox"][data-filter="${filterType}"]:checked`,
      `.filter-group[data-filter="${filterType}"] input[type="checkbox"]:checked`
    ];
    return [...container.querySelectorAll(selectors.join(','))].map(cb => {
      const val = cb.dataset.value || cb.value || cb.closest('label')?.textContent || '';
      return normalizeText(val);
    }).filter(Boolean);
  }

  function applyFilters() {
    const cards = document.querySelectorAll('.prop-card');
    if (!cards.length) return;

    const grid = cards[0].closest('#propertiesContainer, .prop-grid-4, .prop-grid, .properties-grid');
    if (!grid) return;

    /* ── A. Resolve Active Purpose (Tabs / Pills) ── */
    const activePill = document.querySelector('#intentFilters .filter-pill.active, [data-filter-intent].active');
    const activeTab = document.querySelector('.filter-tab.active, .search-tab.active');
    const intentFilter = normalizeText(
      activePill?.dataset.filterIntent ||
      activeTab?.dataset.type ||
      activeTab?.textContent ||
      'all'
    );

    /* ── B. Resolve Configuration (BHK) ── */
    const activeBhkPill = document.querySelector('#bhkFilters .filter-pill.active, [data-filter-bhk].active');
    const activeBhk = normalizeText(activeBhkPill?.dataset.filterBhk || 'all');

    /* ── C. Resolve Locality ── */
    const localitySelect = document.getElementById('localitySelect') || document.querySelector('[data-filter="locality"]');
    const selectedLocality = normalizeText(localitySelect?.value || 'all');

    /* ── D. Resolve Sidebar Checkboxes & Price Ranges ── */
    const sidebar = document.querySelector('#filterSidebar, .filter-sidebar, .sidebar');
    const checkedTypes = getScopedChecked(sidebar, 'type');
    const checkedBHK = getScopedChecked(sidebar, 'bhk');
    const checkedUse = getScopedChecked(sidebar, 'use');

    const minPriceInput = sidebar?.querySelector('.range-input:first-of-type, [data-filter-min="price"], #minPrice');
    const maxPriceInput = sidebar?.querySelector('.range-input:last-of-type, [data-filter-max="price"], #maxPrice');
    const minPrice = cleanNumber(minPriceInput?.value) || 0;
    const maxPrice = cleanNumber(maxPriceInput?.value) || Infinity;

    /* ── E. Resolve Search & Sort ── */
    const searchInp = document.getElementById('propertySearchInput') || document.querySelector('.search-input-wrap input, .prop-search-input');
    const query = normalizeText(searchInp?.value);

    const sortSelect = document.getElementById('sortSelect') || document.querySelector('.main-col select, .sort-select, #sortProperties');
    const sortVal = sortSelect?.value || 'featured';

    let visibleCount = 0;
    const cardItems = [];

    cards.forEach(card => {
      const itemWrapper = getGridItem(card);
      const intent   = normalizeText(card.dataset.intent);
      const bhk      = normalizeText(card.dataset.bhk);
      const propType = normalizeText(card.dataset.proptype);
      const use      = normalizeText(card.dataset.use);
      const locality = normalizeText(card.dataset.locality);
      const price    = cleanNumber(card.dataset.price);
      const name     = normalizeText(card.querySelector('.prop-name, .prop-title, h3')?.textContent);
      const locText  = normalizeText(card.querySelector('.prop-loc, .property-location')?.textContent);

      let show = true;

      /* 1. Purpose / Intent */
      if (intentFilter !== 'all') {
        if (intentFilter === 'buy' && intent !== 'buy') show = false;
        else if (intentFilter === 'rent' && intent !== 'rent') show = false;
        else if (intentFilter === 'commercial' && intent !== 'commercial' && use !== 'commercial') show = false;
      }

      /* 2. BHK (Pills + Checkboxes) */
      if (show && activeBhk !== 'all') {
        if (activeBhk === '4') {
          if (!cleanNumber(bhk) || cleanNumber(bhk) < 4) show = false;
        } else if (bhk !== activeBhk) {
          show = false;
        }
      }
      if (show && checkedBHK.length) {
        if (!checkedBHK.some(b => b.includes(bhk) || bhk === b.replace(/[^0-9]/g, ''))) show = false;
      }

      /* 3. Locality */
      if (show && selectedLocality !== 'all') {
        if (!locality.includes(selectedLocality) && !locText.includes(selectedLocality)) show = false;
      }

      /* 4. Sub-type & Use */
      if (show && checkedTypes.length) {
        if (!checkedTypes.some(t => propType.includes(t) || t.includes(propType))) show = false;
      }
      if (show && checkedUse.length) {
        if (!checkedUse.some(u => use.includes(u))) show = false;
      }

      /* 5. Price Range */
      if (show && price > 0) {
        if (minPrice > 0 && price < minPrice) show = false;
        if (maxPrice < Infinity && price > maxPrice) show = false;
      }

      /* 6. Text Search */
      if (show && query) {
        const blob = `${name} ${locText} ${locality} ${bhk} ${propType}`.toLowerCase();
        if (!blob.includes(query)) show = false;
      }

      /* Toggle grid item directly (preserves <a> layout) */
      itemWrapper.style.display = show ? '' : 'none';
      if (show) {
        visibleCount++;
        cardItems.push({ itemWrapper, card });
      }
    });

    /* Sort visible items safely */
    sortGridItems(cardItems, sortVal, grid);

    /* Update Count */
    updateCountDisplay(visibleCount, cards.length);

    /* Update Empty State */
    updateEmptyState(visibleCount, grid);
  }

  /* ── Safe Sort: Moves the top-level grid item without breaking children ── */
  function sortGridItems(cardItems, sortVal, grid) {
    if (!cardItems.length) return;
    const s = normalizeText(sortVal);

    cardItems.sort((a, b) => {
      const pA = cleanNumber(a.card.dataset.price);
      const pB = cleanNumber(b.card.dataset.price);
      const aA = cleanNumber(a.card.dataset.area);
      const bA = cleanNumber(b.card.dataset.area);

      if (s.includes('price-asc') || s.includes('low to high') || s.includes('asc')) return pA - pB;
      if (s.includes('price-desc') || s.includes('high to low') || s.includes('desc')) return pB - pA;
      if (s.includes('area-desc') || s.includes('largest') || s.includes('area')) return bA - aA;
      return 0;
    });

    /* Disconnect observer temporarily to prevent infinite MutationObserver reflow loop */
    isMutatingDOM = true;
    if (observer) observer.disconnect();

    const fragment = document.createDocumentFragment();
    cardItems.forEach(entry => fragment.appendChild(entry.itemWrapper));
    grid.appendChild(fragment);

    if (observer) {
      observer.observe(grid, { childList: true });
    }
    isMutatingDOM = false;
  }

  function updateCountDisplay(visible, total) {
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
      countEl.textContent = `Showing ${visible} of ${total} Active Listings`;
      return;
    }

    const countStrong = document.querySelector('.results-count strong, .filter-results-count strong');
    if (countStrong) countStrong.textContent = visible;

    const countContainer = document.querySelector('.filter-results-count');
    if (countContainer && !countStrong) {
      countContainer.textContent = `Showing ${visible} properties`;
    }
  }

  function updateEmptyState(visible, grid) {
    let noRes = document.getElementById('noResults');
    if (!noRes) {
      noRes = document.createElement('div');
      noRes.id = 'noResults';
      noRes.className = 'empty-state';
      noRes.style.textAlign = 'center';
      noRes.style.padding = '60px 20px';
      noRes.innerHTML = `
        <div style="font-size:48px;margin-bottom:12px">🔍</div>
        <h3 style="font-size:20px;margin-bottom:8px">No matching properties found</h3>
        <p style="color:var(--text-muted,#64748b);font-size:14px;max-width:440px;margin:0 auto 20px">
          Try broadening your criteria or reset your filters.
        </p>
      `;
      grid.parentNode.insertBefore(noRes, grid.nextSibling);
    }

    noRes.style.display = visible === 0 ? 'block' : 'none';
  }

  /* ══════════════════════════════════════════════
     3. STATE & URL SYNC
  ═══════════════════════════════════════════════ */
  function resetFilters() {
    /* Reset Pills */
    document.querySelectorAll('#intentFilters .filter-pill, [data-filter-intent]').forEach(p => p.classList.remove('active'));
    document.querySelector('#intentFilters .filter-pill[data-filter-intent="all"], [data-filter-intent="all"]')?.classList.add('active');

    document.querySelectorAll('#bhkFilters .filter-pill, [data-filter-bhk]').forEach(p => p.classList.remove('active'));
    document.querySelector('#bhkFilters .filter-pill[data-filter-bhk="all"], [data-filter-bhk="all"]')?.classList.add('active');

    /* Reset Dropdowns */
    const locSelect = document.getElementById('localitySelect');
    if (locSelect) locSelect.value = 'all';

    const sortSelect = document.getElementById('sortSelect') || document.querySelector('.main-col select, .sort-select');
    if (sortSelect) sortSelect.selectedIndex = 0;

    /* Reset Search */
    const searchInp = document.getElementById('propertySearchInput') || document.querySelector('.search-input-wrap input');
    if (searchInp) searchInp.value = '';

    /* Reset Sidebar Checkboxes & Numbers */
    const sidebar = document.querySelector('#filterSidebar, .filter-sidebar, .sidebar');
    if (sidebar) {
      sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = cb.dataset.default === 'true';
      });
      sidebar.querySelectorAll('.range-input, input[type="number"]').forEach(inp => {
        inp.value = '';
      });
    }

    applyFilters();
  }

  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const q        = params.get('q');
    const intent   = params.get('intent') || params.get('type');
    const bhk      = params.get('bhk');
    const locality = params.get('locality');

    if (q) {
      const inp = document.getElementById('propertySearchInput') || document.querySelector('.search-input-wrap input');
      if (inp) inp.value = q;
    }

    if (intent) {
      const cleanIntent = normalizeText(intent);
      const pill = document.querySelector(`[data-filter-intent="${cleanIntent}"]`);
      if (pill) {
        document.querySelectorAll('#intentFilters .filter-pill, [data-filter-intent]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      }
    }

    if (bhk) {
      const cleanBhk = bhk.replace(/[^0-9]/g, '');
      const pill = document.querySelector(`[data-filter-bhk="${cleanBhk}"]`);
      if (pill) {
        document.querySelectorAll('#bhkFilters .filter-pill, [data-filter-bhk]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      }
    }

    if (locality) {
      const locSelect = document.getElementById('localitySelect');
      if (locSelect) locSelect.value = locality.toLowerCase();
    }
  }

  /* ══════════════════════════════════════════════
     4. INITIALIZATION & LISTENERS
  ═══════════════════════════════════════════════ */
  function initFilter() {
    const grid = document.querySelector('#propertiesContainer, .prop-grid-4, .prop-grid, .properties-grid');
    if (!grid) return;

    enrichCards();
    applyUrlParams();

    /* Purpose Pills & Tabs */
    document.querySelectorAll('#intentFilters .filter-pill, [data-filter-intent], .filter-tab, .search-tab').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        const group = pill.closest('#intentFilters') || pill.parentElement;
        group?.querySelectorAll('.filter-pill, .filter-tab, .search-tab').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        applyFilters();
      });
    });

    /* BHK Pills */
    document.querySelectorAll('#bhkFilters .filter-pill, [data-filter-bhk]').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        const group = pill.closest('#bhkFilters') || pill.parentElement;
        group?.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        applyFilters();
      });
    });

    /* Locality & Sort Selects */
    document.getElementById('localitySelect')?.addEventListener('change', applyFilters);
    (document.getElementById('sortSelect') || document.querySelector('.sort-select'))?.addEventListener('change', applyFilters);

    /* Search Input (Debounced) */
    const searchInp = document.getElementById('propertySearchInput') || document.querySelector('.search-input-wrap input');
    if (searchInp) {
      searchInp.addEventListener('input', debounce(applyFilters, 180));
    }

    /* Reset Buttons */
    document.getElementById('resetFiltersBtn')?.addEventListener('click', resetFilters);
    document.querySelectorAll('.btn-reset, .apply-btn').forEach(btn => {
      if (normalizeText(btn.textContent).includes('reset')) {
        btn.addEventListener('click', (e) => { e.preventDefault(); resetFilters(); });
      }
    });

    /* Sidebar Checkboxes & Range Sliders */
    const sidebar = document.querySelector('#filterSidebar, .filter-sidebar, .sidebar');
    if (sidebar) {
      sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', applyFilters);
      });
      sidebar.querySelectorAll('.range-input, input[type="number"]').forEach(inp => {
        inp.addEventListener('input', debounce(applyFilters, 250));
      });
    }

    /* Safe MutationObserver for Dynamic Injections */
    if (!observer) {
      observer = new MutationObserver(() => {
        if (isMutatingDOM) return;
        enrichCards();
        applyFilters();
      });
      observer.observe(grid, { childList: true });
    }

    applyFilters();
  }

  /* ── Global API Export ── */
  window.PFREPropertyFilter = {
    init: initFilter,
    apply: applyFilters,
    reset: resetFilters,
    refresh: () => { enrichCards(); applyFilters(); }
  };

  onReady(initFilter);
})();