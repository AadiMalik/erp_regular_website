// Smart Mart — header/footer interactivity: sticky scroll state, mobile
// drawer, mega menu + footer category lists, live search suggestions,
// wishlist drawer and cart/wishlist badge counts.
// Call `initHeader()` once, after `loadPartials()` has resolved.

import { qs, qsa, debounce, formatCurrency, escapeHtml } from './utils.js';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS } from '../data/products.js';
import { getCartCount, getWishlist, toggleWishlist } from './store.js';
import { getCurrentUser, logout } from './auth.js';
import { showToast } from './toast.js';

function populateCategoryLists() {
  const mega = qs('[data-mega-categories]');
  if (mega) {
    mega.innerHTML = CATEGORIES.map((c) => `
      <a href="shop.html?category=${c.id}"><i class="fa-solid ${c.icon}"></i> ${c.name}</a>
    `).join('');
  }
  const mobile = qs('[data-mobile-categories]');
  if (mobile) {
    mobile.innerHTML = CATEGORIES.map((c) => `
      <a href="shop.html?category=${c.id}"><i class="fa-solid ${c.icon}"></i> ${c.name}</a>
    `).join('');
  }
  const footer = qs('[data-footer-categories]');
  if (footer) {
    footer.innerHTML = CATEGORIES.slice(0, 6).map((c) => `
      <li><a href="shop.html?category=${c.id}">${c.name}</a></li>
    `).join('');
  }
}

function initStickyHeader() {
  const header = qs('#siteHeaderEl');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMobileDrawer() {
  const hamburger = qs('[data-drawer-toggle]');
  const drawer = qs('[data-mobile-drawer]');
  const overlay = qs('[data-drawer-overlay]');
  const closeBtn = qs('[data-drawer-close]');
  if (!hamburger || !drawer || !overlay) return;

  const open = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => (drawer.classList.contains('open') ? close() : open()));
  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', () => {
    close();
    closeWishlistDrawer();
  });
}

function initSearchToggle() {
  const toggle = qs('[data-search-toggle]');
  const panel = qs('[data-search-panel]');
  const closeBtn = qs('[data-search-close]');
  if (!toggle || !panel) return;

  const open = () => {
    panel.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    setTimeout(() => qs('[data-search-input]', panel)?.focus(), 150);
  };
  const close = () => {
    panel.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.contains('open') ? close() : open();
  });
  closeBtn?.addEventListener('click', close);
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== toggle) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?';
}

function renderAccountMenu() {
  const menu = qs('[data-account-menu]');
  const user = getCurrentUser();
  if (menu) {
    menu.innerHTML = user ? `
      <div class="account-menu__head">
        <span class="account-menu__avatar">${initials(user.name)}</span>
        <div><strong>${escapeHtml(user.name)}</strong><span>${escapeHtml(user.email)}</span></div>
      </div>
      <a href="account.html"><i class="fa-regular fa-user"></i> My Profile</a>
      <a href="orders.html"><i class="fa-solid fa-bag-shopping"></i> My Orders</a>
      <a href="account-password.html"><i class="fa-solid fa-lock"></i> Change Password</a>
      <button type="button" class="danger" data-logout-btn><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
    ` : `
      <a href="login.html"><i class="fa-solid fa-right-to-bracket"></i> Sign In</a>
      <a href="signup.html"><i class="fa-solid fa-user-plus"></i> Create Account</a>
      <a href="track-order.html"><i class="fa-solid fa-truck-fast"></i> Track My Order</a>
    `;
  }

  const mobileFoot = qs('[data-mobile-auth-foot]');
  if (mobileFoot) {
    mobileFoot.innerHTML = user ? `
      <a href="account.html" class="btn btn-outline btn-block btn-sm"><i class="fa-regular fa-user"></i> My Profile</a>
      <button type="button" class="btn btn-primary btn-block btn-sm" data-logout-btn>Logout</button>
    ` : `
      <a href="login.html" class="btn btn-outline btn-block btn-sm">Sign In</a>
      <a href="signup.html" class="btn btn-primary btn-block btn-sm">Register</a>
    `;
  }

  qsa('[data-logout-btn]').forEach((btn) => btn.addEventListener('click', () => {
    logout();
    showToast('You have been signed out.', 'info');
    setTimeout(() => { window.location.href = 'index.html'; }, 600);
  }));
}

function initAccountDropdown() {
  const dropdown = qs('[data-account-dropdown]');
  const trigger = qs('[data-account-toggle]');
  renderAccountMenu();
  if (!dropdown || !trigger) return;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown.classList.remove('open'));
  window.addEventListener('auth:change', renderAccountMenu);
}

function closeWishlistDrawer() {
  qs('[data-wishlist-drawer]')?.classList.remove('open');
}

function renderWishlistDrawer() {
  const container = qs('[data-wishlist-items]');
  if (!container) return;
  const ids = getWishlist();
  const items = PRODUCTS.filter((p) => ids.includes(p.id));
  if (items.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--color-text-muted)">
      <i class="fa-regular fa-heart" style="font-size:2rem;display:block;margin-bottom:12px;color:var(--color-border-strong)"></i>
      Your wishlist is empty.
    </div>`;
    return;
  }
  container.innerHTML = items.map((p) => `
    <div style="display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--color-border)">
      <img src="${p.images[0]}" alt="" style="width:60px;height:60px;border-radius:10px;object-fit:cover">
      <div style="flex:1;min-width:0">
        <a href="product.html?slug=${p.slug}" style="font-size:.85rem;font-weight:600;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(p.name)}</a>
        <span style="font-size:.8rem;color:var(--color-primary-dark);font-weight:700">${formatCurrency(p.price)}</span>
      </div>
      <button class="btn-icon" data-wishlist="${p.id}" aria-label="Remove"><i class="fa-solid fa-trash-can" style="font-size:.8rem"></i></button>
    </div>
  `).join('');
}

function initWishlistDrawer() {
  const toggle = qs('[data-wishlist-toggle]');
  const closeBtn = qs('[data-wishlist-close]');
  const drawer = qs('[data-wishlist-drawer]');
  if (!toggle || !drawer) return;
  toggle.addEventListener('click', () => {
    renderWishlistDrawer();
    drawer.classList.add('open');
    qs('[data-drawer-overlay]')?.classList.add('open');
  });
  closeBtn?.addEventListener('click', closeWishlistDrawer);
  drawer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-wishlist]');
    if (btn) { toggleWishlist(btn.dataset.wishlist); renderWishlistDrawer(); }
  });
}

function initSearch() {
  qsa('[data-search-form]').forEach((form) => {
    const input = qs('[data-search-input]', form);
    const suggestBox = form.parentElement.querySelector('[data-search-suggest]');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      window.location.href = `shop.html${q ? `?q=${encodeURIComponent(q)}` : ''}`;
    });

    if (!suggestBox) return;
    const render = debounce(() => {
      const q = input.value.trim().toLowerCase();
      if (!q) { suggestBox.classList.remove('open'); return; }
      const matches = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)).slice(0, 6);
      suggestBox.innerHTML = matches.length ? matches.map((p) => `
        <a class="search-suggest__item" href="product.html?slug=${p.slug}">
          <img src="${p.images[0]}" alt="">
          <span>
            <span class="name">${escapeHtml(p.name)}</span>
            <span class="cat">${p.brand} · ${p.unit}</span>
          </span>
          <span class="price">${formatCurrency(p.price)}</span>
        </a>`).join('') : `<div class="search-suggest__empty">No products found for "${escapeHtml(q)}"</div>`;
      suggestBox.classList.add('open');
    }, 200);

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    document.addEventListener('click', (e) => {
      if (!form.parentElement.contains(e.target)) suggestBox.classList.remove('open');
    });
  });
}

function initBackToTop() {
  const btn = qs('[data-back-to-top]');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 480), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function updateCounts() {
  qsa('[data-cart-count]').forEach((el) => {
    el.textContent = getCartCount();
    el.classList.remove('count-pop'); void el.offsetWidth; el.classList.add('count-pop');
  });
  qsa('[data-wishlist-count]').forEach((el) => {
    el.textContent = getWishlist().length;
    el.classList.remove('count-pop'); void el.offsetWidth; el.classList.add('count-pop');
  });
}

function markActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  qsa('.main-nav a[data-nav]').forEach((a) => {
    const target = a.getAttribute('href').split('?')[0];
    if (target === page || (page === '' && target === 'index.html')) a.classList.add('active');
  });
}

export function initHeader() {
  populateCategoryLists();
  initStickyHeader();
  initMobileDrawer();
  initSearchToggle();
  initAccountDropdown();
  initWishlistDrawer();
  initSearch();
  initBackToTop();
  markActiveNav();
  updateCounts();

  window.addEventListener('cart:change', updateCounts);
  window.addEventListener('wishlist:change', () => { updateCounts(); renderWishlistDrawer(); });
}
