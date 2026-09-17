<script setup>
// Ports assets/js/pages/order-details.js.

import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useOrdersStore } from '@/stores/orders';
import { useCartStore } from '@/stores/cart';
import { showToast } from '@/composables/useToast';
import { openShare } from '@/composables/useShare';
import { formatCurrency, taxLineLabel, taxDiscountLineLabel } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import PageHeader from '@/components/ui/PageHeader.vue';
import AccountSidebar from '@/components/account/AccountSidebar.vue';
import StatusBadge from '@/components/account/StatusBadge.vue';
import OrderTimeline from '@/components/account/OrderTimeline.vue';

const route = useRoute();
const auth = useAuthStore();
const ordersStore = useOrdersStore();
const cart = useCartStore();

const PAYMENT_METHOD_LABELS = {
  card: 'Credit / Debit Card',
  paypal: 'PayPal',
  cod: 'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
  bank: 'Bank Transfer',
};

function paymentMethodLabel(pm) {
  if (!pm) return '—';
  if (typeof pm === 'string') return PAYMENT_METHOD_LABELS[pm] || pm;
  return pm.name || PAYMENT_METHOD_LABELS[pm.code] || pm.code || '—';
}
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  const result = await ordersStore.fetchOrder(route.params.id);
  loading.value = false;
  if (!result.ok) error.value = result.message || 'Order not found.';
});

const order = computed(() => {
  const o = ordersStore.currentOrder || ordersStore.getOrderById(route.params.id);
  if (!o) return null;
  // Ownership is enforced by the API; still guard against mismatched local leftovers.
  // IDs may come back as string or number depending on source, so compare as strings.
  if (o.userId && auth.currentUser?.id && String(o.userId) !== String(auth.currentUser.id)) return null;
  return o;
});

const timeline = computed(() => (order.value ? ordersStore.getOrderTimeline(order.value) : []));

async function reorder() {
  let added = 0;
  let failed = null;
  for (const item of order.value?.items || []) {
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

function shareItem(item) {
  openShare(item.productId, {
    name: item.name,
    image: item.image,
    slug: item.slug,
    price: item.qty ? item.lineTotal / item.qty : item.lineTotal,
  });
}
</script>

<template>
  <PageHeader :title="order ? `Order #${order.orderNumber}` : 'Order #—'" crumb="Order Details" />

  <div class="section">
    <div class="container">
      <div v-if="loading" class="cart-empty">
        <i class="fa-solid fa-spinner spin"></i>
        <h2>Loading order…</h2>
      </div>
      <div v-else-if="!order" class="cart-empty">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h2>Order not found</h2>
        <p class="text-muted" style="margin:var(--sp-3) 0 var(--sp-5)">{{ error || "We couldn't find this order on your account." }}</p>
        <RouterLink :to="{ name: 'orders' }" class="btn btn-primary">Back to My Orders</RouterLink>
      </div>

      <div v-else class="account-layout">
        <AccountSidebar active="orders" />

        <div class="order-details-grid">
          <div>
            <div class="account-card">
              <div class="account-card__head">
                <div>
                  <strong style="font-size:var(--fs-md)">#{{ order.orderNumber }}</strong>
                  <p style="margin-top:4px">Placed on {{ formatDate(order.placedAt) }}</p>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  <StatusBadge :status="order.status" />
                  <StatusBadge :status="order.paymentStatus" kind="payment" />
                </div>
              </div>
              <div>
                <div v-for="i in order.items" :key="i.productId + (i.variation || '')" class="order-line-item">
                  <img :src="i.image" :alt="i.name">
                  <div>
                    <div class="order-line-item__name">{{ i.name }}</div>
                    <div class="order-line-item__variant">{{ i.variation ? `${i.variation} · Qty ${i.qty}` : `Qty ${i.qty}` }}</div>
                  </div>
                  <div class="order-line-item__price">{{ formatCurrency(i.lineTotal) }}</div>
                  <button
                    type="button"
                    class="order-line-item__share"
                    title="Share this product"
                    aria-label="Share this product"
                    @click="shareItem(i)"
                  ><i class="fa-solid fa-share-nodes"></i></button>
                </div>
              </div>
              <div class="order-card__foot" style="border-top:1px solid var(--color-border);padding-top:var(--sp-4);margin-top:var(--sp-4)">
                <div class="order-card__actions">
                  <button type="button" class="btn btn-outline btn-sm" @click="reorder"><i class="fa-solid fa-rotate-right"></i> Reorder</button>
                  <RouterLink
                    v-if="order.status === 'processing' || order.status === 'delivered'"
                    :to="{ name: 'contact' }"
                    class="btn btn-ghost btn-sm"
                  ><i class="fa-solid fa-headset"></i> Contact Support</RouterLink>
                </div>
              </div>
            </div>

            <div id="tracking" class="account-card">
              <div class="account-card__head"><div><h3>Tracking</h3></div></div>
              <OrderTimeline :steps="timeline" />
            </div>
          </div>

          <div>
            <div class="account-card">
              <div class="account-card__head"><div><h3>Order Summary</h3></div></div>
              <div class="summary-row"><span>Subtotal</span><span>{{ formatCurrency(order.subtotal) }}</span></div>
              <div class="summary-row"><span>Discount</span><span>-{{ formatCurrency(order.discount) }}</span></div>
              <div class="summary-row"><span>Shipping</span><span>{{ formatCurrency(order.shipping) }}</span></div>
              <div class="summary-row"><span>{{ taxLineLabel(order.taxPercent, order.taxType) }}</span><span>{{ formatCurrency(order.tax) }}</span></div>
              <div v-if="order.taxDiscount" class="summary-row"><span>{{ taxDiscountLineLabel(order.taxDiscountPercent) }}</span><span>{{ formatCurrency(order.taxDiscount) }}</span></div>
              <div class="summary-row summary-row--total"><span>Total</span><span>{{ formatCurrency(order.total) }}</span></div>
            </div>
            <div class="account-card" v-if="order.deliveryAddress || order.address">
              <div class="account-card__head"><div><h3>Delivery</h3></div></div>
              <p v-if="order.deliveryAddress">{{ order.deliveryAddress }}</p>
              <p v-else-if="order.address">
                {{ order.address.fullName }}<br>
                {{ order.address.address }}, {{ order.address.city }} {{ order.address.zip }}<br>
                {{ order.address.country }}
              </p>
              <p class="text-muted" style="margin-top:var(--sp-3)">
                Payment: {{ paymentMethodLabel(order.paymentMethod) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
