import { reactive } from 'vue';

export const quickViewState = reactive({ open: false, productId: null });

export function openQuickView(productId) {
  quickViewState.productId = productId;
  quickViewState.open = true;
}
export function closeQuickView() {
  quickViewState.open = false;
}
