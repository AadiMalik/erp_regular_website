// Cart store backed by the ERP website cart API.
// Prices, stock, and totals are always server-authoritative.

import { defineStore } from 'pinia';
import * as cartApi from '@/services/cart';
import * as voucherApi from '@/services/vouchers';
import { findProductById } from '@/services/products';
import { useAuthStore } from '@/stores/auth';
import { useBranchStore } from '@/stores/branch';

function emptyCart() {
  return {
    cart_id: null,
    items: [],
    item_count: 0,
    serverTotals: { subtotal: 0, discount: 0, voucher_discount: 0, tax: 0, tax_percent: 0, tax_type: 'exclusive', tax_discount: 0, tax_discount_percent: 0, shipping: 0, total: 0 },
    voucher: null,
    voucherError: null,
    sale_type: null,
    branch_id: null,
  };
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    ...emptyCart(),
    loading: false,
    loaded: false,
    syncing: false,
    lastError: null,
  }),

  getters: {
    detailedItems(state) {
      return (state.items || []).map((item) => {
        const cached = findProductById(item.product_id);
        return {
          cartItemId: item.cart_item_id,
          productId: item.product_id,
          productVariationId: item.product_variation_id,
          variation: item.variation,
          variationLabel: item.variation_label || item.attribute_label || null,
          unit: item.unit || item.product_unit || cached?.unit || null,
          qty: item.quantity,
          unitPrice: item.unit_price,
          unitOldPrice: item.unit_old_price,
          lineTotal: item.line_total,
          maxStock: item.available_stock == null ? 9999 : item.available_stock,
          inStock: item.in_stock,
          product: {
            id: item.product_id,
            slug: item.slug,
            name: item.name,
            unit: item.unit || item.product_unit || cached?.unit || null,
            images: item.image ? [item.image] : (cached?.images || []),
          },
        };
      });
    },
    count(state) {
      return state.item_count || 0;
    },
    subtotal(state) {
      return state.serverTotals?.subtotal || 0;
    },
    totals(state) {
      const t = state.serverTotals || {};
      return {
        subtotal: t.subtotal || 0,
        discount: t.discount || 0,
        voucherDiscount: t.voucher_discount || 0,
        shipping: t.shipping || 0,
        tax: t.tax || 0,
        taxPercent: t.tax_percent || 0,
        taxType: t.tax_type || 'exclusive',
        taxDiscount: t.tax_discount || 0,
        taxDiscountPercent: t.tax_discount_percent || 0,
        total: t.total || 0,
        coupon: state.voucher,
      };
    },
  },

  actions: {
    applyPayload(payload) {
      if (!payload) {
        Object.assign(this, emptyCart());
        return;
      }
      this.cart_id = payload.cart_id;
      this.items = payload.items || [];
      this.item_count = payload.item_count || 0;
      this.serverTotals = payload.totals || emptyCart().serverTotals;
      this.voucher = payload.voucher || null;
      this.voucherError = payload.voucher_error || null;
      this.sale_type = payload.sale_type || null;
      this.branch_id = payload.branch_id || null;
      this.loaded = true;
      this.lastError = null;
    },

    requireAuth() {
      const auth = useAuthStore();
      if (!auth.isLoggedIn) {
        return { ok: false, message: 'Please sign in to manage your cart.', needsAuth: true };
      }
      return { ok: true };
    },

    async loadCart() {
      const gate = this.requireAuth();
      if (!gate.ok) {
        Object.assign(this, emptyCart());
        this.loaded = true;
        return gate;
      }

      this.loading = true;
      const branch = useBranchStore();
      const result = await cartApi.fetchCart({
        branch_id: branch.selectedId || undefined,
      });
      this.loading = false;

      if (!result.success) {
        this.lastError = result.message;
        return { ok: false, message: result.message };
      }

      this.applyPayload(result.data);
      return { ok: true };
    },

    async addToCart(productId, variationOrOpts = null, qty = 1) {
      const gate = this.requireAuth();
      if (!gate.ok) return gate;

      const { findProductById } = await import('@/services/products');

      // Support legacy (productId, variationLabel, qty) and new
      // (productId, { productVariationId, quantity }) call shapes.
      let productVariationId = null;
      let quantity = qty;
      if (variationOrOpts && typeof variationOrOpts === 'object' && !Array.isArray(variationOrOpts)) {
        productVariationId = variationOrOpts.productVariationId || variationOrOpts.product_variation_id;
        quantity = variationOrOpts.quantity ?? qty;
      } else if (typeof variationOrOpts === 'string' && variationOrOpts) {
        const product = findProductById(productId);
        const opt = product?.variations?.options?.find((o) => o.label === variationOrOpts || o.id === variationOrOpts);
        productVariationId = opt?.id || null;
      }

      if (!productVariationId) {
        const product = findProductById(productId);
        productVariationId = product?.default_variation_id
          || product?.variations?.options?.[0]?.id
          || null;
      }

      if (!productVariationId) {
        return { ok: false, message: 'A product variation is required. Open the product to select options.' };
      }

      this.syncing = true;
      const branch = useBranchStore();
      const result = await cartApi.addToCart({
        productId,
        productVariationId,
        quantity,
        branchId: branch.selectedId || null,
      });
      this.syncing = false;

      if (!result.success) {
        return { ok: false, message: result.message };
      }

      this.applyPayload(result.data);
      return { ok: true, message: 'Added to cart.' };
    },

    async updateQty(cartItemId, qty) {
      const gate = this.requireAuth();
      if (!gate.ok) return gate;

      this.syncing = true;
      const branch = useBranchStore();
      const result = await cartApi.updateCartItem(
        cartItemId,
        qty,
        branch.selectedId || null,
      );
      this.syncing = false;

      if (!result.success) {
        return { ok: false, message: result.message };
      }

      this.applyPayload(result.data);
      return { ok: true };
    },

    async removeItem(cartItemId) {
      const gate = this.requireAuth();
      if (!gate.ok) return gate;

      this.syncing = true;
      const result = await cartApi.removeCartItem(cartItemId);
      this.syncing = false;

      if (!result.success) {
        return { ok: false, message: result.message };
      }

      this.applyPayload(result.data);
      return { ok: true };
    },

    async clear() {
      const gate = this.requireAuth();
      if (!gate.ok) {
        Object.assign(this, emptyCart());
        return gate;
      }

      this.syncing = true;
      const result = await cartApi.clearCart();
      this.syncing = false;

      if (!result.success) {
        return { ok: false, message: result.message };
      }

      this.applyPayload(result.data);
      return { ok: true };
    },

    // Backward-compatible aliases used by CartView / order-reorder flows.
    async removeFromCart(cartItemIdOrProductId, _variation = null) {
      if (!cartItemIdOrProductId) return { ok: false, message: 'Item not found.' };
      // Prefer cart_item_id when callers pass the detailed item id.
      const byId = this.items.find((i) => i.cart_item_id === cartItemIdOrProductId);
      if (byId) return this.removeItem(byId.cart_item_id);
      const byProduct = this.items.find((i) => i.product_id === cartItemIdOrProductId);
      if (byProduct) return this.removeItem(byProduct.cart_item_id);
      return { ok: false, message: 'Item not found.' };
    },
    clearCart() {
      return this.clear();
    },
    removeCoupon() {
      this.clearCoupon();
    },

    async applyCoupon(code) {
      const gate = this.requireAuth();
      if (!gate.ok) return gate;

      const trimmed = String(code || '').trim();
      if (!trimmed) {
        return { ok: false, message: 'Please enter a voucher code.' };
      }

      this.syncing = true;
      const branch = useBranchStore();
      const result = await voucherApi.applyVoucher({
        voucherCode: trimmed,
        branchId: branch.selectedId || null,
      });
      this.syncing = false;

      if (!result.success) {
        return { ok: false, message: result.message };
      }

      this.applyPayload(result.data);
      return { ok: true, message: 'Voucher applied successfully.' };
    },

    async clearCoupon() {
      if (!this.voucher && !this.voucherError) return { ok: true };

      const gate = this.requireAuth();
      if (!gate.ok) return gate;

      this.syncing = true;
      const result = await voucherApi.removeVoucher();
      this.syncing = false;

      if (!result.success) {
        return { ok: false, message: result.message };
      }

      this.applyPayload(result.data);
      return { ok: true };
    },
  },
});
