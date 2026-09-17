<script setup>
defineProps({
  category: { type: Object, required: true },
  reveal: { type: Boolean, default: false },
  revealIndex: { type: Number, default: 0 },
});
</script>

<template>
  <RouterLink
    class="category-card"
    v-reveal="reveal ? ['up', revealIndex, 60] : undefined"
    :to="{ name: 'shop', query: { category: category.id } }"
  >
    <img :src="category.image" :alt="category.name" loading="lazy">
    <span class="category-card__arrow"><i class="fa-solid fa-up-right-from-square"></i></span>
    <div class="category-card__body">
      <span class="category-card__icon"><i class="fa-solid" :class="category.icon"></i></span>
      <h3>{{ category.name }}</h3>
      <span>{{ category.subcategories.length }} subcategories</span>
    </div>
  </RouterLink>
</template>
