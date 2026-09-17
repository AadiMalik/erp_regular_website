<script setup>
import { ref, onMounted } from 'vue';
import { fetchCategories } from '@/services/categories';
import { fetchContactInfo, fetchSocialLinks, fetchSection } from '@/services/cms';
import PoweredByDukanaz from '@/components/common/PoweredByDukanaz.vue';
import FooterCopyright from '@/components/common/FooterCopyright.vue';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';

const site = useWebsiteSettingsStore();
const categories = ref([]);
const contact = ref({ address: '', phone: '', email: '', hours: '' });
const social = ref([]);
const footerSection = ref(null);

onMounted(async () => {
  const [cats, contactInfo, socialLinks, footerData] = await Promise.all([
    fetchCategories(),
    fetchContactInfo(),
    fetchSocialLinks(),
    fetchSection('footer'),
  ]);
  categories.value = cats.slice(0, 5);
  contact.value = contactInfo;
  social.value = socialLinks;
  footerSection.value = footerData;
});
</script>

<template>
  <footer class="t3-footer">
    <div class="container t3-footer__top">
      <span class="t3-footer__eyebrow">{{ footerSection?.tagline || 'The Curated Edit' }}</span>
      <h2 v-if="footerSection?.description">{{ footerSection.description }}</h2>
      <h2 v-else>Considered groceries, <em>delivered with care.</em></h2>
    </div>

    <div class="container t3-footer__grid">
      <div class="t3-footer__col">
        <h4>Shop</h4>
        <RouterLink v-for="c in categories" :key="c.id" :to="{ name: 'shop', query: { category: c.id } }">{{ c.name }}</RouterLink>
        <RouterLink :to="{ name: 'categories' }">All Categories</RouterLink>
      </div>
      <div class="t3-footer__col">
        <h4>Client Care</h4>
        <RouterLink :to="{ name: 'help-center' }">Help Center</RouterLink>
        <RouterLink :to="{ name: 'track-order' }">Track Order</RouterLink>
        <RouterLink :to="{ name: 'returns-refunds' }">Returns &amp; Refunds</RouterLink>
        <RouterLink :to="{ name: 'privacy-policy' }">Privacy Policy</RouterLink>
        <RouterLink :to="{ name: 'terms-conditions' }">Terms &amp; Conditions</RouterLink>
      </div>
      <div class="t3-footer__col">
        <h4>Visit</h4>
        <span>{{ contact.address }}</span>
        <span>{{ contact.phone }}</span>
        <span>{{ contact.email }}</span>
        <span>{{ contact.hours }}</span>
      </div>
      <div class="t3-footer__col">
        <h4>Follow</h4>
        <div class="t3-footer__social">
          <a v-for="s in social" :key="s.id" :href="s.url" :aria-label="s.label"><i :class="s.icon"></i></a>
        </div>
      </div>
    </div>

    <div class="container t3-footer__bottom">
      <FooterCopyright prefix="" :show-year="false" tagline="Luxury Edit" />
      <FooterCopyright prefix="© " :show-year="true" :tagline="''" show-all-rights />
      <PoweredByDukanaz />
    </div>
  </footer>
</template>

<style scoped>
.t3-footer { background: var(--color-secondary); color: rgba(255,255,255,0.7); }
.t3-footer__top { padding-block: var(--sp-11) var(--sp-9); text-align: center; }
.t3-footer__eyebrow { display: block; color: var(--color-gold); font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: var(--sp-4); }
.t3-footer__top h2 { font-size: clamp(1.9rem, 4vw, 3rem); color: #fff; font-weight: 500; max-width: 22ch; margin-inline: auto; }
.t3-footer__top h2 em { font-style: italic; color: var(--color-gold); }

.t3-footer__grid { padding-bottom: var(--sp-10); border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--sp-9); display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-6); }
.t3-footer__col { display: flex; flex-direction: column; gap: 14px; }
.t3-footer__col h4 { color: var(--color-gold); font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600; margin-bottom: 2px; }
.t3-footer__col a, .t3-footer__col span { font-size: var(--fs-sm); }
.t3-footer__col a:hover { color: #fff; }
.t3-footer__social { display: flex; gap: 14px; }
.t3-footer__social a { width: 34px; height: 34px; border: 1px solid rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all var(--dur-base); }
.t3-footer__social a:hover { border-color: var(--color-gold); color: var(--color-gold); }

.t3-footer__bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-block: var(--sp-5); display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--sp-2); font-size: var(--fs-xs); letter-spacing: 0.03em; }

@media (max-width: 900px) { .t3-footer__grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .t3-footer__grid { grid-template-columns: 1fr; } .t3-footer__bottom { flex-direction: column; text-align: center; } }
</style>
