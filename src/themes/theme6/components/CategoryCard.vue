<script setup>
const props = defineProps({
  category: { type: Object, required: true },
  reveal: { type: Boolean, default: false },
  revealIndex: { type: Number, default: 0 },
});

const GRADIENTS = [
  'linear-gradient(135deg,#7C3AED,#A78BFA)',
  'linear-gradient(135deg,#16A34A,#4ADE80)',
  'linear-gradient(135deg,#F59E0B,#FCD34D)',
  'linear-gradient(135deg,#E11D48,#FB7185)',
];
const bg = GRADIENTS[props.revealIndex % GRADIENTS.length];
</script>

<template>
  <RouterLink
    class="t6-cat"
    :style="{ '--tile': bg }"
    v-reveal="reveal ? ['right', revealIndex, 40] : undefined"
    :to="{ name: 'shop', query: { category: category.id } }"
  >
    <span class="t6-cat__icon"><i class="fa-solid" :class="category.icon"></i></span>
    <h3>{{ category.name }}</h3>
    <em>{{ category.subcategories.length }} lines</em>
  </RouterLink>
</template>

<style scoped>
.t6-cat {
  display: flex; flex-direction: column; gap: var(--sp-2); padding: var(--sp-5);
  border-radius: var(--radius-card); background: var(--tile); color: #fff; height: 100%;
  transition: transform var(--dur-base) var(--ease-premium), box-shadow var(--dur-base) var(--ease-premium);
}
.t6-cat:hover { transform: translateY(-6px) scale(1.02); box-shadow: var(--shadow-lg); }
.t6-cat__icon {
  width: 46px; height: 46px; border-radius: 14px; background: rgba(255,255,255,0.22); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
  transition: transform var(--dur-base) var(--ease-spring);
}
.t6-cat:hover .t6-cat__icon { transform: rotate(-8deg) scale(1.1); }
.t6-cat h3 { font-family: var(--font-display); font-weight: 700; font-size: var(--fs-sm); margin-top: 4px; }
.t6-cat em { font-style: normal; font-size: 11px; opacity: 0.85; }
</style>
