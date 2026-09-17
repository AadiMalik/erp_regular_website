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
  <article class="t4-card" v-reveal="reveal ? ['up', revealIndex, 50] : undefined" :data-product-id="product.id">
    <div class="t4-card__media">
      <span v-if="product.discount > 0" class="t4-card__sale">-{{ product.discount }}%</span>
      <button class="t4-card__wish" :class="{ active: wished }" aria-label="Toggle wishlist" @click="toggleWishlist">
        <i :class="wished ? 'fa-solid' : 'fa-regular'" class="fa-heart"></i>
      </button>
      <button class="t4-card__share" aria-label="Share this product" @click="shareProduct">
        <i class="fa-solid fa-share-nodes"></i>
      </button>
      <RouterLink :to="{ name: 'product', params: { slug: product.slug } }">
        <img :src="product.images[0]" :alt="product.name" loading="lazy" width="400" height="400">
      </RouterLink>
      <button class="t4-card__quick" @click="openQuickView(product.id)"><i class="fa-solid fa-eye"></i> Quick View</button>
    </div>
    <div class="t4-card__body">
      <span class="t4-card__cat">{{ product.brand }}</span>
      <h3><RouterLink :to="{ name: 'product', params: { slug: product.slug } }">{{ product.name }}</RouterLink></h3>
      <div class="t4-card__rating"><StarRating :rating="product.rating" /><span>({{ product.reviewCount }})</span></div>
      <div class="t4-card__row">
        <div class="t4-card__price">
          <span class="now">{{ formatCurrency(product.price) }}</span>
          <span v-if="product.oldPrice" class="old">{{ formatCurrency(product.oldPrice) }}</span>
        </div>
        <button
          class="t4-card__add"
          :class="{ 'is-added': justAdded }"
          :disabled="product.stock === 0"
          @click="addToCart"
        >
          <i class="fa-solid" :class="product.stock === 0 ? 'fa-ban' : (justAdded ? 'fa-check' : 'fa-plus')"></i>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.t4-card { display: flex; flex-direction: column; height: 100%; background: var(--color-surface); border: 2.5px solid var(--color-secondary); border-radius: var(--radius-card); overflow: hidden; transition: transform var(--dur-fast) var(--ease-premium), box-shadow var(--dur-fast) var(--ease-premium); }
.t4-card:hover { transform: translate(-3px, -3px); box-shadow: var(--shadow-hard); }

.t4-card__media { position: relative; aspect-ratio: 1/1; overflow: hidden; background: var(--color-bg-alt); border-bottom: 2.5px solid var(--color-secondary); }
.t4-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-slow) var(--ease-premium); }
.t4-card:hover .t4-card__media img { transform: scale(1.08) rotate(-1deg); }
.t4-card__sale {
  position: absolute; top: 10px; left: 10px; z-index: 2; background: var(--color-accent); color: #fff;
  border: 2px solid var(--color-secondary); font-size: 11px; font-weight: 900; padding: 3px 9px; border-radius: 6px;
}
.t4-card__wish {
  position: absolute; top: 10px; right: 10px; z-index: 2; width: 36px; height: 36px; border-radius: 8px;
  background: #fff; border: 2px solid var(--color-secondary); display: flex; align-items: center; justify-content: center;
  transition: transform var(--dur-fast) var(--ease-premium);
}
.t4-card__wish:hover { transform: scale(1.1); }
.t4-card__wish.active { color: var(--color-danger); background: var(--color-danger-light); }
.t4-card__share {
  position: absolute; top: calc(10px + 36px + 8px); right: 10px; z-index: 2; width: 36px; height: 36px; border-radius: 8px;
  background: #fff; border: 2px solid var(--color-secondary); display: flex; align-items: center; justify-content: center;
  transition: transform var(--dur-fast) var(--ease-premium);
}
.t4-card__share:hover { transform: scale(1.1); color: var(--color-primary); }
.t4-card__quick {
  position: absolute; left: 8px; right: 8px; bottom: 8px; z-index: 2;
  background: var(--color-secondary); color: #fff; border-radius: 8px; padding: 0.55rem;
  font-size: var(--fs-xs); font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transform: translateY(120%); transition: transform var(--dur-base) var(--ease-premium);
}
.t4-card:hover .t4-card__quick { transform: translateY(0); }

.t4-card__body { padding: var(--sp-4); display: flex; flex-direction: column; gap: 4px; flex: 1; }
.t4-card__cat { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-primary-dark); }
.t4-card__body h3 { font-family: var(--font-display); font-weight: 700; font-size: var(--fs-sm); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.4em; }
.t4-card__body h3 a:hover { color: var(--color-primary); }
.t4-card__rating { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.t4-card__rating span { font-size: var(--fs-xs); color: var(--color-text-muted); }
.t4-card__row { display: flex; align-items: center; justify-content: space-between; margin-top: var(--sp-2); }
.t4-card__price .now { font-family: var(--font-display); font-size: var(--fs-lg); font-weight: 900; color: var(--color-secondary); }
.t4-card__price .old { font-size: var(--fs-xs); color: var(--color-text-faint); text-decoration: line-through; margin-left: 6px; }
.t4-card__add {
  width: 40px; height: 40px; border-radius: 8px; background: var(--color-primary); color: #fff;
  border: 2px solid var(--color-secondary); display: flex; align-items: center; justify-content: center;
  transition: transform var(--dur-fast) var(--ease-premium);
}
.t4-card__add:hover:not(:disabled) { transform: translate(-2px, -2px); box-shadow: 3px 3px 0 var(--color-secondary); }
.t4-card__add.is-added { background: var(--color-accent); }
.t4-card__add:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
