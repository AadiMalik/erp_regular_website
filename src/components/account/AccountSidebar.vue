<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';

defineProps({ active: { type: String, required: true } });

const auth = useAuthStore();
const router = useRouter();

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?';
}

function logout() {
  auth.logout();
  showToast('You have been signed out.', 'info');
  setTimeout(() => router.push({ name: 'home' }), 500);
}
</script>

<template>
  <nav class="account-nav">
    <div class="account-nav__user">
      <span class="account-nav__avatar">
        <img v-if="auth.currentUser?.profile_image" :src="auth.currentUser.profile_image" :alt="auth.currentUser?.name">
        <template v-else>{{ initials(auth.currentUser?.name) }}</template>
      </span>
      <div><strong>{{ auth.currentUser?.name }}</strong><span>{{ auth.currentUser?.email }}</span></div>
    </div>
    <RouterLink :to="{ name: 'account' }" :class="{ active: active === 'profile' }"><i class="fa-regular fa-user"></i> Profile</RouterLink>
    <RouterLink :to="{ name: 'account-edit' }" :class="{ active: active === 'edit' }"><i class="fa-solid fa-pen"></i> Edit Profile</RouterLink>
    <RouterLink :to="{ name: 'orders' }" :class="{ active: active === 'orders' }"><i class="fa-solid fa-bag-shopping"></i> My Orders</RouterLink>
    <RouterLink :to="{ name: 'account-password' }" :class="{ active: active === 'password' }"><i class="fa-solid fa-lock"></i> Change Password</RouterLink>
    <hr>
    <button type="button" class="danger" @click="logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
  </nav>
</template>
