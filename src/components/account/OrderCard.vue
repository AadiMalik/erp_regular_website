<script setup>
import { computed } from 'vue';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import StatusBadge from './StatusBadge.vue';

const props = defineProps({
  order: { type: Object, required: true },
});
const emit = defineEmits(['reorder']);

const shownItems = computed(() => props.order.items.slice(0, 4));
const extra = computed(() => props.order.items.length - shownItems.value.length);
const itemCount = computed(() => props.order.items.reduce((s, i) => s + i.qty, 0));
const needsSupport = computed(() =>
  props.order.status === 'processing' || props.order.status === 'delivered'
);
</script>

<template>
  <div class="order-card">
    <div class="order-card__head">
      <div class="order-card__meta">
        <strong>#{{ order.orderNumber }}</strong>
        <span>Placed on {{ formatDate(order.placedAt) }} &middot; {{ itemCount }} item(s)</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <StatusBadge :status="order.status" />
        <StatusBadge :status="order.paymentStatus" kind="payment" />
      </div>
    </div>
    <div class="order-card__items">
      <img v-for="i in shownItems" :key="i.productId + (i.variation || '')" :src="i.image" :alt="i.name">
      <span v-if="extra > 0" class="more">+{{ extra }}</span>
    </div>
    <div class="order-card__foot">
      <span class="order-card__total">{{ formatCurrency(order.total) }}</span>
      <div class="order-card__actions">
        <RouterLink :to="{ name: 'order-details', params: { id: order.id } }" class="btn btn-outline btn-sm">
          <i class="fa-solid fa-eye"></i> View Details
        </RouterLink>
        <RouterLink
          v-if="order.status !== 'cancelled'"
          :to="{ name: 'order-details', params: { id: order.id }, hash: '#tracking' }"
          class="btn btn-ghost btn-sm"
        ><i class="fa-solid fa-truck-fast"></i> Track Order</RouterLink>
        <button type="button" class="btn btn-ghost btn-sm" @click="emit('reorder', order)"><i class="fa-solid fa-rotate-right"></i> Reorder</button>
        <RouterLink
          v-if="needsSupport"
          :to="{ name: 'contact' }"
          class="btn btn-ghost btn-sm"
        ><i class="fa-solid fa-headset"></i> Contact Support</RouterLink>
      </div>
    </div>
  </div>
</template>
