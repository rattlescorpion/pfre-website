document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get('id');

  if (!propertyId) {
    window.location.href = '/properties.html';
    return;
  }

  try {
    const res = await fetch('/data/properties.json');
    if (!res.ok) throw new Error('Could not retrieve listings database');
    const properties = await res.json();
    const prop = properties.find(p => p.id === propertyId);

    if (!prop) {
      document.getElementById('propertyContent').innerHTML = `
        <div style="text-align:center;padding:80px 20px;">
          <h2 style="font-family:var(--font-heading);font-size:28px;">Property Listing Not Found</h2>
          <p style="color:var(--text-muted);margin:12px 0 24px;">The property you are looking for may have been leased or sold.</p>
          <a href="/properties.html" class="btn btn-primary">Browse All Active Properties</a>
        </div>
      `;
      return;
    }

    // Page Title & Meta Updates
    document.title = `${prop.title} | Property Finder Real Estate Mumbai`;

    // Populate Hero & Breadcrumb
    document.getElementById('detailTitle').textContent = prop.title;
    document.getElementById('detailPrice').textContent = prop.priceDisplay;
    document.getElementById('detailLocation').innerHTML = `📍 ${prop.address}`;
    document.getElementById('detailBreadcrumbName').textContent = prop.title;

    // Badges
    const badgeHtml = `
      <span class="badge ${prop.intent === 'buy' ? 'badge-blue' : (prop.intent === 'rent' ? 'badge-green' : 'badge-gold')}">
        ${prop.intent === 'buy' ? 'For Sale' : (prop.intent === 'rent' ? 'For Rent' : 'Commercial')}
      </span>
      ${prop.bhk ? `<span class="badge badge-gray">${prop.bhk} BHK</span>` : ''}
      <span class="badge badge-blue">RERA: ${prop.reraId}</span>
    `;
    document.getElementById('detailBadges').innerHTML = badgeHtml;

    // Main Image
    const mainImg = document.getElementById('detailMainImg');
    if (mainImg) {
      mainImg.src = prop.images[0];
      mainImg.alt = `${prop.title} in ${prop.locality} Mumbai`;
    }

    // Overview Specs
    document.getElementById('specCarpet').textContent = `${prop.carpetArea} sq.ft`;
    document.getElementById('specBeds').textContent = prop.bhk ? `${prop.bhk} BHK` : 'N/A';
    document.getElementById('specBaths').textContent = prop.bathrooms || 'N/A';
    document.getElementById('specFloor').textContent = prop.floor || 'Standard';
    document.getElementById('specFacing').textContent = prop.facing || 'East';
    document.getElementById('specParking').textContent = prop.parking ? `${prop.parking} Reserved` : 'Open / Street';

    // Amenities List
    const amenContainer = document.getElementById('detailAmenities');
    if (amenContainer && prop.amenities) {
      amenContainer.innerHTML = prop.amenities.map(a => `
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;font-size:13.5px;font-weight:600;">
          <span style="color:var(--blue);">✓</span> ${a}
        </div>
      `).join('');
    }

    // Connect Contact Direct Action Buttons
    const waText = encodeURIComponent(`Hello Property Finder Real Estate, I am interested in inspecting "${prop.title}" (${prop.id}) listed at ${prop.priceDisplay}. Please share availability.`);
    document.getElementById('detailWaBtn').href = `https://wa.me/919326990050?text=${waText}`;
    document.getElementById('detailCallBtn').href = `tel:+919326990050`;

    // Sticky Bottom Bar on Mobile
    const stickyName = document.querySelector('.sticky-prop-name');
    const stickyPrice = document.querySelector('.sticky-prop-price');
    if (stickyName) stickyName.textContent = prop.title;
    if (stickyPrice) stickyPrice.textContent = prop.priceDisplay;

  } catch (error) {
    console.error('Error rendering property details:', error);
  }
});