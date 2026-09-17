<script setup>
const props = defineProps({
  category: { type: Object, required: true },
  reveal: { type: Boolean, default: false },
  revealIndex: { type: Number, default: 0 },
});

const PALETTE = ['#0F7A3D', '#FF5722', '#111827', '#FFC107'];
const bg = PALETTE[props.revealIndex % PALETTE.length];
</script>

<template>
  <RouterLink
    class="t4-cat"
    :style="{ '--tile': bg }"
    v-reveal="reveal ? ['up', revealIndex, 50] : undefined"
    :to="{ name: 'shop', query: { category: category.id } }"
  >
    <span class="t4-cat__icon"><i class="fa-solid" :class="category.icon"></i></span>
    <h3>{{ category.name }}</h3>
    <em>{{ category.subcategories.length }} lines</em>
    <span class="t4-cat__arrow"><i class="fa-solid fa-arrow-right"></i></span>
  </RouterLink>
</template>

<style scoped>
.t4-cat {
  position: relative; display: flex; flex-direction: column; justify-content: flex-end;
  aspect-ratio: 1/1; padding: var(--sp-4); border-radius: var(--radius-card);
  background: var(--tile); border: 2.5px solid var(--color-secondary);
  color: #fff; overflow: hidden;
  transition: transform var(--dur-fast) var(--ease-premium), box-shadow var(--dur-fast) var(--ease-premium);
}
.t4-cat:hover { transform: translate(-3px, -3px); box-shadow: var(--shadow-hard); }
.t4-cat__icon {
  position: absolute; top: var(--sp-4); left: var(--sp-4); width: 42px; height: 42px; border-radius: 10px;
  background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.15rem;
  transition: transform var(--dur-base) var(--ease-spring);
}
.t4-cat:hover .t4-cat__icon { transform: scale(1.12) rotate(-6deg); }
.t4-cat h3 { font-family: var(--font-display); font-weight: 800; font-size: var(--fs-md); text-transform: uppercase; line-height: 1.15; }
.t4-cat em { font-style: normal; font-size: var(--fs-xs); opacity: 0.85; margin-top: 2px; }
.t4-cat__arrow {
  position: absolute; top: var(--sp-4); right: var(--sp-4); width: 30px; height: 30px; border-radius: 8px;
  background: #fff; color: var(--color-secondary); display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: translate(-6px, 6px); transition: all var(--dur-base) var(--ease-premium); font-size: 0.8rem;
}
.t4-cat:hover .t4-cat__arrow { opacity: 1; transform: translate(0, 0); }
</style>
