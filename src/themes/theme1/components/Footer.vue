<script setup>
import { ref, onMounted } from 'vue';
import { fetchCategories } from '@/services/categories';
import { fetchContactInfo, fetchSocialLinks, fetchSection, fetchContentItems } from '@/services/cms';
import PoweredByDukanaz from '@/components/common/PoweredByDukanaz.vue';
import FooterCopyright from '@/components/common/FooterCopyright.vue';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';

const site = useWebsiteSettingsStore();
const logoError = ref(false);
const categories = ref([]);
const contact = ref({ address: '', phone: '', email: '', hours: '' });
const social = ref([]);
const footerSection = ref(null);
const paymentIcons = ref([]);

onMounted(async () => {
  const [cats, contactInfo, socialLinks, footerData, icons] = await Promise.all([
    fetchCategories(),
    fetchContactInfo(),
    fetchSocialLinks(),
    fetchSection('footer'),
    fetchContentItems('payment_icons'),
  ]);
  categories.value = cats.slice(0, 6);
  contact.value = contactInfo;
  social.value = socialLinks;
  footerSection.value = footerData;
  paymentIcons.value = icons;
});
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-top">
      <div class="footer-brand">
        <RouterLink :to="{ name: 'home' }" class="logo">
          <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:32px;width:auto;object-fit:contain" @error="logoError = true">
          <template v-else>
            <span class="logo__mark"><i class="fa-solid fa-basket-shopping"></i></span>
            <span style="color:var(--color-primary)">{{ site.business.name }}</span>
          </template>
        </RouterLink>
        <p>{{ footerSection?.description || 'Your everyday supermarket, online. Fresh produce, pantry staples and household essentials delivered fast — with quality you can trust.' }}</p>
        <div class="footer-social">
          <a v-for="s in social" :key="s.id" :href="s.url" :aria-label="s.label"><i :class="s.icon"></i></a>
        </div>
      </div>

      <div class="footer-col">
        <h4>Categories</h4>
        <ul>
          <li v-for="c in categories" :key="c.id">
            <RouterLink :to="{ name: 'shop', query: { category: c.id } }">{{ c.name }}</RouterLink>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Customer Service</h4>
        <ul>
          <li><RouterLink :to="{ name: 'help-center' }">Help Center</RouterLink></li>
          <li><RouterLink :to="{ name: 'track-order' }">Track My Order</RouterLink></li>
          <li><RouterLink :to="{ name: 'returns-refunds' }">Returns &amp; Refunds</RouterLink></li>
          <li><RouterLink :to="{ name: 'cancellation-policy' }">Cancellation Policy</RouterLink></li>
          <li><RouterLink :to="{ name: 'shipping-info' }">Shipping Info</RouterLink></li>
          <li><RouterLink :to="{ name: 'privacy-policy' }">Privacy Policy</RouterLink></li>
          <li><RouterLink :to="{ name: 'terms-conditions' }">Terms &amp; Conditions</RouterLink></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><RouterLink :to="{ name: 'about' }">About Us</RouterLink></li>
          <li><RouterLink :to="{ name: 'contact' }">Contact Us</RouterLink></li>
          <li><RouterLink :to="{ name: 'categories' }">Categories</RouterLink></li>
          <li><RouterLink :to="{ name: 'orders' }">My Orders</RouterLink></li>
        </ul>
      </div>

      <div class="footer-col footer-contact">
        <h4>Get In Touch</h4>
        <ul>
          <li><i class="fa-solid fa-location-dot"></i> {{ contact.address }}</li>
          <li><i class="fa-solid fa-phone"></i> {{ contact.phone }}</li>
          <li><i class="fa-solid fa-envelope"></i> {{ contact.email }}</li>
          <li><i class="fa-solid fa-clock"></i> {{ contact.hours }}</li>
        </ul>
      </div>
    </div>

    <div class="container footer-bottom">
      <FooterCopyright :tagline="footerSection?.tagline" show-all-rights />
      <PoweredByDukanaz />
      <div class="payment-icons" v-if="paymentIcons.length" aria-label="Accepted payment methods">
        <i v-for="p in paymentIcons" :key="p.id" :class="p.icon" :title="p.title"></i>
      </div>
    </div>
  </footer>
</template>
