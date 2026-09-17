// Smart Mart — reusable product card renderer + delegated interactions.
// Render with `productCardHTML(product)` anywhere (home rows, shop grid,
// related products) and call `initProductCardEvents()` once per page.

import { formatCurrency, starsMarkup, escapeHtml } from './utils.js';
import { addToCart, isWishlisted, toggleWishlist } from './store.js';
import { showToast } from './toast.js';

function badgesMarkup(product) {
  const out = [];
  if (product.badges.includes('new')) out.push('<span class="badge badge-new">New</span>');
  if (product.discount > 0) out.push(`<span class="badge badge-sale">-${product.discount}%</span>`);
  if (product.badges.includes('bestseller')) out.push('<span class="badge badge-best">Best Seller</span>');
  if (product.stock === 0) out.push('<span class="badge badge-out">Out of Stock</span>');
  return out.join('');
}

function stockMarkup(product) {
  if (product.stock === 0) return '<span class="product-card__stock out">Out of stock</span>';
  if (product.stock <= 10) return `<span class="product-card__stock low">Only ${product.stock} left</span>`;
  return '<span class="product-card__stock in">In stock</span>';
}

export function productCardHTML(product, { reveal = false } = {}) {
  const wished = isWishlisted(product.id);
  return `
  <article class="product-card"${reveal ? ' data-reveal="up"' : ''} data-product-id="${product.id}">
    <div class="product-card__media">
      <div class="product-card__badges">${badgesMarkup(product)}</div>
      <button class="product-card__wishlist${wished ? ' active' : ''}" data-wishlist="${product.id}" aria-label="Toggle wishlist" aria-pressed="${wished}">
        <i class="fa-${wished ? 'solid' : 'regular'} fa-heart"></i>
      </button>
      <a href="product.html?slug=${product.slug}">
        <img class="img-main" src="${product.images[0]}" alt="${escapeHtml(product.name)}" loading="lazy" width="400" height="400">
        <img class="img-alt" src="${product.images[1]}" alt="" loading="lazy" width="400" height="400">
      </a>
      <div class="product-card__quick">
        <button data-quickview="${product.id}"><i class="fa-regular fa-eye"></i> Quick View</button>
      </div>
    </div>
    <div class="product-card__body">
      <span class="product-card__category">${product.brand}</span>
      <h3 class="product-card__title"><a href="product.html?slug=${product.slug}">${escapeHtml(product.name)}</a></h3>
      <div class="rating">${starsMarkup(product.rating)}<span class="count">(${product.reviewCount})</span></div>
      <div class="product-card__price">
        <span class="price-now">${formatCurrency(product.price)}</span>
        ${product.oldPrice ? `<span class="price-old">${formatCurrency(product.oldPrice)}</span>` : ''}
      </div>
      ${stockMarkup(product)}
      <div class="product-card__footer">
        <button class="add-to-cart-btn" data-add-to-cart="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
          <span class="icon-pop"><i class="fa-solid fa-cart-plus"></i></span>
          <span class="btn-label">${product.stock === 0 ? 'Unavailable' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  </article>`;
}

export function skeletonCardHTML() {
  return `
  <div class="product-card skeleton-card skeleton" aria-hidden="true">
    <div style="aspect-ratio:1/1"></div>
  </div>`;
}

let bound = false;

export function initProductCardEvents() {
  if (bound) return;
  bound = true;

  document.addEventListener('click', (e) => {
    const wishBtn = e.target.closest('[data-wishlist]');
    if (wishBtn) {
      const id = wishBtn.dataset.wishlist;
      const active = toggleWishlist(id);
      wishBtn.classList.toggle('active', active);
      wishBtn.setAttribute('aria-pressed', String(active));
      const icon = wishBtn.querySelector('i');
      icon.className = `fa-${active ? 'solid' : 'regular'} fa-heart`;
      showToast(active ? 'Added to wishlist' : 'Removed from wishlist', 'success');
      return;
    }

    const addBtn = e.target.closest('[data-add-to-cart]');
    if (addBtn && !addBtn.disabled) {
      const id = addBtn.dataset.addToCart;
      const result = addToCart(id, null, 1);
      if (result.ok) {
        addBtn.classList.add('is-added', 'pulse');
        const label = addBtn.querySelector('.btn-label');
        const prevLabel = label.textContent;
        label.textContent = 'Added ✓';
        showToast('Item added to your cart', 'success');
        bumpCartIcon();
        setTimeout(() => {
          addBtn.classList.remove('pulse');
          label.textContent = prevLabel;
        }, 1400);
      } else {
        showToast(result.message, 'error');
      }
      return;
    }

    const quickBtn = e.target.closest('[data-quickview]');
    if (quickBtn) {
      document.dispatchEvent(new CustomEvent('quickview:open', { detail: { id: quickBtn.dataset.quickview } }));
    }
  });
}

export function bumpCartIcon() {
  const icon = document.querySelector('[data-header-cart-icon]');
  if (!icon) return;
  icon.classList.remove('cart-bump');
  void icon.offsetWidth;
  icon.classList.add('cart-bump');
}
