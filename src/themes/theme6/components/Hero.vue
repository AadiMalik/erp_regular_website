<script setup>
// Falls back to this static hero copy when the ERP admin hasn't configured
// the "hero" CMS section yet (Website CMS > Homepage Sections). Bento stat
// tiles come from the admin-managed Hero Stats CRUD - hidden entirely when
// the admin hasn't configured any.
import { ref, onMounted } from 'vue';
import { fetchSection, resolveSectionLink, fetchHeroStats } from '@/services/cms';

const section = ref(null);
const stats = ref([]);
onMounted(async () => {
  [section.value, stats.value] = await Promise.all([fetchSection('hero'), fetchHeroStats()]);
});
</script>

<template>
  <section class="t6-hero">
    <div class="container t6-bento">
      <div class="t6-bento__tile t6-bento__tile--main">
        <span class="t6-bento__badge"><i v-if="section?.tagline_icon" :class="section.tagline_icon"></i> {{ section?.tagline || '🔥 Trending Now' }}</span>
        <h1>{{ section?.heading || 'Your whole basket, sorted fast.' }}</h1>
        <p>{{ section?.description || 'Fresh produce, pantry staples and everyday finds from every corner of the bazaar — all in one cart.' }}</p>
        <RouterLink :to="section ? resolveSectionLink(section) : { name: 'shop' }" class="btn btn-primary btn-lg">{{ section?.button_text || 'Start Shopping' }}</RouterLink>
        <img class="t6-bento__img" :src="section?.image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&h=700&q=80'" alt="Fresh produce basket">
      </div>
      <div class="t6-bento__tile t6-bento__tile--stat" v-if="stats[0]">
        <strong>{{ stats[0].value }}</strong>
        <span>{{ stats[0].label }}</span>
      </div>
      <div class="t6-bento__tile t6-bento__tile--deliver" v-if="stats[1]">
        <i :class="stats[1].icon || 'fa-solid fa-bolt'"></i>
        <strong>{{ stats[1].value }}</strong>
        <span>{{ stats[1].label }}</span>
      </div>
      <div class="t6-bento__tile t6-bento__tile--rate" v-if="stats[2]">
        <div class="t6-bento__stars"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i></div>
        <strong>{{ stats[2].value }}</strong>
        <span>{{ stats[2].label }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.t6-hero { padding-block: var(--sp-6) var(--sp-8); }
.t6-bento {
  display: grid; grid-template-columns: 1.6fr 1fr; grid-template-rows: auto auto;
  gap: var(--sp-5);
}
.t6-bento__tile { border-radius: var(--radius-card); padding: var(--sp-6); position: relative; overflow: hidden; }

.t6-bento__tile--main {
  grid-row: 1 / 3;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: #fff; display: flex; flex-direction: column; align-items: flex-start; gap: var(--sp-4);
  min-height: 460px;
}
.t6-bento__badge { background: rgba(255,255,255,0.18); padding: 6px 14px; border-radius: var(--radius-pill); font-size: var(--fs-xs); font-weight: 700; backdrop-filter: blur(4px); }
.t6-bento__tile--main h1 { font-family: var(--font-display); font-weight: 700; font-size: clamp(2rem, 4vw, 3rem); max-width: 14ch; }
.t6-bento__tile--main p { max-width: 40ch; opacity: 0.88; font-size: var(--fs-md); }
.t6-bento__img {
  position: absolute; right: -30px; bottom: -30px; width: 62%; max-width: 340px; border-radius: 28px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.3); opacity: 0.95; object-fit: cover; aspect-ratio: 1/1;
  transform: rotate(4deg);
}

.t6-bento__tile--stat { background: var(--color-gold); color: #3a2900; display: flex; flex-direction: column; justify-content: center; }
.t6-bento__tile--stat strong { font-family: var(--font-display); font-size: var(--fs-4xl); font-weight: 800; }
.t6-bento__tile--stat span { font-size: var(--fs-sm); font-weight: 700; margin-top: 4px; }

.t6-bento__tile--deliver { background: var(--color-accent-light); color: var(--color-accent-dark); display: flex; flex-direction: column; justify-content: center; gap: 6px; }
.t6-bento__tile--deliver i { font-size: 1.4rem; }
.t6-bento__tile--deliver strong { font-family: var(--font-display); font-size: var(--fs-lg); }
.t6-bento__tile--deliver span { font-size: var(--fs-xs); opacity: 0.85; }

.t6-bento__tile--rate { grid-column: 2; background: var(--color-surface); border: 1px solid var(--color-border); display: flex; flex-direction: column; justify-content: center; gap: 4px; }
.t6-bento__stars { color: var(--color-gold); font-size: 0.9rem; display: flex; gap: 2px; }
.t6-bento__tile--rate strong { font-family: var(--font-display); font-size: var(--fs-lg); }
.t6-bento__tile--rate span { font-size: var(--fs-xs); color: var(--color-text-muted); }

@media (max-width: 900px) {
  .t6-bento { grid-template-columns: 1fr 1fr; }
  .t6-bento__tile--main { grid-row: auto; grid-column: 1 / -1; min-height: 380px; }
  .t6-bento__img { display: none; }
}
@media (max-width: 560px) {
  .t6-bento { grid-template-columns: 1fr; }
  .t6-bento__tile--main { grid-column: auto; }
  .t6-bento__tile--rate { grid-column: auto; }
}
</style>
