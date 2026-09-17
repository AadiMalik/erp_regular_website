<script setup>
// Ports the address add/edit modal from assets/js/pages/account-edit.js.

import { reactive, watch } from 'vue';
import BaseModal from '@/components/ui/BaseModal.vue';

const props = defineProps({
  open: { type: Boolean, required: true },
  address: { type: Object, default: null },
});
const emit = defineEmits(['close', 'save']);

const EMPTY = { id: null, label: 'Home', fullName: '', phone: '', address: '', city: '', zip: '', country: 'Pakistan', isDefault: false };

const form = reactive({ ...EMPTY });
const errors = reactive({ fullName: false, phone: false, address: false, city: false, zip: false });

watch(() => props.open, (isOpen) => {
  if (!isOpen) return;
  Object.assign(form, EMPTY, props.address || {});
  Object.keys(errors).forEach((k) => { errors[k] = false; });
});

function validate() {
  errors.fullName = form.fullName.trim().length <= 1;
  errors.phone = form.phone.trim().length <= 1;
  errors.address = form.address.trim().length <= 1;
  errors.city = form.city.trim().length <= 1;
  errors.zip = form.zip.trim().length <= 1;
  return !Object.values(errors).some(Boolean);
}

function submit() {
  if (!validate()) return;
  emit('save', { ...form });
}
</script>

<template>
  <BaseModal :open="open" box-class="address-modal" @close="emit('close')">
    <h2>{{ address ? 'Edit Address' : 'Add Address' }}</h2>
    <form novalidate @submit.prevent="submit">
      <div class="field">
        <label for="addr-label">Label</label>
        <select id="addr-label" v-model="form.label">
          <option value="Home">Home</option>
          <option value="Work">Work</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="field-row">
        <div class="field" :class="{ 'has-error': errors.fullName }">
          <label for="addr-name">Full Name</label>
          <input id="addr-name" v-model="form.fullName">
          <span class="error-msg">Please enter a name.</span>
        </div>
        <div class="field" :class="{ 'has-error': errors.phone }">
          <label for="addr-phone">Phone</label>
          <input id="addr-phone" v-model="form.phone" type="tel" placeholder="03001234567">
          <span class="error-msg">Please enter a valid phone number.</span>
        </div>
      </div>
      <div class="field" :class="{ 'has-error': errors.address }">
        <label for="addr-street">Street Address</label>
        <input id="addr-street" v-model="form.address">
        <span class="error-msg">Please enter a street address.</span>
      </div>
      <div class="field-row">
        <div class="field" :class="{ 'has-error': errors.city }">
          <label for="addr-city">City</label>
          <input id="addr-city" v-model="form.city">
          <span class="error-msg">Please enter a city.</span>
        </div>
        <div class="field" :class="{ 'has-error': errors.zip }">
          <label for="addr-zip">ZIP / Postal Code</label>
          <input id="addr-zip" v-model="form.zip">
          <span class="error-msg">Please enter a ZIP code.</span>
        </div>
      </div>
      <div class="field">
        <label for="addr-country">Country</label>
        <select id="addr-country" v-model="form.country">
          <option>Pakistan</option>
          <option>United States</option>
          <option>Canada</option>
          <option>United Kingdom</option>
          <option>Australia</option>
        </select>
      </div>
      <label class="field-check" style="margin-bottom:var(--sp-5)">
        <input v-model="form.isDefault" type="checkbox"> Set as default address
      </label>
      <button type="submit" class="btn btn-primary btn-block"><i class="fa-solid fa-check"></i> Save Address</button>
    </form>
  </BaseModal>
</template>
