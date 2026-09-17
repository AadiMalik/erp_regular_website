<script setup>
import { ref, onMounted } from 'vue';
import { fetchCategories } from '@/services/categories';
import { fetchTestimonials } from '@/services/cms';
import { useHomeProductSections } from '@/composables/useHomeProductSections';

import Hero from './components/Hero.vue';
import CategoryGrid from '@/components/home/CategoryGrid.vue';
import ProductGrid from '@/components/home/ProductGrid.vue';
import ProductCarouselSection from '@/components/home/ProductCarouselSection.vue';
import DealsBanner from '@/components/home/DealsBanner.vue';
import PerksGrid from '@/components/home/PerksGrid.vue';
import EditorialSection from '@/components/home/EditorialSection.vue';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel.vue';
import NewsletterSection from '@/components/home/NewsletterSection.vue';

const categories = ref([]);
const testimonials = ref([]);

const { featured, discounted, trending, newArrivals, bestsellers, config, benefits } = useHomeProductSections();

onMounted(async () => {
  categories.value = await fetchCategories();
  testimonials.value = await fetchTestimonials();
});
</script>

<template>
  <Hero />

  <section class="section t4-section">
    <div class="container">
      <div class="t4-head">
        <span class="t4-head__num">01</span>
        <h2>{{ config.categories?.heading || 'Shop by Category' }}</h2>
      </div>
      <CategoryGrid :categories="categories" />
    </div>
  </section>

  <section class="section t4-section t4-section--flip" v-if="trending.length">
    <div class="container">
      <ProductCarouselSection :eyebrow="config.trending_products?.tagline || 'Popular Right Now'" :eyebrow-icon="config.trending_products?.tagline_icon || 'fa-fire'" :title="config.trending_products?.heading || 'Trending Products'" :products="trending" />
    </div>
  </section>

  <section class="section t4-section" v-if="featured.length">
    <div class="container">
      <div class="t4-head">
        <span class="t4-head__num">02</span>
        <h2>{{ config.featured_products?.heading || 'Hand-Picked Featured' }}</h2>
      </div>
      <ProductGrid :products="featured" />
      <div class="load-more-wrap">
        <RouterLink :to="{ name: 'shop' }" class="btn btn-dark">Browse Full Shop <i class="fa-solid fa-arrow-right"></i></RouterLink>
      </div>
    </div>
  </section>

  <section class="section t4-section t4-section--flip">
    <div class="container">
      <DealsBanner />
      <template v-if="discounted.length">
        <div class="t4-head" style="margin-top:var(--sp-9)">
          <span class="t4-head__num">03</span>
          <h2>{{ config.discounted_products?.heading || 'Save More Today' }}</h2>
        </div>
        <ProductGrid :products="discounted" />
      </template>
    </div>
  </section>

  <section class="section t4-section" v-if="benefits.length">
    <div class="container">
      <div class="t4-head t4-head--center">
        <span class="t4-head__num">04</span>
        <h2>{{ config.why_shop_with_us?.heading || 'Why Shop With Us' }}</h2>
      </div>
      <PerksGrid :items="benefits" />
    </div>
  </section>

  <section class="section t4-section t4-section--flip" v-if="newArrivals.length">
    <div class="container">
      <ProductCarouselSection :eyebrow="config.new_arrivals?.tagline || 'Just In'" :eyebrow-icon="config.new_arrivals?.tagline_icon || 'fa-wand-magic-sparkles'" :title="config.new_arrivals?.heading || 'New Arrivals'" :products="newArrivals" />
    </div>
  </section>

  <section class="section t4-section" id="about">
    <div class="container">
      <EditorialSection />
    </div>
  </section>

  <section class="section t4-section t4-section--flip" v-if="bestsellers.length">
    <div class="container">
      <div class="t4-head">
        <span class="t4-head__num">05</span>
        <h2>{{ config.best_sellers?.heading || 'Best Sellers' }}</h2>
      </div>
      <ProductGrid :products="bestsellers" />
    </div>
  </section>

  <section class="section t4-section" v-if="testimonials.length">
    <div class="container">
      <div class="t4-head t4-head--center">
        <span class="t4-head__num">06</span>
        <h2>{{ config.testimonials?.heading || 'What Our Customers Say' }}</h2>
      </div>
      <TestimonialsCarousel :testimonials="testimonials" />
    </div>
  </section>

  <section class="section t4-section t4-section--flip" style="padding-bottom:0">
    <div class="container">
      <NewsletterSection />
    </div>
  </section>
</template>

<style scoped>
.t4-section { padding-block: var(--sp-9); }
.t4-section--flip { background: var(--color-bg-soft); }
.t4-head { display: flex; align-items: baseline; gap: var(--sp-4); margin-bottom: var(--sp-7); }
.t4-head--center { justify-content: center; text-align: center; }
.t4-head__num {
  font-family: var(--font-display); font-weight: 900; font-size: var(--fs-2xl); color: var(--color-primary);
  -webkit-text-stroke: 1.5px var(--color-secondary);
}
.t4-head h2 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; font-size: clamp(1.6rem, 3vw, 2.2rem); color: var(--color-secondary); }
</style>
