/**
 * js/load-projects.js
 * Property Finder Real Estate - Mumbai
 * Project Catalog Loader & Dynamic Filter Engine
 */

(function (window, document) {
  'use strict';

  let allProjects = [];
  let activeCategory = 'all';
  let activeSearchTerm = '';
  let activeLocality = 'all';

  function getCategoryBadge(category) {
    const map = {
      ready: { label: 'Ready Possession', class: 'badge-green' },
      uc: { label: 'Under Construction', class: 'badge-blue' },
      launch: { label: 'New Launch', class: 'badge-gold' }
    };
    const match = map[category] || { label: 'Project', class: 'badge-gray' };
    return `<span class="badge ${match.class}">${match.label}</span>`;
  }

  function createProjectCardHtml(project) {
    const primaryImg = (project.images && project.images[0]) || '/images/og-banner.jpg';
    const detailUrl = `project-detail.html?slug=${encodeURIComponent(project.slug || project.id)}`;
    const phone = window.PFRE_CONFIG ? window.PFRE_CONFIG.BRAND.phone : '+919326990050';
    const whatsappText = encodeURIComponent(`Hello, I am interested in ${project.title} by ${project.developer} at ${project.location}. Please share floor plans and brochure.`);

    return `
      <article class="project-card-lg" data-category="${project.category}" data-id="${project.id}">
        <div class="project-img-lg">
          <img src="${primaryImg}" alt="${project.title}" loading="lazy" onerror="this.src='/images/og-banner.jpg'">
          <div class="prop-badge-stack">
            ${getCategoryBadge(project.category)}
            <span class="badge badge-gray">${project.type || 'Residential'}</span>
          </div>
        </div>

        <div class="project-content-lg">
          <div class="project-meta-top">
            <span class="developer-tag">&#127970; ${project.developer}</span>
            <span class="rera-tag">&#128220; ${project.reraId || 'MahaRERA Registered'}</span>
          </div>

          <h3 class="project-title-lg">
            <a href="${detailUrl}">${project.title}</a>
          </h3>

          <p class="project-location-lg">&#128205; ${project.location}</p>

          <p class="project-desc-line">${project.description || 'Modern architecture with thoughtfully planned configurations and world-class podium amenities.'}</p>

          <div class="project-details-grid">
            <div class="p-detail-item">
              <label>Configuration</label>
              <strong>${project.config || '2, 3 BHK'}</strong>
            </div>
            <div class="p-detail-item">
              <label>Carpet Area</label>
              <strong>${project.carpetArea || 'Contact for Area'}</strong>
            </div>
            <div class="p-detail-item">
              <label>Price Range</label>
              <strong class="text-blue">${project.priceRange || 'Price on Request'}</strong>
            </div>
            <div class="p-detail-item">
              <label>Possession</label>
              <strong>${project.possession || 'Ready OC'}</strong>
            </div>
          </div>

          <div class="project-card-actions">
            <a href="${detailUrl}" class="btn btn-outline btn-sm">View Floor Plans</a>
            <a href="https://wa.me/${phone.replace('+', '')}?text=${whatsappText}" target="_blank" rel="noopener" class="btn btn-green-inline btn-sm">&#128172; WhatsApp Brochure</a>
            <a href="tel:${phone}" class="btn btn-primary btn-sm">&#128222; Enquire</a>
          </div>
        </div>
      </article>
    `;
  }

  function renderProjects(projectsList) {
    const container = document.getElementById('projectsContainer') || document.querySelector('.projects-grid');
    if (!container) return;

    if (!projectsList || projectsList.length === 0) {
      container.innerHTML = `
        <div class="no-results-box" style="grid-column: 1 / -1; text-align: center; padding: 48px 20px;">
          <h3>No matching projects found</h3>
          <p>Try modifying your search criteria or explore other micro-markets in Mumbai.</p>
          <button id="resetProjectsFilterBtn" class="btn btn-outline btn-sm" style="margin-top: 12px;">Reset All Filters</button>
        </div>
      `;

      const resetBtn = document.getElementById('resetProjectsFilterBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
      }
      return;
    }

    container.innerHTML = projectsList.map(createProjectCardHtml).join('');

    const countTarget = document.getElementById('projectCountLabel');
    if (countTarget) {
      countTarget.textContent = `Showing ${projectsList.length} verified projects`;
    }
  }

  function applyFilters() {
    let filtered = allProjects.slice();

    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (activeLocality !== 'all') {
      const term = activeLocality.toLowerCase();
      filtered = filtered.filter(p => p.location.toLowerCase().includes(term));
    }

    if (activeSearchTerm.trim() !== '') {
      const q = activeSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.developer.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          (p.config && p.config.toLowerCase().includes(q))
        );
      });
    }

    renderProjects(filtered);
  }

  function resetFilters() {
    activeCategory = 'all';
    activeLocality = 'all';
    activeSearchTerm = '';

    const searchInput = document.getElementById('projectSearchInput');
    if (searchInput) searchInput.value = '';

    const localitySelect = document.getElementById('projectLocalitySelect');
    if (localitySelect) localitySelect.value = 'all';

    document.querySelectorAll('.tab-pill[data-project-category]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-project-category') === 'all');
    });

    applyFilters();
  }

  function bindEvents() {
    document.querySelectorAll('.tab-pill[data-project-category]').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tab-pill[data-project-category]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeCategory = this.getAttribute('data-project-category');
        applyFilters();
      });
    });

    const searchInput = document.getElementById('projectSearchInput');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', function (e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          activeSearchTerm = e.target.value;
          applyFilters();
        }, 250);
      });
    }

    const localitySelect = document.getElementById('projectLocalitySelect');
    if (localitySelect) {
      localitySelect.addEventListener('change', function (e) {
        activeLocality = e.target.value;
        applyFilters();
      });
    }
  }

  async function init() {
    const container = document.getElementById('projectsContainer') || document.querySelector('.projects-grid');
    if (!container) return;

    try {
      if (window.pfreApi && typeof window.pfreApi.getProjects === 'function') {
        allProjects = await window.pfreApi.getProjects();
      } else {
        const res = await fetch('/data/projects.json');
        allProjects = await res.json();
      }

      bindEvents();

      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get('category');
      if (catParam) {
        activeCategory = catParam;
        const matchingBtn = document.querySelector(`.tab-pill[data-project-category="${catParam}"]`);
        if (matchingBtn) {
          document.querySelectorAll('.tab-pill[data-project-category]').forEach(b => b.classList.remove('active'));
          matchingBtn.classList.add('active');
        }
      }

      applyFilters();
    } catch (err) {
      console.error('Failed to load project listings:', err);
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 16px;">
          <p class="text-muted">Unable to load project listings right now.</p>
        </div>
      `;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})(window, document);