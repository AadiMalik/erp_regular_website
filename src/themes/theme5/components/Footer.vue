<script setup>
import { ref, onMounted } from 'vue';
import { fetchContactInfo, fetchSocialLinks, fetchSection, subscribeNewsletter } from '@/services/cms';
import PoweredByDukanaz from '@/components/common/PoweredByDukanaz.vue';
import FooterCopyright from '@/components/common/FooterCopyright.vue';
import { showToast } from '@/composables/useToast';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';

const site = useWebsiteSettingsStore();
const logoError = ref(false);
const contact = ref({ address: '', phone: '', email: '', hours: '' });
const social = ref([]);
const email = ref('');
const footerSection = ref(null);
const submitting = ref(false);

onMounted(async () => {
  const [contactInfo, socialLinks, footer] = await Promise.all([fetchContactInfo(), fetchSocialLinks(), fetchSection('footer')]);
  contact.value = contactInfo;
  social.value = socialLinks;
  footerSection.value = footer;
});

async function subscribe() {
  submitting.value = true;
  const result = await subscribeNewsletter(email.value, 'footer_newsletter');
  submitting.value = false;

  if (result.success) {
    showToast("You're on the list — expect a note soon.", 'success');
    email.value = '';
  } else {
    showToast(result.message || 'Failed to subscribe. Please try again.', 'error');
  }
}
</script>

<template>
  <footer class="t5-footer">
    <div class="container t5-footer__inner">
      <span class="t5-footer__logo">
        <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:22px;width:auto;object-fit:contain" @error="logoError = true">
        <template v-else>{{ site.business.name.toUpperCase() }}</template>
      </span>
      <p class="t5-footer__tag">{{ footerSection?.description || 'Quiet luxury, quietly delivered.' }}</p>

      <nav class="t5-footer__nav">
        <RouterLink :to="{ name: 'shop' }">Shop</RouterLink>
        <RouterLink :to="{ name: 'about' }">About</RouterLink>
        <RouterLink :to="{ name: 'contact' }">Contact</RouterLink>
        <RouterLink :to="{ name: 'help-center' }">Help</RouterLink>
        <RouterLink :to="{ name: 'track-order' }">Track Order</RouterLink>
        <RouterLink :to="{ name: 'returns-refunds' }">Returns</RouterLink>
        <RouterLink :to="{ name: 'privacy-policy' }">Privacy</RouterLink>
        <RouterLink :to="{ name: 'terms-conditions' }">Terms</RouterLink>
      </nav>

      <form class="t5-footer__form" @submit.prevent="subscribe">
        <input v-model="email" type="email" required placeholder="Email address" aria-label="Email address" :disabled="submitting">
        <button type="submit" aria-label="Subscribe" :disabled="submitting"><i class="fa-solid fa-arrow-right"></i></button>
      </form>

      <div class="t5-footer__social">
        <a v-for="s in social" :key="s.id" :href="s.url" :aria-label="s.label"><i :class="s.icon"></i></a>
      </div>

      <div class="t5-footer__contact">
        <span>{{ contact.address }}</span>
        <span>{{ contact.phone }}</span>
        <span>{{ contact.email }}</span>
      </div>

      <span class="t5-footer__copy"><FooterCopyright show-all-rights /></span>
      <PoweredByDukanaz />
    </div>
  </footer>
</template>

<style scoped>
.t5-footer { background: var(--color-bg-soft); border-top: 1px solid var(--color-border); }
.t5-footer__inner { display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--sp-5); padding-block: var(--sp-11) var(--sp-8); }
.t5-footer__logo { font-family: var(--font-display); font-weight: 600; font-size: 1.1rem; letter-spacing: 0.3em; color: var(--color-text); }
.t5-footer__tag { font-size: var(--fs-sm); color: var(--color-text-muted); font-weight: 300; }

.t5-footer__nav { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--sp-5); margin-top: var(--sp-3); }
.t5-footer__nav a { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); transition: color var(--dur-fast); }
.t5-footer__nav a:hover { color: var(--color-accent); }

.t5-footer__form { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--color-text); padding-bottom: 8px; margin-top: var(--sp-3); }
.t5-footer__form input { background: transparent; text-align: center; font-size: var(--fs-sm); min-width: 220px; padding: 4px; }
.t5-footer__form button { color: var(--color-text); transition: color var(--dur-fast); }
.t5-footer__form button:hover { color: var(--color-accent); }

.t5-footer__social { display: flex; gap: var(--sp-4); }
.t5-footer__social a { color: var(--color-text-muted); font-size: 1rem; transition: color var(--dur-fast); }
.t5-footer__social a:hover { color: var(--color-accent); }

.t5-footer__contact { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--sp-4); font-size: var(--fs-xs); color: var(--color-text-muted); }
.t5-footer__copy { font-size: 10px; color: var(--color-text-faint); letter-spacing: 0.05em; margin-top: var(--sp-4); padding-top: var(--sp-5); border-top: 1px solid var(--color-border); width: 100%; }
</style>
