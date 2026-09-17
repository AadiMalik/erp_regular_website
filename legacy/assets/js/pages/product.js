// Smart Mart — Product Detail page.

import { qs, qsa, formatCurrency, starsMarkup, escapeHtml, clamp } from '../core/utils.js';
import { getProductBySlug, getRelatedProducts } from '../data/products.js';
import { generateReviews, ratingBreakdown } from '../data/reviews.js';
import { productCardHTML } from '../core/product-card.js';
import { staggerReveal, observe } from '../core/reveal.js';
import { openLightbox } from '../core/modal.js';
import { addToCart, isWishlisted, toggleWishlist } from '../core/store.js';
import { showToast } from '../core/toast.js';

const slug = new URLSearchParams(window.location.search).get('slug');
const product = getProductBySlug(slug);

if (!product) {
  qs('#main').innerHTML = `
    <div class="section container center">
      <h1>Product Not Found</h1>
      <p class="text-muted" style="margin:var(--sp-4) 0">The product you're looking for doesn't exist or may have been removed.</p>
      <a href="shop.html" class="btn btn-primary">Back to Shop</a>
    </div>`;
  throw new Error('Product not found');
}

document.title = `${product.name} — Smart Mart`;
document.querySelector('title').textContent = document.title;

let selectedOption = product.variations ? (product.variations.options.find((o) => o.stock > 0) || product.variations.options[0]) : null;
let qty = 1;

function currentPrice() { return selectedOption ? selectedOption.price : product.price; }
function currentOldPrice() { return selectedOption ? selectedOption.oldPrice : product.oldPrice; }
function currentStock() { return selectedOption ? selectedOption.stock : product.stock; }
function currentImage() {
  if (!product.variations) return product.images[0];
  const idx = product.variations.options.indexOf(selectedOption);
  return product.images[idx % product.images.length];
}

/* ---------------- Breadcrumb ---------------- */
function renderBreadcrumb() {
  const bc = qs('[data-pd-breadcrumb]');
  bc.insertAdjacentHTML('beforeend', `
    <span class="sep">/</span>
    <a href="shop.html?category=${product.category}">${escapeHtml(product.subcategory)}</a>
    <span class="sep">/</span>
    <span class="current">${escapeHtml(product.name)}</span>
  `);
}

/* ---------------- Gallery ---------------- */
function renderGallery() {
  const el = qs('[data-pd-gallery]');
  el.innerHTML = `
    <div class="gallery__main" data-gallery-main>
      <img src="${currentImage()}" alt="${escapeHtml(product.name)}" data-gallery-img>
      <span class="gallery__zoom-hint"><i class="fa-solid fa-magnifying-glass-plus"></i> Click to zoom</span>
    </div>
    <div class="gallery__thumbs">
      ${product.images.map((src, i) => `
        <button class="${i === 0 ? 'active' : ''}" data-thumb="${src}"><img src="${src}" alt="View ${i + 1}"></button>
      `).join('')}
    </div>`;

  qs('[data-gallery-main]').addEventListener('click', () => openLightbox(qs('[data-gallery-img]').src, product.name));
  qsa('[data-thumb]', el).forEach((btn) => {
    btn.addEventListener('click', () => {
      qs('[data-gallery-img]').style.opacity = 0;
      setTimeout(() => {
        qs('[data-gallery-img]').src = btn.dataset.thumb;
        qs('[data-gallery-img]').style.opacity = 1;
      }, 150);
      qsa('[data-thumb]', el).forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function updateGalleryImage() {
  const img = qs('[data-gallery-img]');
  img.style.opacity = 0;
  setTimeout(() => { img.src = currentImage(); img.style.opacity = 1; }, 150);
  qsa('[data-thumb]').forEach((b) => b.classList.toggle('active', b.dataset.thumb === currentImage()));
}

/* ---------------- Info panel ---------------- */
function stockBadge() {
  const stock = currentStock();
  if (stock === 0) return '<span class="badge badge-out">Out of Stock</span>';
  if (stock <= 10) return `<span class="badge badge-low">Only ${stock} left in stock</span>`;
  return '<span class="badge badge-soft"><i class="fa-solid fa-check"></i> In Stock</span>';
}

function renderInfo() {
  const el = qs('[data-pd-info]');
  const wished = isWishlisted(product.id);
  el.innerHTML = `
    <span class="pd-brand">${product.brand} &middot; ${escapeHtml(product.subcategory)}</span>
    <h1 class="pd-title">${escapeHtml(product.name)}</h1>
    <div class="pd-meta">
      <div class="rating">${starsMarkup(product.rating)}<span class="count">${product.rating.toFixed(1)} (${product.reviewCount} reviews)</span></div>
      <span class="sep">|</span>
      <span data-pd-stock>${stockBadge()}</span>
      <span class="sep">|</span>
      <span>SKU: ${product.sku}</span>
    </div>

    <div class="pd-price" data-pd-price>
      <span class="now">${formatCurrency(currentPrice())}</span>
      ${currentOldPrice() ? `<span class="old">${formatCurrency(currentOldPrice())}</span><span class="badge badge-sale">-${Math.round(100 - (currentPrice() / currentOldPrice()) * 100)}%</span>` : ''}
    </div>

    <p class="pd-desc">${escapeHtml(product.description)}</p>
    <ul class="pd-highlights">
      ${product.highlights.map((h) => `<li><i class="fa-solid fa-circle-check"></i> ${escapeHtml(h)}</li>`).join('')}
    </ul>

    ${product.variations ? `
    <div class="pd-variation">
      <h4>${product.variations.label}: <span class="selected-val" data-pd-selected-label>${selectedOption.label}</span></h4>
      <div class="swatch-group" data-pd-swatches>
        ${product.variations.options.map((o) => `
          <button class="swatch${o === selectedOption ? ' active' : ''}" data-pd-swatch="${o.label}" ${o.stock === 0 ? 'disabled' : ''}>${o.label}${o.stock === 0 ? ' (Out)' : ''}</button>
        `).join('')}
      </div>
    </div>` : ''}

    <div class="pd-actions">
      <div class="qty-control" data-pd-qty>
        <button type="button" data-qty-down aria-label="Decrease quantity">−</button>
        <input type="number" value="1" min="1" max="${currentStock()}" data-qty-input aria-label="Quantity">
        <button type="button" data-qty-up aria-label="Increase quantity">+</button>
      </div>
      <button class="btn btn-primary" data-add-to-cart-pd ${currentStock() === 0 ? 'disabled' : ''}>
        <i class="fa-solid fa-cart-plus"></i> Add to Cart
      </button>
      <button class="btn btn-dark" data-buy-now ${currentStock() === 0 ? 'disabled' : ''}>
        <i class="fa-solid fa-bolt"></i> Buy Now
      </button>
      <button class="btn-icon" data-pd-wishlist aria-label="Toggle wishlist" style="${wished ? 'color:var(--color-danger)' : ''}">
        <i class="fa-${wished ? 'solid' : 'regular'} fa-heart"></i>
      </button>
    </div>

    <div class="pd-info-box">
      <div><i class="fa-solid fa-truck-fast"></i> <span>Free delivery on orders over $50 — arrives within 2 hours in your area.</span></div>
      <div><i class="fa-solid fa-rotate-left"></i> <span>Easy 24-hour returns if you're not fully satisfied.</span></div>
      <div><i class="fa-solid fa-shield-heart"></i> <span>Freshness guaranteed, or your money back.</span></div>
    </div>
  `;

  wireInfoEvents();
}

function wireInfoEvents() {
  const qtyInput = qs('[data-qty-input]');

  const refreshDynamic = () => {
    qs('[data-pd-price]').innerHTML = `
      <span class="now">${formatCurrency(currentPrice())}</span>
      ${currentOldPrice() ? `<span class="old">${formatCurrency(currentOldPrice())}</span><span class="badge badge-sale">-${Math.round(100 - (currentPrice() / currentOldPrice()) * 100)}%</span>` : ''}`;
    qs('[data-pd-stock]').innerHTML = stockBadge();
    qtyInput.max = currentStock();
    qty = clamp(qty, 1, Math.max(currentStock(), 1));
    qtyInput.value = qty;
    const addBtn = qs('[data-add-to-cart-pd]');
    const buyBtn = qs('[data-buy-now]');
    addBtn.disabled = currentStock() === 0;
    buyBtn.disabled = currentStock() === 0;
    updateGalleryImage();
  };

  if (product.variations) {
    qsa('[data-pd-swatch]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedOption = product.variations.options.find((o) => o.label === btn.dataset.pdSwatch);
        qsa('[data-pd-swatch]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        qs('[data-pd-selected-label]').textContent = selectedOption.label;
        refreshDynamic();
      });
    });
  }

  qs('[data-qty-down]').addEventListener('click', () => { qty = clamp(qty - 1, 1, currentStock()); qtyInput.value = qty; });
  qs('[data-qty-up]').addEventListener('click', () => { qty = clamp(qty + 1, 1, currentStock()); qtyInput.value = qty; });
  qtyInput.addEventListener('change', () => { qty = clamp(Number(qtyInput.value) || 1, 1, currentStock()); qtyInput.value = qty; });

  qs('[data-add-to-cart-pd]').addEventListener('click', () => {
    const result = addToCart(product.id, selectedOption ? selectedOption.label : null, qty);
    if (result.ok) showToast('Item added to your cart', 'success');
    else showToast(result.message, 'error');
  });

  qs('[data-buy-now]').addEventListener('click', () => {
    const result = addToCart(product.id, selectedOption ? selectedOption.label : null, qty);
    if (result.ok) window.location.href = 'checkout.html';
    else showToast(result.message, 'error');
  });

  qs('[data-pd-wishlist]').addEventListener('click', (e) => {
    const active = toggleWishlist(product.id);
    const btn = e.currentTarget;
    btn.style.color = active ? 'var(--color-danger)' : '';
    btn.querySelector('i').className = `fa-${active ? 'solid' : 'regular'} fa-heart`;
    showToast(active ? 'Added to wishlist' : 'Removed from wishlist', 'success');
  });
}

/* ---------------- Tabs ---------------- */
function renderTabs() {
  qs('[data-tab-panel="description"]').innerHTML = `
    <p style="max-width:70ch;color:var(--color-text-soft)">${escapeHtml(product.description)}</p>
    <ul class="pd-highlights" style="margin-top:var(--sp-4)">
      ${product.highlights.map((h) => `<li><i class="fa-solid fa-circle-check"></i> ${escapeHtml(h)}</li>`).join('')}
    </ul>`;

  qs('[data-tab-panel="specs"]').innerHTML = `
    <table class="spec-table">
      <tr><td>Brand</td><td>${product.brand}</td></tr>
      <tr><td>Category</td><td>${escapeHtml(product.subcategory)}</td></tr>
      <tr><td>SKU</td><td>${product.sku}</td></tr>
      <tr><td>Unit</td><td>${product.unit}</td></tr>
      ${product.variations ? `<tr><td>${product.variations.label} Options</td><td>${product.variations.options.map((o) => o.label).join(', ')}</td></tr>` : ''}
      <tr><td>Stock Status</td><td>${product.stock === 0 ? 'Out of Stock' : `${product.stock} units available`}</td></tr>
    </table>`;

  renderReviewsTab();

  qs('[data-tab-panel="delivery"]').innerHTML = `
    <div class="pd-info-box" style="border:none;padding:0;gap:var(--sp-4)">
      <div><i class="fa-solid fa-truck-fast"></i> <span><strong>Delivery:</strong> Order before 6pm for same-day delivery. Standard delivery within 2 hours, free on orders over $50 (otherwise a flat $4.99 fee applies).</span></div>
      <div><i class="fa-solid fa-box-open"></i> <span><strong>Packaging:</strong> Fresh items are packed in insulated, eco-friendly packaging to preserve quality in transit.</span></div>
      <div><i class="fa-solid fa-rotate-left"></i> <span><strong>Returns:</strong> Not satisfied? Request a return or replacement within 24 hours of delivery for a full refund.</span></div>
      <div><i class="fa-solid fa-shield-heart"></i> <span><strong>Freshness Guarantee:</strong> If any item arrives damaged or below quality expectations, we'll replace or refund it immediately.</span></div>
    </div>`;
}

const productReviews = generateReviews(product);

function renderReviewsTab() {
  const reviews = productReviews;
  const breakdown = ratingBreakdown(product);
  qs('[data-tab-panel="reviews"]').innerHTML = `
    <div class="reviews-summary">
      <div class="reviews-summary__score">
        <strong>${product.rating.toFixed(1)}</strong>
        ${starsMarkup(product.rating)}
        <p class="text-muted" style="font-size:var(--fs-xs);margin-top:4px">${product.reviewCount} reviews</p>
      </div>
      <div class="rating-bars">
        ${breakdown.map((b) => `
          <div class="row"><span>${b.star}★</span><div class="bar"><span style="width:${b.pct}%"></span></div><span>${b.pct}%</span></div>
        `).join('')}
      </div>
    </div>
    <div data-review-list>
      ${reviews.map((r) => reviewItemHTML(r)).join('')}
    </div>

    <div style="margin-top:var(--sp-7);padding-top:var(--sp-6);border-top:1px solid var(--color-border)">
      <h3 style="font-size:var(--fs-md);margin-bottom:var(--sp-4)">Write a Review</h3>
      <form data-review-form>
        <div class="field">
          <label>Your Rating</label>
          <div class="swatch-group" data-review-stars>
            ${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="swatch" data-star="${n}">${n}★</button>`).join('')}
          </div>
        </div>
        <div class="field">
          <label for="reviewName">Name</label>
          <input id="reviewName" type="text" required placeholder="Your name">
        </div>
        <div class="field">
          <label for="reviewComment">Your Review</label>
          <textarea id="reviewComment" rows="3" required placeholder="Share your thoughts about this product…"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit Review</button>
      </form>
    </div>
  `;
  wireReviewForm(reviews);
}

function reviewItemHTML(r) {
  return `
    <div class="review-item">
      <div class="review-item__head">
        <img src="${r.avatar}" alt="${escapeHtml(r.name)}">
        <div>
          <strong>${escapeHtml(r.name)}</strong>
          <span>${r.date}</span>
        </div>
        <div class="rating" style="margin-left:auto">${starsMarkup(r.rating)}</div>
      </div>
      <p>${escapeHtml(r.comment)}</p>
    </div>`;
}

function wireReviewForm(reviews) {
  let picked = 5;
  const stars = qsa('[data-star]');
  const highlight = () => stars.forEach((s) => s.classList.toggle('active', Number(s.dataset.star) <= picked));
  highlight();
  stars.forEach((s) => s.addEventListener('click', () => { picked = Number(s.dataset.star); highlight(); }));

  qs('[data-review-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = qs('#reviewName').value.trim();
    const comment = qs('#reviewComment').value.trim();
    if (!name || !comment) return;
    const newReview = { name, avatar: `https://i.pravatar.cc/80?u=${encodeURIComponent(name)}`, rating: picked, date: 'Just now', comment };
    reviews.unshift(newReview);
    qs('[data-review-list]').insertAdjacentHTML('afterbegin', reviewItemHTML(newReview));
    e.target.reset();
    picked = 5; highlight();
    showToast('Thanks! Your review has been posted.', 'success');
  });
}

function wireTabSwitching() {
  const buttons = qsa('.tabs__list button');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      qsa('.tabs__panel').forEach((p) => p.classList.toggle('active', p.dataset.tabPanel === btn.dataset.tab));
    });
  });
}

/* ---------------- Related ---------------- */
function renderRelated() {
  const grid = qs('[data-related-grid]');
  const related = getRelatedProducts(product, 4);
  grid.innerHTML = related.map((p) => productCardHTML(p, { reveal: true })).join('');
  staggerReveal(grid, 60);
}

renderBreadcrumb();
renderGallery();
renderInfo();
renderTabs();
wireTabSwitching();
renderRelated();
observe(document.querySelector('[data-pd-info]'));
