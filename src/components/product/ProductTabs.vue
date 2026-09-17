<script setup>
import { ref, onMounted } from 'vue';
import { fetchContentItems } from '@/services/cms';

defineProps({
  product: { type: Object, required: true },
});

// Same product_trust content items rendered here and in ProductInfo.vue's
// info box, so the two spots can never drift out of sync.
const trustItems = ref([]);
onMounted(async () => { trustItems.value = await fetchContentItems('product_trust'); });

const TABS = [
  { key: 'description', label: 'Description' },
  { key: 'specs', label: 'Specifications' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'delivery', label: 'Delivery & Returns' },
];
const active = ref('description');
</script>

<template>
  <div class="pd-tabs-section" v-reveal="'up'">
    <div class="tabs__list" role="tablist">
      <button v-for="t in TABS" :key="t.key" :class="{ active: active === t.key }" @click="active = t.key">{{ t.label }}</button>
    </div>

    <div class="tabs__panel" :class="{ active: active === 'description' }">
      <p style="max-width:70ch;color:var(--color-text-soft)">{{ product.description }}</p>
      <ul class="pd-highlights" style="margin-top:var(--sp-4)">
        <li v-for="h in product.highlights" :key="h"><i class="fa-solid fa-circle-check"></i> {{ h }}</li>
      </ul>
    </div>

    <div class="tabs__panel" :class="{ active: active === 'specs' }">
      <table class="spec-table">
        <tr><td>Brand</td><td>{{ product.brand }}</td></tr>
        <tr><td>Category</td><td>{{ product.subcategory }}</td></tr>
        <tr><td>SKU</td><td>{{ product.sku }}</td></tr>
        <tr><td>Unit</td><td>{{ product.unit }}</td></tr>
        <tr v-if="product.variations"><td>{{ product.variations.label }} Options</td><td>{{ product.variations.options.map(o => o.label).join(', ') }}</td></tr>
        <tr><td>Stock Status</td><td>{{ product.stock === 0 ? 'Out of Stock' : `${product.stock} units available` }}</td></tr>
      </table>
    </div>

    <div class="tabs__panel" :class="{ active: active === 'reviews' }">
      <slot name="reviews" />
    </div>

    <div class="tabs__panel" :class="{ active: active === 'delivery' }">
      <div class="pd-info-box" style="border:none;padding:0;gap:var(--sp-4)" v-if="trustItems.length">
        <div v-for="item in trustItems" :key="item.id"><i :class="item.icon || 'fa-solid fa-circle-check'"></i> <span><strong>{{ item.title }}:</strong> {{ item.description }}</span></div>
      </div>
    </div>
  </div>
</template>
