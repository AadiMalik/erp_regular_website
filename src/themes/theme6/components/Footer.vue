<script setup>
import { ref, onMounted } from 'vue';
import { fetchCategories } from '@/services/categories';
import { fetchContactInfo, fetchSocialLinks, fetchSection, fetchContentItems, subscribeNewsletter } from '@/services/cms';
import PoweredByDukanaz from '@/components/common/PoweredByDukanaz.vue';
import FooterCopyright from '@/components/common/FooterCopyright.vue';
import { showToast } from '@/composables/useToast';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';

const site = useWebsiteSettingsStore();
const logoError = ref(false);
const categories = ref([]);
const contact = ref({ address: '', phone: '', email: '', hours: '' });
const social = ref([]);
const email = ref('');
const submitting = ref(false);
const newsletterSection = ref(null);
const footerSection = ref(null);
const paymentIcons = ref([]);

onMounted(async () => {
  const [cats, contactInfo, socialLinks, newsletterData, footerData, icons] = await Promise.all([
    fetchCategories(),
    fetchContactInfo(),
    fetchSocialLinks(),
    fetchSection('newsletter'),
    fetchSection('footer'),
    fetchContentItems('payment_icons'),
  ]);
  categories.value = cats.slice(0, 6);
  contact.value = contactInfo;
  social.value = socialLinks;
  newsletterSection.value = newsletterData;
  footerSection.value = footerData;
  paymentIcons.value = icons;
});

async function subscribe() {
  submitting.value = true;
  const result = await subscribeNewsletter(email.value, 'footer_newsletter');
  submitting.value = false;

  if (result.success) {
    showToast("You're in! Fresh deals headed your way.", 'success');
    email.value = '';
  } else {
    showToast(result.message || 'Failed to subscribe. Please try again.', 'error');
  }
}
</script>

<template>
  <footer class="t6-footer">
    <div class="container">
      <div class="t6-cta-card">
        <div class="t6-cta-card__text">
          <h2>{{ newsletterSection?.heading || 'Never miss a deal.' }}</h2>
          <p>{{ newsletterSection?.description || 'Weekly drops, flash sales and new arrivals — straight to your inbox.' }}</p>
        </div>
        <form class="t6-cta-card__form" @submit.prevent="subscribe">
          <input v-model="email" type="email" required placeholder="Enter your email" aria-label="Email address" :disabled="submitting">
          <button type="submit" class="btn btn-accent" :disabled="submitting">{{ submitting ? 'Subscribing…' : (newsletterSection?.button_text || 'Subscribe') }}</button>
        </form>
      </div>

      <div class="t6-footer__grid">
        <div class="t6-footer__brand">
          <span class="t6-logo">
            <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:28px;width:auto;object-fit:contain" @error="logoError = true">
            <template v-else><i class="fa-solid fa-basket-shopping"></i> {{ site.business.name }}</template>
          </span>
          <p>{{ footerSection?.description || 'Your whole basket, sorted fast — the marketplace built for real life.' }}</p>
          <div class="t6-footer__social">
            <a v-for="s in social" :key="s.id" :href="s.url" :aria-label="s.label"><i :class="s.icon"></i></a>
          </div>
        </div>
        <div class="t6-footer__col">
          <h4>Shop</h4>
          <RouterLink v-for="c in categories" :key="c.id" :to="{ name: 'shop', query: { category: c.id } }">{{ c.name }}</RouterLink>
        </div>
        <div class="t6-footer__col">
          <h4>Help</h4>
          <RouterLink :to="{ name: 'help-center' }">Help Center</RouterLink>
          <RouterLink :to="{ name: 'track-order' }">Track Order</RouterLink>
          <RouterLink :to="{ name: 'returns-refunds' }">Returns &amp; Refunds</RouterLink>
          <RouterLink :to="{ name: 'shipping-info' }">Shipping Info</RouterLink>
        </div>
        <div class="t6-footer__col">
          <h4>Company</h4>
          <RouterLink :to="{ name: 'about' }">About</RouterLink>
          <RouterLink :to="{ name: 'contact' }">Contact</RouterLink>
          <RouterLink :to="{ name: 'privacy-policy' }">Privacy Policy</RouterLink>
          <RouterLink :to="{ name: 'terms-conditions' }">Terms</RouterLink>
        </div>
        <div class="t6-footer__col">
          <h4>Visit</h4>
          <span>{{ contact.address }}</span>
          <span>{{ contact.phone }}</span>
          <span>{{ contact.email }}</span>
        </div>
      </div>

      <div class="t6-footer__bottom">
        <FooterCopyright />
        <PoweredByDukanaz />
        <div class="payment-icons" v-if="paymentIcons.length" aria-label="Accepted payment methods">
          <i v-for="p in paymentIcons" :key="p.id" :class="p.icon" :title="p.title"></i>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.t6-footer { background: var(--color-bg-soft); padding-block: var(--sp-9) 0; }

.t6-cta-card {
  background: linear-gradient(120deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--radius-panel); color: #fff; padding: var(--sp-7) var(--sp-8);
  display: flex; align-items: center; justify-content: space-between; gap: var(--sp-6); flex-wrap: wrap;
}
.t6-cta-card__text h2 { font-family: var(--font-display); font-size: clamp(1.4rem, 2.6vw, 1.9rem); font-weight: 700; }
.t6-cta-card__text p { margin-top: 6px; opacity: 0.85; font-size: var(--fs-sm); }
.t6-cta-card__form { display: flex; gap: 10px; flex-wrap: wrap; }
.t6-cta-card__form input { border-radius: var(--radius-pill); padding: 0.8rem 1.2rem; min-width: 240px; border: none; }

.t6-footer__grid { padding-block: var(--sp-9); display: grid; grid-template-columns: 1.4fr repeat(4, 1fr); gap: var(--sp-6); }
.t6-footer__brand { display: flex; flex-direction: column; gap: var(--sp-3); }
.t6-logo { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 800; font-size: 1.2rem; color: var(--color-secondary); }
.t6-logo i { color: var(--color-primary); }
.t6-footer__brand p { font-size: var(--fs-sm); color: var(--color-text-muted); max-width: 30ch; }
.t6-footer__social { display: flex; gap: 8px; margin-top: 4px; }
.t6-footer__social a { width: 38px; height: 38px; border-radius: 50%; background: var(--color-primary-light); color: var(--color-primary-dark); display: flex; align-items: center; justify-content: center; transition: background var(--dur-fast), transform var(--dur-fast); }
.t6-footer__social a:hover { background: var(--color-primary); color: #fff; transform: translateY(-3px); }

.t6-footer__col { display: flex; flex-direction: column; gap: 12px; }
.t6-footer__col h4 { font-family: var(--font-display); font-weight: 700; font-size: var(--fs-sm); margin-bottom: 2px; }
.t6-footer__col a, .t6-footer__col span { font-size: var(--fs-sm); color: var(--color-text-muted); }
.t6-footer__col a:hover { color: var(--color-primary); }

.t6-footer__bottom { border-top: 1px solid var(--color-border); padding-block: var(--sp-5); display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--sp-3); font-size: var(--fs-xs); color: var(--color-text-muted); }

@media (max-width: 1080px) { .t6-footer__grid { grid-template-columns: 1fr 1fr 1fr; } .t6-footer__brand { grid-column: 1 / -1; } }
@media (max-width: 640px) { .t6-footer__grid { grid-template-columns: 1fr 1fr; gap: var(--sp-6); } .t6-cta-card { flex-direction: column; align-items: flex-start; } }
</style>
