// Smart Mart — Track My Order page (guest-accessible lookup).

import { qs } from '../core/utils.js';
import { findOrderByNumberAndEmail, getOrderTimeline } from '../core/orders.js';
import { statusBadgeMarkup, formatDate, formatDateTime } from '../core/order-ui.js';

function init() {
  const form = qs('[data-track-form]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const orderNumber = qs('#orderNumber', form);
    const email = qs('#email', form);

    const numberValid = orderNumber.value.trim().length > 0;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    orderNumber.closest('[data-field]').classList.toggle('has-error', !numberValid);
    email.closest('[data-field]').classList.toggle('has-error', !emailValid);
    if (!numberValid || !emailValid) return;

    qs('[data-track-result]').hidden = true;
    qs('[data-track-empty]').hidden = true;

    const order = findOrderByNumberAndEmail(orderNumber.value, email.value);
    if (!order) {
      qs('[data-track-empty]').hidden = false;
      return;
    }
    renderResult(order);
    qs('[data-track-result]').hidden = false;
    qs('[data-track-result]').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function renderResult(order) {
  qs('[data-track-number]').textContent = `#${order.orderNumber}`;
  qs('[data-track-placed]').textContent = `Placed on ${formatDate(order.placedAt)}`;
  qs('[data-track-badge]').innerHTML = statusBadgeMarkup(order.status);

  const timeline = getOrderTimeline(order);
  qs('[data-track-timeline]').innerHTML = timeline.map((step) => `
    <div class="order-timeline__step ${step.done ? 'done' : ''} ${step.isAlt ? 'alt' : ''}">
      <span class="order-timeline__dot"><i class="fa-solid ${step.icon}"></i></span>
      <div class="order-timeline__body">
        <strong>${step.label}</strong>
        <span>${step.at ? formatDateTime(step.at) : 'Pending'}</span>
      </div>
    </div>`).join('');
}

init();
