<script setup>
// Ports legacy/returns-refunds.html. Falls back to this static copy when the
// ERP admin hasn't filled in CMS content yet (Website CMS > Pages & Policies).
import { ref, onMounted } from 'vue';
import { fetchPage } from '@/services/pages';
import PageHeader from '@/components/ui/PageHeader.vue';

const page = ref(null);
onMounted(async () => { page.value = await fetchPage('return-policy'); });
</script>

<template>
  <PageHeader title="Returns &amp; Refund Policy" crumb="Returns &amp; Refunds" />

  <div class="section">
    <div class="container">
      <div v-if="page" class="prose" style="white-space:pre-line" v-reveal="'up'">{{ page.content }}</div>
      <div v-else class="prose" v-reveal="'up'">
        <span class="policy-updated">Last updated: August 1, 2026</span>

        <p>We want you to be completely satisfied with every order. If something isn't right, here's how returns and refunds work.</p>

        <h2>1. Eligibility</h2>
        <ul>
          <li>Most items can be returned within <strong>24 hours</strong> of delivery.</li>
          <li>Items must be unused, unopened and in their original packaging where applicable.</li>
          <li>Perishable items (fresh produce, dairy, meat, bakery) can only be returned if damaged, spoiled, or incorrect at the time of delivery.</li>
        </ul>

        <h2>2. How to Request a Return</h2>
        <p>Open the relevant order in <RouterLink :to="{ name: 'orders' }" style="color:var(--color-primary-dark);font-weight:700">My Orders</RouterLink> and select <strong>Return Item</strong>. Our support team will confirm pickup details or provide return instructions within one business day.</p>

        <h2>3. Refund Method</h2>
        <p>Approved refunds are issued to your original payment method. Cash on Delivery orders are refunded via store credit or bank transfer, as arranged with our support team.</p>

        <h2>4. Refund Timeline</h2>
        <p>Once a return is received and inspected (or approved for perishable issues without pickup), refunds are processed within <strong>3–5 business days</strong>. It may take a few extra days to reflect on your statement depending on your bank.</p>

        <h2>5. Non-Returnable Items</h2>
        <p>For hygiene and safety reasons, opened personal care items and used household products cannot be returned unless defective.</p>

        <h2>6. Need Help?</h2>
        <p>If you have questions about a specific order, visit <RouterLink :to="{ name: 'help-center' }" style="color:var(--color-primary-dark);font-weight:700">Help Center</RouterLink> or <RouterLink :to="{ name: 'contact' }" style="color:var(--color-primary-dark);font-weight:700">Contact Us</RouterLink> directly.</p>
      </div>
    </div>
  </div>
</template>
