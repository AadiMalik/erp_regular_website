<script setup>
import { ref, watch } from 'vue';
import { openLightbox } from '@/composables/useLightbox';

const props = defineProps({
  images: { type: Array, required: true },
  currentImage: { type: String, required: true },
  productName: { type: String, required: true },
});

const activeSrc = ref(props.currentImage);
const fading = ref(false);

watch(() => props.currentImage, (next) => {
  fading.value = true;
  setTimeout(() => {
    activeSrc.value = next;
    fading.value = false;
  }, 150);
});

function selectThumb(src) {
  activeSrc.value = src;
}
</script>

<template>
  <div class="pd-gallery">
    <div class="gallery__main" @click="openLightbox(activeSrc, productName)">
      <img :src="activeSrc" :alt="productName" :style="{ opacity: fading ? 0 : 1 }">
      <span class="gallery__zoom-hint"><i class="fa-solid fa-magnifying-glass-plus"></i> Click to zoom</span>
    </div>
    <div class="gallery__thumbs">
      <button
        v-for="(src, i) in images"
        :key="src"
        :class="{ active: activeSrc === src }"
        @click="selectThumb(src)"
      ><img :src="src" :alt="`View ${i + 1}`"></button>
    </div>
  </div>
</template>
