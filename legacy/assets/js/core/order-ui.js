// Smart Mart — shared rendering helpers for order cards, status badges and
// address cards, reused across account.html, orders.html, order-details.html.

import { escapeHtml, formatCurrency } from './utils.js';
import { STATUS_LABELS } from './orders.js';

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function statusBadgeMarkup(status) {
  return `<span class="status-badge status-${status}"><i class="fa-solid fa-circle"></i> ${STATUS_LABELS[status] || status}</span>`;
}

export function paymentBadgeMarkup(status) {
  const labels = { paid: 'Paid', pending: 'Pending', refunded: 'Refunded' };
  return `<span class="status-badge status-${status}"><i class="fa-solid fa-circle"></i> ${labels[status] || status}</span>`;
}

export function orderCardMarkup(order) {
  const shownItems = order.items.slice(0, 4);
  const extra = order.items.length - shownItems.length;
  return `
  <div class="order-card" data-order-card="${order.id}">
    <div class="order-card__head">
      <div class="order-card__meta">
        <strong>#${escapeHtml(order.orderNumber)}</strong>
        <span>Placed on ${formatDate(order.placedAt)} &middot; ${order.items.reduce((s, i) => s + i.qty, 0)} item(s)</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${statusBadgeMarkup(order.status)}${paymentBadgeMarkup(order.paymentStatus)}</div>
    </div>
    <div class="order-card__items">
      ${shownItems.map((i) => `<img src="${i.image}" alt="${escapeHtml(i.name)}">`).join('')}
      ${extra > 0 ? `<span class="more">+${extra}</span>` : ''}
    </div>
    <div class="order-card__foot">
      <span class="order-card__total">${formatCurrency(order.total)}</span>
      <div class="order-card__actions">
        <a href="order-details.html?order=${order.id}" class="btn btn-outline btn-sm"><i class="fa-solid fa-eye"></i> View Details</a>
        ${order.status !== 'cancelled' ? `<a href="order-details.html?order=${order.id}#tracking" class="btn btn-ghost btn-sm"><i class="fa-solid fa-truck-fast"></i> Track Order</a>` : ''}
        <button type="button" class="btn btn-ghost btn-sm" data-reorder="${order.id}"><i class="fa-solid fa-rotate-right"></i> Reorder</button>
        ${order.status === 'processing' ? `<button type="button" class="btn btn-ghost btn-sm" style="color:var(--color-danger)" data-cancel-order="${order.id}"><i class="fa-solid fa-xmark"></i> Cancel</button>` : ''}
        ${order.status === 'delivered' ? `<button type="button" class="btn btn-ghost btn-sm" data-return-order="${order.id}"><i class="fa-solid fa-rotate-left"></i> Return Item</button>` : ''}
      </div>
    </div>
  </div>`;
}

export function addressCardMarkup(address) {
  return `
  <div class="address-card${address.isDefault ? ' is-default' : ''}" data-address-card="${address.id}">
    ${address.isDefault ? '<span class="address-card__badge badge badge-soft">Default</span>' : ''}
    <strong>${escapeHtml(address.label || 'Address')}</strong>
    <p>${escapeHtml(address.fullName)}<br>${escapeHtml(address.address)}, ${escapeHtml(address.city)} ${escapeHtml(address.zip)}<br>${escapeHtml(address.country)}<br>${escapeHtml(address.phone)}</p>
    <div class="address-card__actions">
      <button type="button" data-edit-address="${address.id}"><i class="fa-solid fa-pen"></i> Edit</button>
      ${!address.isDefault ? `<button type="button" data-default-address="${address.id}"><i class="fa-solid fa-star"></i> Set Default</button>` : ''}
      <button type="button" class="danger" data-delete-address="${address.id}"><i class="fa-solid fa-trash-can"></i> Remove</button>
    </div>
  </div>`;
}
