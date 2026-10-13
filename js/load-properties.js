/**
 * js/load-properties.js
 * Property Finder Real Estate - Mumbai
 * Property Catalog Loader, Sorter & Card Renderer
 */

(function (window, document) {
  'use strict';

  let propertiesCache = [];
  let currentPage = 1;
  const itemsPerPage = 9;

  function formatPriceInr(val) {
    if (!val || isNaN(val)) return 'Price on Request';
    const num = Number(val);
    if (num >= 10000000) {
      const cr = num / 10000000;
      return '₹' + (cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)) + ' Cr';
    }
    if (num >= 100000) {
      const lk = num / 100000;
      return '₹' + (lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(2)) + ' Lakh';
    }
    return '₹' + num.toLocaleString('en-IN');
  }

  function getCategoryBadge(intent) {
    const type = (intent || 'buy').toLowerCase();
    if (type === 'rent') {
      return '<span class="badge badge-amber">For Rent</span>';
    }
    if (type === 'commercial') {
      return '<span class="badge badge-purple">Commercial</span>';
    }
    return '<span class="badge badge-blue">For Sale</span>';
  }

  function createPropertyCard(item) {
    const firstImg = item.images && item.images.length > 0 ? item.images[0] : '/images/og-banner.jpg';
    const displayPrice = item.priceDisplay || formatPriceInr(item.priceNumeric);
    const detailLink = `property-detail.html?id=${encodeURIComponent(item.id)}`;
    const phone = window.PFRE_CONFIG ? window.PFRE_CONFIG.BRAND.phone : '+919326990050';
    const cleanPhone = phone.replace('+', '');
    const waText = encodeURIComponent(`Hello, I am interested in property "${item.title}" in ${item.locality}. Please provide pricing details and arrange an inspection.`);

    return `
      <article class="prop-card" data-id="${item.id}" data-intent="${item.intent || 'buy'}" data-locality="${item.locality || ''}" data-price="${item.priceNumeric || 0}" data-bhk="${item.bhk || 0}">
        <div class="prop-img">
          <img src="${firstImg}" alt="${item.title}" loading="lazy" onerror="this.onerror=null;this.src='/images/og-banner.jpg';">
          <div class="prop-badge-stack">
            ${getCategoryBadge(item.intent)}
            ${item.featured ? '<span class="badge badge-green">Featured</span>' : ''}
          </div>
        </div>

        <div class="prop-body">
          <div class="prop-price">
            ${displayPrice}
            ${item.intent === 'rent' ? '<small>/ month</small>' : ''}
          </div>

          <h3 class="prop-title">
            <a href="${detailLink}">${item.title}</a>
          </h3>

          <p class="prop-address">&#128205; ${item.address || item.locality + ', Mumbai'}</p>

          <div class="prop-specs">
            <div class="spec-item">
              <label>Configuration</label>
              <span>${item.bhk ? item.bhk + ' BHK' : 'Office Space'}</span>
            </div>
            <div class="spec-item">
              <label>Carpet Area</label>
              <span>${item.carpetArea ? item.carpetArea + ' sq.ft' : 'On Request'}</span>
            </div>
            <div class="spec-item">
              <label>Floor</label>
              <span>${item.floor || 'Middle'}</span>
            </div>
          </div>

          <div class="prop-card-actions">
            <a href="${detailLink}" class="btn btn-outline btn-sm flex-1 text-center">View Details</a>
            <a href="https://wa.me/${cleanPhone}?text=${waText}" target="_blank" rel="noopener" class="btn btn-green-inline btn-sm" aria-label="WhatsApp regarding ${item.title}">&#128172;</a>
            <a href="tel:${phone}" class="btn btn-primary btn-sm" aria-label="Call for ${item.title}">&#128222;</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderList(list, targetElementId) {
    const container = document.getElementById(targetElementId);
    if (!container) return;

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 48px 16px;">
          <p style="font-size: 18px; font-weight: 700; color: var(--text);">No properties found matching your criteria</p>
          <p style="color: var(--text-muted); margin-top: 8px;">Try clearing filters or adjusting your budget and configuration.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(createPropertyCard).join('');
  }

  function sortProperties(list, sortValue) {
    const copy = [...list];
    if (sortValue === 'price-asc') {
      return copy.sort((a, b) => (Number(a.priceNumeric) || 0) - (Number(b.priceNumeric) || 0));
    }
    if (sortValue === 'price-desc') {
      return copy.sort((a, b) => (Number(b.priceNumeric) || 0) - (Number(a.priceNumeric) || 0));
    }
    if (sortValue === 'area-desc') {
      return copy.sort((a, b) => (Number(b.carpetArea) || 0) - (Number(a.carpetArea) || 0));
    }
    return copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  async function init() {
    const catalogContainer = document.getElementById('propertiesGrid') || document.getElementById('propertiesContainer');
    const featuredContainer = document.getElementById('featuredGrid');

    if (!catalogContainer && !featuredContainer) return;

    try {
      if (window.pfreApi && typeof window.pfreApi.getProperties === 'function') {
        propertiesCache = await window.pfreApi.getProperties();
      } else {
        const response = await fetch('/data/properties.json', { cache: 'no-cache' });
        propertiesCache = await response.json();
      }

      window.allPropertiesCache = propertiesCache;

      if (featuredContainer) {
        const featuredList = propertiesCache.filter(p => Boolean(p.featured)).slice(0, 6);
        renderList(featuredList.length > 0 ? featuredList : propertiesCache.slice(0, 6), 'featuredGrid');
      }

      if (catalogContainer) {
        const sortSelect = document.getElementById('sortBy');
        const countDisplay = document.getElementById('totalPropertiesCount');

        function updateCatalogView() {
          const currentSort = sortSelect ? sortSelect.value : 'newest';
          const sorted = sortProperties(window.filteredPropertiesCache || propertiesCache, currentSort);
          renderList(sorted, catalogContainer.id);

          if (countDisplay) {
            countDisplay.textContent = sorted.length;
          }
        }

        if (sortSelect) {
          sortSelect.addEventListener('change', updateCatalogView);
        }

        window.addEventListener('pfre:properties-filtered', function (e) {
          window.filteredPropertiesCache = e.detail && e.detail.filtered ? e.detail.filtered : propertiesCache;
          updateCatalogView();
        });

        updateCatalogView();
      }
    } catch (err) {
      console.error('Error rendering property cards:', err);
    }
  }

  window.pfreLoadProperties = {
    init: init,
    formatPrice: formatPriceInr,
    render: renderList
  };

  document.addEventListener('DOMContentLoaded', init);
})(window, document);