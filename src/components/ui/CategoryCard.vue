<script setup>
// Resolves to the active theme's CategoryCard component (see
// src/themes/registry.js). Kept at this path so every existing importer
// needs no changes when the active theme changes.
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { THEME_REGISTRY } from '@/themes/registry';

const props = defineProps({
  category: { type: Object, required: true },
  reveal: { type: Boolean, default: false },
  revealIndex: { type: Number, default: 0 },
});

const themeStore = useThemeStore();
const ThemedCategoryCard = computed(() => THEME_REGISTRY[themeStore.activeTheme].components.CategoryCard);
</script>

<template>
  <component :is="ThemedCategoryCard" :category="category" :reveal="reveal" :reveal-index="revealIndex" />
</template>
