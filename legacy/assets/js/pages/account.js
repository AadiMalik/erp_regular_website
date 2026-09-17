// Smart Mart — Profile overview page.

import { qs } from '../core/utils.js';
import { requireAuth } from '../core/account-nav.js';
import { getOrdersForUser, cancelOrder, requestReturn } from '../core/orders.js';
import { orderCardMarkup, formatDate } from '../core/order-ui.js';
import { addToCart } from '../core/store.js';
import { showToast } from '../core/toast.js';

const user = requireAuth();
if (user) init();

function init() {
  renderProfile();
  renderAddresses();
  renderRecentOrders();
  wireActions();
}

function renderProfile() {
  qs('[data-profile-name]').textContent = user.name;
  qs('[data-profile-email]').textContent = user.email;
  qs('[data-profile-phone]').textContent = user.phone || '—';
  qs('[data-profile-since]').textContent = formatDate(user.createdAt);
}

function renderAddresses() {
  const container = qs('[data-profile-addresses]');
  if (!user.addresses.length) {
    container.innerHTML = `<div class="add-address-card" style="grid-column:1/-1"><i class="fa-solid fa-location-dot"></i> No saved addresses yet — add one from Edit Profile.</div>`;
    return;
  }
  container.innerHTML = user.addresses.slice(0, 4).map((a) => `
    <div class="address-card${a.isDefault ? ' is-default' : ''}">
      ${a.isDefault ? '<span class="address-card__badge badge badge-soft">Default</span>' : ''}
      <strong>${a.label || 'Address'}</strong>
      <p>${a.fullName}<br>${a.address}, ${a.city} ${a.zip}<br>${a.country}</p>
    </div>`).join('');
}

function renderRecentOrders() {
  const container = qs('[data-profile-orders]');
  const orders = getOrdersForUser(user.id).slice(0, 3);
  if (!orders.length) {
    container.innerHTML = `<div class="cart-empty" style="padding:var(--sp-7) var(--sp-4)"><i class="fa-solid fa-bag-shopping"></i><h2 style="font-size:var(--fs-lg)">No orders yet</h2><p class="text-muted" style="margin-top:8px">Your placed orders will show up here.</p><a href="shop.html" class="btn btn-primary" style="margin-top:var(--sp-4)">Start Shopping</a></div>`;
    return;
  }
  container.innerHTML = orders.map(orderCardMarkup).join('');
}

function wireActions() {
  document.addEventListener('click', (e) => {
    const reorderBtn = e.target.closest('[data-reorder]');
    const cancelBtn = e.target.closest('[data-cancel-order]');
    const returnBtn = e.target.closest('[data-return-order]');

    if (reorderBtn) {
      const orders = getOrdersForUser(user.id);
      const order = orders.find((o) => o.id === reorderBtn.dataset.reorder);
      order?.items.forEach((item) => addToCart(item.productId, item.variation, item.qty));
      showToast('Items added to your cart.', 'success');
    }
    if (cancelBtn) {
      const result = cancelOrder(cancelBtn.dataset.cancelOrder);
      showToast(result.message || 'Order cancelled.', result.ok ? 'success' : 'error');
      if (result.ok) renderRecentOrders();
    }
    if (returnBtn) {
      const result = requestReturn(returnBtn.dataset.returnOrder);
      showToast(result.message || 'Return requested.', result.ok ? 'success' : 'error');
      if (result.ok) renderRecentOrders();
    }
  });
}
