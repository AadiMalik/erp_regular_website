// Smart Mart — Order confirmation page.

import { qs, escapeHtml, formatCurrency } from '../core/utils.js';
import { getOrderById } from '../core/orders.js';

const orderId = new URLSearchParams(window.location.search).get('order');
const order = orderId ? getOrderById(orderId) : null;

if (!order) {
  qs('[data-order-missing]').hidden = false;
} else {
  render(order);
}

function render(order) {
  qs('[data-order-success-content]').hidden = false;
  qs('[data-order-number]').textContent = `#${order.orderNumber}`;

  const eta = new Date(order.placedAt);
  const etaHours = order.deliveryMethod === 'express' ? 1 : order.deliveryMethod === 'scheduled' ? 24 : 3;
  eta.setHours(eta.getHours() + etaHours);
  qs('[data-order-eta]').textContent = eta.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });

  qs('[data-order-items]').innerHTML = order.items.map((i) => `
    <div class="order-line-item">
      <img src="${i.image}" alt="${escapeHtml(i.name)}">
      <div>
        <div class="order-line-item__name">${escapeHtml(i.name)}</div>
        <div class="order-line-item__variant">Qty ${i.qty}</div>
      </div>
      <div class="order-line-item__price">${formatCurrency(i.lineTotal)}</div>
    </div>`).join('');

  qs('[data-order-total]').textContent = formatCurrency(order.total);
  qs('[data-track-link]').href = order.userId ? `order-details.html?order=${order.id}` : `track-order.html`;
}
