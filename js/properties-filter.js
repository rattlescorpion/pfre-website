/* =====================================================
   PROPERTY FINDER RE — Client-Side Property Filter v2.0
   Reads data-* attributes from .prop-card elements
   and filters/sorts them based on sidebar & search inputs
   ===================================================== */
(() => {
  'use strict';

  let isSorting = false;
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

  /* ── Clean String Helpers ── */
  function normalizeText(str) {
    return (str || '').toLowerCase().trim();
  }

  function cleanNumber(str) {
    if (!str) return 0;
    const num = parseFloat(String(str).replace(/,/g, '').replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
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
      const name = normalizeText(card.querySelector('.prop-name')?.textContent);

      /* Intent (buy / rent / commercial) */
      const badgeTxt = normalizeText(card.querySelector('.badge')?.textContent);
      if (badgeTxt.includes('rent') || fullText.includes('/ month') || fullText.includes('/mo')) {
        card.dataset.intent = 'rent';
      } else if (badgeTxt.includes('commercial') || fullText.includes('office') || fullText.includes('shop')) {
        card.dataset.intent = 'commercial';
      } else {
        card.dataset.intent = 'buy';
      }

      /* BHK Configuration */
      const bhkMatch = (name + ' ' + fullText).match(/(\d+)\s*(bhk|bed|beds)/i);
      if (bhkMatch) {
        card.dataset.bhk = bhkMatch[1];
      } else {
        card.dataset.bhk = '';
      }

      /* Property & Building Type */
      let propType = 'flat';
      if (fullText.includes('row house')) propType = 'row house';
      else if (fullText.includes('bungalow') || fullText.includes('villa')) propType = 'bungalow';
      else if (fullText.includes('plot') || fullText.includes('land')) propType = 'plot';
      else if (fullText.includes('commercial') || fullText.includes('office') || fullText.includes('showroom')) propType = 'commercial';
      card.dataset.proptype = propType;

      let building = 'private';
      if (fullText.includes('mhada')) building = 'mhada';
      else if (fullText.includes('sra')) building = 'sra';
      else if (fullText.includes('collector')) building = 'collector';
      card.dataset.building = building;

      card.dataset.use = (propType === 'commercial' || card.dataset.intent === 'commercial') ? 'commercial' : 'residential';

      /* Price Normalization */
      const priceEl = card.querySelector('.prop-price');
      if (priceEl) {
        const rawPrice = priceEl.textContent;
        const val = cleanNumber(rawPrice);

        if (rawPrice.includes('Cr')) {
          card.dataset.price = String(Math.round(val * 10000000));
        } else if (rawPrice.includes('L')) {
          card.dataset.price = String(Math.round(val * 100000));
        } else if (rawPrice.includes('/ month') || rawPrice.includes('/mo') || rawPrice.includes('month')) {
          card.dataset.price = String(val); // Keep rent as exact monthly value
          card.dataset.isRent = 'true';
        } else {
          card.dataset.price = String(val);
        }
      } else {
        card.dataset.price = '0';
      }

      /* Built-up / Carpet Area */
      const areaMatch = card.textContent.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft)/i);
      if (areaMatch) {
        card.dataset.area = String(cleanNumber(areaMatch[1]));
      } else {
        card.dataset.area = '0';
      }
    });
  }

  /* ══════════════════════════════════════════════
     2. FILTER & SORT LOGIC
  ═══════════════════════════════════════════════ */
  function getScopedChecked(sidebar, filterType) {
    if (!sidebar) return [];
    const selectors = [
      `[data-filter="${filterType}"] input[type="checkbox"]:checked`,
      `input[type="checkbox"][data-filter="${filterType}"]:checked`,
      `.filter-group[data-filter="${filterType}"] input[type="checkbox"]:checked`
    ];
    const inputs = [...sidebar.querySelectorAll(selectors.join(','))];

    return inputs.map(cb => {
      const val = cb.dataset.value || cb.value || cb.closest('label')?.textContent || '';
      return normalizeText(val);
    }).filter(Boolean);
  }

  function applyFilters() {
    const cards = document.querySelectorAll('.prop-card');
    const grid = cards[0]?.closest('.prop-grid-4, .prop-grid, .properties-grid');
    if (!grid || !cards.length) return;

    const sidebar = document.querySelector('.sidebar');
    const activeTabEl = document.querySelector('.filter-tab.active, .search-tab.active');
    const activeTab = normalizeText(activeTabEl?.dataset.type || activeTabEl?.textContent || 'all');

    const checkedTypes    = getScopedChecked(sidebar, 'type');
    const checkedBHK      = getScopedChecked(sidebar, 'bhk');
    const checkedBuilding = getScopedChecked(sidebar, 'building');
    const checkedUse      = getScopedChecked(sidebar, 'use');

    const minPriceInput = sidebar?.querySelector('.range-input:first-of-type, [data-filter-min="price"], #minPrice');
    const maxPriceInput = sidebar?.querySelector('.range-input:last-of-type, [data-filter-max="price"], #maxPrice');
    const minPrice = cleanNumber(minPriceInput?.value) || 0;
    const maxPrice = cleanNumber(maxPriceInput?.value) || Infinity;

    const searchInp = document.querySelector('.search-input-wrap input, #propertySearchInput, .prop-search-input');
    const query = normalizeText(searchInp?.value);

    const sortSelect = document.querySelector('.main-col select, .sort-select, #sortProperties');
    const sortVal = sortSelect?.value || 'newest';

    let visible = 0;
    const cardArray = Array.from(cards);

    cardArray.forEach(card => {
      const intent   = normalizeText(card.dataset.intent);
      const bhk      = normalizeText(card.dataset.bhk);
      const propType = normalizeText(card.dataset.proptype);
      const building = normalizeText(card.dataset.building);
      const use      = normalizeText(card.dataset.use);
      const price    = cleanNumber(card.dataset.price);
      const name     = normalizeText(card.querySelector('.prop-name')?.textContent);
      const loc      = normalizeText(card.querySelector('.prop-loc')?.textContent);

      let show = true;

      /* Intent tab filter */
      if (activeTab && activeTab !== 'all') {
        if (activeTab.includes('buy') && intent !== 'buy') show = false;
        else if (activeTab.includes('rent') && intent !== 'rent') show = false;
        else if (activeTab.includes('commercial') && intent !== 'commercial' && use !== 'commercial') show = false;
      }

      /* Property Type checkbox filter */
      if (show && checkedTypes.length) {
        if (!checkedTypes.some(t => propType.includes(t) || t.includes(propType))) show = false;
      }

      /* BHK checkbox filter */
      if (show && checkedBHK.length) {
        if (!checkedBHK.some(b => b.includes(bhk) || bhk === b.replace(/[^0-9]/g, ''))) show = false;
      }

      /* Building Type checkbox filter */
      if (show && checkedBuilding.length) {
        if (!checkedBuilding.some(b => building.includes(b))) show = false;
      }

      /* Property Use checkbox filter */
      if (show && checkedUse.length) {
        if (!checkedUse.some(u => use.includes(u))) show = false;
      }

      /* Numeric Price filter */
      if (show && price > 0) {
        if (minPrice > 0 && price < minPrice) show = false;
        if (maxPrice < Infinity && price > maxPrice) show = false;
      }

      /* Inline Search Query (Name or Locality) */
      if (show && query) {
        show = name.includes(query) || loc.includes(query);
      }

      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    /* Sort visible listings */
    const visibleCards = cardArray.filter(c => c.style.display !== 'none');
    sortCards(visibleCards, sortVal, grid);

    /* Update Count Displays */
    const countStrong = document.querySelector('.results-count strong, .filter-results-count strong');
    if (countStrong) countStrong.textContent = visible;

    const countContainer = document.querySelector('.filter-results-count');
    if (countContainer && !countStrong) {
      countContainer.textContent = `Showing ${visible} properties`;
    }

    /* Empty state display */
    let noRes = document.getElementById('noResults');
    if (!noRes) {
      noRes = document.createElement('div');
      noRes.id = 'noResults';
      noRes.className = 'empty-state';
      noRes.innerHTML = `
        <div class="empty-icon" style="font-size:48px;text-align:center;margin-bottom:12px">🔍</div>
        <h3 style="text-align:center;margin-bottom:6px">No properties match your filters</h3>
        <p style="text-align:center;color:var(--text-muted,#64748b)">Try adjusting your search criteria or <a href="contact.html" style="color:var(--blue,#2563eb)">contact us</a> for custom assistance.</p>
      `;
      grid.parentNode.insertBefore(noRes, grid.nextSibling);
    }
    noRes.style.display = visible === 0 ? 'block' : 'none';
    grid.style.display  = visible === 0 ? 'none'  : '';
  }

  /* ── Sort Helper with Loop Guard ── */
  function sortCards(cards, sortVal, grid) {
    if (!cards.length) return;
    const s = normalizeText(sortVal);

    const sorted = [...cards].sort((a, b) => {
      const pA = cleanNumber(a.dataset.price);
      const pB = cleanNumber(b.dataset.price);
      const aA = cleanNumber(a.dataset.area);
      const bA = cleanNumber(b.dataset.area);

      if (s.includes('low to high') || s.includes('asc')) return pA - pB;
      if (s.includes('high to low') || s.includes('desc')) return pB - pA;
      if (s.includes('largest') || s.includes('area')) return bA - aA;
      return 0; // Default order
    });

    isSorting = true;
    const fragment = document.createDocumentFragment();
    sorted.forEach(card => fragment.appendChild(card));
    grid.appendChild(fragment);
    isSorting = false;
  }

  /* ══════════════════════════════════════════════
     3. PRESETS & STATE MANAGEMENT
  ═══════════════════════════════════════════════ */
  function resetFilters() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = cb.dataset.default === 'true';
      });
      sidebar.querySelectorAll('.range-input, input[type="number"]').forEach(inp => {
        inp.value = '';
      });
    }

    const searchInp = document.querySelector('.search-input-wrap input, #propertySearchInput');
    if (searchInp) searchInp.value = '';

    const sortSelect = document.querySelector('.main-col select, .sort-select');
    if (sortSelect) sortSelect.selectedIndex = 0;

    const tabs = document.querySelectorAll('.filter-tab, .search-tab');
    if (tabs.length) {
      tabs.forEach(t => t.classList.remove('active'));
      tabs[0].classList.add('active');
    }

    applyFilters();
  }

  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const q    = params.get('q');
    const type = params.get('type');
    const bhk  = params.get('bhk');

    if (q) {
      const inp = document.querySelector('.search-input-wrap input, #propertySearchInput');
      if (inp) inp.value = q;
    }

    if (type) {
      const cleanType = normalizeText(type);
      document.querySelectorAll('.filter-tab, .search-tab').forEach(tab => {
        const tabType = normalizeText(tab.dataset.type || tab.textContent);
        if (tabType.includes(cleanType) || cleanType.includes(tabType)) {
          document.querySelectorAll('.filter-tab, .search-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        }
      });
    }

    if (bhk) {
      const targetBHK = bhk.replace(/[^0-9]/g, '');
      document.querySelectorAll('.sidebar input[type="checkbox"]').forEach(cb => {
        const label = normalizeText(cb.closest('label')?.textContent || cb.value);
        if (label.includes(`${targetBHK} bhk`) || label.startsWith(targetBHK)) {
          cb.checked = true;
        }
      });
    }
  }

  /* ══════════════════════════════════════════════
     4. INITIALIZATION & EVENT BINDINGS
  ═══════════════════════════════════════════════ */
  function initFilter() {
    const mainCol = document.querySelector('.main-col, .properties-content');
    const grid = document.querySelector('.prop-grid-4, .prop-grid, .properties-grid');
    if (!mainCol && !grid) return;

    enrichCards();
    applyUrlParams();

    /* Tab Switch Event */
    document.querySelectorAll('.filter-tab, .search-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.filter-tab, .search-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        applyFilters();
      });
    });

    /* Sidebar Checkbox & Range Input Events */
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', applyFilters);
      });

      sidebar.querySelectorAll('.apply-btn, .btn-apply').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (normalizeText(btn.textContent).includes('reset')) {
            resetFilters();
          } else {
            applyFilters();
          }
        });
      });

      sidebar.querySelectorAll('.range-input, input[type="number"]').forEach(inp => {
        inp.addEventListener('input', debounce(applyFilters, 300));
      });
    }

    /* Sort Dropdown Event */
    const sortSelect = document.querySelector('.main-col select, .sort-select');
    sortSelect?.addEventListener('change', applyFilters);

    /* Search Input Event */
    const searchInp = document.querySelector('.search-input-wrap input, #propertySearchInput');
    if (searchInp) {
      searchInp.addEventListener('input', debounce(applyFilters, 250));
    }

    /* Safe MutationObserver Setup */
    if (grid && !observer) {
      observer = new MutationObserver(() => {
        if (isSorting) return; // Prevent infinite re-sort loop
        enrichCards();
        applyFilters();
      });
      observer.observe(grid, { childList: true });
    }

    applyFilters();
  }

  /* ── Export API & Initialize on Safe Ready State ── */
  window.PFREPropertyFilter = {
    apply: applyFilters,
    reset: resetFilters,
    refresh: () => { enrichCards(); applyFilters(); }
  };

  onReady(initFilter);
})();