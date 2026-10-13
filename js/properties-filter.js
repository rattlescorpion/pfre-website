/**
 * js/properties-filter.js
 * Property Finder Real Estate - Mumbai
 * Multi-Facet Filter Engine & Catalog Synchronization
 */

(function (window, document) {
  'use strict';

  const filterState = {
    intent: 'all',
    bhk: [],
    locality: 'all',
    minPrice: 0,
    maxPrice: 0,
    keyword: ''
  };

  let debounceTimer = null;

  function parseUrlParameters() {
    const params = new URLSearchParams(window.location.search);

    if (params.has('type')) {
      const type = params.get('type').toLowerCase();
      if (['buy', 'rent', 'commercial'].includes(type)) {
        filterState.intent = type;
      }
    }

    if (params.has('locality')) {
      filterState.locality = params.get('locality');
    }

    if (params.has('bhk')) {
      const rawBhk = params.get('bhk').split(',').map(Number).filter(n => !isNaN(n));
      if (rawBhk.length > 0) {
        filterState.bhk = rawBhk;
      }
    }

    if (params.has('q')) {
      filterState.keyword = params.get('q').trim();
    }
  }

  function syncControlsWithState() {
    const intentPills = document.querySelectorAll('.filter-pill[data-intent]');
    intentPills.forEach(pill => {
      const val = pill.getAttribute('data-intent');
      pill.classList.toggle('active', val === filterState.intent);
    });

    const bhkCheckboxes = document.querySelectorAll('input[type="checkbox"][name="filterBhk"]');
    bhkCheckboxes.forEach(cb => {
      cb.checked = filterState.bhk.includes(Number(cb.value));
    });

    const localitySelect = document.getElementById('filterLocalitySelect');
    if (localitySelect && filterState.locality !== 'all') {
      localitySelect.value = filterState.locality;
    }

    const keywordInput = document.getElementById('propertySearchInput') || document.getElementById('catalogSearch');
    if (keywordInput && filterState.keyword) {
      keywordInput.value = filterState.keyword;
    }

    const maxPriceInput = document.getElementById('filterMaxPrice');
    if (maxPriceInput && filterState.maxPrice > 0) {
      maxPriceInput.value = filterState.maxPrice;
    }
  }

  function applyFilters() {
    const properties = window.allPropertiesCache || [];
    if (!Array.isArray(properties) || properties.length === 0) return;

    const filtered = properties.filter(item => {
      if (filterState.intent !== 'all') {
        const itemIntent = (item.intent || 'buy').toLowerCase();
        if (itemIntent !== filterState.intent) return false;
      }

      if (filterState.bhk.length > 0) {
        const itemBhk = Number(item.bhk) || 0;
        if (!filterState.bhk.includes(itemBhk)) return false;
      }

      if (filterState.locality !== 'all' && filterState.locality !== '') {
        const itemLocality = (item.locality || '').toLowerCase();
        const targetLocality = filterState.locality.toLowerCase();
        if (!itemLocality.includes(targetLocality)) return false;
      }

      const price = Number(item.priceNumeric) || 0;
      if (filterState.minPrice > 0 && price < filterState.minPrice) return false;
      if (filterState.maxPrice > 0 && price > filterState.maxPrice) return false;

      if (filterState.keyword.trim() !== '') {
        const q = filterState.keyword.toLowerCase();
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const addressMatch = (item.address || '').toLowerCase().includes(q);
        const localityMatch = (item.locality || '').toLowerCase().includes(q);
        if (!titleMatch && !addressMatch && !localityMatch) return false;
      }

      return true;
    });

    window.filteredPropertiesCache = filtered;

    const event = new CustomEvent('pfre:properties-filtered', {
      detail: {
        filtered: filtered,
        total: filtered.length,
        criteria: { ...filterState }
      }
    });
    window.dispatchEvent(event);

    updateUrlHistory();
  }

  function updateUrlHistory() {
    const params = new URLSearchParams();

    if (filterState.intent !== 'all') params.set('type', filterState.intent);
    if (filterState.locality !== 'all' && filterState.locality !== '') params.set('locality', filterState.locality);
    if (filterState.bhk.length > 0) params.set('bhk', filterState.bhk.join(','));
    if (filterState.keyword) params.set('q', filterState.keyword);

    const queryString = params.toString();
    const newUrl = window.location.pathname + (queryString ? '?' + queryString : '');
    window.history.replaceState({}, '', newUrl);
  }

  function resetFilters() {
    filterState.intent = 'all';
    filterState.bhk = [];
    filterState.locality = 'all';
    filterState.minPrice = 0;
    filterState.maxPrice = 0;
    filterState.keyword = '';

    syncControlsWithState();
    applyFilters();
  }

  function bindEvents() {
    document.querySelectorAll('.filter-pill[data-intent]').forEach(pill => {
      pill.addEventListener('click', function () {
        document.querySelectorAll('.filter-pill[data-intent]').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        filterState.intent = this.getAttribute('data-intent') || 'all';
        applyFilters();
      });
    });

    document.querySelectorAll('input[type="checkbox"][name="filterBhk"]').forEach(cb => {
      cb.addEventListener('change', function () {
        const val = Number(this.value);
        if (this.checked) {
          if (!filterState.bhk.includes(val)) filterState.bhk.push(val);
        } else {
          filterState.bhk = filterState.bhk.filter(n => n !== val);
        }
        applyFilters();
      });
    });

    const localitySelect = document.getElementById('filterLocalitySelect');
    if (localitySelect) {
      localitySelect.addEventListener('change', function (e) {
        filterState.locality = e.target.value;
        applyFilters();
      });
    }

    const keywordInput = document.getElementById('propertySearchInput') || document.getElementById('catalogSearch');
    if (keywordInput) {
      keywordInput.addEventListener('input', function (e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          filterState.keyword = e.target.value;
          applyFilters();
        }, 250);
      });
    }

    const maxPriceInput = document.getElementById('filterMaxPrice');
    if (maxPriceInput) {
      maxPriceInput.addEventListener('change', function (e) {
        filterState.maxPrice = Number(e.target.value) || 0;
        applyFilters();
      });
    }

    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetFilters);
    }

    const mobileFilterOpenBtn = document.getElementById('openMobileFilterBtn');
    const mobileFilterCloseBtn = document.getElementById('closeMobileFilterBtn');
    const filterSidebar = document.querySelector('.filter-sidebar');

    if (mobileFilterOpenBtn && filterSidebar) {
      mobileFilterOpenBtn.addEventListener('click', function () {
        filterSidebar.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }

    if (mobileFilterCloseBtn && filterSidebar) {
      mobileFilterCloseBtn.addEventListener('click', function () {
        filterSidebar.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
  }

  function init() {
    parseUrlParameters();
    bindEvents();
    syncControlsWithState();

    if (window.allPropertiesCache && window.allPropertiesCache.length > 0) {
      applyFilters();
    } else {
      setTimeout(applyFilters, 150);
    }
  }

  window.pfreFilter = {
    init: init,
    apply: applyFilters,
    reset: resetFilters,
    getState: () => ({ ...filterState })
  };

  document.addEventListener('DOMContentLoaded', init);
})(window, document);