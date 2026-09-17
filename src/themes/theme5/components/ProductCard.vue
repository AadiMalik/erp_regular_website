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
  <article class="t5-card" v-reveal="reveal ? ['up', revealIndex, 70] : undefined" :data-product-id="product.id">
    <div class="t5-card__media">
      <RouterLink :to="{ name: 'product', params: { slug: product.slug } }">
        <img :src="product.images[0]" :alt="product.name" loading="lazy" width="400" height="480">
      </RouterLink>
      <span v-if="product.discount > 0" class="t5-card__sale">{{ product.discount }}% off</span>
      <div class="t5-card__actions">
        <button aria-label="Toggle wishlist" :class="{ active: wished }" @click="toggleWishlist">
          <i :class="wished ? 'fa-solid' : 'fa-regular'" class="fa-heart"></i>
        </button>
        <button aria-label="Quick view" @click="openQuickView(product.id)"><i class="fa-regular fa-eye"></i></button>
        <button aria-label="Share this product" @click="shareProduct"><i class="fa-solid fa-share-nodes"></i></button>
        <button
          aria-label="Add to cart" class="t5-card__add" :class="{ 'is-added': justAdded }"
          :disabled="product.stock === 0" @click="addToCart"
        >
          <i class="fa-solid" :class="product.stock === 0 ? 'fa-ban' : (justAdded ? 'fa-check' : 'fa-plus')"></i>
        </button>
      </div>
    </div>
    <div class="t5-card__body">
      <span class="t5-card__brand">{{ product.brand }}</span>
      <h3><RouterLink :to="{ name: 'product', params: { slug: product.slug } }">{{ product.name }}</RouterLink></h3>
      <div class="t5-card__rating"><StarRating :rating="product.rating" /><span>({{ product.reviewCount }})</span></div>
      <div class="t5-card__price">
        <span class="now">{{ formatCurrency(product.price) }}</span>
        <span v-if="product.oldPrice" class="old">{{ formatCurrency(product.oldPrice) }}</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.t5-card { display: flex; flex-direction: column; height: 100%; }
.t5-card__media { position: relative; aspect-ratio: 4/5; overflow: hidden; background: var(--color-bg-alt); }
.t5-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-slow) var(--ease-premium); }
.t5-card:hover .t5-card__media img { transform: scale(1.04); }
.t5-card__sale {
  position: absolute; top: 12px; left: 12px; z-index: 2; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--color-text); background: rgba(255,255,255,0.9); padding: 4px 10px; backdrop-filter: blur(4px);
}
.t5-card__actions {
  position: absolute; right: 12px; top: 12px; display: flex; flex-direction: column; gap: 8px;
  opacity: 0; transform: translateX(8px); transition: all var(--dur-base) var(--ease-premium);
}
.t5-card:hover .t5-card__actions { opacity: 1; transform: translateX(0); }
.t5-card__actions button {
  width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.94); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; color: var(--color-text); font-size: 0.85rem;
  transition: background var(--dur-fast), color var(--dur-fast);
}
.t5-card__actions button:hover { background: var(--color-text); color: #fff; }
.t5-card__actions button.active { color: #b3261e; }
.t5-card__add.is-added { background: var(--color-text); color: #fff; }
.t5-card__add:disabled { opacity: 0.4; cursor: not-allowed; }

.t5-card__body { padding-top: var(--sp-4); display: flex; flex-direction: column; gap: 3px; flex: 1; }
.t5-card__brand { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-text-faint); }
.t5-card__body h3 { font-weight: 500; font-size: var(--fs-sm); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.t5-card__body h3 a:hover { color: var(--color-accent); }
.t5-card__rating { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.t5-card__rating span { font-size: 11px; color: var(--color-text-muted); }
.t5-card__price { display: flex; align-items: baseline; gap: 8px; margin-top: 4px; }
.t5-card__price .now { font-size: var(--fs-md); font-weight: 500; }
.t5-card__price .old { font-size: var(--fs-xs); color: var(--color-text-faint); text-decoration: line-through; }
</style>
