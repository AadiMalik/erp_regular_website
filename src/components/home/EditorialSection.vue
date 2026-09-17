<script setup>
import { ref, onMounted } from 'vue';
import { fetchSection, resolveSectionLink } from '@/services/cms';

const section = ref(null);
onMounted(async () => { section.value = await fetchSection('editorial_banner'); });
</script>

<template>
  <div class="editorial" v-reveal="'up'" v-if="section">
    <div class="editorial__img"><img :src="section.image || 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?auto=format&fit=crop&w=900&q=80'" alt=""></div>
    <div class="editorial__content">
      <span class="eyebrow" v-if="section.tagline" style="color:var(--color-primary)"><i v-if="section.tagline_icon" :class="section.tagline_icon"></i> {{ section.tagline }}</span>
      <h2>{{ section.heading }}</h2>
      <p v-if="section.description">{{ section.description }}</p>
      <RouterLink v-if="section.button_text" :to="resolveSectionLink(section)" class="btn btn-dark">{{ section.button_text }} <i class="fa-solid fa-arrow-right"></i></RouterLink>
    </div>
  </div>
</template>
