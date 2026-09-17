<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const show = ref(false);
function onScroll() {
  show.value = window.scrollY > 480;
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <button class="back-to-top" :class="{ show }" aria-label="Back to top" @click="scrollTop">
    <i class="fa-solid fa-arrow-up"></i>
  </button>
</template>
