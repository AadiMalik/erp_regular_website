<script setup>
// Server-driven search/filter/sort/pagination against the ERP's website
// products API (services/products.js's fetchProducts), replacing the old
// client-side filtering over a stale local product cache.

import { reactive, ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchProducts } from '@/services/products';
import { fetchCategories, fetchBrands } from '@/services/categories';
import { useBranchStore } from '@/stores/branch';
import PageHeader from '@/components/ui/PageHeader.vue';
import FiltersPanel from '@/components/shop/FiltersPanel.vue';
import ActiveFilterChips from '@/components/shop/ActiveFilterChips.vue';
import ProductCard from '@/components/ui/ProductCard.vue';
import SkeletonCard from '@/components/ui/SkeletonCard.vue';

const route = useRoute();
const branch = useBranchStore();

const categories = ref([]);
const brands = ref([]);

const PAGE_SIZE = 12;
const DEFAULT_PRICE_MIN = 0;
const DEFAULT_PRICE_MAX = 100;
const priceMin = ref(DEFAULT_PRICE_MIN);
const priceMax = ref(DEFAULT_PRICE_MAX);
let boundsInitialized = false;

const filters = reactive({
  categoryId: route.query.category || null,
  subCategoryId: null,
  brandId: null,
  minPrice: DEFAULT_PRICE_MIN,
  maxPrice: DEFAULT_PRICE_MAX,
  inStockOnly: false,
  dealsOnly: route.query.filter === 'deal',
  query: route.query.q || '',
});

const SORT_LABELS = {
  featured: 'Featured', newest: 'Newest', price_asc: 'Price: Low to High', price_desc: 'Price: High to Low', name_asc: 'Name: A to Z', name_desc: 'Name: Z to A',
};
const sort = ref('featured');
const page = ref(1);
const lastPage = ref(1);
const total = ref(0);
const products = ref([]);
const view = ref('grid');
const sortMenuOpen = ref(false);
const mobileFiltersOpen = ref(false);
const isLoading = ref(false);
const isLoadingMore = ref(false);

const shopDesc = computed(() => {
  if (!filters.categoryId) return 'Fresh groceries and everyday essentials, all in one place.';
  const cat = categories.value.find((c) => c.id === filters.categoryId);
  return cat ? `Browsing ${cat.name}.` : 'Fresh groceries and everyday essentials, all in one place.';
});

let skipNextWatch = false;
let requestToken = 0;
async function load({ append = false } = {}) {
  const token = ++requestToken;
  if (append) isLoadingMore.value = true;
  else isLoading.value = true;

  const result = await fetchProducts({
    search: filters.query || undefined,
    category_id: filters.categoryId || undefined,
    sub_category_id: filters.subCategoryId || undefined,
    brand_id: filters.brandId || undefined,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    in_stock: filters.inStockOnly ? 1 : undefined,
    on_sale: filters.dealsOnly ? 1 : undefined,
    sort: sort.value,
    page: page.value,
    per_page: PAGE_SIZE,
    branch_id: branch.selectedId || undefined,
  });

  if (token !== requestToken) return; // a newer request superseded this one

  const data = result.products || { data: [], current_page: 1, last_page: 1, total: 0 };
  products.value = append ? [...products.value, ...data.data] : data.data;
  lastPage.value = data.last_page || 1;
  total.value = data.total || 0;

  if (!boundsInitialized && result.filters_meta && result.filters_meta.price_min != null) {
    priceMin.value = Math.floor(result.filters_meta.price_min);
    priceMax.value = Math.ceil(result.filters_meta.price_max);
    // Syncing the slider bounds into `filters` would otherwise re-trigger
    // the watcher below and fire a redundant second request - the widened
    // default bounds already matched every product, so nothing to refetch.
    skipNextWatch = true;
    filters.minPrice = priceMin.value;
    filters.maxPrice = priceMax.value;
    boundsInitialized = true;
  }

  isLoading.value = false;
  isLoadingMore.value = false;
}

function loadMore() {
  if (page.value >= lastPage.value) return;
  page.value += 1;
  load({ append: true });
}

let debounceTimer = null;
watch([filters, sort], () => {
  if (skipNextWatch) { skipNextWatch = false; return; }
  page.value = 1;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => load(), 300);
}, { deep: true });

// Stock (and, in principle, price) is branch-scoped - switching the store
// must refresh the listing immediately, not leave the previous branch's
// figures showing until the shopper changes a filter.
watch(() => branch.selectedId, () => {
  page.value = 1;
  load();
});

function clearAll() {
  filters.categoryId = null;
  filters.subCategoryId = null;
  filters.brandId = null;
  filters.minPrice = priceMin.value;
  filters.maxPrice = priceMax.value;
  filters.inStockOnly = false;
  filters.dealsOnly = false;
  filters.query = '';
}

function selectSort(value) {
  sort.value = value;
  sortMenuOpen.value = false;
}

onMounted(async () => {
  document.addEventListener('click', () => { sortMenuOpen.value = false; });
  [categories.value, brands.value] = await Promise.all([fetchCategories(), fetchBrands()]);
  load();
});
</script>

<template>
  <PageHeader title="Shop All Products" crumb="Shop" section-type="shop">
    <p>{{ shopDesc }}</p>
  </PageHeader>

  <div class="section" style="padding-top:var(--sp-7)">
    <div class="container">
      <div class="shop-layout">
        <aside class="filters-panel">
          <FiltersPanel
            :filters="filters"
            :categories="categories"
            :brands="brands"
            :price-min="priceMin"
            :price-max="priceMax"
            @clear="clearAll"
          />
        </aside>

        <div class="shop-results">
          <ActiveFilterChips :filters="filters" :categories="categories" :brands="brands" :price-min="priceMin" :price-max="priceMax" />

          <div class="shop-toolbar">
            <p class="result-count"><strong>{{ total }}</strong> products found</p>
            <div class="toolbar-right">
              <button class="btn btn-outline btn-sm mobile-filter-btn" @click="mobileFiltersOpen = true">
                <i class="fa-solid fa-sliders"></i> Filters
              </button>
              <div class="view-toggle">
                <button type="button" :class="{ active: view === 'grid' }" aria-label="Grid view" :aria-pressed="view === 'grid'" @click="view = 'grid'">
                  <i class="fa-solid fa-grip"></i>
                </button>
                <button type="button" :class="{ active: view === 'list' }" aria-label="List view" :aria-pressed="view === 'list'" @click="view = 'list'">
                  <i class="fa-solid fa-list"></i>
                </button>
              </div>
              <div class="dropdown sort-dropdown" :class="{ open: sortMenuOpen }">
                <button class="dropdown__trigger" @click.stop="sortMenuOpen = !sortMenuOpen">
                  <i class="fa-solid fa-arrow-down-wide-short"></i> <span>Sort: {{ SORT_LABELS[sort] }}</span>
                </button>
                <div class="dropdown__menu">
                  <button
                    v-for="(label, value) in SORT_LABELS"
                    :key="value"
                    :class="{ active: sort === value }"
                    @click="selectSort(value)"
                  >{{ label }}</button>
                </div>
              </div>
            </div>
          </div>

          <div class="product-grid stagger" :class="{ 'list-view': view === 'list' }" :hidden="total === 0 && !isLoading">
            <template v-if="isLoading">
              <SkeletonCard v-for="n in PAGE_SIZE" :key="'sk' + n" />
            </template>
            <template v-else>
              <ProductCard v-for="(p, i) in products" :key="p.id" :product="p" reveal :reveal-index="i" />
            </template>
          </div>

          <div v-if="!isLoading && total === 0" class="no-results">
            <i class="fa-solid fa-basket-shopping"></i>
            <h3>No products match your filters</h3>
            <p class="text-muted">Try clearing some filters or searching for something else.</p>
            <button class="btn btn-primary" style="margin-top:var(--sp-4)" @click="clearAll">Clear All Filters</button>
          </div>

          <div v-if="!isLoading && total > 0 && products.length < total" class="load-more-wrap">
            <div class="load-more-progress"><span :style="{ width: (products.length / total) * 100 + '%' }"></span></div>
            <p class="text-muted" style="font-size:var(--fs-xs)"><span>{{ products.length }}</span> of <span>{{ total }}</span> products shown</p>
            <button class="btn btn-outline" :disabled="isLoadingMore" @click="loadMore">{{ isLoadingMore ? 'Loading…' : 'Load More Products' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="drawer-overlay" :class="{ open: mobileFiltersOpen }" @click="mobileFiltersOpen = false"></div>
  <aside class="drawer-right" :class="{ open: mobileFiltersOpen }" aria-label="Filters">
    <div class="mobile-drawer__head">
      <strong><i class="fa-solid fa-sliders"></i>&nbsp; Filters</strong>
      <button class="btn-icon" aria-label="Close filters" @click="mobileFiltersOpen = false"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div style="padding: 0 var(--sp-5) var(--sp-5); overflow-y:auto; flex:1;">
      <FiltersPanel
        :filters="filters"
        :categories="categories"
        :brands="brands"
        :price-min="priceMin"
        :price-max="priceMax"
        @clear="clearAll"
      />
    </div>
    <div style="padding: var(--sp-5); border-top:1px solid var(--color-border)">
      <button class="btn btn-primary btn-block" @click="mobileFiltersOpen = false">Show Results</button>
    </div>
  </aside>
</template>
