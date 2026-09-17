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
    showToast("You're subscribed! Watch your inbox for fresh deals.", 'success');
    email.value = '';
  } else {
    showToast(result.message || 'Failed to subscribe. Please try again.', 'error');
  }
}
</script>

<template>
  <footer class="t4-footer">
    <div class="container t4-newsletter">
      <div class="t4-newsletter__text">
        <span class="t4-tag">{{ newsletterSection?.tagline || 'Stay In The Loop' }}</span>
        <h2>{{ newsletterSection?.heading || 'Get deals dropped straight to your inbox.' }}</h2>
      </div>
      <form class="t4-newsletter__form" @submit.prevent="subscribe">
        <input v-model="email" type="email" required placeholder="you@email.com" aria-label="Email address" :disabled="submitting">
        <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? 'Subscribing…' : 'Subscribe' }} <i class="fa-solid fa-arrow-right"></i></button>
      </form>
    </div>

    <div class="container t4-footer__grid">
      <div class="t4-footer__brand">
        <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:32px;width:auto;object-fit:contain" @error="logoError = true">
        <span v-else class="t4-logo__mark">{{ site.business.name.slice(0, 2).toUpperCase() }}</span>
        <p>{{ footerSection?.description || 'Big, fresh flavour delivered fast — groceries done right.' }}</p>
        <div class="t4-footer__social">
          <a v-for="s in social" :key="s.id" :href="s.url" :aria-label="s.label"><i :class="s.icon"></i></a>
        </div>
      </div>
      <div class="t4-footer__col">
        <h4>Shop</h4>
        <RouterLink v-for="c in categories" :key="c.id" :to="{ name: 'shop', query: { category: c.id } }">{{ c.name }}</RouterLink>
      </div>
      <div class="t4-footer__col">
        <h4>Support</h4>
        <RouterLink :to="{ name: 'help-center' }">Help Center</RouterLink>
        <RouterLink :to="{ name: 'track-order' }">Track Order</RouterLink>
        <RouterLink :to="{ name: 'returns-refunds' }">Returns &amp; Refunds</RouterLink>
        <RouterLink :to="{ name: 'shipping-info' }">Shipping Info</RouterLink>
      </div>
      <div class="t4-footer__col">
        <h4>Company</h4>
        <RouterLink :to="{ name: 'about' }">About Us</RouterLink>
        <RouterLink :to="{ name: 'contact' }">Contact</RouterLink>
        <RouterLink :to="{ name: 'privacy-policy' }">Privacy Policy</RouterLink>
        <RouterLink :to="{ name: 'terms-conditions' }">Terms &amp; Conditions</RouterLink>
      </div>
      <div class="t4-footer__col">
        <h4>Visit</h4>
        <span>{{ contact.address }}</span>
        <span>{{ contact.phone }}</span>
        <span>{{ contact.email }}</span>
        <span>{{ contact.hours }}</span>
      </div>
    </div>

    <div class="container t4-footer__bottom">
      <FooterCopyright :tagline="footerSection?.tagline || 'Big. Fresh. Fast.'" tagline-separator=". " />
      <PoweredByDukanaz />
      <div class="payment-icons" v-if="paymentIcons.length" aria-label="Accepted payment methods">
        <i v-for="p in paymentIcons" :key="p.id" :class="p.icon" :title="p.title"></i>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.t4-footer { background: var(--color-bg-soft); color: var(--color-text); border-top: 3px solid var(--color-secondary); }

.t4-newsletter {
  display: flex; align-items: center; justify-content: space-between; gap: var(--sp-6); flex-wrap: wrap;
  padding-block: var(--sp-8); border-bottom: 3px solid var(--color-secondary);
}
.t4-tag { display: inline-block; background: var(--color-secondary); color: #fff; padding: 5px 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--sp-3); }
.t4-newsletter__text h2 { font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 800; max-width: 20ch; }
.t4-newsletter__form { display: flex; gap: 10px; flex-wrap: wrap; }
.t4-newsletter__form input {
  border: 2.5px solid var(--color-secondary); border-radius: var(--radius-btn); padding: 0.85rem 1.1rem;
  background: #fff; min-width: 260px; font-weight: 600;
}
.t4-newsletter__form input:focus { outline: none; box-shadow: 3px 3px 0 var(--color-secondary); }

.t4-footer__grid { padding-block: var(--sp-9); display: grid; grid-template-columns: 1.4fr repeat(4, 1fr); gap: var(--sp-6); }
.t4-footer__brand { display: flex; flex-direction: column; gap: var(--sp-3); }
.t4-logo__mark {
  width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;
  background: var(--color-primary); color: #fff; font-family: var(--font-display); font-weight: 900;
  border-radius: 10px; border: 2.5px solid var(--color-secondary); box-shadow: var(--shadow-hard);
}
.t4-footer__brand p { font-size: var(--fs-sm); max-width: 32ch; color: var(--color-text-muted); }
.t4-footer__social { display: flex; gap: 8px; margin-top: 6px; }
.t4-footer__social a {
  width: 38px; height: 38px; border: 2px solid var(--color-secondary); border-radius: 8px;
  display: flex; align-items: center; justify-content: center; transition: transform var(--dur-fast) var(--ease-premium);
}
.t4-footer__social a:hover { transform: translate(-2px, -2px); box-shadow: 3px 3px 0 var(--color-secondary); background: var(--color-primary); color: #fff; }

.t4-footer__col { display: flex; flex-direction: column; gap: 12px; }
.t4-footer__col h4 { font-family: var(--font-display); font-size: var(--fs-sm); font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px; }
.t4-footer__col a, .t4-footer__col span { font-size: var(--fs-sm); color: var(--color-text-muted); }
.t4-footer__col a:hover { color: var(--color-primary); }

.t4-footer__bottom {
  border-top: 3px solid var(--color-secondary); padding-block: var(--sp-5);
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--sp-3);
  font-size: var(--fs-xs); font-weight: 700;
}

@media (max-width: 1080px) { .t4-footer__grid { grid-template-columns: 1fr 1fr 1fr; } .t4-footer__brand { grid-column: 1 / -1; } }
@media (max-width: 640px) { .t4-footer__grid { grid-template-columns: 1fr 1fr; gap: var(--sp-6); } .t4-newsletter { flex-direction: column; align-items: flex-start; } }
</style>
