<script setup>
// Ports about.html. Falls back to this static editorial copy when the ERP
// admin hasn't filled in the "about_us" CMS section yet (Website CMS >
// Homepage Sections).

import { ref, onMounted } from 'vue';
import { fetchSection, resolveSectionLink, fetchHeroStats, fetchContentItems } from '@/services/cms';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import PageHeader from '@/components/ui/PageHeader.vue';

const site = useWebsiteSettingsStore();
const section = ref(null);
const stats = ref([]);
const values = ref([]);
const ctaSection = ref(null);
onMounted(async () => {
  [section.value, stats.value, values.value, ctaSection.value] = await Promise.all([
    fetchSection('about_us'),
    fetchHeroStats(),
    fetchContentItems('about_values'),
    fetchSection('about_cta'),
  ]);
});
</script>

<template>
  <PageHeader :title="`About ${site.business.name}`" crumb="About Us" section-type="about_us">
    <p>Your everyday store, online — quality products, delivered fast.</p>
  </PageHeader>

  <div class="section">
    <div class="container">
      <div class="editorial" v-reveal="'up'">
        <div class="editorial__img">
          <img :src="section?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'" alt="About us">
        </div>
        <div class="editorial__content">
          <span class="eyebrow" style="color:var(--color-primary)"><i class="fa-solid" :class="section?.heading_icon || 'fa-seedling'"></i> Our Story</span>
          <h2>{{ section?.heading || 'Fresh groceries, without the hassle.' }}</h2>
          <p>{{ section?.description || `${site.business.name} started with a simple idea: shopping should be quick, honest and pleasant. What began as a single neighbourhood store has grown into a network of branches, each hand-picking quality products daily and getting them to your door fast.` }}</p>
          <RouterLink :to="section ? resolveSectionLink(section) : { name: 'shop' }" class="btn btn-dark">{{ section?.button_text || 'Start Shopping' }} <i class="fa-solid fa-arrow-right"></i></RouterLink>
        </div>
      </div>

      <div class="about-stats stagger" v-if="stats.length">
        <div v-for="(s, i) in stats" :key="s.id" v-reveal="['up', i, 60]"><strong>{{ s.value }}</strong><span>{{ s.label }}</span></div>
      </div>

      <div class="section-head center" style="justify-content:center;flex-direction:column;text-align:center" v-if="values.length">
        <span class="eyebrow"><i class="fa-solid fa-heart"></i> What We Stand For</span>
        <h2>Our Values</h2>
      </div>
      <div class="values-grid stagger" v-if="values.length">
        <div v-for="(v, i) in values" :key="v.id" class="perk-card" v-reveal="['up', i, 60]">
          <span class="ico" :style="v.icon_color ? { color: v.icon_color } : null"><i class="fa-solid" :class="v.icon || 'fa-circle-check'"></i></span>
          <h3>{{ v.title }}</h3>
          <p>{{ v.description }}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="section" style="background:var(--color-bg-soft);padding-top:0" v-if="ctaSection">
    <div class="container">
      <div class="newsletter" v-reveal="'zoom'">
        <div class="newsletter__text">
          <h2>{{ ctaSection.heading }}</h2>
          <p v-if="ctaSection.description">{{ ctaSection.description }}</p>
        </div>
        <RouterLink :to="resolveSectionLink(ctaSection)" class="btn btn-dark">{{ ctaSection.button_text || 'Shop Now' }}</RouterLink>
      </div>
    </div>
  </div>
</template>
