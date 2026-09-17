<script setup>
// Resolves to the active theme's Footer component (see src/themes/registry.js).
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { THEME_REGISTRY } from '@/themes/registry';

const themeStore = useThemeStore();
const ThemedFooter = computed(() => THEME_REGISTRY[themeStore.activeTheme].components.Footer);
</script>

<template>
  <component :is="ThemedFooter" />
</template>
