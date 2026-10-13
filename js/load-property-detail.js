/**
 * js/load-property-detail.js
 * Property Finder Real Estate - Mumbai
 * Property Detail Page Controller & Gallery Engine
 */

(function (window, document) {
  'use strict';

  function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }

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

  function renderGallery(images, title) {
    const mainImg = document.getElementById('detailMainImg');
    const thumbContainer = document.getElementById('detailThumbsContainer');

    if (!images || images.length === 0) {
      images = ['/images/og-banner.jpg'];
    }

    if (mainImg) {
      mainImg.src = images[0];
      mainImg.alt = title;
      mainImg.setAttribute('data-lightbox-src', images[0]);
    }

    if (thumbContainer) {
      thumbContainer.innerHTML = images.map((src, index) => `
        <button type="button" class="gallery-thumb ${index === 0 ? 'active' : ''}" data-src="${src}" aria-label="View photo ${index + 1}">
          <img src="${src}" alt="${title} photo ${index + 1}" loading="lazy" onerror="this.src='/images/og-banner.jpg'">
        </button>
      `).join('');

      thumbContainer.querySelectorAll('.gallery-thumb').forEach(btn => {
        btn.addEventListener('click', function () {
          thumbContainer.querySelectorAll('.gallery-thumb').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          const targetSrc = this.getAttribute('data-src');
          if (mainImg) {
            mainImg.src = targetSrc;
            mainImg.setAttribute('data-lightbox-src', targetSrc);
          }
        });
      });
    }
  }

  function populateDetails(prop) {
    document.title = `${prop.title} | Property Finder Real Estate Mumbai`;

    const titleEl = document.getElementById('propDetailTitle');
    if (titleEl) titleEl.textContent = prop.title;

    const breadcrumbTitle = document.getElementById('breadcrumbPropTitle');
    if (breadcrumbTitle) breadcrumbTitle.textContent = prop.title;

    const addressEl = document.getElementById('propDetailAddress');
    if (addressEl) addressEl.innerHTML = `&#128205; ${prop.address || prop.locality + ', Mumbai'}`;

    const priceEl = document.getElementById('propDetailPrice');
    if (priceEl) {
      const priceText = prop.priceDisplay || formatPriceInr(prop.priceNumeric);
      priceEl.innerHTML = `${priceText} ${prop.intent === 'rent' ? '<small style="font-size:15px;color:var(--text-muted)">/ month</small>' : ''}`;
    }

    const bhkEl = document.getElementById('propDetailBhk');
    if (bhkEl) bhkEl.textContent = prop.bhk ? `${prop.bhk} BHK` : 'Commercial Space';

    const carpetEl = document.getElementById('propDetailCarpet');
    if (carpetEl) carpetEl.textContent = prop.carpetArea ? `${prop.carpetArea} sq.ft` : 'On Request';

    const bathEl = document.getElementById('propDetailBaths');
    if (bathEl) bathEl.textContent = prop.bathrooms || '2';

    const floorEl = document.getElementById('propDetailFloor');
    if (floorEl) floorEl.textContent = prop.floor || 'Middle Floor';

    const reraEl = document.getElementById('propDetailRera');
    if (reraEl) reraEl.textContent = prop.reraId || 'MahaRERA Registered';

    const descEl = document.getElementById('propDetailDesc');
    if (descEl) {
      descEl.textContent = prop.description || `Presenting a verified ${prop.bhk || 2} BHK residence in ${prop.locality || 'Mumbai'}. Offering an efficient carpet layout, cross ventilation, dedicated parking, and complete society documentation.`;
    }

    const amenitiesList = document.getElementById('propAmenitiesList');
    if (amenitiesList && Array.isArray(prop.amenities)) {
      amenitiesList.innerHTML = prop.amenities.map(amenity => `
        <div class="amenity-item" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg-secondary);border-radius:8px;font-size:13.5px;font-weight:600">
          <span style="color:var(--blue)">&#10003;</span> ${amenity}
        </div>
      `).join('');
    }

    renderGallery(prop.images, prop.title);

    const phone = window.PFRE_CONFIG ? window.PFRE_CONFIG.BRAND.phone : '+919326990050';
    const waText = encodeURIComponent(`Hello, I am interested in viewing property "${prop.title}" in ${prop.locality}. Please schedule an inspection.`);

    const waBtn = document.getElementById('propDetailWaBtn');
    if (waBtn) {
      waBtn.href = `https://wa.me/${phone.replace('+', '')}?text=${waText}`;
    }

    const callBtn = document.getElementById('propDetailCallBtn');
    if (callBtn) {
      callBtn.href = `tel:${phone}`;
    }

    const leadPropInput = document.getElementById('leadPropertySubject');
    if (leadPropInput) {
      leadPropInput.value = `${prop.title} [ID: ${prop.id}]`;
    }

    const stickyBar = document.getElementById('stickyEnquiry');
    if (stickyBar) {
      const stickPrice = stickyBar.querySelector('.sticky-enquiry-price');
      if (stickPrice) stickPrice.textContent = prop.priceDisplay || formatPriceInr(prop.priceNumeric);
      stickyBar.style.display = 'flex';
    }
  }

  function renderNotFound() {
    const layout = document.querySelector('.detail-layout') || document.querySelector('main');
    if (layout) {
      layout.innerHTML = `
        <div style="text-align:center;padding:70px 20px;max-width:560px;margin:0 auto">
          <h2 style="font-size:26px;margin-bottom:12px">Property Listing Not Found</h2>
          <p class="text-muted" style="margin-bottom:24px">The listing you requested has either been transacted, archived, or does not exist.</p>
          <a href="properties.html" class="btn btn-primary">Browse All Mumbai Properties</a>
        </div>
      `;
    }
  }

  async function init() {
    const propId = getQueryParam('id');
    if (!propId) {
      renderNotFound();
      return;
    }

    try {
      let property = null;

      if (window.pfreApi && typeof window.pfreApi.getPropertyById === 'function') {
        property = await window.pfreApi.getPropertyById(propId);
      }

      if (!property) {
        const res = await fetch('/data/properties.json');
        const list = await res.json();
        property = list.find(item => item.id === propId);
      }

      if (property) {
        populateDetails(property);
      } else {
        renderNotFound();
      }
    } catch (err) {
      console.error('Failed to load property details:', err);
      renderNotFound();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})(window, document);