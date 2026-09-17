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

  <section class="section t6-section">
    <div class="container">
      <div class="t6-head">
        <div>
          <span class="t6-head__pill"><i :class="config.categories?.tagline_icon || 'fa-solid fa-grip'"></i> {{ config.categories?.tagline || 'Browse the Bazaar' }}</span>
          <h2>{{ config.categories?.heading || 'Shop by Category' }}</h2>
        </div>
        <RouterLink :to="{ name: 'shop' }" class="btn btn-primary">See All</RouterLink>
      </div>
      <CategoryGrid :categories="categories" />
    </div>
  </section>

  <section class="section t6-section" v-if="trending.length">
    <div class="container">
      <ProductCarouselSection :eyebrow="config.trending_products?.tagline || 'Hot Right Now'" :eyebrow-icon="config.trending_products?.tagline_icon || 'fa-fire'" :title="config.trending_products?.heading || 'Trending Products'" :products="trending" />
    </div>
  </section>

  <section class="section t6-section" v-if="featured.length">
    <div class="container">
      <div class="t6-head">
        <div>
          <span class="t6-head__pill"><i :class="config.featured_products?.tagline_icon || 'fa-solid fa-star'"></i> {{ config.featured_products?.tagline || 'Hand Picked' }}</span>
          <h2>{{ config.featured_products?.heading || 'Featured Finds' }}</h2>
        </div>
      </div>
      <ProductGrid :products="featured" />
    </div>
  </section>

  <section class="section t6-section">
    <div class="container">
      <DealsBanner />
      <template v-if="discounted.length">
        <div class="t6-head" style="margin-top:var(--sp-9)">
          <div>
            <span class="t6-head__pill"><i :class="config.discounted_products?.tagline_icon || 'fa-solid fa-percent'"></i> {{ config.discounted_products?.tagline || 'Save More' }}</span>
            <h2>{{ config.discounted_products?.heading || 'Discounted Right Now' }}</h2>
          </div>
        </div>
        <ProductGrid :products="discounted" />
      </template>
    </div>
  </section>

  <section class="section t6-section" v-if="benefits.length">
    <div class="container">
      <div class="t6-head t6-head--center">
        <span class="t6-head__pill"><i :class="config.why_shop_with_us?.tagline_icon || 'fa-solid fa-shield-heart'"></i> {{ config.why_shop_with_us?.tagline || 'Why Bazaar' }}</span>
        <h2>{{ config.why_shop_with_us?.heading || 'Shopping, Made Easy' }}</h2>
      </div>
      <PerksGrid :items="benefits" />
    </div>
  </section>

  <section class="section t6-section" v-if="newArrivals.length">
    <div class="container">
      <ProductCarouselSection :eyebrow="config.new_arrivals?.tagline || 'Fresh In'" :eyebrow-icon="config.new_arrivals?.tagline_icon || 'fa-wand-magic-sparkles'" :title="config.new_arrivals?.heading || 'New Arrivals'" :products="newArrivals" />
    </div>
  </section>

  <section class="section t6-section" id="about">
    <div class="container">
      <EditorialSection />
    </div>
  </section>

  <section class="section t6-section" v-if="bestsellers.length">
    <div class="container">
      <div class="t6-head">
        <div>
          <span class="t6-head__pill"><i :class="config.best_sellers?.tagline_icon || 'fa-solid fa-crown'"></i> {{ config.best_sellers?.tagline || 'Fan Favourites' }}</span>
          <h2>{{ config.best_sellers?.heading || 'Best Sellers' }}</h2>
        </div>
      </div>
      <ProductGrid :products="bestsellers" />
    </div>
  </section>

  <section class="section t6-section" v-if="testimonials.length">
    <div class="container">
      <div class="t6-head t6-head--center">
        <span class="t6-head__pill"><i :class="config.testimonials?.tagline_icon || 'fa-solid fa-quote-left'"></i> {{ config.testimonials?.tagline || 'Shopper Love' }}</span>
        <h2>{{ config.testimonials?.heading || 'What Our Customers Say' }}</h2>
      </div>
      <TestimonialsCarousel :testimonials="testimonials" />
    </div>
  </section>

  <section class="section t6-section" style="padding-top:0">
    <div class="container">
      <NewsletterSection />
    </div>
  </section>
</template>

<style scoped>
.t6-section { padding-block: var(--sp-9); }
.t6-head { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--sp-5); margin-bottom: var(--sp-7); flex-wrap: wrap; }
.t6-head--center { justify-content: center; flex-direction: column; align-items: center; text-align: center; }
.t6-head__pill {
  display: inline-flex; align-items: center; gap: 8px; background: var(--color-primary-light); color: var(--color-primary-dark);
  padding: 6px 14px; border-radius: var(--radius-pill); font-size: var(--fs-xs); font-weight: 700; margin-bottom: var(--sp-3);
}
.t6-head h2 { font-family: var(--font-display); font-weight: 700; font-size: clamp(1.6rem, 3vw, 2.2rem); }
</style>
