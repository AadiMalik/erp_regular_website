<script setup>
defineProps({
  category: { type: Object, required: true },
  reveal: { type: Boolean, default: false },
  revealIndex: { type: Number, default: 0 },
});
</script>

<template>
  <RouterLink
    class="t5-cat"
    v-reveal="reveal ? ['zoom', revealIndex, 60] : undefined"
    :to="{ name: 'shop', query: { category: category.id } }"
  >
    <span class="t5-cat__ring">
      <img :src="category.image" :alt="category.name" loading="lazy">
    </span>
    <h3>{{ category.name }}</h3>
  </RouterLink>
</template>

<style scoped>
.t5-cat { display: flex; flex-direction: column; align-items: center; gap: var(--sp-3); text-align: center; }
.t5-cat__ring {
  width: 96px; height: 96px; border-radius: 50%; overflow: hidden; border: 1px solid var(--color-border);
  padding: 4px; display: block; transition: border-color var(--dur-base) var(--ease-premium), transform var(--dur-base) var(--ease-premium);
}
.t5-cat:hover .t5-cat__ring { border-color: var(--color-accent); transform: translateY(-4px); }
.t5-cat__ring img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.t5-cat h3 { font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-soft); max-width: 12ch; }
</style>
