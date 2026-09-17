<script setup>
// Ports legacy/cancellation-policy.html. Falls back to this static copy when
// the ERP admin hasn't filled in CMS content yet (Website CMS > Pages & Policies).
import { ref, onMounted } from 'vue';
import { fetchPage } from '@/services/pages';
import PageHeader from '@/components/ui/PageHeader.vue';

const page = ref(null);
onMounted(async () => { page.value = await fetchPage('cancellation-policy'); });
</script>

<template>
  <PageHeader title="Cancellation Policy" crumb="Cancellation Policy" />

  <div class="section">
    <div class="container">
      <div v-if="page" class="prose" style="white-space:pre-line" v-reveal="'up'">{{ page.content }}</div>
      <div v-else class="prose" v-reveal="'up'">
        <span class="policy-updated">Last updated: August 1, 2026</span>

        <p>Plans change — here's how order cancellations work at Smart Mart.</p>

        <h2>1. When You Can Cancel</h2>
        <p>Orders can be cancelled free of charge while they're still in the <strong>Processing</strong> stage — before they've been picked and handed to a courier. Once an order moves to <strong>Shipped</strong>, it can no longer be cancelled.</p>

        <h2>2. How to Cancel</h2>
        <p>Go to <RouterLink :to="{ name: 'orders' }" style="color:var(--color-primary-dark);font-weight:700">My Orders</RouterLink>, open the order you'd like to cancel, and select <strong>Cancel Order</strong>. The cancellation is applied immediately.</p>

        <h2>3. Refunds for Cancelled Orders</h2>
        <p>If payment was already captured (card, PayPal), a full refund is issued to your original payment method within 3–5 business days. Cash on Delivery orders simply require no payment.</p>

        <h2>4. After Shipping</h2>
        <p>If your order has already shipped and you no longer want it, you can request a return once it's delivered — see our <RouterLink :to="{ name: 'returns-refunds' }" style="color:var(--color-primary-dark);font-weight:700">Returns &amp; Refund Policy</RouterLink> for details.</p>

        <h2>5. Cancellations by Smart Mart</h2>
        <p>Occasionally we may need to cancel part or all of an order due to stock unavailability or a pricing error. In this case, you'll be notified and refunded in full for the affected items.</p>
      </div>
    </div>
  </div>
</template>
