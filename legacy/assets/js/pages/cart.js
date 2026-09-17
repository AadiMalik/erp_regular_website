// Smart Mart — Cart page: line items, live totals, coupon simulation.

import { qs, qsa, formatCurrency, escapeHtml, clamp } from '../core/utils.js';
import {
  getCartDetailed, updateCartQty, removeFromCart, clearCart,
  computeTotals, applyCoupon, removeCoupon, getCoupon, toggleWishlist,
} from '../core/store.js';
import { showToast } from '../core/toast.js';
import { observe } from '../core/reveal.js';

function variantLabel(item) {
  return item.variation ? `<span class="cart-product__variant">${item.product.variations.label}: ${escapeHtml(item.variation)}</span>` : '';
}

function rowHTML(item) {
  return `
  <tr class="cart-row" data-cart-row data-key="${item.productId}::${item.variation || ''}">
    <td>
      <div class="cart-product">
        <img src="${item.product.images[0]}" alt="${escapeHtml(item.product.name)}">
        <div>
          <a class="cart-product__name" href="product.html?slug=${item.product.slug}">${escapeHtml(item.product.name)}</a>
          ${variantLabel(item)}
          <div class="cart-product__actions">
            <button data-move-wishlist><i class="fa-regular fa-heart"></i> Save for later</button>
            <button data-remove-item><i class="fa-solid fa-trash-can"></i> Remove</button>
          </div>
        </div>
      </div>
    </td>
    <td class="cart-price">${formatCurrency(item.unitPrice)}</td>
    <td>
      <div class="qty-control">
        <button type="button" data-qty-down aria-label="Decrease quantity">−</button>
        <input type="number" value="${item.qty}" min="1" max="${item.maxStock}" data-qty-input aria-label="Quantity">
        <button type="button" data-qty-up aria-label="Increase quantity">+</button>
      </div>
    </td>
    <td class="cart-subtotal" data-line-total>${formatCurrency(item.lineTotal)}</td>
    <td><button class="btn-icon" data-remove-item aria-label="Remove item"><i class="fa-solid fa-xmark"></i></button></td>
  </tr>`;
}

function mobileCardHTML(item) {
  return `
  <div class="cart-mobile-item" data-cart-row data-key="${item.productId}::${item.variation || ''}">
    <div class="cart-product">
      <img src="${item.product.images[0]}" alt="${escapeHtml(item.product.name)}">
      <div>
        <a class="cart-product__name" href="product.html?slug=${item.product.slug}">${escapeHtml(item.product.name)}</a>
        ${variantLabel(item)}
        <div class="cart-product__actions">
          <button data-move-wishlist><i class="fa-regular fa-heart"></i> Save</button>
          <button data-remove-item><i class="fa-solid fa-trash-can"></i> Remove</button>
        </div>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--sp-4)">
      <div class="qty-control">
        <button type="button" data-qty-down aria-label="Decrease quantity">−</button>
        <input type="number" value="${item.qty}" min="1" max="${item.maxStock}" data-qty-input aria-label="Quantity">
        <button type="button" data-qty-up aria-label="Increase quantity">+</button>
      </div>
      <strong class="cart-subtotal" data-line-total>${formatCurrency(item.lineTotal)}</strong>
    </div>
  </div>`;
}

function renderSummary() {
  const { subtotal, discount, shipping, tax, total, coupon } = computeTotals();
  qs('[data-sum-subtotal]').textContent = formatCurrency(subtotal);
  qs('[data-sum-discount]').textContent = discount ? `−${formatCurrency(discount)}` : `−${formatCurrency(0)}`;
  qs('[data-sum-shipping]').textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
  qs('[data-sum-tax]').textContent = formatCurrency(tax);
  qs('[data-sum-total]').textContent = formatCurrency(total);

  const msg = qs('[data-coupon-msg]');
  if (coupon) {
    msg.textContent = `"${coupon.code}" applied — ${coupon.label}. `;
    msg.classList.add('show', 'success');
    msg.classList.remove('error');
    if (!msg.querySelector('button')) {
      msg.insertAdjacentHTML('beforeend', '<button type="button" data-remove-coupon style="text-decoration:underline;font-weight:700">Remove</button>');
    }
  } else {
    msg.classList.remove('show');
  }
}

function render() {
  const items = getCartDetailed();
  const isEmpty = items.length === 0;
  qs('[data-cart-empty]').hidden = !isEmpty;
  qs('[data-cart-content]').hidden = isEmpty;
  if (isEmpty) return;

  qs('[data-cart-tbody]').innerHTML = items.map(rowHTML).join('');
  qs('[data-cart-mobile-list]').innerHTML = items.map(mobileCardHTML).join('');
  renderSummary();
  observe(qs('[data-cart-page]'));
}

function findItem(key) {
  const [productId, variation] = key.split('::');
  return { productId, variation: variation || null };
}

function wireEvents() {
  document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('[data-remove-item]');
    if (removeBtn) {
      const rowEls = qsa(`[data-key="${removeBtn.closest('[data-cart-row]').dataset.key}"]`);
      const { productId, variation } = findItem(removeBtn.closest('[data-cart-row]').dataset.key);
      rowEls.forEach((r) => r.classList.add('removing'));
      setTimeout(() => { removeFromCart(productId, variation); showToast('Item removed from cart', 'info'); render(); }, 260);
      return;
    }

    const wishBtn = e.target.closest('[data-move-wishlist]');
    if (wishBtn) {
      const { productId, variation } = findItem(wishBtn.closest('[data-cart-row]').dataset.key);
      toggleWishlist(productId);
      const rowEls = qsa(`[data-key="${productId}::${variation || ''}"]`);
      rowEls.forEach((r) => r.classList.add('removing'));
      setTimeout(() => { removeFromCart(productId, variation); showToast('Saved to wishlist', 'success'); render(); }, 260);
      return;
    }

    if (e.target.closest('[data-qty-down]') || e.target.closest('[data-qty-up]')) {
      const row = e.target.closest('[data-cart-row]');
      const input = qs('[data-qty-input]', row);
      const delta = e.target.closest('[data-qty-up]') ? 1 : -1;
      const next = clamp(Number(input.value) + delta, 1, Number(input.max));
      input.value = next;
      const { productId, variation } = findItem(row.dataset.key);
      updateCartQty(productId, variation, next);
      pulseAndRender(row);
      return;
    }

    if (e.target.closest('[data-clear-cart]')) {
      clearCart();
      showToast('Cart cleared', 'info');
      render();
      return;
    }

    if (e.target.closest('[data-remove-coupon]')) {
      removeCoupon();
      qs('[data-coupon-input]').value = '';
      renderSummary();
      return;
    }

    if (e.target.closest('[data-coupon-apply]')) {
      const code = qs('[data-coupon-input]').value;
      const result = applyCoupon(code);
      const msg = qs('[data-coupon-msg]');
      if (result.ok) {
        showToast('Coupon applied!', 'success');
        renderSummary();
      } else {
        msg.textContent = result.message;
        msg.classList.add('show', 'error');
        msg.classList.remove('success');
      }
    }
  });

  document.addEventListener('change', (e) => {
    if (!e.target.matches('[data-qty-input]')) return;
    const row = e.target.closest('[data-cart-row]');
    const { productId, variation } = findItem(row.dataset.key);
    const val = clamp(Number(e.target.value) || 1, 1, Number(e.target.max));
    e.target.value = val;
    updateCartQty(productId, variation, val);
    pulseAndRender(row);
  });
}

function pulseAndRender(row) {
  render();
  requestAnimationFrame(() => {
    const key = row.dataset.key;
    qsa(`[data-key="${key}"] [data-line-total]`).forEach((el) => {
      el.classList.remove('count-pop'); void el.offsetWidth; el.classList.add('count-pop');
    });
  });
}

wireEvents();
render();
