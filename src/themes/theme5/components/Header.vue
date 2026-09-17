<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
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

// Floating pill nav: hides on scroll-down, reappears on scroll-up — a
// distinct structural behaviour from the always-sticky headers in the
// other themes.
const hidden = ref(false);
const scrolled = ref(false);
let lastY = 0;
function onScroll() {
  const y = window.scrollY;
  scrolled.value = y > 20;
  hidden.value = y > lastY && y > 140;
  lastY = y;
}
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
  setTimeout(() => router.push({ name: 'home' }), 350);
}
</script>

<template>
  <header class="t5-header" :class="{ hidden, scrolled }">
    <div class="container t5-header__inner">
      <button class="t5-menu-btn" aria-label="Toggle menu" @click="menuOpen = !menuOpen">
        <span></span><span></span>
      </button>

      <RouterLink :to="{ name: 'home' }" class="t5-logo">
        <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:24px;width:auto;object-fit:contain" @error="logoError = true">
        <template v-else>{{ site.business.name.toUpperCase() }}</template>
      </RouterLink>

      <div class="t5-actions">
        <button class="t5-action" aria-label="Select store" @click="branch.openModal()">
          <i class="fa-regular fa-location-dot"></i>
        </button>
        <RouterLink :to="{ name: 'wishlist' }" class="t5-action" aria-label="Wishlist">
          <i class="fa-regular fa-heart"></i>
          <span v-if="wishlist.count" class="t5-dot"></span>
        </RouterLink>
        <RouterLink :to="auth.currentUser ? { name: 'account' } : { name: 'login' }" class="t5-action" aria-label="Account">
          <i class="fa-regular fa-user"></i>
        </RouterLink>
        <RouterLink :to="{ name: 'cart' }" class="t5-action" aria-label="Cart">
          <i class="fa-regular fa-bag-shopping" :class="{ 't5-bump': cartBump }"></i>
          <span v-if="cart.count" class="t5-badge">{{ cart.count }}</span>
        </RouterLink>
      </div>
    </div>
    <nav class="t5-nav">
      <RouterLink :to="{ name: 'home' }">Home</RouterLink>
      <RouterLink :to="{ name: 'shop' }">Shop</RouterLink>
      <RouterLink :to="{ name: 'categories' }">Categories</RouterLink>
      <RouterLink :to="{ name: 'about' }">About</RouterLink>
      <RouterLink :to="{ name: 'contact' }">Contact</RouterLink>
    </nav>
  </header>

  <Transition name="t5-menu">
    <div v-if="menuOpen" class="t5-menu">
      <button class="t5-menu__close" aria-label="Close menu" @click="menuOpen = false"><i class="fa-regular fa-xmark"></i></button>
      <nav class="t5-menu__nav">
        <RouterLink :to="{ name: 'home' }" @click="menuOpen = false">Home</RouterLink>
        <RouterLink :to="{ name: 'shop' }" @click="menuOpen = false">Shop</RouterLink>
        <RouterLink :to="{ name: 'categories' }" @click="menuOpen = false">Categories</RouterLink>
        <RouterLink :to="{ name: 'shop', query: { filter: 'deal' } }" @click="menuOpen = false">Offers</RouterLink>
        <RouterLink :to="{ name: 'about' }" @click="menuOpen = false">About</RouterLink>
        <RouterLink :to="{ name: 'contact' }" @click="menuOpen = false">Contact</RouterLink>
      </nav>
      <div class="t5-menu__cats">
        <span v-for="c in categories" :key="c.id" @click="router.push({ name: 'shop', query: { category: c.id } }); menuOpen = false">{{ c.name }}</span>
      </div>
      <div class="t5-menu__foot">
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
.t5-header {
  position: sticky; top: var(--sp-4); z-index: var(--z-header);
  max-width: min(720px, calc(100% - 32px)); margin-inline: auto;
  background: rgba(255,255,255,0.72); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border); border-radius: var(--radius-pill);
  box-shadow: var(--shadow-md);
  transition: transform var(--dur-base) var(--ease-premium), opacity var(--dur-base) var(--ease-premium), background var(--dur-base);
}
.t5-header.scrolled { background: rgba(255,255,255,0.9); }
.t5-header.hidden { transform: translateY(-140%); opacity: 0; }

.t5-header__inner { display: flex; align-items: center; justify-content: space-between; height: 56px; padding-inline: var(--sp-5); }
.t5-menu-btn { width: 30px; height: 20px; display: flex; flex-direction: column; justify-content: space-between; }
.t5-menu-btn span { display: block; height: 1px; background: var(--color-text); transition: width var(--dur-base); }
.t5-menu-btn span:last-child { width: 60%; align-self: flex-end; }
.t5-menu-btn:hover span { width: 100%; }

.t5-logo { font-family: var(--font-display); font-weight: 600; font-size: 0.95rem; letter-spacing: 0.28em; color: var(--color-text); }

.t5-actions { display: flex; align-items: center; gap: var(--sp-4); }
.t5-action { position: relative; color: var(--color-text-soft); font-size: 1rem; transition: color var(--dur-fast); }
.t5-action:hover { color: var(--color-accent); }
.t5-dot { position: absolute; top: -2px; right: -4px; width: 6px; height: 6px; border-radius: 50%; background: var(--color-accent); }
.t5-badge {
  position: absolute; top: -9px; right: -11px; min-width: 16px; height: 16px; padding: 0 3px;
  background: var(--color-text); color: #fff; border-radius: 999px; font-size: 9px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.t5-bump { animation: t5Pulse var(--dur-slow) var(--ease-premium); }
@keyframes t5Pulse { 50% { transform: scale(1.2); } }

.t5-nav { display: flex; justify-content: center; gap: var(--sp-6); padding-bottom: 14px; }
.t5-nav a { font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-text-muted); transition: color var(--dur-fast); }
.t5-nav a:hover, .t5-nav a.router-link-exact-active { color: var(--color-text); }
@media (max-width: 720px) { .t5-nav { display: none; } }

/* ---------- Fullscreen menu ---------- */
.t5-menu-enter-active, .t5-menu-leave-active { transition: opacity var(--dur-slow) var(--ease-premium); }
.t5-menu-enter-from, .t5-menu-leave-to { opacity: 0; }
.t5-menu {
  position: fixed; inset: 0; z-index: var(--z-drawer); background: var(--color-bg);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--sp-6);
  padding: var(--sp-8);
}
.t5-menu__close { position: absolute; top: var(--sp-6); right: var(--sp-6); font-size: 1.3rem; color: var(--color-text); }
.t5-menu__nav { display: flex; flex-direction: column; align-items: center; gap: var(--sp-3); }
.t5-menu__nav a { font-family: var(--font-display); font-weight: 300; font-size: clamp(1.6rem, 4vw, 2.4rem); letter-spacing: 0.03em; color: var(--color-text); transition: color var(--dur-base); }
.t5-menu__nav a:hover { color: var(--color-accent); }
.t5-menu__cats { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--sp-4); max-width: 620px; }
.t5-menu__cats span { color: var(--color-text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: color var(--dur-fast); }
.t5-menu__cats span:hover { color: var(--color-accent); }
.t5-menu__foot { display: flex; gap: var(--sp-5); }
.t5-menu__foot a, .t5-menu__foot button { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text); border-bottom: 1px solid var(--color-text); padding-bottom: 2px; }
</style>
