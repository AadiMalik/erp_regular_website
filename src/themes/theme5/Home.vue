<script setup>
import { ref, onMounted } from 'vue';
import { fetchCategories } from '@/services/categories';
import { fetchTestimonials } from '@/services/cms';
import { useHomeProductSections } from '@/composables/useHomeProductSections';

import Hero from './components/Hero.vue';
import CategoryGrid from '@/components/home/CategoryGrid.vue';
import ProductGrid from '@/components/home/ProductGrid.vue';
import EditorialSection from '@/components/home/EditorialSection.vue';
import PerksGrid from '@/components/home/PerksGrid.vue';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel.vue';
import NewsletterSection from '@/components/home/NewsletterSection.vue';

const categories = ref([]);
const testimonials = ref([]);

const { featured, bestsellers, config, benefits } = useHomeProductSections();

onMounted(async () => {
  categories.value = await fetchCategories();
  testimonials.value = await fetchTestimonials();
});
</script>

<template>
  <Hero />

  <section class="section t5-section">
    <div class="container">
      <div class="t5-head">
        <span class="t5-head__eyebrow">{{ config.categories?.tagline || 'Browse' }}</span>
        <h2>{{ config.categories?.heading || 'Shop by Category' }}</h2>
      </div>
      <CategoryGrid :categories="categories" />
    </div>
  </section>

  <section class="section t5-section" v-if="featured.length">
    <div class="container">
      <div class="t5-head">
        <span class="t5-head__eyebrow">{{ config.featured_products?.tagline || 'Selected' }}</span>
        <h2>{{ config.featured_products?.heading || 'The Featured Edit' }}</h2>
      </div>
      <ProductGrid :products="featured" />
    </div>
  </section>

  <section class="section t5-section" id="about">
    <div class="container">
      <EditorialSection />
    </div>
  </section>

  <section class="section t5-section" v-if="benefits.length">
    <div class="container">
      <div class="t5-head t5-head--center">
        <span class="t5-head__eyebrow">{{ config.why_shop_with_us?.tagline || 'Considered' }}</span>
        <h2>{{ config.why_shop_with_us?.heading || 'Why Shop With Us' }}</h2>
      </div>
      <PerksGrid :items="benefits" />
    </div>
  </section>

  <section class="section t5-section" v-if="bestsellers.length">
    <div class="container">
      <div class="t5-head">
        <span class="t5-head__eyebrow">{{ config.best_sellers?.tagline || 'Favourites' }}</span>
        <h2>{{ config.best_sellers?.heading || 'Best Sellers' }}</h2>
      </div>
      <ProductGrid :products="bestsellers" />
    </div>
  </section>

  <section class="section t5-section" v-if="testimonials.length">
    <div class="container">
      <div class="t5-head t5-head--center">
        <span class="t5-head__eyebrow">{{ config.testimonials?.tagline || 'In Their Words' }}</span>
        <h2>{{ config.testimonials?.heading || 'What Our Clients Say' }}</h2>
      </div>
      <TestimonialsCarousel :testimonials="testimonials" />
    </div>
  </section>

  <section class="section t5-section" style="padding-top:0">
    <div class="container">
      <NewsletterSection />
    </div>
  </section>
</template>

<style scoped>
.t5-section { padding-block: var(--sp-11); }
.t5-head { max-width: 560px; margin-bottom: var(--sp-8); }
.t5-head--center { margin-inline: auto; text-align: center; }
.t5-head__eyebrow { display: block; color: var(--color-accent); font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: var(--sp-3); }
.t5-head h2 { font-weight: 300; font-size: clamp(1.9rem, 3.4vw, 2.7rem); }
</style>
