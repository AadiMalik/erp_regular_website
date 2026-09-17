<script setup>
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
  <article class="t3-card" v-reveal="reveal ? ['up', revealIndex, 60] : undefined" :data-product-id="product.id">
    <div class="t3-card__media">
      <span v-if="product.discount > 0" class="t3-card__sale">-{{ product.discount }}%</span>
      <RouterLink :to="{ name: 'product', params: { slug: product.slug } }">
        <img :src="product.images[0]" :alt="product.name" loading="lazy" width="400" height="400">
      </RouterLink>
      <div class="t3-card__overlay">
        <button aria-label="Toggle wishlist" :class="{ active: wished }" @click="toggleWishlist">
          <i :class="wished ? 'fa-solid' : 'fa-regular'" class="fa-heart"></i>
        </button>
        <button aria-label="Quick view" @click="openQuickView(product.id)"><i class="fa-solid fa-eye"></i></button>
        <button aria-label="Share this product" @click="shareProduct"><i class="fa-solid fa-share-nodes"></i></button>
      </div>
    </div>
    <div class="t3-card__body">
      <span class="t3-card__brand">{{ product.brand }}</span>
      <h3><RouterLink :to="{ name: 'product', params: { slug: product.slug } }">{{ product.name }}</RouterLink></h3>
      <div class="t3-card__rating"><StarRating :rating="product.rating" /><span>({{ product.reviewCount }})</span></div>
      <div class="t3-card__row">
        <div class="t3-card__price">
          <span class="now">{{ formatCurrency(product.price) }}</span>
          <span v-if="product.oldPrice" class="old">{{ formatCurrency(product.oldPrice) }}</span>
        </div>
        <button class="t3-card__add" :disabled="product.stock === 0" @click="addToCart" :aria-label="justAdded ? 'Added' : 'Add to cart'">
          <i class="fa-solid" :class="product.stock === 0 ? 'fa-ban' : (justAdded ? 'fa-check' : 'fa-plus')"></i>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.t3-card { display: flex; flex-direction: column; height: 100%; }
.t3-card__media { position: relative; aspect-ratio: 4/5; overflow: hidden; background: var(--color-bg-alt); }
.t3-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-slow) var(--ease-premium); }
.t3-card:hover .t3-card__media img { transform: scale(1.06); }
.t3-card__sale {
  position: absolute; top: 12px; left: 12px; z-index: 2; background: var(--color-secondary); color: #fff;
  font-size: 10px; letter-spacing: 0.05em; padding: 4px 10px;
}
.t3-card__overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 10px;
  background: rgba(28,25,23,0.28); opacity: 0; transition: opacity var(--dur-base) var(--ease-premium);
}
.t3-card:hover .t3-card__overlay { opacity: 1; }
.t3-card__overlay button {
  width: 42px; height: 42px; border-radius: 50%; background: #fff; color: var(--color-secondary);
  display: flex; align-items: center; justify-content: center;
  transform: translateY(8px); transition: transform var(--dur-base) var(--ease-premium);
}
.t3-card:hover .t3-card__overlay button { transform: translateY(0); }
.t3-card__overlay button.active { color: var(--color-danger); }
.t3-card__body { padding-top: var(--sp-4); display: flex; flex-direction: column; gap: 4px; flex: 1; }
.t3-card__brand { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-faint); }
.t3-card__body h3 { font-family: var(--font-display); font-weight: 500; font-size: var(--fs-md); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.t3-card__body h3 a:hover { color: var(--color-accent); }
.t3-card__rating { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.t3-card__rating span { font-size: var(--fs-xs); color: var(--color-text-muted); }
.t3-card__row { display: flex; align-items: center; justify-content: space-between; margin-top: var(--sp-2); }
.t3-card__price .now { font-family: var(--font-display); font-size: var(--fs-lg); }
.t3-card__price .old { font-size: var(--fs-xs); color: var(--color-text-faint); text-decoration: line-through; margin-left: 6px; }
.t3-card__add {
  width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--color-border-strong);
  display: flex; align-items: center; justify-content: center; transition: all var(--dur-base);
}
.t3-card__add:hover:not(:disabled) { background: var(--color-secondary); color: #fff; border-color: var(--color-secondary); }
.t3-card__add:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
