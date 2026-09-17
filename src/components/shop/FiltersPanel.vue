<script setup>
// Ports assets/js/pages/shop.js's filtersPanelHTML(). `filters` is the
// reactive filter-state object owned by ShopView — mutated directly here
// (Vue 3's reactive support makes this safe) since this panel is rendered
// twice (desktop aside + mobile drawer) against the same state.
//
// Category/subcategory/brand are single-select (the storefront API takes
// one category_id/sub_category_id/brand_id per request, not arrays) -
// checking one clears the others in its group. Rating has no backing data
// anywhere in the ERP schema, so there's no rating filter here.

import { computed } from 'vue';
import { formatCurrency } from '@/utils/currency';

const props = defineProps({
  filters: { type: Object, required: true },
  categories: { type: Array, required: true },
  brands: { type: Array, required: true },
  priceMin: { type: Number, required: true },
  priceMax: { type: Number, required: true },
});
const emit = defineEmits(['clear']);

const subcategoryOptions = computed(() => {
  const category = props.categories.find((c) => c.id === props.filters.categoryId);
  return category?.subCategories || [];
});

function onCategoryChange(id, checked) {
  props.filters.categoryId = checked ? id : null;
  props.filters.subCategoryId = null;
}
function onSubCategoryChange(id, checked) {
  props.filters.subCategoryId = checked ? id : null;
}
function onBrandChange(id, checked) {
  props.filters.brandId = checked ? id : null;
}
</script>

<template>
  <div class="filters-panel__head">
    <h3 style="font-size:var(--fs-md)">Filters</h3>
    <button type="button" @click="emit('clear')">Clear All</button>
  </div>

  <div class="field" style="margin-bottom:var(--sp-3)">
    <input
      type="search"
      placeholder="Search products…"
      :value="filters.query"
      @input="filters.query = $event.target.value"
    >
  </div>

  <div class="accordion__item open">
    <div class="filter-group">
      <h4>Category</h4>
      <label v-for="c in categories" :key="c.id" class="check-row">
        <input
          type="checkbox"
          :value="c.id"
          :checked="filters.categoryId === c.id"
          @change="onCategoryChange(c.id, $event.target.checked)"
        >
        {{ c.name }}
      </label>
    </div>
  </div>

  <div v-if="subcategoryOptions.length" class="filter-group">
    <h4>Subcategory</h4>
    <label v-for="s in subcategoryOptions" :key="s.id" class="check-row">
      <input
        type="checkbox"
        :value="s.id"
        :checked="filters.subCategoryId === s.id"
        @change="onSubCategoryChange(s.id, $event.target.checked)"
      >
      {{ s.name }}
    </label>
  </div>

  <div class="filter-group">
    <h4>Brand</h4>
    <label v-for="b in brands" :key="b.id" class="check-row">
      <input
        type="checkbox"
        :value="b.id"
        :checked="filters.brandId === b.id"
        @change="onBrandChange(b.id, $event.target.checked)"
      >
      {{ b.name }}
    </label>
  </div>

  <div class="filter-group">
    <h4>Price Range</h4>
    <input
      type="range"
      class="range-slider"
      :min="priceMin"
      :max="priceMax"
      :value="filters.maxPrice"
      @input="filters.maxPrice = Number($event.target.value)"
    >
    <div class="price-inputs">
      <input
        type="number"
        :min="priceMin"
        :max="priceMax"
        :value="filters.minPrice"
        aria-label="Minimum price"
        @change="filters.minPrice = Math.min(Number($event.target.value) || priceMin, filters.maxPrice)"
      >
      <span>–</span>
      <input
        type="number"
        :min="priceMin"
        :max="priceMax"
        :value="filters.maxPrice"
        aria-label="Maximum price"
        @change="filters.maxPrice = Math.max(Number($event.target.value) || priceMax, filters.minPrice)"
      >
    </div>
    <p class="text-muted" style="font-size:var(--fs-xs);margin-top:6px">{{ formatCurrency(filters.minPrice) }} – {{ formatCurrency(filters.maxPrice) }}</p>
  </div>

  <div class="filter-group">
    <h4>Availability &amp; Deals</h4>
    <label class="check-row">
      <input type="checkbox" :checked="filters.inStockOnly" @change="filters.inStockOnly = $event.target.checked"> In Stock Only
    </label>
    <label class="check-row">
      <input type="checkbox" :checked="filters.dealsOnly" @change="filters.dealsOnly = $event.target.checked"> On Sale / Deals Only
    </label>
  </div>
</template>
