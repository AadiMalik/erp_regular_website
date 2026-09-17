<script setup>
// Ports assets/js/pages/product.js's renderInfo/wireInfoEvents.

import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { openShare } from '@/composables/useShare';
import { showToast } from '@/composables/useToast';
import { formatCurrency } from '@/utils/currency';
import { fetchContentItems } from '@/services/cms';
import StarRating from '@/components/ui/StarRating.vue';
import QtyStepper from '@/components/ui/QtyStepper.vue';

const props = defineProps({
  product: { type: Object, required: true },
});
const emit = defineEmits(['image-change']);

const cart = useCartStore();
const wishlist = useWishlistStore();
const router = useRouter();

// Same product_trust content items rendered here and in ProductTabs.vue's
// Delivery & Returns tab, so the two spots can never drift out of sync.
const trustItems = ref([]);
onMounted(async () => { trustItems.value = await fetchContentItems('product_trust'); });

const selectedOption = ref(
  props.product.variations
    ? (props.product.variations.options.find((o) => o.stock > 0) || props.product.variations.options[0])
    : null,
);
const qty = ref(1);
const wishlistBusy = ref(false);

const currentPrice = computed(() => (selectedOption.value ? selectedOption.value.price : props.product.price));
const currentOldPrice = computed(() => (selectedOption.value ? selectedOption.value.oldPrice : props.product.oldPrice));
const currentStock = computed(() => (selectedOption.value ? selectedOption.value.stock : props.product.stock));
const discountPct = computed(() => (currentOldPrice.value ? Math.round(100 - (currentPrice.value / currentOldPrice.value) * 100) : 0));

// Prefer variation-level wishlist when a concrete variation is selected and
// the product has multiple options; otherwise use product-level.
const wishlistVariationId = computed(() => {
  if (!selectedOption.value?.id) return null;
  if (props.product.is_single_variation) return null;
  return selectedOption.value.id;
});

const wished = computed(() => {
  if (wishlistVariationId.value) {
    return wishlist.isVariationWishlisted(props.product.id, wishlistVariationId.value)
      || wishlist.isProductWishlisted(props.product.id);
  }
  return wishlist.isWishlisted(props.product.id);
});

const currentImage = computed(() => {
  if (!props.product.variations) return props.product.images[0];
  const idx = props.product.variations.options.findIndex((o) => o.label === selectedOption.value.label);
  return props.product.images[idx % props.product.images.length];
});

watch(currentImage, (src) => emit('image-change', src), { immediate: true });
watch(currentStock, (max) => {
  qty.value = Math.max(1, Math.min(qty.value, Math.max(max, 1)));
});

function selectSwatch(opt) {
  selectedOption.value = opt;
}

async function addToCart() {
  const result = await cart.addToCart(props.product.id, {
    productVariationId: selectedOption.value?.id || props.product.default_variation_id,
    quantity: qty.value,
  });
  if (result.needsAuth) {
    showToast(result.message, 'info');
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }
  if (result.ok) showToast('Item added to your cart', 'success');
  else showToast(result.message, 'error');
}
async function buyNow() {
  const result = await cart.addToCart(props.product.id, {
    productVariationId: selectedOption.value?.id || props.product.default_variation_id,
    quantity: qty.value,
  });
  if (result.needsAuth) {
    showToast(result.message, 'info');
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }
  if (result.ok) router.push({ name: 'checkout' });
  else showToast(result.message, 'error');
}
async function toggleWishlist() {
  if (wishlistBusy.value) return;
  wishlistBusy.value = true;
  const result = await wishlist.toggle(props.product.id, wishlistVariationId.value);
  wishlistBusy.value = false;
  if (result.requiresAuth) {
    showToast(result.message, 'info');
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }
  if (!result.ok) {
    showToast(result.message || 'Could not update wishlist.', 'error');
    return;
  }
  showToast(result.active ? 'Added to wishlist' : 'Removed from wishlist', 'success');
}

function shareProduct() {
  openShare(props.product.id, {
    name: props.product.name,
    image: props.product.images[0],
    slug: props.product.slug,
    price: currentPrice.value,
  });
}
</script>

<template>
  <div class="pd-info">
    <span class="pd-brand">{{ product.brand }} &middot; {{ product.subcategory }}</span>
    <h1 class="pd-title">{{ product.name }}</h1>
    <div class="pd-meta">
      <div class="rating">
        <StarRating :rating="product.rating" />
        <span class="count">{{ product.rating.toFixed(1) }} ({{ product.reviewCount }} reviews)</span>
      </div>
      <span class="sep">|</span>
      <span class="pd-stock-wrap">
        <span v-if="currentStock === 0" class="badge badge-out">Out of Stock</span>
        <span v-else-if="currentStock <= 10" class="badge badge-low">Only {{ currentStock }} left in stock</span>
        <span v-else class="badge badge-soft"><i class="fa-solid fa-check"></i> In Stock</span>
      </span>
      <span class="sep">|</span>
      <span>SKU: {{ product.sku }}</span>
    </div>

    <div class="pd-price">
      <span class="now">{{ formatCurrency(currentPrice) }}</span>
      <template v-if="currentOldPrice">
        <span class="old">{{ formatCurrency(currentOldPrice) }}</span>
        <span class="badge badge-sale">-{{ discountPct }}%</span>
      </template>
    </div>

    <p class="pd-desc">{{ product.description }}</p>
    <ul class="pd-highlights">
      <li v-for="h in product.highlights" :key="h"><i class="fa-solid fa-circle-check"></i> {{ h }}</li>
    </ul>

    <div v-if="product.variations && !product.is_single_variation" class="pd-variation">
      <h4>{{ product.variations.label }}: <span class="selected-val">{{ selectedOption?.label }}</span></h4>
      <div class="swatch-group">
        <button
          v-for="o in product.variations.options"
          :key="o.label"
          class="swatch"
          :class="{ active: o.label === selectedOption?.label }"
          :disabled="o.stock === 0"
          @click="selectSwatch(o)"
        >{{ o.label }}{{ o.stock === 0 ? ' (Out)' : '' }}</button>
      </div>
    </div>

    <div class="pd-actions">
      <QtyStepper v-model="qty" :min="1" :max="Math.max(currentStock, 1)" />
      <button class="btn btn-primary" :disabled="currentStock === 0" @click="addToCart">
        <i class="fa-solid fa-cart-plus"></i> Add to Cart
      </button>
      <button class="btn btn-dark" :disabled="currentStock === 0" @click="buyNow">
        <i class="fa-solid fa-bolt"></i> Buy Now
      </button>
      <button class="btn-icon" aria-label="Toggle wishlist" :disabled="wishlistBusy" :style="wished ? 'color:var(--color-danger)' : ''" @click="toggleWishlist">
        <i :class="wished ? 'fa-solid' : 'fa-regular'" class="fa-heart"></i>
      </button>
      <button class="btn-icon" aria-label="Share this product" @click="shareProduct">
        <i class="fa-solid fa-share-nodes"></i>
      </button>
    </div>

    <div class="pd-info-box" v-if="trustItems.length">
      <div v-for="item in trustItems" :key="item.id"><i :class="item.icon || 'fa-solid fa-circle-check'"></i> <span>{{ item.description || item.title }}</span></div>
    </div>
  </div>
</template>
