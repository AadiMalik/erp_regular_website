<script setup>
import CategoryCard from '@/components/ui/CategoryCard.vue';

defineProps({
  categories: { type: Array, required: true },
});
</script>

<template>
  <div class="category-grid stagger">
    <CategoryCard v-for="(c, i) in categories" :key="c.id" :category="c" reveal :reveal-index="i" />
  </div>
</template>
