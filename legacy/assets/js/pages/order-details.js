// Smart Mart — Order Details page.

import { qs, escapeHtml, formatCurrency } from '../core/utils.js';
import { requireAuth } from '../core/account-nav.js';
import { getOrderById, getOrderTimeline, cancelOrder, requestReturn } from '../core/orders.js';
import { statusBadgeMarkup, paymentBadgeMarkup, formatDate, formatDateTime } from '../core/order-ui.js';
import { addToCart } from '../core/store.js';
import { showToast } from '../core/toast.js';

const user = requireAuth();
const orderId = new URLSearchParams(window.location.search).get('order');

if (user) init();

function init() {
  const order = orderId ? getOrderById(orderId) : null;
  if (!order || order.userId !== user.id) {
    qs('[data-order-not-found]').hidden = false;
    return;
  }
  qs('[data-order-content]').hidden = false;
  renderOrder(order);
  wireActions(order);
}

function renderOrder(order) {
  document.title = `Order #${order.orderNumber} — Smart Mart`;
  qs('[data-order-number-title]').textContent = `#${order.orderNumber}`;
  qs('[data-order-number]').textContent = `#${order.orderNumber}`;
  qs('[data-order-placed]').textContent = `Placed on ${formatDate(order.placedAt)}`;
  qs('[data-order-badges]').innerHTML = statusBadgeMarkup(order.status) + paymentBadgeMarkup(order.paymentStatus);

  qs('[data-order-items]').innerHTML = order.items.map((i) => `
    <div class="order-line-item">
      <img src="${i.image}" alt="${escapeHtml(i.name)}">
      <div>
        <div class="order-line-item__name">${escapeHtml(i.name)}</div>
        ${i.variation ? `<div class="order-line-item__variant">${escapeHtml(i.variation)} &middot; Qty ${i.qty}</div>` : `<div class="order-line-item__variant">Qty ${i.qty}</div>`}
      </div>
      <div class="order-line-item__price">${formatCurrency(i.lineTotal)}</div>
    </div>`).join('');

  const timeline = getOrderTimeline(order);
  qs('[data-order-timeline]').innerHTML = timeline.map((step) => `
    <div class="order-timeline__step ${step.done ? 'done' : ''} ${step.isAlt ? 'alt' : ''}">
      <span class="order-timeline__dot"><i class="fa-solid ${step.icon}"></i></span>
      <div class="order-timeline__body">
        <strong>${step.label}</strong>
        <span>${step.at ? formatDateTime(step.at) : 'Pending'}</span>
      </div>
    </div>`).join('');

  qs('[data-sum-subtotal]').textContent = formatCurrency(order.subtotal);
  qs('[data-sum-discount]').textContent = `−${formatCurrency(order.discount)}`;
  qs('[data-sum-shipping]').textContent = order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping);
  qs('[data-sum-tax]').textContent = formatCurrency(order.tax);
  qs('[data-sum-total]').textContent = formatCurrency(order.total);

  const methodLabels = { card: 'Credit / Debit Card', paypal: 'PayPal', cod: 'Cash on Delivery' };
  qs('[data-order-payment-method]').textContent = methodLabels[order.paymentMethod] || order.paymentMethod;
  qs('[data-order-payment-badge]').innerHTML = paymentBadgeMarkup(order.paymentStatus);

  const addr = order.address;
  qs('[data-order-address]').innerHTML = addr && addr.address
    ? `${escapeHtml(addr.fullName || '')}<br>${escapeHtml(addr.address)}, ${escapeHtml(addr.city || '')} ${escapeHtml(addr.zip || '')}<br>${escapeHtml(addr.country || '')}<br>${escapeHtml(addr.phone || '')}`
    : 'No address on file for this order.';

  qs('[data-cancel-btn]').hidden = order.status !== 'processing';
  qs('[data-return-btn]').hidden = order.status !== 'delivered';
}

function wireActions(order) {
  qs('[data-reorder-btn]').addEventListener('click', () => {
    order.items.forEach((item) => addToCart(item.productId, item.variation, item.qty));
    showToast('Items added to your cart.', 'success');
  });
  qs('[data-cancel-btn]').addEventListener('click', () => {
    const result = cancelOrder(order.id);
    showToast(result.message || 'Order cancelled.', result.ok ? 'success' : 'error');
    if (result.ok) renderOrder(getOrderById(order.id));
  });
  qs('[data-return-btn]').addEventListener('click', () => {
    const result = requestReturn(order.id);
    showToast(result.message || 'Return requested.', result.ok ? 'success' : 'error');
    if (result.ok) renderOrder(getOrderById(order.id));
  });
}
