<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';
import { useBranchStore } from '@/stores/branch';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { fetchCategories } from '@/services/categories';
import { showToast } from '@/composables/useToast';

const cart = useCartStore();
const wishlist = useWishlistStore();
const auth = useAuthStore();
const branch = useBranchStore();
const site = useWebsiteSettingsStore();
const logoError = ref(false);
const router = useRouter();

const categories = ref([]);
onMounted(async () => { categories.value = await fetchCategories(); });

const scrolled = ref(false);
function onScroll() { scrolled.value = window.scrollY > 40; }
onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});
onUnmounted(() => window.removeEventListener('scroll', onScroll));

const cartBump = ref(false);
watch(() => cart.count, () => {
  cartBump.value = false;
  requestAnimationFrame(() => { cartBump.value = true; });
});

const menuOpen = ref(false);
function logout() {
  auth.logout();
  menuOpen.value = false;
  showToast('You have been signed out.', 'info');
  setTimeout(() => router.push({ name: 'home' }), 400);
}
</script>

<template>
  <header class="t3-header" :class="{ scrolled }">
    <div class="container t3-header__inner">
      <button class="t3-menu-btn" aria-label="Toggle menu" @click="menuOpen = !menuOpen">
        <span></span><span></span><span></span>
      </button>

      <RouterLink :to="{ name: 'home' }" class="t3-logo">
        <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:28px;width:auto;object-fit:contain" @error="logoError = true">
        <template v-else>{{ site.business.name }}</template>
      </RouterLink>

      <div class="t3-actions">
        <button class="t3-action" aria-label="Select store" @click="branch.openModal()">
          <i class="fa-solid fa-location-dot"></i>
          <span class="t3-action__label">{{ branch.selectedBranch?.name || 'Select Store' }}</span>
        </button>
        <RouterLink :to="{ name: 'wishlist' }" class="t3-action" aria-label="Wishlist">
          <i class="fa-regular fa-heart"></i>
          <span v-if="wishlist.count" class="t3-count">{{ wishlist.count }}</span>
        </RouterLink>
        <RouterLink :to="auth.currentUser ? { name: 'account' } : { name: 'login' }" class="t3-action" aria-label="Account">
          <i class="fa-solid fa-user"></i>
        </RouterLink>
        <RouterLink :to="{ name: 'cart' }" class="t3-action" aria-label="Cart">
          <i class="fa-solid fa-bag-shopping" :class="{ 't3-bump': cartBump }"></i>
          <span v-if="cart.count" class="t3-count">{{ cart.count }}</span>
        </RouterLink>
      </div>
    </div>
  </header>

  <Transition name="t3-menu">
    <div v-if="menuOpen" class="t3-menu">
      <button class="t3-menu__close" aria-label="Close menu" @click="menuOpen = false"><i class="fa-solid fa-xmark"></i></button>
      <nav class="t3-menu__nav">
        <RouterLink :to="{ name: 'home' }" @click="menuOpen = false">Home</RouterLink>
        <RouterLink :to="{ name: 'shop' }" @click="menuOpen = false">Shop</RouterLink>
        <RouterLink :to="{ name: 'categories' }" @click="menuOpen = false">Categories</RouterLink>
        <RouterLink :to="{ name: 'shop', query: { filter: 'deal' } }" @click="menuOpen = false">Edit &amp; Deals</RouterLink>
        <RouterLink :to="{ name: 'about' }" @click="menuOpen = false">About</RouterLink>
        <RouterLink :to="{ name: 'contact' }" @click="menuOpen = false">Contact</RouterLink>
      </nav>
      <div class="t3-menu__cats">
        <span v-for="c in categories" :key="c.id" @click="router.push({ name: 'shop', query: { category: c.id } }); menuOpen = false">{{ c.name }}</span>
      </div>
      <div class="t3-menu__foot">
        <template v-if="auth.currentUser">
          <RouterLink :to="{ name: 'account' }" @click="menuOpen = false">My Profile</RouterLink>
          <button @click="logout">Logout</button>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'login' }" @click="menuOpen = false">Sign In</RouterLink>
          <RouterLink :to="{ name: 'signup' }" @click="menuOpen = false">Create Account</RouterLink>
        </template>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.t3-header {
  position: sticky; top: 0; z-index: var(--z-header);
  background: rgba(28,25,23,0.72); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  transition: background var(--dur-slow) var(--ease-premium), padding var(--dur-slow) var(--ease-premium);
}
.t3-header.scrolled { background: rgba(28,25,23,0.96); border-bottom-color: var(--color-gold); }
.t3-header__inner { display: flex; align-items: center; justify-content: space-between; height: 96px; transition: height var(--dur-slow) var(--ease-premium); }
.t3-header.scrolled .t3-header__inner { height: 74px; }

.t3-logo { font-family: var(--font-display); font-size: 1.6rem; letter-spacing: 0.04em; color: #fff; font-weight: 600; }
.t3-logo em { font-style: italic; color: var(--color-gold); }

.t3-menu-btn { width: 40px; height: 32px; display: flex; flex-direction: column; justify-content: space-between; }
.t3-menu-btn span { display: block; height: 1px; background: #fff; width: 100%; transition: width var(--dur-base) var(--ease-out); }
.t3-menu-btn:hover span:nth-child(1) { width: 70%; }
.t3-menu-btn:hover span:nth-child(3) { width: 55%; }

.t3-actions { display: flex; align-items: center; gap: var(--sp-5); }
.t3-action { position: relative; display: flex; align-items: center; gap: 8px; color: #fff; font-size: 1rem; opacity: 0.88; transition: opacity var(--dur-fast); }
.t3-action:hover { opacity: 1; color: var(--color-gold); }
.t3-action__label { font-size: var(--fs-xs); letter-spacing: 0.02em; }
.t3-count {
  position: absolute; top: -8px; right: -10px; min-width: 16px; height: 16px; padding: 0 3px;
  background: var(--color-gold); color: #1c1917; border-radius: 999px; font-size: 9px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.t3-bump { animation: t3Pulse var(--dur-slow) var(--ease-premium); }
@keyframes t3Pulse { 50% { transform: scale(1.25); } }
@media (max-width: 860px) { .t3-action__label { display: none; } }

.t3-menu-enter-active, .t3-menu-leave-active { transition: opacity var(--dur-slow) var(--ease-premium); }
.t3-menu-enter-from, .t3-menu-leave-to { opacity: 0; }
.t3-menu {
  position: fixed; inset: 0; z-index: var(--z-drawer); background: var(--color-secondary);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--sp-6);
  padding: var(--sp-8);
}
.t3-menu__close { position: absolute; top: var(--sp-6); right: var(--sp-6); color: #fff; font-size: 1.4rem; }
.t3-menu__nav { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); }
.t3-menu__nav a { font-family: var(--font-display); font-size: clamp(1.6rem, 4vw, 2.6rem); color: #fff; transition: color var(--dur-base); }
.t3-menu__nav a:hover { color: var(--color-gold); }
.t3-menu__cats { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--sp-4); max-width: 640px; }
.t3-menu__cats span { color: rgba(255,255,255,0.6); font-size: var(--fs-sm); cursor: pointer; transition: color var(--dur-fast); }
.t3-menu__cats span:hover { color: var(--color-gold); }
.t3-menu__foot { display: flex; gap: var(--sp-5); }
.t3-menu__foot a, .t3-menu__foot button { color: #fff; font-size: var(--fs-sm); text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid var(--color-gold); padding-bottom: 3px; }
</style>
