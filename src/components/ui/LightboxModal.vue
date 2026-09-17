<script setup>
import { lightboxState, closeLightbox } from '@/composables/useLightbox';
import BaseModal from './BaseModal.vue';
</script>

<template>
  <BaseModal
    :open="lightboxState.open"
    box-class="lightbox-box"
    @close="closeLightbox"
  >
    <img
      v-if="lightboxState.src"
      :src="lightboxState.src"
      :alt="lightboxState.alt"
      style="width:100%;height:100%;max-height:88vh;object-fit:contain;display:block"
    >
  </BaseModal>
</template>

<style scoped>
:deep(.lightbox-box) {
  max-width: 1000px;
  background: transparent;
  box-shadow: none;
}
</style>
