<script setup>
// Resolves to the active theme's ProductCard component (see
// src/themes/registry.js). Kept at this path so every existing importer
// (ProductGrid, ProductCarouselSection, ShopView, WishlistView, ...) needs
// no changes when the active theme changes.
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { THEME_REGISTRY } from '@/themes/registry';

const props = defineProps({
  product: { type: Object, required: true },
  reveal: { type: Boolean, default: false },
  revealIndex: { type: Number, default: 0 },
});

const themeStore = useThemeStore();
const ThemedProductCard = computed(() => THEME_REGISTRY[themeStore.activeTheme].components.ProductCard);
</script>

<template>
  <component :is="ThemedProductCard" :product="product" :reveal="reveal" :reveal-index="revealIndex" />
</template>
