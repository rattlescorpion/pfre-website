document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.prop-grid-4') || document.querySelector('.prop-grid');
  if (!container) return;

  try {
    const res = await fetch('/data/properties.json');
    if (!res.ok) throw new Error('Failed to load property data');
    const properties = await res.json();

    container.innerHTML = properties.map(p => {
      const intentBadgeClass = p.intent === 'buy' ? 'badge-blue' : (p.intent === 'rent' ? 'badge-green' : 'badge-gold');
      const intentLabel = p.intent === 'buy' ? 'For Sale' : (p.intent === 'rent' ? 'For Rent' : 'Commercial');
      const detailUrl = `/property-detail.html?id=${encodeURIComponent(p.id)}`;

      return `
        <a href="${detailUrl}" class="prop-card-link">
          <div class="prop-card" 
               data-intent="${p.intent}" 
               data-bhk="${p.bhk || ''}" 
               data-proptype="${p.propType}" 
               data-use="${p.use}" 
               data-price="${p.price}" 
               data-area="${p.carpetArea}"
               data-locality="${p.locality.toLowerCase()}">
            <div class="prop-img">
              <img src="${p.images[0]}" 
                   alt="${p.title} in ${p.locality} Mumbai" 
                   class="prop-photo" 
                   loading="lazy" 
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="prop-placeholder" style="display:none;">${p.use === 'commercial' ? '🏬' : '🏠'}</div>
              <div class="prop-badges">
                <span class="badge ${intentBadgeClass}">${intentLabel}</span>
                ${p.bhk ? `<span class="badge badge-gray">${p.bhk} BHK</span>` : ''}
              </div>
              <button class="prop-fav" type="button" onclick="event.preventDefault();" aria-label="Favorite">🤍</button>
            </div>
            <div class="prop-body">
              <div class="prop-price">${p.priceDisplay}</div>
              <div class="prop-name">${p.title}</div>
              <div class="prop-loc">📍 ${p.subLocality}, ${p.locality}</div>
              <div class="prop-meta">
                ${p.bhk ? `<div class="prop-meta-item">🛏 <strong>${p.bhk}</strong> Beds</div>` : ''}
                ${p.bathrooms ? `<div class="prop-meta-item">🛁 <strong>${p.bathrooms}</strong> Baths</div>` : ''}
                <div class="prop-meta-item">📐 <strong>${p.carpetArea}</strong> sq.ft Carpet</div>
              </div>
            </div>
          </div>
        </a>
      `;
    }).join('');

    // Trigger filter recalculation after injecting elements
    if (window.PFREPropertyFilter && typeof window.PFREPropertyFilter.init === 'function') {
      window.PFREPropertyFilter.init();
    }
  } catch (error) {
    console.error('Properties load error:', error);
  }
});