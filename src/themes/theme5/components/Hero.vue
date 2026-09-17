<script setup>
// Falls back to this static hero copy when the ERP admin hasn't configured
// the "hero" CMS section yet (Website CMS > Homepage Sections).
import { ref, onMounted } from 'vue';
import { fetchSection, resolveSectionLink } from '@/services/cms';

const section = ref(null);
onMounted(async () => { section.value = await fetchSection('hero'); });
</script>

<template>
  <section class="t5-hero">
    <div class="t5-hero__media">
      <img :src="section?.image || 'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=1800&h=1000&q=80'" alt="Still life of fresh groceries">
    </div>
    <div class="container t5-hero__content">
      <span class="t5-hero__eyebrow"><i v-if="section?.tagline_icon" :class="section.tagline_icon"></i> {{ section?.tagline || 'The Grocery Atelier' }}</span>
      <h1 v-if="section?.heading">{{ section.heading }}</h1>
      <h1 v-else>Quiet luxury,<br>quietly delivered.</h1>
      <p>{{ section?.description || 'A pared-back way to shop for the everyday — considered produce and pantry staples, presented without the noise.' }}</p>
      <RouterLink :to="section ? resolveSectionLink(section) : { name: 'shop' }" class="t5-hero__btn">{{ section?.button_text || 'Enter the Shop' }}</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.t5-hero { position: relative; height: 78vh; min-height: 480px; max-height: 780px; display: flex; align-items: flex-end; overflow: hidden; }
.t5-hero__media { position: absolute; inset: 0; }
.t5-hero__media img { width: 100%; height: 100%; object-fit: cover; }
.t5-hero__media::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(0deg, rgba(20,24,26,0.55) 0%, rgba(20,24,26,0.05) 55%);
}
.t5-hero__content { position: relative; z-index: 1; padding-bottom: var(--sp-10); text-align: center; margin-inline: auto; max-width: 640px; }
.t5-hero__eyebrow { display: block; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; margin-bottom: var(--sp-5); opacity: 0.85; }
.t5-hero h1 { font-family: var(--font-display); font-weight: 300; color: #fff; font-size: clamp(2.4rem, 5.5vw, 4.4rem); letter-spacing: -0.01em; }
.t5-hero p { margin-top: var(--sp-5); color: rgba(255,255,255,0.85); font-size: var(--fs-md); font-weight: 300; max-width: 46ch; margin-inline: auto; }
.t5-hero__btn {
  display: inline-block; margin-top: var(--sp-7); padding: 1rem 2.6rem; border: 1px solid #fff; border-radius: var(--radius-pill);
  color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em;
  transition: background var(--dur-base) var(--ease-premium), color var(--dur-base);
}
.t5-hero__btn:hover { background: #fff; color: var(--color-text); }

@media (max-width: 640px) {
  .t5-hero { height: auto; min-height: 560px; padding-top: 30vh; }
}
</style>
