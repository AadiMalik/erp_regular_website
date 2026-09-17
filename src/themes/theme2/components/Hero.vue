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
  <section class="t2-hero">
    <div class="t2-hero__blob b1"></div>
    <div class="t2-hero__blob b2"></div>
    <div class="container t2-hero__inner">
      <span v-if="section?.tagline" class="t2-hero__badge"><i :class="section.tagline_icon || 'fa-solid fa-sparkles'"></i> {{ section.tagline }}</span>
      <h1 v-if="section?.heading">{{ section.heading }}</h1>
      <h1 v-else>Groceries that feel <span class="t2-hero__gradient">like a celebration.</span></h1>
      <p>{{ section?.description || "Vivid produce, everyday essentials and weekend deals — all delivered in as fast as 2 hours, wrapped in a shopping experience you'll actually enjoy." }}</p>
      <div class="t2-hero__cta">
        <RouterLink :to="section ? resolveSectionLink(section) : { name: 'shop' }" class="t2-hero__btn t2-hero__btn--primary"><i class="fa-solid fa-bolt"></i> {{ section?.button_text || 'Shop the Bazaar' }}</RouterLink>
        <RouterLink v-if="section?.secondary_button_text" :to="resolveSecondaryLink(section)" class="t2-hero__btn t2-hero__btn--ghost">{{ section.secondary_button_text }}</RouterLink>
      </div>
      <div class="t2-hero__stats" v-if="stats.length > 3">
        <div v-for="stat in stats.slice(3)" :key="stat.id"><strong>{{ stat.value }}</strong><span>{{ stat.label }}</span></div>
      </div>
    </div>
    <div class="t2-hero__cards">
      <div v-if="stats[0]" class="t2-hero__card c1"><i class="fa-solid fa-truck-fast"></i><div><strong>{{ stats[0].value }}</strong><span>{{ stats[0].label }}</span></div></div>
      <div v-if="stats[1]" class="t2-hero__card c2"><i class="fa-solid fa-tags"></i><div><strong>{{ stats[1].value }}</strong><span>{{ stats[1].label }}</span></div></div>
      <div v-if="stats[2]" class="t2-hero__card c3"><i class="fa-solid fa-star"></i><div><strong>{{ stats[2].value }}</strong><span>{{ stats[2].label }}</span></div></div>
    </div>
  </section>
</template>

<style scoped>
.t2-hero { position: relative; overflow: hidden; padding-block: var(--sp-11) var(--sp-9); background: linear-gradient(180deg, var(--color-primary-lighter), #fff 70%); }
.t2-hero__blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.5; z-index: 0; }
.t2-hero__blob.b1 { width: 420px; height: 420px; background: var(--color-gold); top: -140px; right: -100px; }
.t2-hero__blob.b2 { width: 340px; height: 340px; background: var(--color-primary); bottom: -160px; left: -80px; }
.t2-hero__inner { position: relative; z-index: 1; max-width: 760px; margin-inline: auto; text-align: center; }
.t2-hero__badge {
  display: inline-flex; align-items: center; gap: 8px; background: #fff; color: var(--color-primary);
  padding: 8px 18px; border-radius: var(--radius-pill); font-weight: 700; font-size: var(--fs-sm);
  box-shadow: var(--shadow-md); margin-bottom: var(--sp-5);
  animation: t2Float 3.4s ease-in-out infinite;
}
.t2-hero__inner h1 { font-size: clamp(2.4rem, 5vw, 3.75rem); color: var(--color-secondary); margin-bottom: var(--sp-4); }
.t2-hero__gradient {
  background: linear-gradient(90deg, var(--color-primary), var(--color-gold), var(--color-accent));
  background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: t2Shift 5s ease-in-out infinite;
}
.t2-hero__inner p { color: var(--color-text-muted); font-size: var(--fs-md); max-width: 56ch; margin-inline: auto var(--sp-6) auto; margin-bottom: var(--sp-6); }
.t2-hero__cta { display: flex; gap: var(--sp-3); justify-content: center; flex-wrap: wrap; margin-bottom: var(--sp-8); }
.t2-hero__btn { padding: 1rem 1.9rem; border-radius: var(--radius-pill); font-weight: 700; display: inline-flex; align-items: center; gap: 8px; transition: transform var(--dur-fast) var(--ease-spring); }
.t2-hero__btn--primary { background: linear-gradient(120deg, var(--color-primary), var(--color-accent)); color: #fff; box-shadow: var(--shadow-glow); }
.t2-hero__btn--ghost { background: #fff; color: var(--color-secondary); border: 1.5px solid var(--color-border); }
.t2-hero__btn:hover { transform: translateY(-3px) scale(1.03); }
.t2-hero__stats { display: flex; justify-content: center; gap: var(--sp-8); }
.t2-hero__stats strong { display: block; font-family: var(--font-display); font-size: var(--fs-2xl); color: var(--color-primary); }
.t2-hero__stats span { font-size: var(--fs-xs); color: var(--color-text-muted); }

.t2-hero__cards { position: relative; z-index: 1; display: flex; justify-content: center; gap: var(--sp-4); flex-wrap: wrap; margin-top: var(--sp-9); }
.t2-hero__card {
  background: #fff; border-radius: var(--radius-xl); padding: var(--sp-4) var(--sp-5); box-shadow: var(--shadow-md);
  display: flex; align-items: center; gap: 12px; min-width: 200px;
}
.t2-hero__card i { width: 42px; height: 42px; border-radius: var(--radius-md); background: var(--color-primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.t2-hero__card strong { display: block; font-size: var(--fs-sm); }
.t2-hero__card span { font-size: var(--fs-xs); color: var(--color-text-muted); }
.t2-hero__card.c2 { transform: translateY(-10px); }

@keyframes t2Float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes t2Shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

@media (max-width: 640px) {
  .t2-hero { padding-block: var(--sp-9) var(--sp-7); }
  .t2-hero__card.c2 { transform: none; }
}
</style>
