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
  <article class="t6-card" v-reveal="reveal ? ['up', revealIndex, 55] : undefined" :data-product-id="product.id">
    <div class="t6-card__media">
      <span class="t6-card__cat-chip">{{ product.brand }}</span>
      <span v-if="product.discount > 0" class="t6-card__sale">-{{ product.discount }}%</span>
      <button class="t6-card__wish" :class="{ active: wished }" aria-label="Toggle wishlist" @click="toggleWishlist">
        <i :class="wished ? 'fa-solid' : 'fa-regular'" class="fa-heart"></i>
      </button>
      <button class="t6-card__share" aria-label="Share this product" @click="shareProduct">
        <i class="fa-solid fa-share-nodes"></i>
      </button>
      <RouterLink :to="{ name: 'product', params: { slug: product.slug } }">
        <img :src="product.images[0]" :alt="product.name" loading="lazy" width="400" height="400">
      </RouterLink>
      <button class="t6-card__quick" aria-label="Quick view" @click="openQuickView(product.id)"><i class="fa-solid fa-eye"></i></button>
    </div>
    <div class="t6-card__body">
      <h3><RouterLink :to="{ name: 'product', params: { slug: product.slug } }">{{ product.name }}</RouterLink></h3>
      <div class="t6-card__rating"><StarRating :rating="product.rating" /><span>({{ product.reviewCount }})</span></div>
      <div class="t6-card__row">
        <div class="t6-card__price">
          <span class="now">{{ formatCurrency(product.price) }}</span>
          <span v-if="product.oldPrice" class="old">{{ formatCurrency(product.oldPrice) }}</span>
        </div>
        <button
          class="t6-card__add" :class="{ 'is-added': justAdded }"
          :disabled="product.stock === 0" @click="addToCart" :aria-label="justAdded ? 'Added' : 'Add to cart'"
        >
          <i class="fa-solid" :class="product.stock === 0 ? 'fa-ban' : (justAdded ? 'fa-check' : 'fa-plus')"></i>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.t6-card { display: flex; flex-direction: column; height: 100%; background: var(--color-surface); border-radius: var(--radius-card); overflow: hidden; box-shadow: var(--shadow-sm); transition: transform var(--dur-base) var(--ease-premium), box-shadow var(--dur-base) var(--ease-premium); }
.t6-card:hover { transform: translateY(-7px); box-shadow: var(--shadow-lg); }

.t6-card__media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: var(--color-bg-alt); border-radius: var(--radius-card) var(--radius-card) 0 0; }
.t6-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-slow) var(--ease-premium); }
.t6-card:hover .t6-card__media img { transform: scale(1.09); }
.t6-card__cat-chip {
  position: absolute; top: 10px; left: 10px; z-index: 2; background: rgba(255,255,255,0.92); backdrop-filter: blur(3px);
  color: var(--color-primary-dark); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em;
  padding: 4px 10px; border-radius: var(--radius-pill);
}
.t6-card__sale {
  position: absolute; bottom: 10px; left: 10px; z-index: 2; background: var(--color-accent); color: #fff;
  font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: var(--radius-pill);
}
.t6-card__wish {
  position: absolute; top: 10px; right: 10px; z-index: 2; width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center;
  color: var(--color-text-soft); transition: transform var(--dur-fast) var(--ease-spring);
}
.t6-card__wish:hover { transform: scale(1.15) rotate(-8deg); }
.t6-card__wish.active { color: var(--color-danger); }
.t6-card__share {
  position: absolute; top: calc(10px + 36px + 8px); right: 10px; z-index: 2; width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center;
  color: var(--color-text-soft); transition: transform var(--dur-fast) var(--ease-spring);
}
.t6-card__share:hover { transform: scale(1.15) rotate(-8deg); color: var(--color-primary); }
.t6-card__quick {
  position: absolute; right: 10px; bottom: 10px; z-index: 2; width: 36px; height: 36px; border-radius: 50%;
  background: var(--color-secondary); color: #fff; display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: translateY(10px); transition: all var(--dur-base) var(--ease-premium);
}
.t6-card:hover .t6-card__quick { opacity: 1; transform: translateY(0); }

.t6-card__body { padding: var(--sp-4) var(--sp-4) var(--sp-5); display: flex; flex-direction: column; gap: 4px; flex: 1; }
.t6-card__body h3 { font-family: var(--font-display); font-weight: 600; font-size: var(--fs-sm); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.6em; }
.t6-card__body h3 a:hover { color: var(--color-primary); }
.t6-card__rating { display: flex; align-items: center; gap: 4px; }
.t6-card__rating span { font-size: var(--fs-xs); color: var(--color-text-muted); }
.t6-card__row { display: flex; align-items: center; justify-content: space-between; margin-top: var(--sp-2); }
.t6-card__price .now { font-family: var(--font-display); font-weight: 800; font-size: var(--fs-lg); color: var(--color-secondary); }
.t6-card__price .old { font-size: var(--fs-xs); color: var(--color-text-faint); text-decoration: line-through; margin-left: 6px; }
.t6-card__add {
  width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary); color: #fff;
  display: flex; align-items: center; justify-content: center; transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast);
}
.t6-card__add:hover:not(:disabled) { transform: scale(1.12) rotate(90deg); background: var(--color-primary-dark); }
.t6-card__add.is-added { background: var(--color-accent); }
.t6-card__add:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
