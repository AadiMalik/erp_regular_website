// Smart Mart — Checkout page: order review, delivery/payment selection, validation.

import { qs, qsa, formatCurrency, escapeHtml } from '../core/utils.js';
import { getCartDetailed, getCartSubtotal, getCoupon, clearCart } from '../core/store.js';
import { showToast } from '../core/toast.js';
import { getCurrentUser } from '../core/auth.js';
import { createOrder } from '../core/orders.js';
import { getSelectedBranchId } from '../core/branch.js';

const DELIVERY_PRICES = { standard: null, express: 7.99, scheduled: 2.99 }; // null = free-over-50 logic

if (getCartDetailed().length === 0) {
  qs('[data-checkout-empty]').hidden = false;
  qs('[data-checkout-content]').hidden = true;
} else {
  init();
}

function init() {
  prefillFromAccount();
  renderOrderItems();
  renderTotals();
  wireDeliveryMethod();
  wirePaymentMethod();
  wireValidation();
  wireSubmit();
}

function prefillFromAccount() {
  const user = getCurrentUser();
  if (!user) return;
  const form = qs('[data-checkout-form]');
  form.fullName.value = user.name;
  form.email.value = user.email;
  form.phone.value = user.phone || '';
  const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
  if (defaultAddr) {
    form.address.value = defaultAddr.address;
    form.city.value = defaultAddr.city;
    form.zip.value = defaultAddr.zip;
    if ([...form.country.options].some((o) => o.value === defaultAddr.country)) form.country.value = defaultAddr.country;
  }
}

function renderOrderItems() {
  const items = getCartDetailed();
  qs('[data-checkout-items]').innerHTML = items.map((item) => `
    <div class="checkout-order-item">
      <img src="${item.product.images[0]}" alt="${escapeHtml(item.product.name)}">
      <div>
        <div class="checkout-order-item__name">${escapeHtml(item.product.name)} <span class="badge-qty">×${item.qty}</span></div>
        ${item.variation ? `<div class="checkout-order-item__variant">${item.product.variations.label}: ${escapeHtml(item.variation)}</div>` : ''}
      </div>
      <div class="checkout-order-item__price">${formatCurrency(item.lineTotal)}</div>
    </div>
  `).join('');
}

function currentDeliveryMethod() {
  return qs('input[name="delivery"]:checked')?.value || 'standard';
}

function computeCheckoutTotals() {
  const subtotal = getCartSubtotal();
  const coupon = getCoupon();
  const discount = coupon ? +(subtotal * (coupon.pct / 100)).toFixed(2) : 0;
  const method = currentDeliveryMethod();
  const shipping = method === 'standard' ? (subtotal >= 50 ? 0 : 4.99) : DELIVERY_PRICES[method];
  const taxable = subtotal - discount;
  const tax = +(taxable * 0.05).toFixed(2);
  const total = +(taxable + tax + shipping).toFixed(2);
  return { subtotal, discount, shipping, tax, total };
}

function renderTotals() {
  const { subtotal, discount, shipping, tax, total } = computeCheckoutTotals();
  qs('[data-co-subtotal]').textContent = formatCurrency(subtotal);
  qs('[data-co-discount]').textContent = `−${formatCurrency(discount)}`;
  qs('[data-co-shipping]').textContent = shipping === 0 ? 'FREE' : formatCurrency(shipping);
  qs('[data-co-tax]').textContent = formatCurrency(tax);
  qs('[data-co-total]').textContent = formatCurrency(total);
  qs('[data-delivery-price]').textContent = subtotal >= 50 ? 'FREE' : '$4.99';
}

function wireDeliveryMethod() {
  qsa('input[name="delivery"]').forEach((el) => el.addEventListener('change', renderTotals));
}

function wirePaymentMethod() {
  const cardFields = qs('[data-card-fields]');
  const update = () => {
    const isCard = qs('input[name="payment"]:checked').value === 'card';
    cardFields.style.display = isCard ? '' : 'none';
  };
  qsa('[data-payment-option]').forEach((el) => el.addEventListener('change', update));
  update();
}

const VALIDATORS = {
  fullName: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: (v) => v.replace(/[^0-9]/g, '').length >= 7,
  address: (v) => v.trim().length >= 4,
  city: (v) => v.trim().length >= 2,
  zip: (v) => v.trim().length >= 3,
  country: (v) => v.trim().length > 0,
  cardNumber: (v) => v.replace(/\s/g, '').length === 16 && /^[0-9\s]+$/.test(v),
  cardExpiry: (v) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim()),
  cardCvv: (v) => /^[0-9]{3,4}$/.test(v.trim()),
};

function wireValidation() {
  const form = qs('[data-checkout-form]');
  qsa('[data-field] input, [data-field] select', form).forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      const wrap = input.closest('[data-field]');
      if (wrap.classList.contains('has-error')) validateField(input);
    });
  });

  // Auto-format card number / expiry as the user types.
  const cardNumber = qs('#cardNumber');
  cardNumber?.addEventListener('input', () => {
    cardNumber.value = cardNumber.value.replace(/[^0-9]/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  });
  const cardExpiry = qs('#cardExpiry');
  cardExpiry?.addEventListener('input', () => {
    let v = cardExpiry.value.replace(/[^0-9]/g, '').slice(0, 4);
    if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    cardExpiry.value = v;
  });
}

function validateField(input) {
  const wrap = input.closest('[data-field]');
  const key = wrap.dataset.field;
  const validator = VALIDATORS[key];
  const valid = validator ? validator(input.value) : true;
  wrap.classList.toggle('has-error', !valid);
  return valid;
}

function isCardPayment() {
  return qs('input[name="payment"]:checked').value === 'card';
}

function validateAll() {
  const form = qs('[data-checkout-form]');
  const cardActive = isCardPayment();
  let firstInvalid = null;
  let allValid = true;

  qsa('[data-field]', form).forEach((wrap) => {
    const isCardField = ['cardNumber', 'cardExpiry', 'cardCvv'].includes(wrap.dataset.field);
    if (isCardField && !cardActive) { wrap.classList.remove('has-error'); return; }
    const input = qs('input, select', wrap);
    const valid = validateField(input);
    if (!valid) { allValid = false; firstInvalid = firstInvalid || input; }
  });

  if (firstInvalid) firstInvalid.focus();
  return allValid;
}

function wireSubmit() {
  const form = qs('[data-checkout-form]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateAll()) {
      showToast('Please fix the highlighted fields before continuing.', 'error');
      return;
    }
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Placing Order…';

    setTimeout(() => {
      const items = getCartDetailed().map((item) => ({
        productId: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        image: item.product.images[0],
        variation: item.variation,
        qty: item.qty,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      }));
      const totals = computeCheckoutTotals();
      const user = getCurrentUser();

      const order = createOrder({
        items,
        totals,
        address: {
          fullName: form.fullName.value.trim(),
          email: form.email.value.trim(),
          phone: form.phone.value.trim(),
          address: form.address.value.trim(),
          city: form.city.value.trim(),
          zip: form.zip.value.trim(),
          country: form.country.value,
        },
        deliveryMethod: currentDeliveryMethod(),
        paymentMethod: qs('input[name="payment"]:checked').value,
        branchId: getSelectedBranchId(),
        userId: user ? user.id : null,
        notes: form.notes.value.trim(),
      });

      clearCart();
      window.location.href = `order-success.html?order=${order.id}`;
    }, 900);
  });
}
