<script setup>
// Checkout - authenticated, server-priced cart + website payment methods (COD / bank transfer).

import { reactive, ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useOrdersStore } from '@/stores/orders';
import { useAuthStore } from '@/stores/auth';
import { useBranchStore } from '@/stores/branch';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { fetchPaymentMethods, verifyDeliveryAddress } from '@/services/checkout';
import { showToast } from '@/composables/useToast';
import { formatCurrency, taxLineLabel, taxDiscountLineLabel } from '@/utils/currency';
import PageHeader from '@/components/ui/PageHeader.vue';
import FormField from '@/components/ui/FormField.vue';
import VoucherApply from '@/components/checkout/VoucherApply.vue';
import LocationPicker from '@/components/checkout/LocationPicker.vue';

const router = useRouter();
const cart = useCartStore();
const orders = useOrdersStore();
const auth = useAuthStore();
const branch = useBranchStore();
const websiteSettings = useWebsiteSettingsStore();

const items = computed(() => cart.detailedItems);
const totals = computed(() => cart.totals);
const hasOutOfStockItems = computed(() => items.value.some((item) => item.inStock === false));

const paymentMethods = ref([]);
const bankDetails = ref(null);
const loadingPage = ref(true);
const paymentReceipt = ref(null);
const paymentReference = ref('');

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip: '',
  country: '',
  notes: '',
});
const location = ref(null); // { lat, lng } picked on the delivery map
const payment = ref('');
const errors = reactive({});
const submitting = ref(false);

// Distance-based delivery fee for the picked location - resolved against
// the branch's Delivery Zones, separate from the (currently always-0)
// flat `totals.shipping` the cart API returns.
const checkingDelivery = ref(false);
const deliveryFee = ref(null); // null = not checked yet
const deliveryFree = ref(false);
const deliveryOutOfArea = ref(false);
const deliveryMessage = ref('');

const displayTotal = computed(() => Number(totals.value.total || 0) + Number(deliveryFee.value || 0));

watch(location, async (loc) => {
  deliveryOutOfArea.value = false;
  deliveryMessage.value = '';
  if (!loc?.lat || !loc?.lng) {
    deliveryFee.value = null;
    deliveryFree.value = false;
    return;
  }

  checkingDelivery.value = true;
  const result = await verifyDeliveryAddress({ branchId: branch.selectedId, lat: loc.lat, lng: loc.lng });
  checkingDelivery.value = false;

  if (!result.success) {
    // Verification itself failing (network/branch not found) shouldn't block
    // checkout - placeOrder() re-validates server-side either way.
    deliveryFee.value = null;
    deliveryFree.value = false;
    return;
  }

  if (!result.data.in_area) {
    deliveryOutOfArea.value = true;
    deliveryMessage.value = result.data.message || 'Sorry, this address is out of our delivery area.';
    deliveryFee.value = null;
    deliveryFree.value = false;
    return;
  }

  deliveryFee.value = Number(result.data.delivery_fee || 0);
  deliveryFree.value = !!result.data.free;
});

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Pakistan'];

const selectedMethod = computed(() =>
  paymentMethods.value.find((m) => m.code === payment.value) || null,
);
const isBankTransfer = computed(() => payment.value === 'bank_transfer');
const displayBankDetails = computed(() => bankDetails.value || websiteSettings.bank_details || null);

const VALIDATORS = {
  fullName: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: (v) => v.replace(/[^0-9]/g, '').length >= 7,
  address: (v) => v.trim().length >= 4,
  city: (v) => v.trim().length >= 2,
  zip: (v) => !v || v.trim().length >= 3,
  country: (v) => v.trim().length > 0,
};

function validateLocation() {
  const valid = !!location.value;
  errors.location = !valid;
  return valid;
}

const ERROR_MESSAGES = {
  fullName: 'Please enter your full name.',
  email: 'Please enter a valid email address.',
  phone: 'Please enter a valid phone number.',
  address: 'Please enter your street address.',
  city: 'Please enter your city.',
  zip: 'Please enter a valid ZIP code.',
  country: 'Please select your country.',
  location: 'Please pin your delivery location on the map.',
  payment: 'Please select a payment method.',
  paymentReceipt: 'Please upload your payment receipt.',
};

function paymentIcon(code) {
  if (code === 'bank_transfer') return 'fa-building-columns';
  return 'fa-money-bill-wave';
}

function validateField(key) {
  const validator = VALIDATORS[key];
  const valid = validator ? validator(form[key]) : true;
  errors[key] = !valid;
  return valid;
}

function onBlur(key) {
  validateField(key);
}
function onInput(key) {
  if (errors[key]) validateField(key);
}

function onReceiptChange(event) {
  const file = event.target.files?.[0] || null;
  paymentReceipt.value = file;
  errors.paymentReceipt = false;
}

function validateAll() {
  const fields = ['fullName', 'email', 'phone', 'address', 'city', 'zip', 'country'];
  let allValid = true;
  fields.forEach((key) => {
    if (!validateField(key)) allValid = false;
  });
  if (!validateLocation()) allValid = false;
  if (!payment.value || !selectedMethod.value) {
    errors.payment = true;
    allValid = false;
  } else {
    errors.payment = false;
  }
  if (isBankTransfer.value && !paymentReceipt.value) {
    errors.paymentReceipt = true;
    allValid = false;
  } else {
    errors.paymentReceipt = false;
  }
  return allValid;
}

function clientRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function prefillFromUser() {
  const user = auth.currentUser;
  if (!user) return;

  form.email = user.email || '';
  const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
  if (defaultAddr) {
    form.fullName = defaultAddr.fullName || user.name || '';
    form.phone = defaultAddr.phone || user.phone || '';
    form.address = defaultAddr.address || '';
    form.city = defaultAddr.city || '';
    form.zip = defaultAddr.zip || '';
    form.country = defaultAddr.country || '';
  } else {
    form.fullName = user.name || '';
    form.phone = user.phone || '';
  }
}

onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.replace({ name: 'login', query: { redirect: '/checkout' } });
    return;
  }

  const [, , payResult] = await Promise.all([
    auth.fetchProfile(),
    cart.loadCart(),
    fetchPaymentMethods(),
  ]);
  prefillFromUser();

  if (payResult.success && payResult.data) {
    paymentMethods.value = (payResult.data.methods || []).filter(
      (m) => m.code === 'cod' || m.code === 'bank_transfer',
    );
    bankDetails.value = payResult.data.bank_details || null;
    if (bankDetails.value) {
      websiteSettings.bank_details = { ...websiteSettings.bank_details, ...bankDetails.value };
    }
    if (paymentMethods.value.length && !payment.value) {
      payment.value = paymentMethods.value[0].code;
    }
  }

  loadingPage.value = false;
});

watch(payment, () => {
  errors.payment = false;
  if (!isBankTransfer.value) {
    paymentReceipt.value = null;
    errors.paymentReceipt = false;
  }
});

async function submitOrder() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: '/checkout' } });
    return;
  }
  if (!validateAll()) {
    showToast('Please fix the highlighted fields before continuing.', 'error');
    return;
  }
  if (!items.value.length) {
    showToast('Your cart is empty.', 'error');
    return;
  }
  if (items.value.some((item) => item.inStock === false)) {
    showToast('One or more items in your cart are out of stock. Please remove them to continue.', 'error');
    return;
  }

  submitting.value = true;

  const fd = new FormData();
  fd.append('full_name', form.fullName.trim());
  fd.append('email', form.email.trim());
  fd.append('phone', form.phone.trim());
  fd.append('address', form.address.trim());
  fd.append('city', form.city.trim());
  fd.append('zip', form.zip.trim());
  fd.append('country', form.country);
  fd.append('latitude', location.value.lat);
  fd.append('longitude', location.value.lng);
  fd.append('notes', form.notes.trim());
  fd.append('payment_code', selectedMethod.value.code);
  fd.append('payment_method_id', selectedMethod.value.id);
  fd.append('client_request_id', clientRequestId());
  if (branch.selectedId) fd.append('branch_id', branch.selectedId);
  if (paymentReference.value.trim()) {
    fd.append('payment_reference', paymentReference.value.trim());
  }
  if (isBankTransfer.value && paymentReceipt.value) {
    fd.append('payment_receipt', paymentReceipt.value);
  }

  const result = await orders.placeOrder(fd);
  submitting.value = false;

  if (!result.ok) {
    showToast(result.message || 'Failed to place order.', 'error');
    // A rejection is very often a stock race (another order/POS sale/website
    // checkout took the last unit between page-load and submit) - refresh
    // the cart immediately so the shopper sees the corrected stock/whatever
    // item is now out of stock, instead of resubmitting against stale data.
    await cart.loadCart().catch(() => {});
    return;
  }

  // Cart is cleared server-side on successful checkout; refresh local state.
  await cart.loadCart().catch(() => {});
  router.push({ name: 'order-success', params: { id: result.order.id } });
}
</script>

<template>
  <PageHeader title="Checkout" crumb="Checkout" section-type="checkout" />

  <div class="section">
    <div class="container">

      <div v-if="loadingPage" class="cart-empty">
        <p class="text-muted">Loading checkout…</p>
      </div>

      <div v-else-if="items.length === 0" class="cart-empty">
        <i class="fa-solid fa-cart-shopping"></i>
        <h2>Your cart is empty</h2>
        <p class="text-muted" style="margin:var(--sp-3) 0 var(--sp-5)">Add some products before checking out.</p>
        <RouterLink :to="{ name: 'shop' }" class="btn btn-primary">Start Shopping</RouterLink>
      </div>

      <div v-else>
        <div class="checkout-steps">
          <div class="step active"><span class="num">1</span> Delivery</div>
          <div class="line"></div>
          <div class="step active"><span class="num">2</span> Payment</div>
          <div class="line"></div>
          <div class="step active"><span class="num">3</span> Review</div>
        </div>

        <form class="checkout-layout" novalidate @submit.prevent="submitOrder">
          <div>
            <div class="checkout-section">
              <h3><i class="fa-solid fa-id-card"></i> Customer Information</h3>
              <div class="field-row">
                <FormField
                  id="fullName" label="Full Name" placeholder="Jane Doe"
                  v-model="form.fullName" :error="errors.fullName" :error-message="ERROR_MESSAGES.fullName"
                  @blur="onBlur('fullName')" @update:model-value="onInput('fullName')"
                />
                <FormField
                  id="email" label="Email Address" type="email" placeholder="jane@example.com"
                  v-model="form.email" :error="errors.email" :error-message="ERROR_MESSAGES.email"
                  @blur="onBlur('email')" @update:model-value="onInput('email')"
                />
              </div>
              <FormField
                id="phone" label="Phone Number" type="tel" placeholder="03001234567"
                v-model="form.phone" :error="errors.phone" :error-message="ERROR_MESSAGES.phone"
                @blur="onBlur('phone')" @update:model-value="onInput('phone')"
              />
            </div>

            <div class="checkout-section">
              <h3><i class="fa-solid fa-location-dot"></i> Delivery Address</h3>
              <FormField
                id="address" label="Street Address" placeholder="221 Fresh Market Ave"
                v-model="form.address" :error="errors.address" :error-message="ERROR_MESSAGES.address"
                @blur="onBlur('address')" @update:model-value="onInput('address')"
              />
              <div class="field-row">
                <FormField
                  id="city" label="City" placeholder="Springfield"
                  v-model="form.city" :error="errors.city" :error-message="ERROR_MESSAGES.city"
                  @blur="onBlur('city')" @update:model-value="onInput('city')"
                />
                <FormField
                  id="zip" label="ZIP / Postal Code" placeholder="62704"
                  v-model="form.zip" :error="errors.zip" :error-message="ERROR_MESSAGES.zip"
                  @blur="onBlur('zip')" @update:model-value="onInput('zip')"
                />
              </div>
              <FormField
                id="country" label="Country" as="select"
                v-model="form.country" :error="errors.country" :error-message="ERROR_MESSAGES.country"
                @blur="onBlur('country')" @update:model-value="onInput('country')"
              >
                <option value="">Select country</option>
                <option v-for="c in COUNTRIES" :key="c">{{ c }}</option>
              </FormField>
              <LocationPicker
                v-model="location" :error="errors.location" :error-message="ERROR_MESSAGES.location"
              />
            </div>

            <div class="checkout-section">
              <h3><i class="fa-solid fa-credit-card"></i> Payment Method</h3>
              <p v-if="errors.payment" class="text-muted" style="color:var(--color-danger);margin-bottom:var(--sp-3)">{{ ERROR_MESSAGES.payment }}</p>
              <p v-if="!paymentMethods.length" class="text-muted">No payment methods are available right now. Please contact support.</p>
              <div v-else class="payment-methods">
                <label v-for="method in paymentMethods" :key="method.id" class="radio-card">
                  <input v-model="payment" type="radio" name="payment" :value="method.code">
                  <span class="radio-card__meta">
                    <strong>{{ method.name }}</strong>
                    <span v-if="method.code === 'cod'">Pay when your order arrives</span>
                    <span v-else>Transfer funds and upload your receipt</span>
                  </span>
                  <i class="fa-solid" :class="paymentIcon(method.code)" style="font-size:1.2rem;color:var(--color-text-muted)"></i>
                </label>
              </div>

              <div v-if="isBankTransfer" style="margin-top:var(--sp-5)">
                <div v-if="displayBankDetails" class="account-card" style="margin-bottom:var(--sp-4)">
                  <div class="account-card__head"><div><h3 style="font-size:var(--fs-md)">Bank Details</h3></div></div>
                  <p v-if="displayBankDetails.bank_name"><strong>Bank:</strong> {{ displayBankDetails.bank_name }}</p>
                  <p v-if="displayBankDetails.account_title"><strong>Account Title:</strong> {{ displayBankDetails.account_title }}</p>
                  <p v-if="displayBankDetails.account_number"><strong>Account Number:</strong> {{ displayBankDetails.account_number }}</p>
                  <p v-if="displayBankDetails.iban"><strong>IBAN:</strong> {{ displayBankDetails.iban }}</p>
                  <p v-if="displayBankDetails.branch"><strong>Branch:</strong> {{ displayBankDetails.branch }}</p>
                  <p v-if="displayBankDetails.swift_code"><strong>SWIFT:</strong> {{ displayBankDetails.swift_code }}</p>
                  <p v-if="displayBankDetails.instructions" class="text-muted" style="margin-top:var(--sp-3)">{{ displayBankDetails.instructions }}</p>
                </div>

                <FormField
                  id="paymentReference" label="Payment Reference (optional)" placeholder="Transaction / deposit reference"
                  v-model="paymentReference"
                />

                <div class="field" :class="{ 'has-error': errors.paymentReceipt }">
                  <label for="paymentReceipt">Payment Receipt <span class="text-muted">(required)</span></label>
                  <input
                    id="paymentReceipt"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.webp,image/*,application/pdf"
                    @change="onReceiptChange"
                  >
                  <span class="error-msg">{{ ERROR_MESSAGES.paymentReceipt }}</span>
                </div>
              </div>
            </div>

            <div class="checkout-section">
              <h3><i class="fa-regular fa-note-sticky"></i> Order Notes <span class="text-muted" style="font-weight:400;font-size:var(--fs-xs)">(optional)</span></h3>
              <textarea v-model="form.notes" rows="3" placeholder="Delivery instructions, gate code, preferred contact method…" style="width:100%;border:1.5px solid var(--color-border);border-radius:var(--radius-sm);padding:0.8rem 1rem"></textarea>
            </div>
          </div>

          <div>
            <div class="summary-card" style="position:sticky;top:calc(var(--header-h) + 20px)">
              <h3>Order Summary</h3>
              <div class="checkout-order-items">
                <div v-for="item in items" :key="item.cartItemId || `${item.productId}::${item.productVariationId || ''}`" class="checkout-order-item">
                  <img :src="item.product.images[0]" :alt="item.product.name">
                  <div>
                    <div class="checkout-order-item__name">{{ item.product.name }} <span class="badge-qty">&times;{{ item.qty }}</span></div>
                    <div v-if="item.variation" class="checkout-order-item__variant">{{ item.variation }}</div>
                    <div v-if="item.inStock === false" class="checkout-order-item__oos">Out of stock — remove from cart to continue</div>
                  </div>
                  <div class="checkout-order-item__price">{{ formatCurrency(item.lineTotal) }}</div>
                </div>
              </div>
              <div class="summary-row"><span>Subtotal</span><span>{{ formatCurrency(totals.subtotal) }}</span></div>
              <div v-if="totals.discount" class="summary-row"><span>Product Discount</span><span class="discount-val">&minus;{{ formatCurrency(totals.discount) }}</span></div>
              <VoucherApply compact />
              <div v-if="totals.voucherDiscount" class="summary-row"><span>Voucher</span><span class="discount-val">&minus;{{ formatCurrency(totals.voucherDiscount) }}</span></div>
              <div class="summary-row">
                <span>Delivery</span>
                <span>
                  <template v-if="checkingDelivery">Checking…</template>
                  <template v-else-if="deliveryOutOfArea">&mdash;</template>
                  <template v-else-if="deliveryFee === null">Select a delivery location</template>
                  <template v-else-if="deliveryFree || deliveryFee === 0">FREE</template>
                  <template v-else>{{ formatCurrency(deliveryFee) }}</template>
                </span>
              </div>
              <div class="summary-row"><span>{{ taxLineLabel(totals.taxPercent, totals.taxType) }}</span><span>{{ formatCurrency(totals.tax) }}</span></div>
              <div v-if="totals.taxDiscount" class="summary-row"><span>{{ taxDiscountLineLabel(totals.taxDiscountPercent) }}</span><span>{{ formatCurrency(totals.taxDiscount) }}</span></div>
              <div class="summary-row total"><span>Total</span><span>{{ formatCurrency(displayTotal) }}</span></div>
              <p v-if="hasOutOfStockItems" class="checkout-oos-note">
                <i class="fa-solid fa-triangle-exclamation"></i>
                One or more items are out of stock. Go back to your cart to remove them before placing this order.
              </p>
              <p v-if="deliveryOutOfArea" class="checkout-oos-note">
                <i class="fa-solid fa-triangle-exclamation"></i>
                {{ deliveryMessage }}
              </p>
              <button type="submit" class="btn btn-primary btn-block" :disabled="submitting || hasOutOfStockItems || deliveryOutOfArea || checkingDelivery">
                <i class="fa-solid" :class="submitting ? 'fa-spinner spin' : 'fa-lock'"></i>
                {{ submitting ? 'Placing Order…' : 'Place Order' }}
              </button>
              <p class="place-order-note">By placing your order you agree to {{ websiteSettings.business.name }}'s Terms &amp; Conditions and Privacy Policy.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
