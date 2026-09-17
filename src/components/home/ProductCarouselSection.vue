<script setup>
// Shared by the Trending and New Arrivals rows on the home page — both are
// the same section-head+nav-buttons+Carousel structure over different
// product lists (ports the two near-identical blocks in assets/js/pages/home.js).

import { ref } from 'vue';
import Carousel from '@/components/ui/Carousel.vue';
import ProductCard from '@/components/ui/ProductCard.vue';

defineProps({
  eyebrow: { type: String, required: true },
  eyebrowIcon: { type: String, required: true },
  title: { type: String, required: true },
  products: { type: Array, required: true },
});

const carousel = ref(null);
</script>

<template>
  <template v-if="products.length">
    <div class="section-head">
      <div>
        <span class="eyebrow"><i class="fa-solid" :class="eyebrowIcon"></i> {{ eyebrow }}</span>
        <h2>{{ title }}</h2>
      </div>
      <div class="carousel-nav">
        <button class="carousel-prev" aria-label="Previous" @click="carousel?.prev()"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="carousel-next" aria-label="Next" @click="carousel?.next()"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
    </div>
    <Carousel ref="carousel" :items="products" variant="product">
      <template #default="{ item }">
        <ProductCard :product="item" />
      </template>
    </Carousel>
  </template>
</template>
