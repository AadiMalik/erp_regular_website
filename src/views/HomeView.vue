<script setup>
// Resolves to the active theme's Home composition (see src/themes/registry.js).
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { THEME_REGISTRY } from '@/themes/registry';

const themeStore = useThemeStore();
const ThemedHome = computed(() => THEME_REGISTRY[themeStore.activeTheme].home);
</script>

<template>
  <component :is="ThemedHome" />
</template>
