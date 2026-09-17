<script setup>
// Ports legacy/privacy-policy.html. Falls back to this static copy when the
// ERP admin hasn't filled in CMS content yet (Website CMS > Pages & Policies).
import { ref, onMounted } from 'vue';
import { fetchPage } from '@/services/pages';
import PageHeader from '@/components/ui/PageHeader.vue';

const page = ref(null);
onMounted(async () => { page.value = await fetchPage('privacy-policy'); });
</script>

<template>
  <PageHeader title="Privacy Policy" crumb="Privacy Policy" />

  <div class="section">
    <div class="container">
      <div v-if="page" class="prose" style="white-space:pre-line" v-reveal="'up'">{{ page.content }}</div>
      <div v-else class="prose" v-reveal="'up'">
        <span class="policy-updated">Last updated: August 1, 2026</span>

        <p>At Smart Mart, we take your privacy seriously. This policy explains what information we collect, how we use it, and the choices you have.</p>

        <h2>1. Information We Collect</h2>
        <p>When you create an account, place an order or contact support, we collect information such as your name, email address, phone number, delivery addresses and order history. We also collect basic usage data (pages visited, items viewed) to improve our service.</p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To process and deliver your orders</li>
          <li>To send order confirmations, shipping updates and account notifications</li>
          <li>To provide customer support and respond to inquiries</li>
          <li>To personalise product recommendations and promotions</li>
          <li>To improve our website and services</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>We do not sell your personal information. We may share necessary details with delivery partners and payment processors solely to fulfil your orders, and only to the extent required by law or to protect our rights.</p>

        <h2>4. Data Security</h2>
        <p>We use industry-standard safeguards to protect your data, including encrypted checkout and secure storage practices. No online service can guarantee absolute security, but we work continuously to protect your information.</p>

        <h2>5. Your Choices</h2>
        <p>You can review and update your personal information at any time from your Profile page, manage saved addresses, and opt out of marketing emails via the unsubscribe link in any newsletter.</p>

        <h2>6. Cookies</h2>
        <p>We use essential cookies and local storage to keep you signed in, remember your cart, wishlist and selected store branch between visits. These are required for the site to function correctly.</p>

        <h2>7. Contact Us</h2>
        <p>If you have questions about this policy or how your data is handled, reach out via our <RouterLink :to="{ name: 'contact' }" style="color:var(--color-primary-dark);font-weight:700">Contact Us</RouterLink> page.</p>
      </div>
    </div>
  </div>
</template>
