<script setup>
const props = defineProps({
  rating: { type: Number, required: true },
});
const pct = () => Math.min(Math.max((props.rating / 5) * 100, 0), 100);
</script>

<template>
  <span class="stars"><span class="stars-fill" :style="{ width: pct() + '%' }"></span></span>
</template>
