import { reactive } from 'vue';

// Mirrors useQuickView.js's pattern: a global reactive trigger for
// ShareModal (mounted once in App.vue) so any component can open it
// without prop-drilling. `fallback` carries the caller's own known fields
// (name/image/price - e.g. from an order line item) for when the product
// isn't in the products cache (findProductById returns null).
export const shareState = reactive({ open: false, productId: null, fallback: null });

export function openShare(productId, fallback = null) {
  shareState.productId = productId;
  shareState.fallback = fallback;
  shareState.open = true;
}

export function closeShare() {
  shareState.open = false;
}
