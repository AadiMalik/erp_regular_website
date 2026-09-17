<script setup>
import { ref, onMounted } from 'vue';
import { fetchCategories } from '@/services/categories';
import { fetchContactInfo, fetchSocialLinks, fetchSection, fetchContentItems, subscribeNewsletter } from '@/services/cms';
import PoweredByDukanaz from '@/components/common/PoweredByDukanaz.vue';
import FooterCopyright from '@/components/common/FooterCopyright.vue';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { showToast } from '@/composables/useToast';

const site = useWebsiteSettingsStore();
const logoError = ref(false);
const categories = ref([]);
const contact = ref({ address: '', phone: '', email: '', hours: '' });
const social = ref([]);
const footerSection = ref(null);
const newsletterSection = ref(null);
const paymentIcons = ref([]);
const email = ref('');
const submitting = ref(false);

onMounted(async () => {
  const [cats, contactInfo, socialLinks, footerData, newsletterData, icons] = await Promise.all([
    fetchCategories(),
    fetchContactInfo(),
    fetchSocialLinks(),
    fetchSection('footer'),
    fetchSection('newsletter'),
    fetchContentItems('payment_icons'),
  ]);
  categories.value = cats.slice(0, 6);
  contact.value = contactInfo;
  social.value = socialLinks;
  footerSection.value = footerData;
  newsletterSection.value = newsletterData;
  paymentIcons.value = icons;
});

async function subscribe() {
  submitting.value = true;
  const result = await subscribeNewsletter(email.value, 'footer_newsletter');
  submitting.value = false;

  if (result.success) {
    showToast("You're subscribed! Watch your inbox for fresh deals.", 'success');
    email.value = '';
  } else {
    showToast(result.message || 'Failed to subscribe. Please try again.', 'error');
  }
}
</script>

<template>
  <footer class="t2-footer">
    <div class="t2-footer__cta">
      <div class="container t2-footer__cta-inner">
        <div>
          <h2>{{ newsletterSection?.heading || 'Get 20% off your first order' }}</h2>
          <p>{{ newsletterSection?.description || 'Join the bazaar — fresh deals dropped in your inbox every week.' }}</p>
        </div>
        <form class="t2-footer__form" @submit.prevent="subscribe">
          <input v-model="email" type="email" placeholder="you@email.com" required :disabled="submitting">
          <button type="submit" :disabled="submitting">{{ submitting ? 'Subscribing…' : (newsletterSection?.button_text || 'Subscribe') }}</button>
        </form>
      </div>
    </div>

    <div class="container t2-footer__grid">
      <div class="t2-footer__brand">
        <RouterLink :to="{ name: 'home' }" class="t2-footer__logo">
          <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:32px;width:auto;object-fit:contain" @error="logoError = true">
          <template v-else><span><i class="fa-solid fa-bag-shopping"></i></span> {{ site.business.name }}</template>
        </RouterLink>
        <p>{{ footerSection?.description || 'Your everyday supermarket, reimagined — bold deals, fresh picks, delivered fast.' }}</p>
        <div class="t2-footer__social">
          <a v-for="s in social" :key="s.id" :href="s.url" :aria-label="s.label"><i :class="s.icon"></i></a>
        </div>
      </div>

      <div class="t2-footer__col">
        <h4>Shop</h4>
        <RouterLink v-for="c in categories" :key="c.id" :to="{ name: 'shop', query: { category: c.id } }">{{ c.name }}</RouterLink>
      </div>

      <div class="t2-footer__col">
        <h4>Support</h4>
        <RouterLink :to="{ name: 'help-center' }">Help Center</RouterLink>
        <RouterLink :to="{ name: 'track-order' }">Track Order</RouterLink>
        <RouterLink :to="{ name: 'returns-refunds' }">Returns &amp; Refunds</RouterLink>
        <RouterLink :to="{ name: 'shipping-info' }">Shipping Info</RouterLink>
        <RouterLink :to="{ name: 'terms-conditions' }">Terms</RouterLink>
      </div>

      <div class="t2-footer__col">
        <h4>Get in touch</h4>
        <span><i class="fa-solid fa-location-dot"></i> {{ contact.address }}</span>
        <span><i class="fa-solid fa-phone"></i> {{ contact.phone }}</span>
        <span><i class="fa-solid fa-envelope"></i> {{ contact.email }}</span>
      </div>
    </div>

    <div class="container t2-footer__bottom">
      <FooterCopyright :tagline="footerSection?.tagline" />
      <PoweredByDukanaz />
      <div class="t2-footer__pay" v-if="paymentIcons.length" aria-label="Accepted payment methods">
        <i v-for="p in paymentIcons" :key="p.id" :class="p.icon" :title="p.title"></i>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.t2-footer { background: var(--color-secondary); color: rgba(255,255,255,0.78); }
.t2-footer__cta { background: linear-gradient(120deg, var(--color-primary), #C026D3); color: #fff; }
.t2-footer__cta-inner { padding-block: var(--sp-8); display: flex; align-items: center; justify-content: space-between; gap: var(--sp-6); flex-wrap: wrap; }
.t2-footer__cta-inner h2 { font-size: var(--fs-2xl); }
.t2-footer__cta-inner p { opacity: 0.9; margin-top: 4px; }
.t2-footer__form { display: flex; gap: 8px; background: rgba(255,255,255,0.15); padding: 6px; border-radius: var(--radius-pill); }
.t2-footer__form input { background: transparent; border: none; padding: 0.7rem 1rem; color: #fff; min-width: 220px; }
.t2-footer__form input::placeholder { color: rgba(255,255,255,0.7); }
.t2-footer__form input:focus { outline: none; }
.t2-footer__form button { background: #fff; color: var(--color-primary); font-weight: 800; padding: 0.7rem 1.4rem; border-radius: var(--radius-pill); transition: transform var(--dur-fast) var(--ease-spring); }
.t2-footer__form button:hover { transform: scale(1.05); }

.t2-footer__grid { padding-block: var(--sp-9); display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: var(--sp-6); }
.t2-footer__logo { display: flex; align-items: center; gap: 8px; color: #fff; font-family: var(--font-display); font-weight: 800; font-size: 1.2rem; }
.t2-footer__logo span { width: 34px; height: 34px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--color-gold), var(--color-accent)); display: flex; align-items: center; justify-content: center; }
.t2-footer__logo em { font-style: normal; color: var(--color-gold); }
.t2-footer__brand p { margin-top: var(--sp-3); max-width: 32ch; font-size: var(--fs-sm); }
.t2-footer__social { display: flex; gap: 10px; margin-top: var(--sp-5); }
.t2-footer__social a { width: 38px; height: 38px; border-radius: var(--radius-md); background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; color: #fff; transition: all var(--dur-fast) var(--ease-spring); }
.t2-footer__social a:hover { background: var(--color-gold); transform: translateY(-3px) rotate(-6deg); }
.t2-footer__col { display: flex; flex-direction: column; gap: 10px; }
.t2-footer__col h4 { color: #fff; font-size: var(--fs-sm); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.t2-footer__col a, .t2-footer__col span { font-size: var(--fs-sm); display: flex; align-items: center; gap: 8px; }
.t2-footer__col a:hover { color: var(--color-gold); }
.t2-footer__bottom { border-top: 1px solid rgba(255,255,255,0.12); padding-block: var(--sp-5); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--sp-3); font-size: var(--fs-xs); }
.t2-footer__pay { display: flex; gap: 10px; font-size: 1.3rem; }

@media (max-width: 900px) { .t2-footer__grid { grid-template-columns: 1fr 1fr; } .t2-footer__brand { grid-column: 1 / -1; } }
@media (max-width: 560px) { .t2-footer__grid { grid-template-columns: 1fr; } .t2-footer__cta-inner { flex-direction: column; align-items: flex-start; } }
</style>
