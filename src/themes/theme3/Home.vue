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

  <section class="section t3-section">
    <div class="container">
      <div class="t3-head">
        <span class="t3-head__eyebrow"><i v-if="config.categories?.tagline_icon" :class="config.categories.tagline_icon"></i> {{ config.categories?.tagline || 'Chapter One' }}</span>
        <h2>{{ config.categories?.heading || 'Shop by Category' }}</h2>
      </div>
      <CategoryGrid :categories="categories" />
    </div>
  </section>

  <section class="section t3-section" style="background:var(--color-bg-soft)" v-if="featured.length">
    <div class="container">
      <div class="t3-head">
        <span class="t3-head__eyebrow"><i v-if="config.featured_products?.tagline_icon" :class="config.featured_products.tagline_icon"></i> {{ config.featured_products?.tagline || 'Chapter Two' }}</span>
        <h2>{{ config.featured_products?.heading || 'The Featured Selection' }}</h2>
        <p>{{ config.featured_products?.description || 'Eight items our editors return to, week after week.' }}</p>
      </div>
      <ProductGrid :products="featured" />
    </div>
  </section>

  <section class="section t3-section" id="about">
    <div class="container">
      <EditorialSection />
    </div>
  </section>

  <section class="section t3-section" style="background:var(--color-bg-soft)" v-if="benefits.length">
    <div class="container">
      <div class="t3-head">
        <span class="t3-head__eyebrow"><i v-if="config.why_shop_with_us?.tagline_icon" :class="config.why_shop_with_us.tagline_icon"></i> {{ config.why_shop_with_us?.tagline || 'Chapter Three' }}</span>
        <h2>{{ config.why_shop_with_us?.heading || 'Considered, By Design' }}</h2>
      </div>
      <PerksGrid :items="benefits" />
    </div>
  </section>

  <section class="section t3-section" v-if="bestsellers.length">
    <div class="container">
      <div class="t3-head">
        <span class="t3-head__eyebrow"><i v-if="config.best_sellers?.tagline_icon" :class="config.best_sellers.tagline_icon"></i> {{ config.best_sellers?.tagline || 'Chapter Four' }}</span>
        <h2>{{ config.best_sellers?.heading || 'Best Sellers' }}</h2>
      </div>
      <ProductGrid :products="bestsellers" />
    </div>
  </section>

  <section class="section t3-section" style="background:var(--color-bg-soft)" v-if="testimonials.length">
    <div class="container">
      <div class="t3-head t3-head--center">
        <span class="t3-head__eyebrow"><i v-if="config.testimonials?.tagline_icon" :class="config.testimonials.tagline_icon"></i> {{ config.testimonials?.tagline || 'In Their Words' }}</span>
        <h2>{{ config.testimonials?.heading || 'What Our Clients Say' }}</h2>
      </div>
      <TestimonialsCarousel :testimonials="testimonials" />
    </div>
  </section>

  <section class="section t3-section" style="padding-top:0">
    <div class="container">
      <NewsletterSection />
    </div>
  </section>
</template>

<style scoped>
.t3-section { padding-block: var(--sp-11); }
.t3-head { max-width: 640px; margin-bottom: var(--sp-8); }
.t3-head--center { margin-inline: auto; text-align: center; }
.t3-head__eyebrow { display: block; color: var(--color-accent); font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: var(--sp-3); }
.t3-head h2 { font-size: clamp(1.8rem, 3.4vw, 2.6rem); font-weight: 500; }
.t3-head p { color: var(--color-text-muted); margin-top: var(--sp-3); }
</style>
