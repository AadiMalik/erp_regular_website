<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';
import { useClickOutside } from '@/composables/useClickOutside';

const auth = useAuthStore();
const router = useRouter();
const open = ref(false);
const rootEl = ref(null);

useClickOutside(rootEl, () => { open.value = false; });

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?';
}

function logout() {
  auth.logout();
  open.value = false;
  showToast('You have been signed out.', 'info');
  setTimeout(() => router.push({ name: 'home' }), 400);
}
</script>

<template>
  <div ref="rootEl" class="dropdown" :class="{ open }">
    <button class="header-action" aria-label="Account" @click.stop="open = !open">
      <i class="fa-regular fa-user"></i>
    </button>
    <div class="dropdown__menu">
      <template v-if="auth.currentUser">
        <div class="account-menu__head">
          <span class="account-menu__avatar">{{ initials(auth.currentUser.name) }}</span>
          <div><strong>{{ auth.currentUser.name }}</strong><span>{{ auth.currentUser.email }}</span></div>
        </div>
        <RouterLink :to="{ name: 'account' }" @click="open = false"><i class="fa-regular fa-user"></i> My Profile</RouterLink>
        <RouterLink :to="{ name: 'orders' }" @click="open = false"><i class="fa-solid fa-bag-shopping"></i> My Orders</RouterLink>
        <RouterLink :to="{ name: 'account-password' }" @click="open = false"><i class="fa-solid fa-lock"></i> Change Password</RouterLink>
        <button type="button" class="danger" @click="logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
      </template>
      <template v-else>
        <RouterLink :to="{ name: 'login' }" @click="open = false"><i class="fa-solid fa-right-to-bracket"></i> Sign In</RouterLink>
        <RouterLink :to="{ name: 'signup' }" @click="open = false"><i class="fa-solid fa-user-plus"></i> Create Account</RouterLink>
        <RouterLink :to="{ name: 'track-order' }" @click="open = false"><i class="fa-solid fa-truck-fast"></i> Track My Order</RouterLink>
      </template>
    </div>
  </div>
</template>
