<script setup>
// Cart page - server-backed cart with live prices/stock.

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { showToast } from '@/composables/useToast';
import { formatCurrency, taxLineLabel, taxDiscountLineLabel } from '@/utils/currency';
import { fetchContentItems } from '@/services/cms';
import PageHeader from '@/components/ui/PageHeader.vue';
import CartProductCell from '@/components/cart/CartProductCell.vue';
import QtyStepper from '@/components/ui/QtyStepper.vue';
import VoucherApply from '@/components/checkout/VoucherApply.vue';

const router = useRouter();
const cart = useCartStore();
const wishlist = useWishlistStore();
const auth = useAuthStore();
const websiteSettings = useWebsiteSettingsStore();

const trustBadges = ref([]);
onMounted(async () => {
  trustBadges.value = await fetchContentItems('cart_trust');
  if (auth.isLoggedIn) {
    await cart.loadCart();
  }
});

const items = computed(() => cart.detailedItems);
const totals = computed(() => cart.totals);
const itemCount = computed(() => cart.count);
const removingKeys = ref(new Set());
const hasOutOfStockItems = computed(() => items.value.some((item) => item.inStock === false));

const freeDelivery = computed(() => websiteSettings.free_delivery || {});
const freeDeliveryNote = computed(() => {
  if (!freeDelivery.value.enabled || freeDelivery.value.min_amount == null) return '';
  const remaining = Math.max(0, Number(freeDelivery.value.min_amount) - Number(totals.value.subtotal || 0));
  if (remaining <= 0) return 'You have unlocked free delivery on this order.';
  return `Add ${formatCurrency(remaining)} more for free delivery.`;
});

function keyOf(item) {
  return item.cartItemId || `${item.productId}::${item.productVariationId || ''}`;
}

async function removeItem(item, message = 'Item removed from cart', type = 'info') {
  removingKeys.value.add(keyOf(item));
  const result = await cart.removeItem(item.cartItemId);
  removingKeys.value.delete(keyOf(item));
  if (!result.ok) {
    if (result.needsAuth) {
      router.push({ name: 'login', query: { redirect: '/cart' } });
    }
    showToast(result.message || 'Could not remove item.', 'error');
    return;
  }
  showToast(message, type);
}

async function saveForLater(item) {
  const result = await wishlist.toggle(item.productId, item.productVariationId);
  if (result.requiresAuth) {
    showToast(result.message, 'info');
    return;
  }
  if (!result.ok) {
    showToast(result.message || 'Could not update wishlist.', 'error');
    return;
  }
  await removeItem(item, 'Saved to wishlist', 'success');
}

async function changeQty(item, next) {
  const result = await cart.updateQty(item.cartItemId, next);
  if (!result.ok) showToast(result.message || 'Could not update quantity.', 'error');
}

async function clearCart() {
  const result = await cart.clear();
  if (!result.ok) {
    showToast(result.message || 'Could not clear cart.', 'error');
    return;
  }
  showToast('Cart cleared', 'info');
}
</script>

<template>
  <PageHeader title="Your Shopping Cart" crumb="Cart" section-type="cart" />

  <div class="section">
    <div class="container">
      <div v-if="!auth.isLoggedIn" class="cart-empty">
        <i class="fa-solid fa-user-lock"></i>
        <h2>Sign in to view your cart</h2>
        <p class="text-muted" style="margin:var(--sp-3) 0 var(--sp-5)">Your cart is saved to your account so prices and stock stay accurate.</p>
        <RouterLink :to="{ name: 'login', query: { redirect: '/cart' } }" class="btn btn-primary">Sign In</RouterLink>
      </div>

      <div v-else-if="cart.loading" class="cart-empty">
        <p class="text-muted">Loading your cart…</p>
      </div>

      <div v-else-if="items.length === 0" class="cart-empty">
        <i class="fa-solid fa-cart-shopping"></i>
        <h2>Your cart is empty</h2>
        <p class="text-muted" style="margin:var(--sp-3) 0 var(--sp-5)">Looks like you haven't added anything yet. Let's fix that.</p>
        <RouterLink :to="{ name: 'shop' }" class="btn btn-primary">Start Shopping</RouterLink>
      </div>

      <div v-else class="cart-layout">
        <div class="cart-main">
          <div class="cart-table-wrap">
            <table class="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in items"
                  :key="keyOf(item)"
                  class="cart-row"
                  :class="{ removing: removingKeys.has(keyOf(item)) }"
                >
                  <td>
                    <CartProductCell
                      :item="item"
                      @remove="removeItem(item)"
                      @save-for-later="saveForLater(item)"
                    />
                  </td>
                  <td class="cart-price">{{ formatCurrency(item.unitPrice) }}</td>
                  <td>
                    <QtyStepper
                      :model-value="item.qty"
                      :min="1"
                      :max="item.maxStock"
                      :disabled="item.inStock === false"
                      @update:model-value="changeQty(item, $event)"
                    />
                  </td>
                  <td class="cart-subtotal">{{ formatCurrency(item.lineTotal) }}</td>
                  <td>
                    <button class="btn-icon" aria-label="Remove item" @click="removeItem(item)">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="cart-mobile-list">
            <article
              v-for="item in items"
              :key="`m-${keyOf(item)}`"
              class="cart-mobile-item"
              :class="{ removing: removingKeys.has(keyOf(item)) }"
            >
              <CartProductCell
                :item="item"
                save-label="Save"
                compact
                @remove="removeItem(item)"
                @save-for-later="saveForLater(item)"
              />
              <div class="cart-mobile-item__footer">
                <QtyStepper
                  :model-value="item.qty"
                  :min="1"
                  :max="item.maxStock"
                  :disabled="item.inStock === false"
                  @update:model-value="changeQty(item, $event)"
                />
                <div class="cart-mobile-item__prices">
                  <span class="cart-price">{{ formatCurrency(item.unitPrice) }}</span>
                  <strong class="cart-subtotal">{{ formatCurrency(item.lineTotal) }}</strong>
                </div>
              </div>
            </article>
          </div>

          <div class="cart-actions">
            <RouterLink :to="{ name: 'shop' }" class="btn btn-outline cart-actions__continue">
              <i class="fa-solid fa-arrow-left"></i>
              Continue Shopping
            </RouterLink>
            <button type="button" class="btn btn-ghost cart-actions__clear" @click="clearCart">
              <i class="fa-regular fa-trash-can"></i>
              Clear Cart
            </button>
          </div>

          <section v-if="trustBadges.length" class="cart-assurance" aria-label="Shopping assurances">
            <div
              v-for="badge in trustBadges"
              :key="badge.code || badge.title"
              class="cart-assurance__item"
            >
              <span class="cart-assurance__icon" aria-hidden="true">
                <i :class="badge.icon || 'fa-solid fa-shield-halved'"></i>
              </span>
              <div>
                <strong>{{ badge.title }}</strong>
                <p v-if="badge.description">{{ badge.description }}</p>
              </div>
            </div>
          </section>
        </div>

        <aside class="cart-summary">
          <div class="cart-summary__head">
            <h3>Order Summary</h3>
            <span class="cart-summary__count">{{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}</span>
          </div>

          <div class="cart-summary__rows">
            <div class="cart-summary__row">
              <span>Subtotal</span>
              <span>{{ formatCurrency(totals.subtotal) }}</span>
            </div>
            <div v-if="totals.discount" class="cart-summary__row cart-summary__row--discount">
              <span>Product Discount</span>
              <span>− {{ formatCurrency(totals.discount) }}</span>
            </div>
            <VoucherApply compact />
            <div v-if="totals.voucherDiscount" class="cart-summary__row cart-summary__row--discount">
              <span>Voucher</span>
              <span>− {{ formatCurrency(totals.voucherDiscount) }}</span>
            </div>
            <div class="cart-summary__row">
              <span>Shipping</span>
              <span>{{ totals.shipping === 0 ? 'FREE' : formatCurrency(totals.shipping) }}</span>
            </div>
            <div class="cart-summary__row">
              <span>{{ taxLineLabel(totals.taxPercent, totals.taxType) }}</span>
              <span>{{ formatCurrency(totals.tax) }}</span>
            </div>
            <div v-if="totals.taxDiscount" class="cart-summary__row">
              <span>{{ taxDiscountLineLabel(totals.taxDiscountPercent) }}</span>
              <span>{{ formatCurrency(totals.taxDiscount) }}</span>
            </div>
          </div>

          <div class="cart-summary__total">
            <span>Total</span>
            <strong>{{ formatCurrency(totals.total) }}</strong>
          </div>

          <p v-if="freeDeliveryNote" class="cart-summary__note">
            <i class="fa-solid fa-truck"></i>
            {{ freeDeliveryNote }}
          </p>

          <p v-if="hasOutOfStockItems" class="cart-summary__note cart-summary__note--warning">
            <i class="fa-solid fa-triangle-exclamation"></i>
            One or more items in your cart are out of stock. Remove them to continue to checkout.
          </p>
          <RouterLink
            v-if="!hasOutOfStockItems"
            :to="{ name: 'checkout' }"
            class="btn btn-primary btn-block cart-summary__checkout"
          >
            Proceed to Checkout
            <i class="fa-solid fa-arrow-right"></i>
          </RouterLink>
          <button v-else type="button" class="btn btn-primary btn-block cart-summary__checkout" disabled>
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  </div>
</template>
