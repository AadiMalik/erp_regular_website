<script setup>
// CMS-driven business logo + name (icon fallback when logo missing).
import { ref } from 'vue';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';

defineProps({
  light: { type: Boolean, default: false },
  showName: { type: Boolean, default: true },
});

const site = useWebsiteSettingsStore();
const logoError = ref(false);
</script>

<template>
  <span class="logo" :class="{ 'logo--light': light }">
    <img
      v-if="site.business.logo && !logoError"
      :src="site.business.logo"
      :alt="site.business.name"
      class="logo__img"
      @error="logoError = true"
    >
    <template v-else>
      <span class="logo__mark"><i class="fa-solid fa-basket-shopping"></i></span>
      <span v-if="showName" class="logo-text">{{ site.business.name }}</span>
    </template>
    <span v-if="showName && site.business.logo && !logoError" class="logo-text">{{ site.business.name }}</span>
  </span>
</template>

<style scoped>
.logo__img {
  height: 32px;
  width: auto;
  max-width: 160px;
  object-fit: contain;
  vertical-align: middle;
}
.logo--light {
  color: #fff;
}
.logo--light .logo__img {
  filter: brightness(0) invert(1);
}
</style>
