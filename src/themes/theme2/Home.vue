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

const { discounted, trending, newArrivals, bestsellers, config, benefits } = useHomeProductSections();

onMounted(async () => {
  categories.value = await fetchCategories();
  testimonials.value = await fetchTestimonials();
});
</script>

<template>
  <Hero />

  <section class="section t2-band">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="eyebrow"><i :class="config.categories?.tagline_icon || 'fa-solid fa-grip'"></i> {{ config.categories?.tagline || 'Browse the Bazaar' }}</span>
          <h2>{{ config.categories?.heading || 'Shop by Category' }}</h2>
        </div>
        <RouterLink :to="{ name: 'shop' }" class="btn btn-primary">Explore All</RouterLink>
      </div>
      <CategoryGrid :categories="categories" />
    </div>
  </section>

  <section class="section" v-if="trending.length">
    <div class="container">
      <ProductCarouselSection :eyebrow="config.trending_products?.tagline || 'Trending Now'" :eyebrow-icon="config.trending_products?.tagline_icon || 'fa-fire'" :title="config.trending_products?.heading || 'What Everyone Is Buying'" :products="trending" />
    </div>
  </section>

  <section class="section t2-band">
    <div class="container">
      <DealsBanner />
      <template v-if="discounted.length">
        <div class="section-head" style="margin-top:var(--sp-9)">
          <div>
            <span class="eyebrow"><i :class="config.discounted_products?.tagline_icon || 'fa-solid fa-percent'"></i> {{ config.discounted_products?.tagline || 'Bazaar Deals' }}</span>
            <h2>{{ config.discounted_products?.heading || 'Discounted Right Now' }}</h2>
          </div>
        </div>
        <ProductGrid :products="discounted" />
      </template>
    </div>
  </section>

  <section class="section" v-if="bestsellers.length">
    <div class="container">
      <div class="section-head center" style="justify-content:center;flex-direction:column;text-align:center">
        <span class="eyebrow"><i :class="config.best_sellers?.tagline_icon || 'fa-solid fa-crown'"></i> {{ config.best_sellers?.tagline || 'Fan Favourites' }}</span>
        <h2>{{ config.best_sellers?.heading || 'Best Sellers This Week' }}</h2>
      </div>
      <ProductGrid :products="bestsellers" />
    </div>
  </section>

  <section class="section t2-band" v-if="benefits.length">
    <div class="container">
      <div class="section-head center" style="justify-content:center;flex-direction:column;text-align:center">
        <span class="eyebrow"><i :class="config.why_shop_with_us?.tagline_icon || 'fa-solid fa-shield-heart'"></i> {{ config.why_shop_with_us?.tagline || 'Why Shop With Us' }}</span>
        <h2>{{ config.why_shop_with_us?.heading || 'Shopping, Made Fun Again' }}</h2>
      </div>
      <PerksGrid :items="benefits" />
    </div>
  </section>

  <section class="section" v-if="newArrivals.length">
    <div class="container">
      <ProductCarouselSection :eyebrow="config.new_arrivals?.tagline || 'Fresh In'" :eyebrow-icon="config.new_arrivals?.tagline_icon || 'fa-wand-magic-sparkles'" :title="config.new_arrivals?.heading || 'New Arrivals'" :products="newArrivals" />
    </div>
  </section>

  <section class="section t2-band" id="about">
    <div class="container">
      <EditorialSection />
    </div>
  </section>

  <section class="section" v-if="testimonials.length">
    <div class="container">
      <div class="section-head center" style="justify-content:center;flex-direction:column;text-align:center">
        <span class="eyebrow"><i :class="config.testimonials?.tagline_icon || 'fa-solid fa-quote-left'"></i> {{ config.testimonials?.tagline || 'Shopper Love' }}</span>
        <h2>{{ config.testimonials?.heading || 'What Our Customers Say' }}</h2>
      </div>
      <TestimonialsCarousel :testimonials="testimonials" />
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container">
      <NewsletterSection />
    </div>
  </section>
</template>

<style scoped>
.t2-band { background: linear-gradient(180deg, var(--color-primary-lighter), var(--color-bg-soft)); }
</style>
