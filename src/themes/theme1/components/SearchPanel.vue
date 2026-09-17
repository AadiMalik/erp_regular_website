<script setup>
// Ports the search-toggle + dropdown panel + live suggestions from
// assets/js/core/header.js's initSearchToggle/initSearch.

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { PRODUCTS } from '@/services/products';
import { formatCurrency } from '@/utils/currency';

const router = useRouter();
const open = ref(false);
const query = ref('');
const inputEl = ref(null);

function toggle() {
  open.value = !open.value;
  if (open.value) setTimeout(() => inputEl.value?.focus(), 150);
}
function close() {
  open.value = false;
}

const suggestions = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)).slice(0, 6);
});
const showSuggestions = computed(() => query.value.trim().length > 0);

function submit() {
  const q = query.value.trim();
  close();
  router.push({ name: 'shop', query: q ? { q } : {} });
}
function goToProduct(slug) {
  close();
  router.push({ name: 'product', params: { slug } });
}
</script>

<template>
  <button class="header-action" aria-label="Toggle search" :aria-expanded="open" @click.stop="toggle">
    <i class="fa-solid fa-magnifying-glass"></i>
  </button>

  <div class="search-panel" :class="{ open }">
    <div class="container search-panel__inner">
      <form role="search" autocomplete="off" @submit.prevent="submit">
        <i class="fa-solid fa-magnifying-glass search-panel__icon"></i>
        <input
          ref="inputEl"
          v-model="query"
          type="search"
          placeholder="Search for fruits, snacks, dairy, brands…"
          aria-label="Search products"
          spellcheck="false"
          autocomplete="off"
        >
        <button type="submit" class="btn btn-primary btn-sm">Search</button>
      </form>
      <button class="search-panel__close" aria-label="Close search" @click="close"><i class="fa-solid fa-xmark"></i></button>

      <div class="search-suggest" :class="{ open: showSuggestions }">
        <div v-if="suggestions.length === 0 && showSuggestions" class="search-suggest__empty">
          No products found for "{{ query.trim() }}"
        </div>
        <a
          v-for="p in suggestions"
          :key="p.id"
          class="search-suggest__item"
          href="#"
          @click.prevent="goToProduct(p.slug)"
        >
          <img :src="p.images[0]" alt="">
          <span>
            <span class="name">{{ p.name }}</span>
            <span class="cat">{{ p.brand }} · {{ p.unit }}</span>
          </span>
          <span class="price">{{ formatCurrency(p.price) }}</span>
        </a>
      </div>
    </div>
  </div>
</template>
