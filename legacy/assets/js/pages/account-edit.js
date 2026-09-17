// Smart Mart — Edit Profile page: personal info + address book management.

import { qs, qsa } from '../core/utils.js';
import { requireAuth } from '../core/account-nav.js';
import { updateProfile, saveAddress, deleteAddress, getCurrentUser } from '../core/auth.js';
import { addressCardMarkup } from '../core/order-ui.js';
import { showToast } from '../core/toast.js';

let user = requireAuth();
if (user) init();

function init() {
  fillProfileForm();
  renderAddresses();
  wireProfileForm();
  wireAddressActions();
}

function fillProfileForm() {
  qs('#name').value = user.name;
  qs('#email').value = user.email;
  qs('#phone').value = user.phone || '';
}

function wireProfileForm() {
  const form = qs('[data-profile-form]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = qs('#name', form);
    const phone = qs('#phone', form);
    const nameValid = name.value.trim().length >= 2;
    const phoneValid = phone.value.replace(/[^0-9]/g, '').length >= 7;
    name.closest('[data-field]').classList.toggle('has-error', !nameValid);
    phone.closest('[data-field]').classList.toggle('has-error', !phoneValid);
    if (!nameValid || !phoneValid) return;

    updateProfile(user.id, { name: name.value.trim(), phone: phone.value.trim() });
    user = getCurrentUser();
    showToast('Profile updated successfully.', 'success');
  });
}

function renderAddresses() {
  const container = qs('[data-address-list]');
  container.innerHTML = user.addresses.map(addressCardMarkup).join('') +
    `<div class="add-address-card" data-add-address-inline><i class="fa-solid fa-plus"></i> Add a new address</div>`;
}

/* ---------------- Address modal ---------------- */

let overlayEl = null;

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box address-modal">
      <button class="modal-close" data-modal-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      <h2 data-address-modal-title>Add Address</h2>
      <form data-address-form novalidate>
        <input type="hidden" name="addressId">
        <div class="field" data-field="label">
          <label for="addr-label">Label</label>
          <select id="addr-label" name="label">
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="field-row">
          <div class="field" data-field="fullName">
            <label for="addr-name">Full Name</label>
            <input id="addr-name" name="fullName">
            <span class="error-msg">Please enter a name.</span>
          </div>
          <div class="field" data-field="phone">
            <label for="addr-phone">Phone</label>
            <input id="addr-phone" name="phone">
            <span class="error-msg">Please enter a valid phone number.</span>
          </div>
        </div>
        <div class="field" data-field="address">
          <label for="addr-street">Street Address</label>
          <input id="addr-street" name="address">
          <span class="error-msg">Please enter a street address.</span>
        </div>
        <div class="field-row">
          <div class="field" data-field="city">
            <label for="addr-city">City</label>
            <input id="addr-city" name="city">
            <span class="error-msg">Please enter a city.</span>
          </div>
          <div class="field" data-field="zip">
            <label for="addr-zip">ZIP / Postal Code</label>
            <input id="addr-zip" name="zip">
            <span class="error-msg">Please enter a ZIP code.</span>
          </div>
        </div>
        <div class="field" data-field="country">
          <label for="addr-country">Country</label>
          <select id="addr-country" name="country">
            <option>United States</option>
            <option>Canada</option>
            <option>United Kingdom</option>
            <option>Australia</option>
            <option>Pakistan</option>
          </select>
        </div>
        <label class="field-check" style="margin-bottom:var(--sp-5)"><input type="checkbox" name="isDefault"> Set as default address</label>
        <button type="submit" class="btn btn-primary btn-block"><i class="fa-solid fa-check"></i> Save Address</button>
      </form>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('[data-modal-close]')) closeModal();
  });
  qs('[data-address-form]', overlay).addEventListener('submit', onAddressSubmit);
  return overlay;
}

function openModal(address = null) {
  if (!overlayEl) overlayEl = buildOverlay();
  const form = qs('[data-address-form]', overlayEl);
  form.reset();
  qsa('[data-field]', form).forEach((f) => f.classList.remove('has-error'));
  qs('[data-address-modal-title]', overlayEl).textContent = address ? 'Edit Address' : 'Add Address';
  if (address) {
    form.addressId.value = address.id;
    form.label.value = address.label;
    form.fullName.value = address.fullName;
    form.phone.value = address.phone;
    form.address.value = address.address;
    form.city.value = address.city;
    form.zip.value = address.zip;
    form.country.value = address.country;
    form.isDefault.checked = !!address.isDefault;
  }
  overlayEl.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlayEl?.classList.remove('open');
  document.body.style.overflow = '';
}

function onAddressSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const required = { fullName: form.fullName, phone: form.phone, address: form.address, city: form.city, zip: form.zip };
  let allValid = true;
  Object.entries(required).forEach(([key, input]) => {
    const valid = input.value.trim().length > 1;
    input.closest('[data-field]').classList.toggle('has-error', !valid);
    if (!valid) allValid = false;
  });
  if (!allValid) return;

  saveAddress(user.id, {
    id: form.addressId.value || undefined,
    label: form.label.value,
    fullName: form.fullName.value.trim(),
    phone: form.phone.value.trim(),
    address: form.address.value.trim(),
    city: form.city.value.trim(),
    zip: form.zip.value.trim(),
    country: form.country.value,
    isDefault: form.isDefault.checked,
  });
  user = getCurrentUser();
  renderAddresses();
  closeModal();
  showToast('Address saved.', 'success');
}

function wireAddressActions() {
  qs('[data-add-address]').addEventListener('click', () => openModal());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  qs('[data-address-list]').addEventListener('click', (e) => {
    const addTile = e.target.closest('[data-add-address-inline]');
    if (addTile) { openModal(); return; }

    const editBtn = e.target.closest('[data-edit-address]');
    if (editBtn) {
      const address = user.addresses.find((a) => a.id === editBtn.dataset.editAddress);
      openModal(address);
      return;
    }
    const defaultBtn = e.target.closest('[data-default-address]');
    if (defaultBtn) {
      const address = user.addresses.find((a) => a.id === defaultBtn.dataset.defaultAddress);
      saveAddress(user.id, { ...address, isDefault: true });
      user = getCurrentUser();
      renderAddresses();
      showToast('Default address updated.', 'success');
      return;
    }
    const deleteBtn = e.target.closest('[data-delete-address]');
    if (deleteBtn) {
      deleteAddress(user.id, deleteBtn.dataset.deleteAddress);
      user = getCurrentUser();
      renderAddresses();
      showToast('Address removed.', 'info');
    }
  });
}
