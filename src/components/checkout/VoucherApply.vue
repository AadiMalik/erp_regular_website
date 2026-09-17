<script setup>
// Voucher code apply/remove — server-authoritative via cart store.
import { ref, computed } from 'vue';
import { useCartStore } from '@/stores/cart';
import { showToast } from '@/composables/useToast';
import { formatCurrency } from '@/utils/currency';

const props = defineProps({
  compact: { type: Boolean, default: false },
});

const cart = useCartStore();
const code = ref('');
const applying = ref(false);

const applied = computed(() => cart.voucher);
const voucherError = computed(() => cart.voucherError);
const discount = computed(() => cart.totals.voucherDiscount || applied.value?.discount_amount || 0);

async function apply() {
  if (applied.value) return;
  applying.value = true;
  const result = await cart.applyCoupon(code.value);
  applying.value = false;
  if (!result.ok) {
    showToast(result.message, 'error');
    return;
  }
  code.value = '';
  showToast(result.message || 'Voucher applied.', 'success');
}

async function remove() {
  applying.value = true;
  const result = await cart.clearCoupon();
  applying.value = false;
  if (!result.ok) {
    showToast(result.message, 'error');
    return;
  }
  code.value = '';
  showToast('Voucher removed.', 'info');
}
</script>

<template>
  <div class="voucher-box" :class="{ 'voucher-box--compact': compact }">
    <label v-if="!compact" class="voucher-box__label"><i class="fa-solid fa-ticket"></i> Voucher Code</label>

    <div v-if="applied" class="voucher-applied">
      <div class="voucher-applied__info">
        <strong>{{ applied.code }}</strong>
        <span v-if="applied.name" class="text-muted">{{ applied.name }}</span>
        <span v-if="applied.rule" class="voucher-applied__rule">{{ applied.rule }}</span>
        <span v-if="discount" class="voucher-applied__save">You save {{ formatCurrency(discount) }}</span>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" :disabled="applying" @click="remove">
        <i class="fa-solid fa-xmark"></i> Remove
      </button>
    </div>

    <template v-else>
      <div class="coupon-row">
        <input
          v-model="code"
          type="text"
          placeholder="Enter voucher code"
          autocomplete="off"
          :disabled="applying"
          @keyup.enter="apply"
        >
        <button type="button" class="btn btn-outline" :disabled="applying || !code.trim()" @click="apply">
          <i class="fa-solid" :class="applying ? 'fa-spinner spin' : 'fa-check'"></i>
          Apply
        </button>
      </div>
      <p v-if="voucherError" class="voucher-box__error"><i class="fa-solid fa-circle-exclamation"></i> {{ voucherError }}</p>
    </template>
  </div>
</template>

<style scoped>
.voucher-box { margin: var(--sp-4) 0; }
.voucher-box__label {
  display: block;
  font-weight: 700;
  margin-bottom: var(--sp-3);
  font-size: var(--fs-sm);
}
.voucher-applied {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border: 1.5px dashed var(--color-primary);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
}
.voucher-applied__info { display: flex; flex-direction: column; gap: 2px; font-size: var(--fs-sm); }
.voucher-applied__rule { color: var(--color-text-muted); font-size: var(--fs-xs); }
.voucher-applied__save { color: var(--color-primary-dark); font-weight: 700; margin-top: 4px; }
.voucher-box__error {
  margin-top: var(--sp-2);
  font-size: var(--fs-xs);
  color: var(--color-danger);
}
.voucher-box--compact .voucher-box__label { display: none; }

.coupon-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 0;
  align-items: stretch;
}
.coupon-row input,
.coupon-row .btn {
  width: 100%;
  min-width: 0;
  height: 46px;
  margin: 0;
  box-sizing: border-box;
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
}
.coupon-row input {
  padding: 0 1rem;
  border: 1.5px solid var(--color-border);
}
.coupon-row .btn {
  padding: 0 1rem;
  justify-content: center;
}
</style>
