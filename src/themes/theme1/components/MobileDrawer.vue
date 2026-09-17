<script setup>
import { ref, onMounted } from 'vue';
import { fetchCategories } from '@/services/categories';
import { useBranchStore } from '@/stores/branch';
import { useAuthStore } from '@/stores/auth';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { useRouter } from 'vue-router';
import { showToast } from '@/composables/useToast';

defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(['close']);

const categories = ref([]);
onMounted(async () => {
  categories.value = await fetchCategories();
});

const branch = useBranchStore();
const auth = useAuthStore();
const site = useWebsiteSettingsStore();
const logoError = ref(false);
const router = useRouter();

function openBranch() {
  emit('close');
  branch.openModal();
}
function logout() {
  auth.logout();
  emit('close');
  showToast('You have been signed out.', 'info');
  setTimeout(() => router.push({ name: 'home' }), 400);
}
</script>

<template>
  <aside class="mobile-drawer" :class="{ open }" aria-label="Mobile menu">
    <div class="mobile-drawer__head">
      <RouterLink :to="{ name: 'home' }" class="logo" @click="emit('close')">
        <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:28px;width:auto;object-fit:contain" @error="logoError = true">
        <template v-else>
          <span class="logo__mark"><i class="fa-solid fa-basket-shopping"></i></span>
          <span style="color:var(--color-primary)">{{ site.business.name }}</span>
        </template>
      </RouterLink>
      <button class="btn-icon" aria-label="Close menu" @click="emit('close')"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <button class="mobile-drawer__branch" type="button" @click="openBranch">
      <i class="fa-solid fa-location-dot"></i>
      <span>Delivering from <strong>{{ branch.selectedBranch?.name || 'Select store' }}</strong></span>
      <i class="fa-solid fa-chevron-right"></i>
    </button>

    <nav class="mobile-drawer__nav">
      <RouterLink :to="{ name: 'home' }" @click="emit('close')">Home <i class="fa-solid fa-chevron-right"></i></RouterLink>
      <RouterLink :to="{ name: 'shop' }" @click="emit('close')">Shop <i class="fa-solid fa-chevron-right"></i></RouterLink>
      <RouterLink :to="{ name: 'categories' }" @click="emit('close')">Categories <i class="fa-solid fa-chevron-right"></i></RouterLink>
      <RouterLink :to="{ name: 'shop', query: { filter: 'deal' } }" @click="emit('close')">Deals <i class="fa-solid fa-chevron-right"></i></RouterLink>
      <RouterLink :to="{ name: 'about' }" @click="emit('close')">About <i class="fa-solid fa-chevron-right"></i></RouterLink>
      <RouterLink :to="{ name: 'contact' }" @click="emit('close')">Contact <i class="fa-solid fa-chevron-right"></i></RouterLink>
      <RouterLink :to="{ name: 'cart' }" @click="emit('close')">Cart <i class="fa-solid fa-chevron-right"></i></RouterLink>
    </nav>

    <div class="mobile-drawer__cats">
      <h4>Shop by Category</h4>
      <div>
        <RouterLink
          v-for="c in categories"
          :key="c.id"
          :to="{ name: 'shop', query: { category: c.id } }"
          @click="emit('close')"
        ><i class="fa-solid" :class="c.icon"></i> {{ c.name }}</RouterLink>
      </div>
    </div>

    <div class="mobile-drawer__foot">
      <template v-if="auth.currentUser">
        <RouterLink :to="{ name: 'account' }" class="btn btn-outline btn-block btn-sm" @click="emit('close')">
          <i class="fa-regular fa-user"></i> My Profile
        </RouterLink>
        <button type="button" class="btn btn-primary btn-block btn-sm" @click="logout">Logout</button>
      </template>
      <template v-else>
        <RouterLink :to="{ name: 'login' }" class="btn btn-outline btn-block btn-sm" @click="emit('close')">Sign In</RouterLink>
        <RouterLink :to="{ name: 'signup' }" class="btn btn-primary btn-block btn-sm" @click="emit('close')">Register</RouterLink>
      </template>
    </div>
  </aside>
</template>
