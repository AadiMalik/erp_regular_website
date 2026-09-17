<script setup>
import ProductCard from '@/components/ui/ProductCard.vue';

defineProps({
  products: { type: Array, required: true },
});
</script>

<template>
  <div v-if="products.length" class="product-grid stagger">
    <ProductCard v-for="(p, i) in products" :key="p.id" :product="p" reveal :reveal-index="i" />
  </div>
</template>
