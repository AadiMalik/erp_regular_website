<script setup>
// Public track-order lookup via ERP API (order number + email / optional phone).

import { reactive, ref, computed } from 'vue';
import { useOrdersStore } from '@/stores/orders';
import { formatDate } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import PageHeader from '@/components/ui/PageHeader.vue';
import StatusBadge from '@/components/account/StatusBadge.vue';
import OrderTimeline from '@/components/account/OrderTimeline.vue';

const ordersStore = useOrdersStore();

const form = reactive({ orderNumber: '', email: '', phone: '' });
const errors = reactive({ orderNumber: false, email: false });
const result = ref(null);
const notFound = ref(false);
const looking = ref(false);
const errorMessage = ref('');

const timeline = computed(() => (result.value ? ordersStore.getOrderTimeline(result.value) : []));

async function submit() {
  errors.orderNumber = form.orderNumber.trim().length === 0;
  errors.email = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  if (errors.orderNumber || errors.email) return;

  result.value = null;
  notFound.value = false;
  errorMessage.value = '';
  looking.value = true;

  const trackResult = await ordersStore.trackOrder({
    orderNumber: form.orderNumber.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || null,
  });

  looking.value = false;

  if (!trackResult.ok || !trackResult.order) {
    notFound.value = true;
    errorMessage.value = trackResult.message || 'No matching order found';
    return;
  }

  result.value = trackResult.order;
}
</script>

<template>
  <PageHeader title="Track My Order" crumb="Track My Order" />

  <div class="section">
    <div class="container">
      <div class="track-lookup" v-reveal="'up'">
        <span class="branch-modal__icon" style="margin-inline:auto"><i class="fa-solid fa-truck-fast"></i></span>
        <h2 style="margin-top:var(--sp-4)">Where's My Order?</h2>
        <p class="text-muted">Enter your order number and the email used at checkout to see live status — no sign-in required.</p>

        <form novalidate @submit.prevent="submit">
          <div class="field" :class="{ 'has-error': errors.orderNumber }">
            <label for="orderNumber">Order Number</label>
            <input id="orderNumber" v-model="form.orderNumber" placeholder="e.g. SM-123456">
            <span class="error-msg">Please enter your order number.</span>
          </div>
          <div class="field" :class="{ 'has-error': errors.email }">
            <label for="email">Email Address</label>
            <input id="email" v-model="form.email" type="email" placeholder="jane@example.com">
            <span class="error-msg">Please enter the email used at checkout.</span>
          </div>
          <div class="field">
            <label for="phone">Phone <span class="text-muted">(optional)</span></label>
            <input id="phone" v-model="form.phone" type="tel" placeholder="03001234567">
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="looking">
            <i class="fa-solid" :class="looking ? 'fa-spinner spin' : 'fa-magnifying-glass'"></i>
            {{ looking ? 'Looking up…' : 'Track Order' }}
          </button>
        </form>
      </div>

      <div v-if="result" class="track-result">
        <div class="account-card">
          <div class="account-card__head">
            <div>
              <strong style="font-size:var(--fs-md)">#{{ result.orderNumber }}</strong>
              <p style="margin-top:4px">Placed on {{ formatDate(result.placedAt) }}</p>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <StatusBadge :status="result.status" />
              <StatusBadge v-if="result.paymentStatus" :status="result.paymentStatus" kind="payment" />
            </div>
          </div>
          <OrderTimeline :steps="timeline" />
          <div v-if="result.total != null" class="summary-row total" style="margin-top:var(--sp-4)">
            <span>Order Total</span><span>{{ formatCurrency(result.total) }}</span>
          </div>
        </div>
      </div>

      <div v-if="notFound" class="no-results">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h2>No matching order found</h2>
        <p class="text-muted">{{ errorMessage || 'Double-check your order number and email, or' }} <RouterLink :to="{ name: 'contact' }" style="color:var(--color-primary-dark);font-weight:700">contact support</RouterLink> for help.</p>
      </div>
    </div>
  </div>
</template>
