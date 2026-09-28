/* =====================================================
   PROPERTY FINDER RE — Client-Side Property Filter
   Reads data-* attributes from .prop-card elements
   and filters/sorts them based on sidebar inputs
   ===================================================== */
(() => {
  'use strict';

  /* ── Run after DOM ready ── */
  function initFilter() {
    const sidebar   = document.querySelector('.sidebar');
    const mainCol   = document.querySelector('.main-col');
    if (!mainCol) return;

    /* ── Read URL params on page load ── */
    const params = new URLSearchParams(window.location.search);
    if (params.get('q'))    presetSearch(params.get('q'));
    if (params.get('type')) presetType(params.get('type'));
    if (params.get('bhk'))  presetBHK(params.get('bhk'));

    /* ── Attach event listeners ── */
    /* Filter tabs (Buy / Rent / Commercial) */
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => { applyFilters(); });
    });

    /* Sidebar checkboxes */
    if (sidebar) {
      sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', applyFilters);
      });
      /* Apply / Reset buttons */
      sidebar.querySelectorAll('.apply-btn').forEach(btn => {
        if (btn.textContent.trim().toLowerCase().includes('reset')) {
          btn.addEventListener('click', resetFilters);
        } else {
          btn.addEventListener('click', applyFilters);
        }
      });
      /* Price range inputs */
      sidebar.querySelectorAll('.range-input').forEach(inp => {
        inp.addEventListener('input', debounce(applyFilters, 400));
      });
    }

    /* Sort dropdown */
    const sortSelect = mainCol.querySelector('select');
    sortSelect?.addEventListener('change', applyFilters);

    /* Search input (inline on properties page) */
    const searchInp = document.querySelector('.search-input-wrap input');
    if (searchInp) {
      searchInp.addEventListener('input', debounce(applyFilters, 300));
    }

    /* Initial render */
    applyFilters();
  }

  /* ── Simple debounce ── */
  function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  }

  /* ── Preset helpers from URL params ── */
  function presetSearch(q) {
    const inp = document.querySelector('.search-input-wrap input');
    if (inp) inp.value = q;
  }
  function presetType(type) {
    const tab = document.querySelector(`.filter-tab[data-type="${type}"]`);
    if (tab) tab.click();
    /* Also map buy/rent/commercial */
    const map = { buy: 'Buy', rent: 'Rent', commercial: 'Commercial' };
    if (map[type]) {
      document.querySelectorAll('.filter-tab').forEach(t => {
        if (t.textContent.trim() === map[type]) t.click();
      });
    }
  }
  function presetBHK(bhk) {
    const label = `${bhk} BHK`;
    document.querySelectorAll('.filter-check input[type=checkbox]').forEach(cb => {
      const lbl = cb.closest('.filter-check')?.textContent?.trim();
      if (lbl && lbl.includes(bhk)) { cb.checked = true; }
    });
  }

  /* ── Main filter function ── */
  function applyFilters() {
    const cards  = document.querySelectorAll('.prop-card');
    const grid   = cards[0]?.closest('.prop-grid-4, .prop-grid');
    if (!grid || !cards.length) return;

    /* Active tab intent */
    const activeTab = document.querySelector('.filter-tab.active')?.textContent?.trim()?.toLowerCase() || 'all';

    /* Sidebar state */
    const sidebar = document.querySelector('.sidebar');
    const checkedTypes    = getChecked(sidebar, '[data-filter="type"]');
    const checkedBHK      = getChecked(sidebar, '[data-filter="bhk"]');
    const checkedBuilding = getChecked(sidebar, '[data-filter="building"]');
    const checkedUse      = getChecked(sidebar, '[data-filter="use"]');

    /* Price range */
    const minPrice = parseFloat(sidebar?.querySelector('.range-input:first-of-type')?.value) || 0;
    const maxPrice = parseFloat(sidebar?.querySelector('.range-input:last-of-type')?.value)  || Infinity;

    /* Search query */
    const query = (document.querySelector('.search-input-wrap input')?.value || '').toLowerCase().trim();

    /* Sort */
    const sortVal = document.querySelector('.main-col select')?.value || 'Newest First';

    let visible = 0;
    const cardArray = [...cards];

    /* Filter */
    cardArray.forEach(card => {
      const intent   = (card.dataset.intent   || '').toLowerCase();  /* buy|rent|commercial */
      const bhk      = (card.dataset.bhk      || '').toLowerCase();
      const propType = (card.dataset.proptype || '').toLowerCase();
      const building = (card.dataset.building || '').toLowerCase();
      const use      = (card.dataset.use      || '').toLowerCase();
      const price    = parseFloat(card.dataset.price || '0');
      const name     = card.querySelector('.prop-name')?.textContent?.toLowerCase() || '';
      const loc      = card.querySelector('.prop-loc')?.textContent?.toLowerCase()  || '';

      let show = true;

      /* Tab filter */
      if (activeTab !== 'all') {
        if (activeTab === 'buy'        && intent !== 'buy')        show = false;
        if (activeTab === 'rent'       && intent !== 'rent')       show = false;
        if (activeTab === 'commercial' && intent !== 'commercial') show = false;
      }

      /* Sidebar type filter */
      if (show && checkedTypes.length && !checkedTypes.some(t => propType.includes(t))) show = false;

      /* BHK filter */
      if (show && checkedBHK.length && !checkedBHK.some(b => bhk.includes(b))) show = false;

      /* Building type */
      if (show && checkedBuilding.length && !checkedBuilding.some(b => building.includes(b))) show = false;

      /* Property use */
      if (show && checkedUse.length && !checkedUse.some(u => use.includes(u))) show = false;

      /* Price range */
      if (show && price > 0 && minPrice > 0 && price < minPrice) show = false;
      if (show && price > 0 && maxPrice < Infinity && price > maxPrice) show = false;

      /* Search query */
      if (show && query) {
        show = name.includes(query) || loc.includes(query);
      }

      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    /* Sort visible cards */
    const visibleCards = cardArray.filter(c => c.style.display !== 'none');
    sortCards(visibleCards, sortVal, grid);

    /* Update count */
    const countEl = document.querySelector('.results-count strong, .filter-results-count strong');
    if (countEl) countEl.textContent = visible;
    const countEl2 = document.querySelector('.filter-results-count');
    if (countEl2) countEl2.textContent = `Showing ${visible} properties`;

    /* Show no-results if empty */
    let noRes = document.getElementById('noResults');
    if (!noRes) {
      noRes = document.createElement('div');
      noRes.id = 'noResults';
      noRes.className = 'empty-state';
      noRes.innerHTML = '<div class="empty-icon" style="font-size:48px">🔍</div><h3>No properties match your filters</h3><p>Try adjusting your search criteria or <a href="contact.html" style="color:var(--blue)">contact us</a> with your exact requirements.</p>';
      grid.parentNode.insertBefore(noRes, grid.nextSibling);
    }
    noRes.style.display = visible === 0 ? 'block' : 'none';
    grid.style.display  = visible === 0 ? 'none'  : '';
  }

  /* ── Sort helper ── */
  function sortCards(cards, sortVal, grid) {
    const sorted = [...cards].sort((a, b) => {
      const pA = parseFloat(a.dataset.price || '0');
      const pB = parseFloat(b.dataset.price || '0');
      if (sortVal.includes('Low to High')) return pA - pB;
      if (sortVal.includes('High to Low')) return pB - pA;
      if (sortVal.includes('Largest')) {
        const aA = parseFloat(a.dataset.area || '0');
        const bA = parseFloat(b.dataset.area || '0');
        return bA - aA;
      }
      return 0; /* Newest = original order */
    });
    sorted.forEach(card => grid.appendChild(card));
  }

  /* ── Get checked values from sidebar ── */
  function getChecked(parent, selector) {
    if (!parent) return [];
    return [...parent.querySelectorAll(`${selector}:checked, input[type=checkbox]:checked`)]
      .map(cb => (cb.dataset.value || cb.closest('.filter-check')?.textContent?.trim()?.toLowerCase() || ''))
      .filter(Boolean);
  }

  /* ── Reset filters ── */
  function resetFilters() {
    document.querySelectorAll('.sidebar input[type=checkbox]').forEach(cb => {
      cb.checked = cb.dataset.default === 'true';
    });
    document.querySelectorAll('.sidebar .range-input').forEach(inp => { inp.value = ''; });
    /* Reset to first tab */
    const firstTab = document.querySelector('.filter-tab');
    if (firstTab) {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      firstTab.classList.add('active');
    }
    applyFilters();
  }

  /* ── Add data attributes to existing property cards ── */
  function enrichCards() {
    document.querySelectorAll('.prop-card').forEach(card => {
      if (card.dataset.enriched) return;
      card.dataset.enriched = 'true';

      /* Intent from badge text */
      const badge = card.querySelector('.badge');
      const badgeTxt = badge?.textContent?.trim()?.toLowerCase() || '';
      if (badgeTxt.includes('sale') || badgeTxt.includes('launch'))
        card.dataset.intent = 'buy';
      else if (badgeTxt.includes('rent'))
        card.dataset.intent = 'rent';
      else if (badgeTxt.includes('commercial'))
        card.dataset.intent = 'commercial';
      else card.dataset.intent = 'buy';

      /* BHK from badge or meta */
      const bhkBadge = card.querySelector('.badge-gray');
      const bhkTxt = bhkBadge?.textContent || '';
      card.dataset.bhk = bhkTxt.toLowerCase().replace(' bhk','');

      /* Property type */
      const metaItems = card.querySelectorAll('.prop-meta-item');
      metaItems.forEach(item => {
        const txt = item.textContent.toLowerCase();
        if (txt.includes('mhada'))    card.dataset.building = 'mhada';
        else if (txt.includes('sra')) card.dataset.building = 'sra';
        else if (txt.includes('collector')) card.dataset.building = 'collector';
        else card.dataset.building = card.dataset.building || 'private';

        if (txt.includes('flat') || txt.includes('apartment'))  card.dataset.proptype = 'flat';
        if (txt.includes('row house'))  card.dataset.proptype = 'row house';
        if (txt.includes('bungalow'))   card.dataset.proptype = 'bungalow';
        if (txt.includes('plot'))       card.dataset.proptype = 'plot';
        if (txt.includes('commercial')) { card.dataset.proptype = 'commercial'; card.dataset.use = 'commercial'; }
      });
      card.dataset.use = card.dataset.use || 'residential';

      /* Price — parse from display text */
      const priceEl = card.querySelector('.prop-price');
      if (priceEl) {
        const raw = priceEl.textContent;
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        if (raw.includes('Cr')) card.dataset.price = (num * 10000000).toString();
        else if (raw.includes('L')) card.dataset.price = (num * 100000).toString();
        else if (raw.includes(',')) card.dataset.price = num.toString();
        else card.dataset.price = (num * 12).toString(); /* monthly rent → annual */
      }

      /* Area */
      const areaMatch = card.textContent.match(/(\d[,\d]*)\s*sq\.ft/);
      if (areaMatch) card.dataset.area = areaMatch[1].replace(',','');
    });
  }

  /* ── Init ── */
  enrichCards();
  initFilter();

  /* Re-enrich if cards added dynamically */
  const observer = new MutationObserver(() => { enrichCards(); applyFilters(); });
  const grid = document.querySelector('.prop-grid-4, .prop-grid');
  if (grid) observer.observe(grid, { childList: true });

})();
