<script setup>
// Falls back to this static hero copy when the ERP admin hasn't configured
// the "hero" CMS section yet (Website CMS > Homepage Sections). The image
// caption comes from the admin-managed Hero Stats CRUD - hidden entirely
// when the admin hasn't configured any.
import { ref, onMounted } from 'vue';
import { fetchSection, resolveSectionLink, resolveSecondaryLink, fetchHeroStats } from '@/services/cms';

const section = ref(null);
const stats = ref([]);
onMounted(async () => {
  [section.value, stats.value] = await Promise.all([fetchSection('hero'), fetchHeroStats()]);
});
</script>

<template>
  <section class="t3-hero">
    <div class="container t3-hero__grid">
      <div class="t3-hero__text">
        <span class="t3-hero__eyebrow"><i v-if="section?.tagline_icon" :class="section.tagline_icon"></i> {{ section?.tagline || 'Volume I — The Fresh Edit' }}</span>
        <h1 v-if="section?.heading">{{ section.heading }}</h1>
        <h1 v-else>Groceries, <em>curated</em> like a fine collection.</h1>
        <p>{{ section?.description || 'An unhurried way to shop — hand-selected produce, pantry staples and everyday essentials, delivered with the quiet care of a concierge.' }}</p>
        <div class="t3-hero__cta">
          <RouterLink :to="section ? resolveSectionLink(section) : { name: 'shop' }" class="t3-hero__btn">{{ section?.button_text || 'Discover the Edit' }}</RouterLink>
          <RouterLink :to="section?.secondary_button_text ? (resolveSecondaryLink(section) || { name: 'about' }) : { name: 'about' }" class="t3-hero__link">{{ section?.secondary_button_text || 'Our Story' }} <i class="fa-solid fa-arrow-right"></i></RouterLink>
        </div>
      </div>
      <div class="t3-hero__media">
        <img :src="section?.image || 'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=1000&h=1250&q=80'" alt="Curated fresh produce still life">
        <div class="t3-hero__caption" v-if="stats[0]"><strong>{{ stats[0].value }}</strong><span>{{ stats[0].label }}</span></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.t3-hero { padding-block: var(--sp-10) var(--sp-11); }
.t3-hero__grid { display: grid; grid-template-columns: 1fr 0.9fr; gap: var(--sp-9); align-items: center; }
.t3-hero__eyebrow { display: block; color: var(--color-gold); font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: var(--sp-5); }
.t3-hero__text h1 { font-size: clamp(2.4rem, 4.6vw, 4rem); font-weight: 500; color: var(--color-text); margin-bottom: var(--sp-5); }
.t3-hero__text h1 em { font-style: italic; color: var(--color-accent); }
.t3-hero__text p { color: var(--color-text-muted); font-size: var(--fs-md); max-width: 42ch; margin-bottom: var(--sp-7); }
.t3-hero__cta { display: flex; align-items: center; gap: var(--sp-6); }
.t3-hero__btn {
  padding: 1rem 2.2rem; background: var(--color-secondary); color: #fff; font-size: var(--fs-sm);
  text-transform: uppercase; letter-spacing: 0.08em; transition: background var(--dur-base);
}
.t3-hero__btn:hover { background: var(--color-accent); }
.t3-hero__link { font-size: var(--fs-sm); border-bottom: 1px solid var(--color-border-strong); padding-bottom: 3px; display: inline-flex; gap: 8px; align-items: center; }
.t3-hero__link:hover { border-color: var(--color-accent); color: var(--color-accent); }

.t3-hero__media { position: relative; aspect-ratio: 4/5; overflow: hidden; }
.t3-hero__media img { width: 100%; height: 100%; object-fit: cover; }
.t3-hero__caption {
  position: absolute; left: -1px; bottom: var(--sp-6); background: var(--color-surface);
  padding: var(--sp-4) var(--sp-5); display: flex; flex-direction: column; gap: 2px;
  box-shadow: var(--shadow-md);
}
.t3-hero__caption strong { font-family: var(--font-display); font-size: var(--fs-md); }
.t3-hero__caption span { font-size: var(--fs-xs); color: var(--color-text-muted); }

@media (max-width: 900px) {
  .t3-hero__grid { grid-template-columns: 1fr; }
  .t3-hero__media { order: -1; aspect-ratio: 16/11; }
}
</style>
