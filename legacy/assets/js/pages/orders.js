// Smart Mart — My Orders (order history) page.

import { qs, qsa } from '../core/utils.js';
import { requireAuth } from '../core/account-nav.js';
import { getOrdersForUser, cancelOrder, requestReturn } from '../core/orders.js';
import { orderCardMarkup } from '../core/order-ui.js';
import { addToCart } from '../core/store.js';
import { showToast } from '../core/toast.js';

const user = requireAuth();
let activeFilter = 'all';

if (user) init();

function init() {
  render();
  wireFilters();
  wireActions();
}

function matchesFilter(order, filter) {
  if (filter === 'all') return true;
  if (filter === 'cancelled') return order.status === 'cancelled' || order.status === 'return_requested' || order.status === 'returned';
  return order.status === filter;
}

function render() {
  const orders = getOrdersForUser(user.id).filter((o) => matchesFilter(o, activeFilter));
  const container = qs('[data-orders-list]');
  if (!orders.length) {
    container.innerHTML = `<div class="cart-empty">
      <i class="fa-solid fa-bag-shopping"></i>
      <h2>No orders found</h2>
      <p class="text-muted" style="margin:var(--sp-3) 0 var(--sp-5)">${activeFilter === 'all' ? "You haven't placed any orders yet." : 'No orders match this filter.'}</p>
      <a href="shop.html" class="btn btn-primary">Start Shopping</a>
    </div>`;
    return;
  }
  container.innerHTML = orders.map(orderCardMarkup).join('');
}

function wireFilters() {
  qsa('[data-order-filters] button').forEach((btn) => {
    btn.addEventListener('click', () => {
      qsa('[data-order-filters] button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });
}

function wireActions() {
  qs('[data-orders-list]').addEventListener('click', (e) => {
    const reorderBtn = e.target.closest('[data-reorder]');
    const cancelBtn = e.target.closest('[data-cancel-order]');
    const returnBtn = e.target.closest('[data-return-order]');

    if (reorderBtn) {
      const order = getOrdersForUser(user.id).find((o) => o.id === reorderBtn.dataset.reorder);
      order?.items.forEach((item) => addToCart(item.productId, item.variation, item.qty));
      showToast('Items added to your cart.', 'success');
    }
    if (cancelBtn) {
      const result = cancelOrder(cancelBtn.dataset.cancelOrder);
      showToast(result.message || 'Order cancelled.', result.ok ? 'success' : 'error');
      if (result.ok) render();
    }
    if (returnBtn) {
      const result = requestReturn(returnBtn.dataset.returnOrder);
      showToast(result.message || 'Return requested.', result.ok ? 'success' : 'error');
      if (result.ok) render();
    }
  });
}
