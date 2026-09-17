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

  <section class="section">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="eyebrow"><i :class="config.categories?.tagline_icon || 'fa-solid fa-grip'"></i> {{ config.categories?.tagline || 'Browse Aisles' }}</span>
          <h2>{{ config.categories?.heading || 'Shop by Category' }}</h2>
          <p>{{ config.categories?.description || 'Everything you need for the week, organised the way you shop.' }}</p>
        </div>
        <RouterLink :to="{ name: 'shop' }" class="btn btn-outline">View All Categories</RouterLink>
      </div>
      <CategoryGrid :categories="categories" />
    </div>
  </section>

  <section class="section" style="background:var(--color-bg-soft)" v-if="featured.length">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="eyebrow"><i :class="config.featured_products?.tagline_icon || 'fa-solid fa-star'"></i> {{ config.featured_products?.tagline || 'Hand Picked' }}</span>
          <h2>{{ config.featured_products?.heading || 'Featured Products' }}</h2>
          <p>{{ config.featured_products?.description || "This week's staff picks, chosen for freshness and value." }}</p>
        </div>
      </div>
      <ProductGrid :products="featured" />
      <div class="load-more-wrap">
        <RouterLink :to="{ name: 'shop' }" class="btn btn-dark">Browse Full Shop <i class="fa-solid fa-arrow-right"></i></RouterLink>
      </div>
    </div>
  </section>

  <section class="section" v-if="trending.length">
    <div class="container">
      <ProductCarouselSection :eyebrow="config.trending_products?.tagline || 'Popular Right Now'" :eyebrow-icon="config.trending_products?.tagline_icon || 'fa-fire'" :title="config.trending_products?.heading || 'Trending Products'" :products="trending" />
    </div>
  </section>

  <section class="section">
    <div class="container">
      <DealsBanner />
      <template v-if="discounted.length">
        <div class="section-head" style="margin-top:var(--sp-9)">
          <div>
            <span class="eyebrow"><i :class="config.discounted_products?.tagline_icon || 'fa-solid fa-percent'"></i> {{ config.discounted_products?.tagline || 'Save More Today' }}</span>
            <h2>{{ config.discounted_products?.heading || 'Discounted Products' }}</h2>
          </div>
        </div>
        <ProductGrid :products="discounted" />
      </template>
    </div>
  </section>

  <section class="section" style="background:var(--color-bg-soft)" v-if="newArrivals.length">
    <div class="container">
      <ProductCarouselSection :eyebrow="config.new_arrivals?.tagline || 'Just In'" :eyebrow-icon="config.new_arrivals?.tagline_icon || 'fa-wand-magic-sparkles'" :title="config.new_arrivals?.heading || 'New Arrivals'" :products="newArrivals" />
    </div>
  </section>

  <section class="section" v-if="benefits.length">
    <div class="container">
      <div class="section-head center" style="justify-content:center;flex-direction:column;text-align:center">
        <span class="eyebrow"><i :class="config.why_shop_with_us?.tagline_icon || 'fa-solid fa-shield-heart'"></i> {{ config.why_shop_with_us?.tagline || 'The Store Promise' }}</span>
        <h2>{{ config.why_shop_with_us?.heading || 'Why Shop With Us' }}</h2>
      </div>
      <PerksGrid :items="benefits" />
    </div>
  </section>

  <section class="section" style="background:var(--color-bg-soft)" v-if="bestsellers.length">
    <div class="container">
      <div class="section-head">
        <div>
          <span class="eyebrow"><i :class="config.best_sellers?.tagline_icon || 'fa-solid fa-crown'"></i> {{ config.best_sellers?.tagline || 'Customer Favourites' }}</span>
          <h2>{{ config.best_sellers?.heading || 'Best Sellers' }}</h2>
        </div>
      </div>
      <ProductGrid :products="bestsellers" />
    </div>
  </section>

  <section class="section" id="about">
    <div class="container">
      <EditorialSection />
    </div>
  </section>

  <section class="section" v-if="testimonials.length">
    <div class="container">
      <div class="section-head center" style="justify-content:center;flex-direction:column;text-align:center">
        <span class="eyebrow"><i :class="config.testimonials?.tagline_icon || 'fa-solid fa-quote-left'"></i> {{ config.testimonials?.tagline || 'Loved By Shoppers' }}</span>
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
