<script setup>
// Order success - loads the placed order from the ERP by route id.

import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOrdersStore } from '@/stores/orders';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { formatCurrency } from '@/utils/currency';
import StatusBadge from '@/components/account/StatusBadge.vue';

const route = useRoute();
const orders = useOrdersStore();
const site = useWebsiteSettingsStore();

const loading = ref(true);
const error = ref('');

onMounted(async () => {
  const result = await orders.fetchOrder(route.params.id);
  loading.value = false;
  if (!result.ok) error.value = result.message || 'Order not found.';
});

const order = computed(() => orders.currentOrder || orders.getOrderById(route.params.id));

const paymentLabel = computed(() => {
  const pm = order.value?.paymentMethod;
  if (!pm) return '—';
  if (typeof pm === 'string') return pm;
  return pm.name || pm.code || '—';
});
</script>

<template>
  <div class="section">
    <div class="container">

      <div v-if="loading" class="cart-empty">
        <p class="text-muted">Loading your order…</p>
      </div>

      <div v-else-if="!order" class="cart-empty">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h2>Order not found</h2>
        <p class="text-muted" style="margin:var(--sp-3) 0 var(--sp-5)">{{ error || "We couldn't find this order." }}</p>
        <RouterLink :to="{ name: 'home' }" class="btn btn-primary">Back to Home</RouterLink>
      </div>

      <div v-else class="order-success">
        <div class="check-circle"><i class="fa-solid fa-check"></i></div>
        <h2>Order Placed Successfully!</h2>
        <p class="text-muted" style="margin-top:var(--sp-3)">Thank you for shopping with {{ site.business.name }}. A confirmation has been recorded for your order.</p>
        <div class="order-success__number"><i class="fa-solid fa-receipt"></i> <span>#{{ order.orderNumber }}</span></div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:var(--sp-3)">
          <StatusBadge :status="order.status" />
          <StatusBadge v-if="order.paymentStatus" :status="order.paymentStatus" kind="payment" />
        </div>
        <p class="text-muted" style="font-size:var(--fs-sm);margin-top:var(--sp-3)">Payment: <strong>{{ paymentLabel }}</strong></p>

        <div class="account-card" style="text-align:left;margin-top:var(--sp-7)">
          <div>
            <div v-for="item in order.items" :key="`${item.productId}::${item.product_variation_id || item.variation || ''}`" class="order-line-item">
              <img :src="item.image" :alt="item.name">
              <div>
                <div class="order-line-item__name">{{ item.name }}</div>
                <div class="order-line-item__variant">Qty {{ item.qty }}<template v-if="item.variation"> · {{ item.variation }}</template></div>
              </div>
              <div class="order-line-item__price">{{ formatCurrency(item.lineTotal) }}</div>
            </div>
          </div>
          <div class="summary-row total" style="margin-top:var(--sp-3)"><span>Order Total</span><span>{{ formatCurrency(order.total) }}</span></div>
        </div>

        <div class="order-success__actions">
          <RouterLink
            :to="{ name: 'order-details', params: { id: order.id } }"
            class="btn btn-outline"
          ><i class="fa-solid fa-truck-fast"></i> Track Order</RouterLink>
          <RouterLink :to="{ name: 'shop' }" class="btn btn-primary">Continue Shopping <i class="fa-solid fa-arrow-right"></i></RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>
