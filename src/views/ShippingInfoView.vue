<script setup>
// Ports shipping-info.html. Static content — no dedicated legacy page JS file.

import { ref, computed, onMounted } from 'vue';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { formatCurrency } from '@/utils/currency';
import { fetchPage } from '@/services/pages';
import { fetchContentItems } from '@/services/cms';
import PageHeader from '@/components/ui/PageHeader.vue';

const websiteSettings = useWebsiteSettingsStore();
const page = ref(null);
const cmsOptions = ref([]);
onMounted(async () => {
  [page.value, cmsOptions.value] = await Promise.all([
    fetchPage('shipping-information'),
    fetchContentItems('delivery_options'),
  ]);
});

const standardDeliveryText = computed(() => {
  const fd = websiteSettings.free_delivery;
  return fd.enabled
    ? `Arrives within 2–4 hours. Free on orders over ${formatCurrency(fd.min_amount ?? 50)}, otherwise a flat ${formatCurrency(4.99)} fee applies.`
    : `Arrives within 2–4 hours for a flat ${formatCurrency(4.99)} fee.`;
});

// Same delivery_options CMS content used on the Checkout page - falls back
// to static copy (with the live free-delivery threshold folded in for
// Standard) so the two pages never show conflicting pricing once an admin
// configures this content.
const FALLBACK_OPTIONS = computed(() => [
  { icon: 'fa-solid fa-truck-fast', title: 'Standard Delivery', text: standardDeliveryText.value },
  { icon: 'fa-solid fa-bolt', title: 'Express Delivery', text: 'Arrives within 60 minutes for $7.99 — perfect for last-minute essentials.' },
  { icon: 'fa-regular fa-calendar-clock', title: 'Scheduled Delivery', text: "Pick a convenient time slot for $2.99 and we'll deliver exactly when you need it." },
]);

const DELIVERY_OPTIONS = computed(() => cmsOptions.value.length
  ? cmsOptions.value.map((o) => ({ icon: o.icon || 'fa-solid fa-truck-fast', title: o.title, text: [o.description, o.value].filter(Boolean).join(' — ') }))
  : FALLBACK_OPTIONS.value);
</script>

<template>
  <PageHeader title="Shipping Information" crumb="Shipping Info">
    <p>Delivery options, timeframes and everything you need to know about getting your order.</p>
  </PageHeader>

  <div class="section">
    <div class="container">
      <div class="perks-grid stagger" style="grid-template-columns:repeat(3,1fr)">
        <div v-for="(o, i) in DELIVERY_OPTIONS" :key="o.title" class="perk-card" v-reveal="['up', i, 60]">
          <span class="ico"><i :class="o.icon"></i></span>
          <h3>{{ o.title }}</h3>
          <p>{{ o.text }}</p>
        </div>
      </div>

      <div v-if="page" class="prose" style="margin-top:var(--sp-10);white-space:pre-line" v-reveal="'up'">{{ page.content }}</div>
      <div v-else class="prose" style="margin-top:var(--sp-10)" v-reveal="'up'">
        <h2>Delivery Areas</h2>
        <p>We currently deliver within the service radius of each {{ websiteSettings.business.name }} branch. Use the store selector in the header to choose your nearest branch and see accurate delivery estimates for your area.</p>

        <h2>Order Processing</h2>
        <p>Orders are processed as soon as they're placed. You'll see live status updates — Processing, Shipped, Out for Delivery, and Delivered — from My Orders or via Track My Order.</p>

        <h2>Delivery Attempts</h2>
        <p>Our courier will attempt delivery to the address provided at checkout. If you're unavailable, we'll contact you using the phone number on file to arrange redelivery.</p>

        <h2>Packaging</h2>
        <p>Fresh and frozen items are packed in insulated bags with ice packs to maintain quality during transit. Fragile items are individually wrapped for protection.</p>

        <h2>Questions?</h2>
        <p>
          For delivery issues on an existing order, visit
          <RouterLink :to="{ name: 'track-order' }" style="color:var(--color-primary-dark);font-weight:700">Track My Order</RouterLink>
          or reach out via
          <RouterLink :to="{ name: 'contact' }" style="color:var(--color-primary-dark);font-weight:700">Contact Us</RouterLink>.
        </p>
      </div>
    </div>
  </div>
</template>
