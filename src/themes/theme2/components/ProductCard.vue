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
  <article class="t2-card" v-reveal="reveal ? ['up', revealIndex, 60] : undefined" :data-product-id="product.id">
    <div class="t2-card__media">
      <div class="t2-card__badges">
        <span v-if="product.badges.includes('new')" class="t2-tag t2-tag--new">New</span>
        <span v-if="product.discount > 0" class="t2-tag t2-tag--sale">-{{ product.discount }}%</span>
        <span v-if="product.badges.includes('bestseller')" class="t2-tag t2-tag--best">Top Pick</span>
      </div>
      <button class="t2-card__wish" :class="{ active: wished }" aria-label="Toggle wishlist" @click="toggleWishlist">
        <i :class="wished ? 'fa-solid' : 'fa-regular'" class="fa-heart"></i>
      </button>
      <button class="t2-card__share" aria-label="Share this product" @click="shareProduct">
        <i class="fa-solid fa-share-nodes"></i>
      </button>
      <RouterLink :to="{ name: 'product', params: { slug: product.slug } }">
        <img :src="product.images[0]" :alt="product.name" loading="lazy" width="400" height="400">
      </RouterLink>
      <button class="t2-card__quick" @click="openQuickView(product.id)"><i class="fa-regular fa-eye"></i></button>
    </div>
    <div class="t2-card__body">
      <span class="t2-card__brand">{{ product.brand }}</span>
      <h3><RouterLink :to="{ name: 'product', params: { slug: product.slug } }">{{ product.name }}</RouterLink></h3>
      <div class="t2-card__rating"><StarRating :rating="product.rating" /><span>({{ product.reviewCount }})</span></div>
      <div class="t2-card__price">
        <span class="now">{{ formatCurrency(product.price) }}</span>
        <span v-if="product.oldPrice" class="old">{{ formatCurrency(product.oldPrice) }}</span>
      </div>
      <div class="t2-card__stock-row" v-if="product.loyaltyEligible">
        <img
          src="https://fonts.gstatic.com/s/e/notoemoji/latest/1fa99/72.png"
          alt="Earns Loyalty Points"
          title="Earns Loyalty Points"
          class="t2-card__loyalty-coin"
          width="16" height="16" loading="lazy"
        >
      </div>
      <button class="t2-card__add" :class="{ added: justAdded }" :disabled="product.stock === 0" @click="addToCart">
        <i class="fa-solid" :class="product.stock === 0 ? 'fa-ban' : (justAdded ? 'fa-check' : 'fa-cart-plus')"></i>
        {{ product.stock === 0 ? 'Sold Out' : (justAdded ? 'Added' : 'Add to Cart') }}
      </button>
    </div>
  </article>
</template>

<style scoped>
.t2-card {
  position: relative; background: var(--color-surface); border-radius: var(--radius-xl);
  overflow: hidden; display: flex; flex-direction: column; height: 100%;
  box-shadow: var(--shadow-sm); border: 1px solid var(--color-border);
  transition: transform var(--dur-base) var(--ease-spring), box-shadow var(--dur-base) var(--ease-out);
}
.t2-card:hover { transform: translateY(-8px) rotate(-0.6deg); box-shadow: var(--shadow-lg); }
.t2-card__media { position: relative; aspect-ratio: 1/1; background: var(--color-bg-alt); overflow: hidden; }
.t2-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--dur-slow) var(--ease-premium); }
.t2-card:hover .t2-card__media img { transform: scale(1.1) rotate(1deg); }
.t2-card__badges { position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 6px; z-index: 2; }
.t2-tag { padding: 4px 10px; border-radius: var(--radius-pill); font-size: 10px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.03em; }
.t2-tag--new { background: var(--color-info); }
.t2-tag--sale { background: var(--color-accent); }
.t2-tag--best { background: var(--color-gold); }
.t2-card__stock-row { display: flex; align-items: center; margin-top: 2px; }
.t2-card__loyalty-coin { width: 16px; height: 16px; display: inline-block; object-fit: contain; }
.t2-card__wish {
  position: absolute; top: 10px; right: 10px; z-index: 2; width: 36px; height: 36px; border-radius: var(--radius-md);
  background: rgba(255,255,255,0.94); display: flex; align-items: center; justify-content: center; color: var(--color-text-soft);
  transition: transform var(--dur-fast) var(--ease-spring);
}
.t2-card__wish:hover { transform: scale(1.15) rotate(-8deg); }
.t2-card__wish.active { color: var(--color-danger); }
.t2-card__share {
  position: absolute; top: calc(10px + 36px + 8px); right: 10px; z-index: 2; width: 36px; height: 36px; border-radius: var(--radius-md);
  background: rgba(255,255,255,0.94); display: flex; align-items: center; justify-content: center; color: var(--color-text-soft);
  transition: transform var(--dur-fast) var(--ease-spring);
}
.t2-card__share:hover { transform: scale(1.15) rotate(8deg); color: var(--color-primary); }
.t2-card__quick {
  position: absolute; bottom: 10px; right: 10px; z-index: 2; width: 38px; height: 38px; border-radius: var(--radius-md);
  background: var(--color-secondary); color: #fff; display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: translateY(8px); transition: all var(--dur-base) var(--ease-out);
}
.t2-card:hover .t2-card__quick { opacity: 1; transform: translateY(0); }
.t2-card__body { padding: var(--sp-4); display: flex; flex-direction: column; gap: 5px; flex: 1; }
.t2-card__brand { font-size: 10px; font-weight: 700; color: var(--color-primary); text-transform: uppercase; letter-spacing: 0.05em; }
.t2-card__body h3 { font-size: var(--fs-sm); font-weight: 700; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.6em; }
.t2-card__body h3 a:hover { color: var(--color-primary); }
.t2-card__rating { display: flex; align-items: center; gap: 4px; }
.t2-card__rating span { font-size: var(--fs-xs); color: var(--color-text-muted); }
.t2-card__price { display: flex; align-items: baseline; gap: 8px; margin-top: 2px; }
.t2-card__price .now { font-family: var(--font-display); font-weight: 800; font-size: var(--fs-lg); color: var(--color-secondary); }
.t2-card__price .old { font-size: var(--fs-xs); color: var(--color-text-faint); text-decoration: line-through; }
.t2-card__add {
  margin-top: var(--sp-2); width: 100%; padding: 0.7rem; border-radius: var(--radius-pill);
  background: var(--color-primary-light); color: var(--color-primary-dark); font-weight: 800; font-size: var(--fs-sm);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all var(--dur-fast) var(--ease-spring);
}
.t2-card__add:hover:not(:disabled) { background: linear-gradient(120deg, var(--color-primary), var(--color-accent)); color: #fff; transform: scale(1.02); }
.t2-card__add.added { background: var(--color-success); color: #fff; }
.t2-card__add:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
