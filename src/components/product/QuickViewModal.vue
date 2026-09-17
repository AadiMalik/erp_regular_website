<script setup>
// Ports assets/js/core/modal.js's Quick View (variation swatches, qty
// stepper, price/stock recompute) onto BaseModal + reactive state.

import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { quickViewState, closeQuickView } from '@/composables/useQuickView';
import { findProductById } from '@/services/products';
import { useCartStore } from '@/stores/cart';
import { showToast } from '@/composables/useToast';
import { formatCurrency } from '@/utils/currency';
import BaseModal from '@/components/ui/BaseModal.vue';
import StarRating from '@/components/ui/StarRating.vue';
import QtyStepper from '@/components/ui/QtyStepper.vue';

const router = useRouter();
const cart = useCartStore();

const product = computed(() => (quickViewState.productId ? findProductById(quickViewState.productId) : null));
const selected = ref(null);
const qty = ref(1);

watch(() => quickViewState.productId, () => {
  const p = product.value;
  selected.value = p?.variations
    ? (p.variations.options.find((o) => o.stock > 0) || p.variations.options[0])
    : null;
  qty.value = 1;
});

const price = computed(() => (selected.value ? selected.value.price : product.value?.price));
const oldPrice = computed(() => (selected.value ? selected.value.oldPrice : product.value?.oldPrice));
const maxStock = computed(() => (selected.value ? selected.value.stock : product.value?.stock) ?? 0);

function selectSwatch(opt) {
  selected.value = opt;
  qty.value = Math.min(qty.value, Math.max(opt.stock, 1));
}

async function addToCart() {
  const result = await cart.addToCart(product.value.id, {
    productVariationId: selected.value?.id || product.value.default_variation_id,
    quantity: qty.value,
  });
  if (result.needsAuth) {
    showToast(result.message, 'info');
    closeQuickView();
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }
  if (result.ok) {
    showToast('Item added to your cart', 'success');
    closeQuickView();
  } else {
    showToast(result.message, 'error');
  }
}
</script>

<template>
  <BaseModal :open="quickViewState.open" @close="closeQuickView">
    <div v-if="product" class="qv-grid">
      <div class="qv-grid__media">
        <img :src="product.images[0]" :alt="product.name">
      </div>
      <div class="qv-grid__info">
        <span class="pd-brand">{{ product.brand }}</span>
        <h2 style="font-size:var(--fs-xl);margin-top:6px;color:var(--color-secondary)">{{ product.name }}</h2>
        <div class="rating" style="margin-top:8px">
          <StarRating :rating="product.rating" />
          <span class="count">({{ product.reviewCount }} reviews)</span>
        </div>
        <div class="pd-price" style="margin-top:14px">
          <span class="now">{{ formatCurrency(price) }}</span>
          <span v-if="oldPrice" class="old">{{ formatCurrency(oldPrice) }}</span>
        </div>
        <p class="text-muted" style="margin-top:12px;font-size:.9rem">{{ product.description }}</p>

        <div v-if="product.variations && !product.is_single_variation" class="pd-variation">
          <h4>{{ product.variations.label }}: <span class="selected-val">{{ selected?.label }}</span></h4>
          <div class="swatch-group">
            <button
              v-for="opt in product.variations.options"
              :key="opt.label"
              class="swatch"
              :class="{ active: opt.label === selected?.label }"
              :disabled="opt.stock === 0"
              @click="selectSwatch(opt)"
            >{{ opt.label }}</button>
          </div>
        </div>

        <div class="pd-actions" style="margin-top:var(--sp-5)">
          <QtyStepper v-model="qty" :min="1" :max="Math.max(maxStock, 1)" />
          <button class="btn btn-primary" @click="addToCart">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
          </button>
        </div>
        <RouterLink
          :to="{ name: 'product', params: { slug: product.slug } }"
          class="btn btn-ghost btn-sm"
          style="margin-top:14px"
          @click="closeQuickView"
        >View full details <i class="fa-solid fa-arrow-right"></i></RouterLink>
      </div>
    </div>
  </BaseModal>
</template>
