<script setup>
// Falls back to this static hero copy when the ERP admin hasn't configured
// the "hero" CMS section yet (Website CMS > Homepage Sections). Hero Stats
// come from the admin-managed Hero Stats CRUD - hidden entirely when the
// admin hasn't configured any.
import { ref, onMounted } from 'vue';
import { fetchSection, resolveSectionLink, resolveSecondaryLink, fetchHeroStats } from '@/services/cms';

const section = ref(null);
const stats = ref([]);
onMounted(async () => {
  [section.value, stats.value] = await Promise.all([fetchSection('hero'), fetchHeroStats()]);
});
</script>

<template>
  <section class="t4-hero">
    <div class="container t4-hero__grid">
      <div class="t4-hero__text">
        <span class="t4-hero__tag"><i v-if="section?.tagline_icon" :class="section.tagline_icon"></i> {{ section?.tagline || 'No. 01 — Grocery, Reinvented' }}</span>
        <h1 v-if="section?.heading">{{ section.heading }}</h1>
        <h1 v-else>BIG<br><span>FRESH</span><br>FLAVOUR.</h1>
        <p class="lead">{{ section?.description || 'Hand-picked produce, pantry staples and everyday essentials — stacked up, boxed up, and on your doorstep fast.' }}</p>
        <div class="t4-hero__cta">
          <RouterLink :to="section ? resolveSectionLink(section) : { name: 'shop' }" class="btn btn-primary btn-lg">{{ section?.button_text || 'Shop The Drop' }}</RouterLink>
          <RouterLink v-if="section?.secondary_button_text" :to="resolveSecondaryLink(section) || { name: 'shop' }" class="t4-hero__link">{{ section.secondary_button_text }} <i class="fa-solid fa-arrow-right"></i></RouterLink>
        </div>
      </div>
      <div class="t4-hero__visual">
        <div class="t4-hero__img">
          <img :src="section?.image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&h=1000&q=80'" alt="Fresh produce crate">
        </div>
        <div class="t4-hero__chip t4-hero__chip--1" v-if="stats[0]"><strong>{{ stats[0].value }}</strong><span>{{ stats[0].label }}</span></div>
        <div class="t4-hero__chip t4-hero__chip--2" v-if="stats[1]"><i :class="stats[1].icon || 'fa-solid fa-truck-fast'"></i><span>{{ stats[1].label }}</span></div>
      </div>
    </div>
    <div class="t4-hero__strip" v-if="stats.length > 2">
      <div class="container t4-hero__strip-inner">
        <div v-for="stat in stats.slice(2)" :key="stat.id"><strong>{{ stat.value }}</strong><span>{{ stat.label }}</span></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.t4-hero { padding-top: var(--sp-8); position: relative; }
.t4-hero__grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: var(--sp-8); align-items: center; padding-bottom: var(--sp-9); }
.t4-hero__tag {
  display: inline-block; background: var(--color-secondary); color: #fff; padding: 6px 14px;
  font-size: var(--fs-xs); font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--sp-5);
}
.t4-hero__text h1 {
  font-family: var(--font-display); font-weight: 900; text-transform: uppercase;
  font-size: clamp(3rem, 8vw, 6rem); line-height: 0.95; color: var(--color-secondary); letter-spacing: -0.01em;
}
.t4-hero__text h1 span { color: var(--color-primary); -webkit-text-stroke: 2px var(--color-secondary); }
.t4-hero__text p.lead { margin-top: var(--sp-5); font-size: var(--fs-md); color: var(--color-text-soft); max-width: 42ch; font-weight: 600; }
.t4-hero__cta { display: flex; align-items: center; gap: var(--sp-6); margin-top: var(--sp-7); flex-wrap: wrap; }
.t4-hero__link { font-weight: 800; font-size: var(--fs-sm); display: inline-flex; align-items: center; gap: 8px; text-transform: uppercase; border-bottom: 3px solid var(--color-secondary); padding-bottom: 4px; }
.t4-hero__link:hover { color: var(--color-accent); border-color: var(--color-accent); }

.t4-hero__visual { position: relative; }
.t4-hero__img {
  aspect-ratio: 4/4.5; border-radius: var(--radius-card); overflow: hidden;
  border: 3px solid var(--color-secondary); box-shadow: var(--shadow-lg);
}
.t4-hero__img img { width: 100%; height: 100%; object-fit: cover; }
.t4-hero__chip {
  position: absolute; background: #fff; border: 3px solid var(--color-secondary); border-radius: var(--radius-btn);
  padding: 10px 16px; box-shadow: var(--shadow-hard); display: flex; flex-direction: column; align-items: center;
}
.t4-hero__chip--1 { top: -18px; right: -18px; background: var(--color-gold); }
.t4-hero__chip--1 strong { font-family: var(--font-display); font-size: 1.4rem; font-weight: 900; color: var(--color-secondary); }
.t4-hero__chip--1 span { font-size: 9px; font-weight: 800; letter-spacing: 0.05em; }
.t4-hero__chip--2 { bottom: -16px; left: -16px; flex-direction: row; gap: 8px; background: var(--color-secondary); color: #fff; }
.t4-hero__chip--2 i { color: var(--color-primary); }
.t4-hero__chip--2 span { font-size: 10px; font-weight: 800; letter-spacing: 0.04em; }

.t4-hero__strip { background: var(--color-secondary); }
.t4-hero__strip-inner { display: flex; justify-content: space-between; padding-block: var(--sp-5); flex-wrap: wrap; gap: var(--sp-5); }
.t4-hero__strip-inner div { display: flex; flex-direction: column; align-items: center; color: #fff; }
.t4-hero__strip-inner strong { font-family: var(--font-display); font-size: var(--fs-2xl); font-weight: 900; color: var(--color-gold); }
.t4-hero__strip-inner span { font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8; }

@media (max-width: 900px) {
  .t4-hero__grid { grid-template-columns: 1fr; gap: var(--sp-9); }
  .t4-hero__visual { order: -1; max-width: 420px; margin-inline: auto; width: 100%; }
}
@media (max-width: 560px) {
  .t4-hero__strip-inner { justify-content: center; gap: var(--sp-6); }
}
</style>
