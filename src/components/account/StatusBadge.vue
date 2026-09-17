<script setup>
import { STATUS_LABELS } from '@/stores/orders';

const props = defineProps({
  status: { type: String, required: true },
  kind: { type: String, default: 'order' }, // 'order' | 'payment'
});

const PAYMENT_LABELS = { paid: 'Paid', pending: 'Pending', partially_paid: 'Partially Paid', refunded: 'Refunded' };

const label = () => (props.kind === 'payment' ? (PAYMENT_LABELS[props.status] || props.status) : (STATUS_LABELS[props.status] || props.status));
</script>

<template>
  <span class="status-badge" :class="`status-${status}`"><i class="fa-solid fa-circle"></i> {{ label() }}</span>
</template>
