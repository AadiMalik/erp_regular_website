<script setup>
// Ports assets/js/pages/categories.js.

import { ref, onMounted } from 'vue';
import { fetchCategories } from '@/services/categories';
import PageHeader from '@/components/ui/PageHeader.vue';
import CategoryCard from '@/components/ui/CategoryCard.vue';

const categories = ref([]);

onMounted(async () => {
  categories.value = await fetchCategories();
});
</script>

<template>
  <PageHeader title="Shop by Category" crumb="Categories" section-type="categories">
    <p>Everything you need for the week, organised the way you shop.</p>
  </PageHeader>

  <div class="section">
    <div class="container">
      <div class="category-grid stagger">
        <CategoryCard v-for="(c, i) in categories" :key="c.id" :category="c" reveal :reveal-index="i" />
      </div>
    </div>
  </div>
</template>
