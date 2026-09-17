<script setup>
import { computed } from 'vue';
import { formatCurrency } from '@/utils/currency';

const props = defineProps({
  filters: { type: Object, required: true },
  categories: { type: Array, required: true },
  brands: { type: Array, required: true },
  priceMin: { type: Number, required: true },
  priceMax: { type: Number, required: true },
});

function findCategory(id) {
  return props.categories.find((c) => c.id === id);
}
function findSubCategory(id) {
  for (const c of props.categories) {
    const match = (c.subCategories || []).find((s) => s.id === id);
    if (match) return match;
  }
  return null;
}
function findBrand(id) {
  return props.brands.find((b) => b.id === id);
}

const chips = computed(() => {
  const list = [];
  if (props.filters.categoryId) {
    list.push({ label: findCategory(props.filters.categoryId)?.name, remove: () => { props.filters.categoryId = null; props.filters.subCategoryId = null; } });
  }
  if (props.filters.subCategoryId) {
    list.push({ label: findSubCategory(props.filters.subCategoryId)?.name, remove: () => { props.filters.subCategoryId = null; } });
  }
  if (props.filters.brandId) {
    list.push({ label: findBrand(props.filters.brandId)?.name, remove: () => { props.filters.brandId = null; } });
  }
  if (props.filters.inStockOnly) list.push({ label: 'In Stock', remove: () => { props.filters.inStockOnly = false; } });
  if (props.filters.dealsOnly) list.push({ label: 'On Sale', remove: () => { props.filters.dealsOnly = false; } });
  if (props.filters.minPrice > props.priceMin || props.filters.maxPrice < props.priceMax) {
    list.push({
      label: `${formatCurrency(props.filters.minPrice)} – ${formatCurrency(props.filters.maxPrice)}`,
      remove: () => { props.filters.minPrice = props.priceMin; props.filters.maxPrice = props.priceMax; },
    });
  }
  if (props.filters.query) list.push({ label: `"${props.filters.query}"`, remove: () => { props.filters.query = ''; } });
  return list;
});
</script>

<template>
  <div class="active-filters">
    <span v-for="(c, i) in chips" :key="i" class="filter-chip">
      {{ c.label }}
      <button type="button" @click="c.remove()"><i class="fa-solid fa-xmark"></i></button>
    </span>
  </div>
</template>
