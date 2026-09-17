import { defineStore } from 'pinia';
import * as wishlistApi from '@/services/wishlist';
import { wishlistItemKey } from '@/utils/wishlistItems';
import { useAuthStore } from './auth';

export { wishlistItemKey as itemKey };

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [],
    loaded: false,
    loading: false,
  }),

  getters: {
    count(state) {
      return state.items.length;
    },

    keys(state) {
      return state.items.map((i) => wishlistItemKey(i.product_id, i.product_variation_id));
    },

    productIds(state) {
      return [...new Set(state.items.map((i) => String(i.product_id)))];
    },
  },

  actions: {
    isWishlisted(productId, variationId = null) {
      if (variationId) {
        return this.keys.includes(wishlistItemKey(productId, variationId));
      }
      const id = String(productId);
      return this.keys.some((k) => k === id || String(k).startsWith(`${id}:`));
    },

    isProductWishlisted(productId) {
      return this.keys.includes(String(productId));
    },

    isVariationWishlisted(productId, variationId) {
      if (!variationId) return false;
      return this.keys.includes(wishlistItemKey(productId, variationId));
    },

    applyItems(items = [], count = null) {
      this.items = items;
      return { items, count: count ?? items.length };
    },

    async load() {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) {
        this.items = [];
        this.loaded = true;
        return { ok: true, items: [], count: 0 };
      }

      this.loading = true;
      const result = await wishlistApi.fetchWishlist();
      this.loading = false;

      if (!result.success) {
        return { ok: false, message: result.message };
      }

      const items = result.data?.items || [];
      const count = typeof result.data?.count === 'number' ? result.data.count : items.length;
      this.applyItems(items, count);
      this.loaded = true;
      return { ok: true, items, count };
    },

    async toggle(productId, variationId = null) {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) {
        return { ok: false, requiresAuth: true, message: 'Please sign in to use your wishlist.' };
      }

      const result = await wishlistApi.toggleWishlist({
        productId,
        productVariationId: variationId,
      });

      if (!result.success) {
        return { ok: false, message: result.message };
      }

      const loadResult = await this.load();
      if (!loadResult.ok) {
        return { ok: false, message: loadResult.message };
      }

      return {
        ok: true,
        active: !!result.data?.is_wishlisted,
        count: loadResult.count,
      };
    },
  },
});
