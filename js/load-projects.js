document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.project-grid');
  if (!container) return;

  try {
    const res = await fetch('/data/projects.json');
    if (!res.ok) throw new Error('Failed to load projects');
    const projects = await res.json();

    container.innerHTML = projects.map(p => {
      const isReady = p.status.toLowerCase().includes('ready');
      const badgeClass = isReady ? 'badge-green' : 'badge-gold';

      return `
        <div class="project-card">
          <div class="project-img">
            <img src="${p.image}" 
                 alt="${p.name} by ${p.developer} in ${p.locality} Mumbai" 
                 loading="lazy" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                 style="width:100%;height:100%;object-fit:cover;">
            <div class="project-placeholder" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:48px;background:var(--bg-secondary);">🏗️</div>
          </div>
          <div class="project-body">
            <div class="project-status" style="margin-bottom:12px;display:flex;gap:6px;flex-wrap:wrap;">
              <span class="badge ${badgeClass}">${p.status}</span>
              <span class="badge badge-blue">RERA: ${p.reraNumber}</span>
            </div>
            <h3 class="project-name" style="font-size:18px;font-weight:700;margin-bottom:6px;">${p.name}</h3>
            <div class="project-dev" style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">🏢 ${p.developer} · ${p.subLocality}, ${p.locality}</div>
            
            <div class="project-meta" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:16px;">
              <div class="project-meta-item">
                <label style="display:block;font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:600;">Configs</label>
                <span style="font-weight:600;font-size:13.5px;">${p.configurations.join(', ')}</span>
              </div>
              <div class="project-meta-item">
                <label style="display:block;font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:600;">Pricing</label>
                <span style="font-weight:700;color:var(--blue);font-size:13.5px;">${p.priceDisplay}</span>
              </div>
              <div class="project-meta-item">
                <label style="display:block;font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:600;">Carpet Area</label>
                <span style="font-weight:600;font-size:13.5px;">${p.carpetAreaRange}</span>
              </div>
              <div class="project-meta-item">
                <label style="display:block;font-size:11px;text-transform:uppercase;color:var(--text-muted);font-weight:600;">Possession</label>
                <span style="font-weight:600;font-size:13.5px;">${p.possessionDate}</span>
              </div>
            </div>

            <div style="display:flex;gap:10px;">
              <a href="tel:+919326990050" class="btn btn-primary btn-sm" style="flex:1;justify-content:center;">Book Site Visit</a>
              <a href="https://wa.me/919326990050?text=${encodeURIComponent('Hello Property Finder Real Estate, I would like more information and a brochure for ' + p.name)}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="btn btn-outline btn-sm" 
                 style="flex:1;justify-content:center;">WhatsApp</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error rendering project listings:', err);
  }
});