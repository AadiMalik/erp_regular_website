// Smart Mart — Shop page: search, filter, sort, pagination (all client-side).

import { qs, qsa, debounce, formatCurrency, escapeHtml } from '../core/utils.js';
import { CATEGORIES, BRANDS, getCategory } from '../data/categories.js';
import { PRODUCTS } from '../data/products.js';
import { productCardHTML, skeletonCardHTML } from '../core/product-card.js';
import { staggerReveal } from '../core/reveal.js';

const params = new URLSearchParams(window.location.search);
const PRICES = PRODUCTS.map((p) => p.price);
const PRICE_MIN = Math.floor(Math.min(...PRICES));
const PRICE_MAX = Math.ceil(Math.max(...PRICES));

const state = {
  categories: new Set(params.get('category') ? [params.get('category')] : []),
  subcategories: new Set(),
  brands: new Set(),
  minPrice: PRICE_MIN,
  maxPrice: PRICE_MAX,
  minRating: 0,
  inStockOnly: false,
  dealsOnly: params.get('filter') === 'deal',
  query: params.get('q') || '',
  sort: 'featured',
  page: 1,
  pageSize: 12,
  view: 'grid',
};

const SORT_LABELS = {
  featured: 'Featured', newest: 'Newest', bestselling: 'Best Selling',
  rating: 'Top Rated', 'price-asc': 'Price: Low to High', 'price-desc': 'Price: High to Low',
};

function getFiltered() {
  return PRODUCTS.filter((p) => {
    if (state.categories.size && !state.categories.has(p.category)) return false;
    if (state.subcategories.size && !state.subcategories.has(p.subcategory)) return false;
    if (state.brands.size && !state.brands.has(p.brand)) return false;
    if (p.price < state.minPrice || p.price > state.maxPrice) return false;
    if (state.minRating && p.rating < state.minRating) return false;
    if (state.inStockOnly && p.stock === 0) return false;
    if (state.dealsOnly && !p.oldPrice) return false;
    if (state.query) {
      const q = state.query.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q) && !p.category.includes(q)) return false;
    }
    return true;
  });
}

function getSorted(list) {
  const arr = [...list];
  switch (state.sort) {
    case 'newest': return arr.sort((a, b) => (b.badges.includes('new') ? 1 : 0) - (a.badges.includes('new') ? 1 : 0));
    case 'bestselling': return arr.sort((a, b) => b.reviewCount - a.reviewCount);
    case 'rating': return arr.sort((a, b) => b.rating - a.rating);
    case 'price-asc': return arr.sort((a, b) => a.price - b.price);
    case 'price-desc': return arr.sort((a, b) => b.price - a.price);
    default: return arr;
  }
}

/* ---------------- Filters panel ---------------- */

function subcategoryOptions() {
  if (state.categories.size === 0) return [];
  const subs = new Set();
  CATEGORIES.filter((c) => state.categories.has(c.id)).forEach((c) => c.subcategories.forEach((s) => subs.add(s)));
  return Array.from(subs);
}

function countFor(key, value) {
  return PRODUCTS.filter((p) => p[key] === value).length;
}

function filtersPanelHTML() {
  const subs = subcategoryOptions();
  return `
    <div class="filters-panel__head">
      <h3 style="font-size:var(--fs-md)">Filters</h3>
      <button type="button" data-clear-filters>Clear All</button>
    </div>

    <div class="field" style="margin-bottom:var(--sp-3)">
      <input type="search" placeholder="Search products…" value="${escapeHtml(state.query)}" data-filter-search>
    </div>

    <div class="accordion__item open">
      <div class="filter-group">
        <h4>Category</h4>
        ${CATEGORIES.map((c) => `
          <label class="check-row">
            <input type="checkbox" data-filter-category value="${c.id}" ${state.categories.has(c.id) ? 'checked' : ''}>
            ${c.name} <span class="cnt">(${countFor('category', c.id)})</span>
          </label>
        `).join('')}
      </div>
    </div>

    ${subs.length ? `
    <div class="filter-group">
      <h4>Subcategory</h4>
      ${subs.map((s) => `
        <label class="check-row">
          <input type="checkbox" data-filter-subcategory value="${escapeHtml(s)}" ${state.subcategories.has(s) ? 'checked' : ''}>
          ${escapeHtml(s)}
        </label>
      `).join('')}
    </div>` : ''}

    <div class="filter-group">
      <h4>Brand</h4>
      ${BRANDS.map((b) => `
        <label class="check-row">
          <input type="checkbox" data-filter-brand value="${b}" ${state.brands.has(b) ? 'checked' : ''}>
          ${b}
        </label>
      `).join('')}
    </div>

    <div class="filter-group">
      <h4>Price Range</h4>
      <input type="range" class="range-slider" min="${PRICE_MIN}" max="${PRICE_MAX}" value="${state.maxPrice}" data-filter-price-range>
      <div class="price-inputs">
        <input type="number" min="${PRICE_MIN}" max="${PRICE_MAX}" value="${state.minPrice}" data-filter-price-min aria-label="Minimum price">
        <span>–</span>
        <input type="number" min="${PRICE_MIN}" max="${PRICE_MAX}" value="${state.maxPrice}" data-filter-price-max aria-label="Maximum price">
      </div>
    </div>

    <div class="filter-group">
      <h4>Rating</h4>
      ${[4, 3, 2, 1].map((r) => `
        <label class="check-row">
          <input type="radio" name="filter-rating-group" data-filter-rating value="${r}" ${state.minRating === r ? 'checked' : ''}>
          ${'<i class="fa-solid fa-star" style="color:var(--color-gold);font-size:.75rem"></i>'.repeat(r)} &amp; Up
        </label>
      `).join('')}
      <label class="check-row">
        <input type="radio" name="filter-rating-group" data-filter-rating value="0" ${state.minRating === 0 ? 'checked' : ''}>
        Any Rating
      </label>
    </div>

    <div class="filter-group">
      <h4>Availability &amp; Deals</h4>
      <label class="check-row"><input type="checkbox" data-filter-stock ${state.inStockOnly ? 'checked' : ''}> In Stock Only</label>
      <label class="check-row"><input type="checkbox" data-filter-deals ${state.dealsOnly ? 'checked' : ''}> On Sale / Deals Only</label>
    </div>
  `;
}

function renderFiltersPanels() {
  qs('[data-filters-panel]').innerHTML = filtersPanelHTML();
  qs('[data-filters-panel-mobile]').innerHTML = filtersPanelHTML();
}

/* ---------------- Active filter chips ---------------- */

function renderActiveChips() {
  const chips = [];
  state.categories.forEach((id) => chips.push({ label: getCategory(id)?.name, remove: () => state.categories.delete(id) }));
  state.subcategories.forEach((s) => chips.push({ label: s, remove: () => state.subcategories.delete(s) }));
  state.brands.forEach((b) => chips.push({ label: b, remove: () => state.brands.delete(b) }));
  if (state.minRating) chips.push({ label: `${state.minRating}★ & up`, remove: () => { state.minRating = 0; } });
  if (state.inStockOnly) chips.push({ label: 'In Stock', remove: () => { state.inStockOnly = false; } });
  if (state.dealsOnly) chips.push({ label: 'On Sale', remove: () => { state.dealsOnly = false; } });
  if (state.minPrice > PRICE_MIN || state.maxPrice < PRICE_MAX) {
    chips.push({ label: `${formatCurrency(state.minPrice)} – ${formatCurrency(state.maxPrice)}`, remove: () => { state.minPrice = PRICE_MIN; state.maxPrice = PRICE_MAX; } });
  }
  if (state.query) chips.push({ label: `"${state.query}"`, remove: () => { state.query = ''; } });

  const container = qs('[data-active-filters]');
  container.innerHTML = chips.map((c, i) => `
    <span class="filter-chip">${escapeHtml(c.label || '')}<button type="button" data-chip-remove="${i}"><i class="fa-solid fa-xmark"></i></button></span>
  `).join('');
  container.querySelectorAll('[data-chip-remove]').forEach((btn, i) => {
    btn.addEventListener('click', () => { chips[i].remove(); state.page = 1; refresh(); });
  });
}

/* ---------------- Grid render (with skeleton loading) ---------------- */

let loadingTimer = null;

function renderGrid() {
  const grid = qs('[data-shop-grid]');
  grid.classList.toggle('list-view', state.view === 'list');
  const filtered = getSorted(getFiltered());
  const total = filtered.length;
  const visibleCount = Math.min(state.page * state.pageSize, total);
  const visible = filtered.slice(0, visibleCount);

  qs('[data-result-count]').textContent = total;
  qs('[data-no-results]').hidden = total !== 0;
  grid.hidden = total === 0;

  clearTimeout(loadingTimer);
  grid.innerHTML = Array.from({ length: Math.min(visibleCount, state.pageSize) || 4 }).map(skeletonCardHTML).join('');

  loadingTimer = setTimeout(() => {
    grid.innerHTML = visible.map((p) => productCardHTML(p, { reveal: true })).join('');
    staggerReveal(grid, 50);
  }, 320);

  const wrap = qs('[data-load-more-wrap]');
  wrap.hidden = total === 0 || visibleCount >= total;
  qs('[data-load-shown]').textContent = visibleCount;
  qs('[data-load-total]').textContent = total;
  qs('[data-load-progress]').style.width = `${total ? (visibleCount / total) * 100 : 0}%`;
}

function refresh() {
  renderFiltersPanels();
  renderActiveChips();
  renderGrid();
}

/* ---------------- Wiring (event delegation, survives re-renders) ---------------- */

function wireEvents() {
  document.addEventListener('change', (e) => {
    if (e.target.matches('[data-filter-category]')) {
      e.target.checked ? state.categories.add(e.target.value) : state.categories.delete(e.target.value);
      state.subcategories.clear();
      state.page = 1; refresh();
    }
    if (e.target.matches('[data-filter-subcategory]')) {
      e.target.checked ? state.subcategories.add(e.target.value) : state.subcategories.delete(e.target.value);
      state.page = 1; refresh();
    }
    if (e.target.matches('[data-filter-brand]')) {
      e.target.checked ? state.brands.add(e.target.value) : state.brands.delete(e.target.value);
      state.page = 1; refresh();
    }
    if (e.target.matches('[data-filter-rating]')) {
      state.minRating = Number(e.target.value);
      state.page = 1; refresh();
    }
    if (e.target.matches('[data-filter-stock]')) {
      state.inStockOnly = e.target.checked;
      state.page = 1; refresh();
    }
    if (e.target.matches('[data-filter-deals]')) {
      state.dealsOnly = e.target.checked;
      state.page = 1; refresh();
    }
    if (e.target.matches('[data-filter-price-min]')) {
      state.minPrice = Math.min(Number(e.target.value) || PRICE_MIN, state.maxPrice);
      state.page = 1; refresh();
    }
    if (e.target.matches('[data-filter-price-max]')) {
      state.maxPrice = Math.max(Number(e.target.value) || PRICE_MAX, state.minPrice);
      state.page = 1; refresh();
    }
    if (e.target.matches('[data-filter-price-range]')) {
      state.maxPrice = Number(e.target.value);
      state.page = 1; refresh();
    }
  });

  const onSearch = debounce((e) => {
    if (!e.target.matches('[data-filter-search]')) return;
    state.query = e.target.value.trim();
    state.page = 1; refresh();
  }, 350);
  document.addEventListener('input', onSearch);

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-clear-filters]')) clearAll();
  });

  qs('[data-load-more]').addEventListener('click', () => {
    state.page += 1;
    renderGrid();
  });

  qsa('[data-view-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.viewBtn;
      qsa('[data-view-btn]').forEach((b) => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      renderGrid();
    });
  });

  // Sort dropdown
  const sortDropdown = qs('[data-sort-dropdown]');
  qs('[data-sort-trigger]').addEventListener('click', (e) => {
    e.stopPropagation();
    sortDropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => sortDropdown.classList.remove('open'));
  qsa('[data-sort-value]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.sort = btn.dataset.sortValue;
      qs('[data-sort-label]').textContent = `Sort: ${SORT_LABELS[state.sort]}`;
      qsa('[data-sort-value]').forEach((b) => b.classList.toggle('active', b === btn));
      state.page = 1;
      renderGrid();
    });
  });

  // Mobile filter drawer
  const drawer = qs('[data-mobile-filter-drawer]');
  const overlay = qs('[data-mobile-filter-overlay]');
  qs('[data-mobile-filter-open]').addEventListener('click', () => { drawer.classList.add('open'); overlay.classList.add('open'); });
  qs('[data-mobile-filter-close]').addEventListener('click', closeMobileFilters);
  qs('[data-mobile-filter-apply]').addEventListener('click', closeMobileFilters);
  overlay.addEventListener('click', closeMobileFilters);

  function closeMobileFilters() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
  }
}

function clearAll() {
  state.categories.clear();
  state.subcategories.clear();
  state.brands.clear();
  state.minPrice = PRICE_MIN;
  state.maxPrice = PRICE_MAX;
  state.minRating = 0;
  state.inStockOnly = false;
  state.dealsOnly = false;
  state.query = '';
  state.page = 1;
  refresh();
}

if (state.categories.size) {
  const cat = getCategory([...state.categories][0]);
  if (cat) qs('[data-shop-desc]').textContent = `Browsing ${cat.name} — ${cat.subcategories.join(', ')}.`;
}

wireEvents();
refresh();
