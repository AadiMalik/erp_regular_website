<script setup>
import Carousel from '@/components/ui/Carousel.vue';
import StarRating from '@/components/ui/StarRating.vue';

defineProps({
  testimonials: { type: Array, required: true },
});
</script>

<template>
  <Carousel :items="testimonials" item-key="name" variant="testimonial">
    <template #default="{ item }">
      <div class="testimonial-card">
        <div class="rating"><StarRating :rating="item.rating" /></div>
        <p class="quote">"{{ item.quote }}"</p>
        <div class="testimonial-card__author">
          <img :src="item.avatar" :alt="item.name">
          <div><strong>{{ item.name }}</strong><span>{{ item.role }}</span></div>
        </div>
      </div>
    </template>
  </Carousel>
</template>
