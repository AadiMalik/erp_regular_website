<script setup>
// Ports assets/js/pages/orders.js.

import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useOrdersStore } from '@/stores/orders';
import { useCartStore } from '@/stores/cart';
import { showToast } from '@/composables/useToast';
import PageHeader from '@/components/ui/PageHeader.vue';
import AccountSidebar from '@/components/account/AccountSidebar.vue';
import OrderCard from '@/components/account/OrderCard.vue';

const auth = useAuthStore();
const ordersStore = useOrdersStore();
const cart = useCartStore();

const FILTERS = [
  { key: 'all', label: 'All Orders' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled / Returned' },
];
const activeFilter = ref('all');
const error = ref('');

async function loadOrders() {
  error.value = '';
  const params = activeFilter.value === 'all' ? {} : { status: activeFilter.value };
  const result = await ordersStore.fetchOrders(params);
  if (!result.ok) error.value = result.message || 'Failed to load orders.';
}

onMounted(loadOrders);
watch(activeFilter, loadOrders);

const orders = computed(() => ordersStore.getOrdersForUser(auth.currentUser?.id));

async function reorder(order) {
  let added = 0;
  let failed = null;
  for (const item of order.items || []) {
    const result = await cart.addToCart(item.productId, {
      productVariationId: item.product_variation_id,
      quantity: item.qty || 1,
    });
    if (result.needsAuth) {
      showToast(result.message, 'info');
      return;
    }
    if (result.ok) added += 1;
    else failed = result.message;
  }
  if (added) showToast('Items added to your cart.', 'success');
  else showToast(failed || 'Could not add items to cart.', 'error');
}
</script>

<template>
  <PageHeader title="My Orders" crumb="My Orders" />

  <div class="section">
    <div class="container">
      <div class="account-layout">
        <AccountSidebar active="orders" />

        <div>
          <div class="filter-tabs order-filter-tabs">
            <button
              v-for="f in FILTERS"
              :key="f.key"
              type="button"
              :class="{ active: activeFilter === f.key }"
              @click="activeFilter = f.key"
            >{{ f.label }}</button>
          </div>

          <div v-if="ordersStore.loading" class="cart-empty">
            <i class="fa-solid fa-spinner spin"></i>
            <h2>Loading orders…</h2>
          </div>
          <div v-else-if="error" class="cart-empty">
            <i class="fa-solid fa-circle-exclamation"></i>
            <h2>Could not load orders</h2>
            <p class="text-muted" style="margin:var(--sp-3) 0 var(--sp-5)">{{ error }}</p>
            <button type="button" class="btn btn-primary" @click="loadOrders">Try Again</button>
          </div>
          <div v-else-if="!orders.length" class="cart-empty">
            <i class="fa-solid fa-bag-shopping"></i>
            <h2>No orders found</h2>
            <p class="text-muted" style="margin:var(--sp-3) 0 var(--sp-5)">{{ activeFilter === 'all' ? "You haven't placed any orders yet." : 'No orders match this filter.' }}</p>
            <RouterLink :to="{ name: 'shop' }" class="btn btn-primary">Start Shopping</RouterLink>
          </div>
          <OrderCard v-for="o in orders" :key="o.id" :order="o" @reorder="reorder" />
        </div>
      </div>
    </div>
  </div>
</template>
