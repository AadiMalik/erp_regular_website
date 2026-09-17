<script setup>
// Ports assets/js/pages/account-edit.js.

import { reactive, ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';
import PageHeader from '@/components/ui/PageHeader.vue';
import AccountSidebar from '@/components/account/AccountSidebar.vue';
import AddressCard from '@/components/account/AddressCard.vue';
import AddressFormModal from '@/components/account/AddressFormModal.vue';

const auth = useAuthStore();
const user = computed(() => auth.currentUser);

const form = reactive({ name: user.value?.name || '' });
const errors = reactive({ name: false, image: false });
const submitting = ref(false);
const alertMessage = ref('');
const imageFile = ref(null);
const imagePreview = ref(user.value?.profile_image || '');
const fileInput = ref(null);

onMounted(async () => {
  await auth.fetchProfile();
  form.name = user.value?.name || '';
  imagePreview.value = user.value?.profile_image || '';
});

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?';
}

function onImageChange(event) {
  errors.image = false;
  const file = event.target.files?.[0];
  if (!file) {
    imageFile.value = null;
    return;
  }
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!file.type || !allowed.includes(file.type)) {
    errors.image = true;
    imageFile.value = null;
    event.target.value = '';
    alertMessage.value = 'Please upload a valid image file (JPG, PNG or WEBP).';
    return;
  }
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
  alertMessage.value = '';
}

async function submitProfile() {
  alertMessage.value = '';
  errors.name = form.name.trim().length < 2;
  if (errors.name || errors.image) return;

  submitting.value = true;
  const result = await auth.updateProfile(user.value.id, {
    name: form.name.trim(),
    profileImage: imageFile.value,
  });
  submitting.value = false;

  if (!result.ok) {
    alertMessage.value = result.message || 'Failed to update profile.';
    return;
  }
  imagePreview.value = result.user?.profile_image || imagePreview.value;
  imageFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
  showToast('Profile updated successfully.', 'success');
}

const modalOpen = ref(false);
const editingAddress = ref(null);

function openAdd() {
  editingAddress.value = null;
  modalOpen.value = true;
}
function openEdit(address) {
  editingAddress.value = address;
  modalOpen.value = true;
}
async function saveAddress(address) {
  const result = await auth.saveAddress(user.value.id, address);
  if (!result.ok) {
    showToast(result.message || 'Failed to save address.', 'error');
    return;
  }
  modalOpen.value = false;
  showToast('Address saved.', 'success');
}
async function setDefault(address) {
  const result = await auth.saveAddress(user.value.id, { ...address, isDefault: true });
  if (!result.ok) {
    showToast(result.message || 'Failed to update address.', 'error');
    return;
  }
  showToast('Default address updated.', 'success');
}
async function removeAddress(address) {
  const result = await auth.deleteAddress(user.value.id, address.id);
  if (!result.ok) {
    showToast(result.message || 'Failed to remove address.', 'error');
    return;
  }
  showToast('Address removed.', 'info');
}
</script>

<template>
  <PageHeader title="Edit Profile" crumb="Edit Profile" />

  <div class="section">
    <div class="container">
      <div class="account-layout">
        <AccountSidebar active="edit" />

        <div>
          <div class="account-card">
            <div class="account-card__head">
              <div><h3>Personal Information</h3><p>Update your name and profile photo. Email and phone cannot be changed.</p></div>
            </div>
            <div v-if="alertMessage" class="alert-banner error"><i class="fa-solid fa-circle-exclamation"></i><span>{{ alertMessage }}</span></div>
            <form novalidate @submit.prevent="submitProfile">
              <div class="profile-photo-row">
                <div class="profile-photo-preview">
                  <img v-if="imagePreview" :src="imagePreview" alt="Profile photo">
                  <span v-else>{{ initials(form.name || user?.name) }}</span>
                </div>
                <div class="field" :class="{ 'has-error': errors.image }" style="flex:1">
                  <label for="profile_image">Profile Photo</label>
                  <input id="profile_image" ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" @change="onImageChange">
                  <span class="error-msg">Please upload a valid image file (JPG, PNG or WEBP).</span>
                  <small class="text-muted">JPG, PNG or WEBP. Maximum 2 MB.</small>
                </div>
              </div>
              <div class="field-row">
                <div class="field" :class="{ 'has-error': errors.name }">
                  <label for="name">Full Name</label>
                  <input id="name" v-model="form.name" type="text">
                  <span class="error-msg">Please enter your full name.</span>
                </div>
                <div class="field">
                  <label for="email">Email Address</label>
                  <input id="email" type="email" :value="user?.email" disabled style="background:var(--color-bg-alt);color:var(--color-text-muted)">
                </div>
              </div>
              <div class="field">
                <label for="phone">Phone Number</label>
                <input id="phone" type="tel" :value="user?.phone" disabled style="background:var(--color-bg-alt);color:var(--color-text-muted)">
              </div>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <i class="fa-solid" :class="submitting ? 'fa-spinner spin' : 'fa-check'"></i>
                {{ submitting ? 'Saving…' : 'Save Changes' }}
              </button>
            </form>
          </div>

          <div class="account-card">
            <div class="account-card__head">
              <div><h3>Saved Addresses</h3><p>Manage delivery addresses for faster checkout</p></div>
              <button type="button" class="btn btn-outline btn-sm" @click="openAdd"><i class="fa-solid fa-plus"></i> Add Address</button>
            </div>
            <div class="address-grid">
              <AddressCard
                v-for="a in user?.addresses || []"
                :key="a.id"
                :address="a"
                @edit="openEdit"
                @set-default="setDefault"
                @delete="removeAddress"
              />
              <div class="add-address-card" @click="openAdd"><i class="fa-solid fa-plus"></i> Add a new address</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <AddressFormModal :open="modalOpen" :address="editingAddress" @close="modalOpen = false" @save="saveAddress" />
</template>
