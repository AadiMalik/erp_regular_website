<script setup>
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import BackToTop from '@/components/layout/BackToTop.vue';
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <AppHeader />
  <main id="main">
    <RouterView />
  </main>
  <AppFooter />
  <BackToTop />
</template>
