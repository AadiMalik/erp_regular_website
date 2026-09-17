<script setup>
// Falls back to this static hero copy when the ERP admin hasn't configured
// the "hero" CMS section yet (Website CMS > Homepage Sections). Badge and
// floating cards stay theme decoration - outside the CMS schema. Hero
// Stats come from the admin-managed Hero Stats CRUD - hidden entirely
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
  <section class="hero">
    <span class="hero__blob b1"></span>
    <span class="hero__blob b2"></span>
    <div class="container">
      <div class="hero__text">
        <span class="hero__badge hero-anim-1" v-if="section?.tagline"><i v-if="section.tagline_icon" :class="section.tagline_icon"></i> {{ section.tagline }}</span>
        <h1 class="hero-anim-2" v-if="section?.heading">{{ section.heading }}</h1>
        <h1 class="hero-anim-2" v-else>Fresh groceries,<br>delivered <span class="text-gradient">right to your door.</span></h1>
        <p class="lead hero-anim-3">{{ section?.description || 'Shop fruits, vegetables, dairy, bakery and everyday essentials — hand-picked quality, unbeatable prices, delivered in as fast as 2 hours.' }}</p>
        <div class="hero__cta hero-anim-3">
          <RouterLink :to="section ? resolveSectionLink(section) : { name: 'shop' }" class="btn btn-primary btn-lg"><i class="fa-solid fa-basket-shopping"></i> {{ section?.button_text || 'Shop Now' }}</RouterLink>
          <RouterLink v-if="section?.secondary_button_text" :to="resolveSecondaryLink(section) || { name: 'shop' }" class="btn btn-outline btn-lg">{{ section.secondary_button_text }}</RouterLink>
        </div>
        <div class="hero__stats hero-anim-3" v-if="stats.length > 2">
          <div v-for="stat in stats.slice(2)" :key="stat.id"><strong>{{ stat.value }}</strong><span>{{ stat.label }}</span></div>
        </div>
      </div>
      <div class="hero__visual">
        <div class="main-img hero-anim-img">
          <img :src="section?.image || 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=900&h=1000&q=80'" alt="Fresh vegetables and fruits basket">
        </div>
        <div class="hero__float-card card-1 float-slow" v-if="stats[0]">
          <span class="ico"><i :class="stats[0].icon || 'fa-solid fa-star'"></i></span>
          <div><strong>{{ stats[0].value }}</strong><span>{{ stats[0].label }}</span></div>
        </div>
        <div class="hero__float-card card-2 float-med" v-if="stats[1]">
          <span class="ico"><i :class="stats[1].icon || 'fa-solid fa-star'"></i></span>
          <div><strong>{{ stats[1].value }}</strong><span>{{ stats[1].label }}</span></div>
        </div>
      </div>
    </div>
  </section>
</template>
