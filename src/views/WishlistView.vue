<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWishlistStore } from '@/stores/wishlist';
import { mapWishlistItemsToProducts } from '@/utils/wishlistItems';
import PageHeader from '@/components/ui/PageHeader.vue';
import ProductCard from '@/components/ui/ProductCard.vue';

const auth = useAuthStore();
const wishlist = useWishlistStore();
const router = useRouter();
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  if (!auth.isLoggedIn) {
    loading.value = false;
    router.replace({ name: 'login', query: { redirect: '/wishlist' } });
    return;
  }
  const result = await wishlist.load();
  loading.value = false;
  if (!result.ok) error.value = result.message || 'Failed to load wishlist.';
});

const items = computed(() => mapWishlistItemsToProducts(wishlist.items));
</script>

<template>
  <PageHeader title="Your Wishlist" crumb="Wishlist" section-type="wishlist" />

  <div class="section">
    <div class="container">
      <div v-if="loading" class="cart-empty">
        <i class="fa-solid fa-spinner spin"></i>
        <h2>Loading wishlist…</h2>
      </div>
      <div v-else-if="error" class="cart-empty">
        <i class="fa-solid fa-circle-exclamation"></i>
        <h2>Could not load wishlist</h2>
        <p class="text-muted" style="margin:var(--sp-3) 0 var(--sp-5)">{{ error }}</p>
        <button type="button" class="btn btn-primary" @click="wishlist.load()">Try Again</button>
      </div>
      <div v-else-if="items.length === 0" class="cart-empty">
        <i class="fa-regular fa-heart"></i>
        <h2>Your wishlist is empty</h2>
        <p class="text-muted" style="margin:var(--sp-3) 0 var(--sp-5)">Tap the heart icon on any product to save it here for later.</p>
        <RouterLink :to="{ name: 'shop' }" class="btn btn-primary">Start Shopping</RouterLink>
      </div>
      <div v-else class="product-grid stagger">
        <ProductCard
          v-for="(p, i) in items"
          :key="p.wishlistKey"
          :product="p"
          reveal
          :reveal-index="i"
        />
      </div>
    </div>
  </div>
</template>
