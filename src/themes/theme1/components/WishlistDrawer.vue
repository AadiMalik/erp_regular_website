<script setup>
import { computed, watch } from 'vue';
import { useWishlistStore } from '@/stores/wishlist';
import { mapWishlistItemsToProducts } from '@/utils/wishlistItems';
import { formatCurrency } from '@/utils/currency';

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(['close']);

const wishlist = useWishlistStore();

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) wishlist.load().catch(() => {});
  },
);

const items = computed(() => mapWishlistItemsToProducts(wishlist.items));

async function removeItem(item) {
  await wishlist.toggle(item.wishlistProductId, item.wishlistVariationId);
}
</script>

<template>
  <aside class="drawer-right" :class="{ open }" aria-label="Wishlist">
    <div class="mobile-drawer__head">
      <strong><i class="fa-solid fa-heart" style="color:var(--color-danger)"></i>&nbsp; My Wishlist</strong>
      <button class="btn-icon" aria-label="Close wishlist" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div style="padding: var(--sp-5); overflow-y:auto; flex:1;">
      <div v-if="wishlist.loading && items.length === 0" style="text-align:center;padding:40px 0;color:var(--color-text-muted)">
        <i class="fa-solid fa-spinner spin" style="font-size:1.5rem;display:block;margin-bottom:12px"></i>
        Loading wishlist…
      </div>
      <div v-else-if="items.length === 0" style="text-align:center;padding:40px 0;color:var(--color-text-muted)">
        <i class="fa-regular fa-heart" style="font-size:2rem;display:block;margin-bottom:12px;color:var(--color-border-strong)"></i>
        Your wishlist is empty.
      </div>
      <div
        v-for="item in items"
        :key="item.wishlistKey"
        style="display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--color-border)"
      >
        <img :src="item.images[0]" alt="" style="width:60px;height:60px;border-radius:10px;object-fit:cover">
        <div style="flex:1;min-width:0">
          <RouterLink
            :to="{ name: 'product', params: { slug: item.slug } }"
            style="font-size:.85rem;font-weight:600;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
            @click="emit('close')"
          >{{ item.name }}</RouterLink>
          <span style="font-size:.8rem;color:var(--color-primary-dark);font-weight:700">{{ formatCurrency(item.price) }}</span>
        </div>
        <button class="btn-icon" aria-label="Remove" @click="removeItem(item)">
          <i class="fa-solid fa-trash-can" style="font-size:.8rem"></i>
        </button>
      </div>
    </div>
    <div style="padding: var(--sp-5); border-top:1px solid var(--color-border)">
      <RouterLink :to="{ name: 'wishlist' }" class="btn btn-outline btn-block" @click="emit('close')">View Full Wishlist</RouterLink>
    </div>
  </aside>
</template>
