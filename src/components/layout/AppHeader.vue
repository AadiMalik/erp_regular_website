<script setup>
// Resolves to the active theme's Header component (see src/themes/registry.js).
// Kept at this path so every existing importer (DefaultLayout, etc.) needs
// no changes when the active theme changes.
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { THEME_REGISTRY } from '@/themes/registry';

const themeStore = useThemeStore();
const ThemedHeader = computed(() => THEME_REGISTRY[themeStore.activeTheme].components.Header);
</script>

<template>
  <component :is="ThemedHeader" />
</template>
