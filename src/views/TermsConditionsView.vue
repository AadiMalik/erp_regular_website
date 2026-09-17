<script setup>
// Ports legacy/terms-conditions.html. Falls back to this static copy when
// the ERP admin hasn't filled in CMS content yet (Website CMS > Pages & Policies).
import { ref, onMounted } from 'vue';
import { fetchPage } from '@/services/pages';
import PageHeader from '@/components/ui/PageHeader.vue';

const page = ref(null);
onMounted(async () => { page.value = await fetchPage('terms-conditions'); });
</script>

<template>
  <PageHeader title="Terms &amp; Conditions" crumb="Terms &amp; Conditions" />

  <div class="section">
    <div class="container">
      <div v-if="page" class="prose" style="white-space:pre-line" v-reveal="'up'">{{ page.content }}</div>
      <div v-else class="prose" v-reveal="'up'">
        <span class="policy-updated">Last updated: August 1, 2026</span>

        <p>These Terms &amp; Conditions govern your use of the Smart Mart website and any orders placed through it. By using our site, you agree to these terms.</p>

        <h2>1. Using Our Service</h2>
        <p>You must be at least 18 years old, or using the site under the supervision of a parent or guardian, to place an order. You agree to provide accurate account and delivery information.</p>

        <h2>2. Orders &amp; Pricing</h2>
        <p>All prices are shown in USD and include applicable taxes unless stated otherwise. We reserve the right to correct pricing errors and to cancel orders affected by an incorrect price, stock unavailability, or suspected fraud.</p>

        <h2>3. Delivery</h2>
        <p>Delivery times shown at checkout are estimates based on your selected branch and delivery method. Smart Mart is not liable for delays caused by circumstances outside our control (severe weather, courier disruptions, etc.).</p>

        <h2>4. Payments</h2>
        <p>Payment is processed at the time of order for card and digital wallet methods. Cash on Delivery orders are payable in full to the courier upon receipt.</p>

        <h2>5. Cancellations &amp; Returns</h2>
        <p>Orders can be cancelled free of charge while still in "Processing" status. Once shipped, please refer to our <RouterLink :to="{ name: 'returns-refunds' }" style="color:var(--color-primary-dark);font-weight:700">Returns &amp; Refund Policy</RouterLink> and <RouterLink :to="{ name: 'cancellation-policy' }" style="color:var(--color-primary-dark);font-weight:700">Cancellation Policy</RouterLink> for details.</p>

        <h2>6. Account Responsibility</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorised use.</p>

        <h2>7. Limitation of Liability</h2>
        <p>Smart Mart provides its service "as is." To the fullest extent permitted by law, we are not liable for indirect or consequential damages arising from your use of the site.</p>

        <h2>8. Changes to These Terms</h2>
        <p>We may update these terms from time to time. Continued use of the site after changes take effect constitutes acceptance of the revised terms.</p>

        <h2>9. Contact</h2>
        <p>Questions about these terms? Reach out via our <RouterLink :to="{ name: 'contact' }" style="color:var(--color-primary-dark);font-weight:700">Contact Us</RouterLink> page.</p>
      </div>
    </div>
  </div>
</template>
