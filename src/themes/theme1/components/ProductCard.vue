<script setup>
// Ports assets/js/core/product-card.js's productCardHTML markup + the
// delegated click handlers (wishlist toggle, add-to-cart, quick view) as
// real Vue bindings on the same markup/classes.

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { showToast } from '@/composables/useToast';
import { openQuickView } from '@/composables/useQuickView';
import { openShare } from '@/composables/useShare';
import { formatCurrency } from '@/utils/currency';
import StarRating from '@/components/ui/StarRating.vue';

const props = defineProps({
  product: { type: Object, required: true },
  reveal: { type: Boolean, default: false },
  revealIndex: { type: Number, default: 0 },
});

const cart = useCartStore();
const wishlist = useWishlistStore();
const router = useRouter();

const wished = computed(() => wishlist.isWishlisted(props.product.id));
const justAdded = ref(false);

async function toggleWishlist() {
  const result = await wishlist.toggle(props.product.id);
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

async function addToCart() {
  const result = await cart.addToCart(props.product.id, {
    productVariationId: props.product.default_variation_id,
    quantity: 1,
  });
  if (result.needsAuth) {
    showToast(result.message, 'info');
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }
  if (result.ok) {
    justAdded.value = true;
    showToast('Item added to your cart', 'success');
    setTimeout(() => { justAdded.value = false; }, 1400);
  } else {
    showToast(result.message, 'error');
  }
}

function shareProduct() {
  openShare(props.product.id, {
    name: props.product.name,
    image: props.product.images[0],
    slug: props.product.slug,
    price: props.product.price,
  });
}
</script>

<template>
  <article
    class="product-card"
    v-reveal="reveal ? ['up', revealIndex, 60] : undefined"
    :data-product-id="product.id"
  >
    <div class="product-card__media">
      <div class="product-card__badges">
        <span v-if="product.badges.includes('new')" class="badge badge-new">New</span>
        <span v-if="product.discount > 0" class="badge badge-sale">-{{ product.discount }}%</span>
        <span v-if="product.badges.includes('bestseller')" class="badge badge-best">Best Seller</span>
        <span v-if="product.stock === 0" class="badge badge-out">Out of Stock</span>
      </div>
      <button
        class="product-card__wishlist"
        :class="{ active: wished }"
        aria-label="Toggle wishlist"
        :aria-pressed="wished"
        @click="toggleWishlist"
      >
        <i :class="wished ? 'fa-solid' : 'fa-regular'" class="fa-heart"></i>
      </button>
      <button class="product-card__share" aria-label="Share this product" @click="shareProduct">
        <i class="fa-solid fa-share-nodes"></i>
      </button>
      <RouterLink :to="{ name: 'product', params: { slug: product.slug } }">
        <img class="img-main" :src="product.images[0]" :alt="product.name" loading="lazy" width="400" height="400">
        <img class="img-alt" :src="product.images[1]" alt="" loading="lazy" width="400" height="400">
      </RouterLink>
      <div class="product-card__quick">
        <button @click="openQuickView(product.id)"><i class="fa-regular fa-eye"></i> Quick View</button>
      </div>
    </div>
    <div class="product-card__body">
      <span class="product-card__category">{{ product.brand }}</span>
      <h3 class="product-card__title">
        <RouterLink :to="{ name: 'product', params: { slug: product.slug } }">{{ product.name }}</RouterLink>
      </h3>
      <div class="rating">
        <StarRating :rating="product.rating" />
        <span class="count">({{ product.reviewCount }})</span>
      </div>
      <div class="product-card__price">
        <span class="price-now">{{ formatCurrency(product.price) }}</span>
        <span v-if="product.oldPrice" class="price-old">{{ formatCurrency(product.oldPrice) }}</span>
      </div>
      <div class="product-card__stock-row">
        <span v-if="product.stock === 0" class="product-card__stock out">Out of stock</span>
        <span v-else-if="product.stock <= 10" class="product-card__stock low">Only {{ product.stock }} left</span>
        <span v-else class="product-card__stock in">In stock</span>
        <img
          v-if="product.loyaltyEligible"
          src="https://fonts.gstatic.com/s/e/notoemoji/latest/1fa99/72.png"
          alt="Earns Loyalty Points"
          title="Earns Loyalty Points"
          class="product-card__loyalty-coin"
          width="16" height="16" loading="lazy"
        >
      </div>
      <div class="product-card__footer">
        <button
          class="add-to-cart-btn"
          :class="{ 'is-added': justAdded, pulse: justAdded }"
          :disabled="product.stock === 0"
          @click="addToCart"
        >
          <span class="icon-pop"><i class="fa-solid fa-cart-plus"></i></span>
          <span class="btn-label">{{ product.stock === 0 ? 'Unavailable' : (justAdded ? 'Added ✓' : 'Add to Cart') }}</span>
        </button>
      </div>
    </div>
  </article>
</template>
