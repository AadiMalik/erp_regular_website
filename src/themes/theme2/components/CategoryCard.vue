<script setup>
defineProps({
  category: { type: Object, required: true },
  reveal: { type: Boolean, default: false },
  revealIndex: { type: Number, default: 0 },
});
</script>

<template>
  <RouterLink
    class="t2-cat"
    v-reveal="reveal ? ['up', revealIndex, 60] : undefined"
    :to="{ name: 'shop', query: { category: category.id } }"
  >
    <div class="t2-cat__icon"><i class="fa-solid" :class="category.icon"></i></div>
    <img :src="category.image" :alt="category.name" loading="lazy">
    <div class="t2-cat__body">
      <h3>{{ category.name }}</h3>
      <span>{{ category.subcategories.length }} subcategories <i class="fa-solid fa-arrow-right"></i></span>
    </div>
  </RouterLink>
</template>

<style scoped>
.t2-cat {
  position: relative; display: block; border-radius: var(--radius-xl); overflow: hidden;
  aspect-ratio: 3/3.2; box-shadow: var(--shadow-sm);
  transition: transform var(--dur-base) var(--ease-spring), box-shadow var(--dur-base) var(--ease-out);
}
.t2-cat:hover { transform: translateY(-8px) rotate(0.8deg); box-shadow: var(--shadow-lg); }
.t2-cat img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-slow) var(--ease-premium); }
.t2-cat:hover img { transform: scale(1.14) rotate(-1deg); }
.t2-cat::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(200deg, rgba(124,58,237,0.05) 20%, rgba(30,21,51,0.86) 100%);
}
.t2-cat__icon {
  position: absolute; top: 12px; left: 12px; z-index: 2; width: 42px; height: 42px; border-radius: var(--radius-md);
  background: rgba(255,255,255,0.94); color: var(--color-primary); display: flex; align-items: center; justify-content: center;
  transition: transform var(--dur-base) var(--ease-spring);
}
.t2-cat:hover .t2-cat__icon { transform: rotate(-10deg) scale(1.1); }
.t2-cat__body { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: var(--sp-4); color: #fff; }
.t2-cat__body h3 { font-size: var(--fs-md); }
.t2-cat__body span { font-size: var(--fs-xs); opacity: 0.85; display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; }
</style>
