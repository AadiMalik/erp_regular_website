// Smart Mart — generic modal helpers + Quick View modal + fullscreen image lightbox.
// Expects `#modal-root` (quick view) and `#lightbox-root` (gallery zoom)
// overlay containers to exist in the page markup.

import { qs, formatCurrency, starsMarkup, escapeHtml, clamp } from './utils.js';
import { PRODUCTS } from '../data/products.js';
import { addToCart } from './store.js';
import { showToast } from './toast.js';
import { bumpCartIcon } from './product-card.js';

function openOverlay(el) {
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeOverlay(el) {
  el.classList.remove('open');
  document.body.style.overflow = '';
}

/* ---------------- Quick View ---------------- */

function quickViewMarkup(product) {
  const hasVariations = !!product.variations;
  const firstOpt = hasVariations ? product.variations.options.find((o) => o.stock > 0) || product.variations.options[0] : null;
  return `
  <button class="modal-close" data-modal-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
  <div class="qv-grid">
    <div class="qv-grid__media">
      <img src="${product.images[0]}" alt="${escapeHtml(product.name)}" data-qv-image>
    </div>
    <div class="qv-grid__info">
      <span class="pd-brand">${product.brand}</span>
      <h2 style="font-size:var(--fs-xl);margin-top:6px;color:var(--color-secondary)">${escapeHtml(product.name)}</h2>
      <div class="rating" style="margin-top:8px">${starsMarkup(product.rating)}<span class="count">(${product.reviewCount} reviews)</span></div>
      <div class="pd-price" style="margin-top:14px" data-qv-price>
        <span class="now">${formatCurrency(firstOpt ? firstOpt.price : product.price)}</span>
        ${(firstOpt ? firstOpt.oldPrice : product.oldPrice) ? `<span class="old">${formatCurrency(firstOpt ? firstOpt.oldPrice : product.oldPrice)}</span>` : ''}
      </div>
      <p class="text-muted" style="margin-top:12px;font-size:.9rem">${escapeHtml(product.description)}</p>
      ${hasVariations ? `
      <div class="pd-variation">
        <h4>${product.variations.label}: <span class="selected-val" data-qv-selected-label>${firstOpt.label}</span></h4>
        <div class="swatch-group" data-qv-swatches>
          ${product.variations.options.map((o) => `
            <button class="swatch${o.label === firstOpt.label ? ' active' : ''}" data-qv-swatch="${o.label}" ${o.stock === 0 ? 'disabled' : ''}>${o.label}</button>
          `).join('')}
        </div>
      </div>` : ''}
      <div class="pd-actions" style="margin-top:var(--sp-5)">
        <div class="qty-control" data-qv-qty>
          <button type="button" data-qty-down>−</button>
          <input type="number" value="1" min="1" max="${firstOpt ? firstOpt.stock : product.stock}" data-qty-input>
          <button type="button" data-qty-up>+</button>
        </div>
        <button class="btn btn-primary" data-qv-add data-id="${product.id}">
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
      <a href="product.html?slug=${product.slug}" class="btn btn-ghost btn-sm" style="margin-top:14px">View full details <i class="fa-solid fa-arrow-right"></i></a>
    </div>
  </div>`;
}

export function initQuickView() {
  const root = qs('#modal-root');
  if (!root) return;

  document.addEventListener('quickview:open', (e) => {
    const product = PRODUCTS.find((p) => p.id === e.detail.id);
    if (!product) return;
    root.querySelector('.modal-box').innerHTML = quickViewMarkup(product);
    openOverlay(root);
    let selected = product.variations ? (product.variations.options.find((o) => o.stock > 0) || product.variations.options[0]) : null;

    const updatePriceAndStock = () => {
      const price = selected ? selected.price : product.price;
      const oldPrice = selected ? selected.oldPrice : product.oldPrice;
      root.querySelector('[data-qv-price]').innerHTML = `<span class="now">${formatCurrency(price)}</span>${oldPrice ? `<span class="old">${formatCurrency(oldPrice)}</span>` : ''}`;
      const qtyInput = root.querySelector('[data-qty-input]');
      const max = selected ? selected.stock : product.stock;
      qtyInput.max = max;
      qtyInput.value = Math.min(Number(qtyInput.value) || 1, Math.max(max, 1));
    };

    root.querySelectorAll('[data-qv-swatch]').forEach((btn) => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('[data-qv-swatch]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selected = product.variations.options.find((o) => o.label === btn.dataset.qvSwatch);
        root.querySelector('[data-qv-selected-label]').textContent = selected.label;
        updatePriceAndStock();
      });
    });

    const qtyInput = root.querySelector('[data-qty-input]');
    root.querySelector('[data-qty-down]').addEventListener('click', () => {
      qtyInput.value = clamp(Number(qtyInput.value) - 1, 1, Number(qtyInput.max));
    });
    root.querySelector('[data-qty-up]').addEventListener('click', () => {
      qtyInput.value = clamp(Number(qtyInput.value) + 1, 1, Number(qtyInput.max));
    });

    root.querySelector('[data-qv-add]').addEventListener('click', () => {
      const result = addToCart(product.id, selected ? selected.label : null, Number(qtyInput.value));
      if (result.ok) {
        showToast('Item added to your cart', 'success');
        bumpCartIcon();
        closeOverlay(root);
      } else {
        showToast(result.message, 'error');
      }
    });
  });

  root.addEventListener('click', (e) => {
    if (e.target === root || e.target.closest('[data-modal-close]')) closeOverlay(root);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay(root);
  });
}

/* ---------------- Fullscreen image lightbox ---------------- */

export function initLightbox() {
  const root = qs('#lightbox-root');
  if (!root) return;
  root.addEventListener('click', (e) => {
    if (e.target === root || e.target.closest('[data-modal-close]')) closeOverlay(root);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay(root);
  });
}

export function openLightbox(src, alt = '') {
  const root = qs('#lightbox-root');
  if (!root) return;
  root.querySelector('.modal-box').innerHTML = `
    <button class="modal-close" data-modal-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
    <img src="${src}" alt="${escapeHtml(alt)}" style="width:100%;height:100%;max-height:88vh;object-fit:contain;display:block">`;
  openOverlay(root);
}
