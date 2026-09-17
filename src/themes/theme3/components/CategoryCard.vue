<script setup>
defineProps({
  category: { type: Object, required: true },
  reveal: { type: Boolean, default: false },
  revealIndex: { type: Number, default: 0 },
});
</script>

<template>
  <RouterLink
    class="t3-cat"
    v-reveal="reveal ? ['up', revealIndex, 60] : undefined"
    :to="{ name: 'shop', query: { category: category.id } }"
  >
    <div class="t3-cat__media"><img :src="category.image" :alt="category.name" loading="lazy"></div>
    <div class="t3-cat__body">
      <span><i class="fa-solid" :class="category.icon"></i></span>
      <h3>{{ category.name }}</h3>
      <em>{{ category.subcategories.length }} subcategories</em>
    </div>
  </RouterLink>
</template>

<style scoped>
.t3-cat { display: block; }
.t3-cat__media { aspect-ratio: 1/1.05; overflow: hidden; }
.t3-cat__media img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-slow) var(--ease-premium); }
.t3-cat:hover .t3-cat__media img { transform: scale(1.08); }
.t3-cat__body { padding-top: var(--sp-3); text-align: center; }
.t3-cat__body span { color: var(--color-accent); font-size: 1.1rem; }
.t3-cat__body h3 { font-family: var(--font-display); font-weight: 500; font-size: var(--fs-md); margin-top: 6px; }
.t3-cat__body em { display: block; font-style: normal; font-size: var(--fs-xs); color: var(--color-text-muted); margin-top: 2px; }
</style>
