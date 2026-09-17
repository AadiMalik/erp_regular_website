<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
const route = useRoute();

const categories = ref([]);
onMounted(async () => { categories.value = await fetchCategories(); });

const scrolled = ref(false);
function onScroll() { scrolled.value = window.scrollY > 24; }
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

const search = ref('');
function submitSearch() {
  router.push({ name: 'shop', query: search.value ? { q: search.value } : {} });
}

const menuOpen = ref(false);
function logout() {
  auth.logout();
  menuOpen.value = false;
  showToast('You have been signed out.', 'info');
  setTimeout(() => router.push({ name: 'home' }), 300);
}
</script>

<template>
  <header class="t6-header" :class="{ scrolled }">
    <div class="container t6-header__top">
      <RouterLink :to="{ name: 'home' }" class="t6-logo">
        <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:32px;width:auto;object-fit:contain" @error="logoError = true">
        <template v-else>
          <span class="t6-logo__mark"><i class="fa-solid fa-basket-shopping"></i></span>
          {{ site.business.name }}
        </template>
      </RouterLink>

      <form class="t6-search" @submit.prevent="submitSearch">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input v-model="search" type="search" placeholder="Search fruits, snacks, dairy...">
      </form>

      <div class="t6-actions">
        <button class="t6-pill" type="button" @click="branch.openModal()">
          <i class="fa-solid fa-location-dot"></i>
          <span>{{ branch.selectedBranch?.name || 'Store' }}</span>
        </button>
        <RouterLink :to="{ name: 'wishlist' }" class="t6-icon" aria-label="Wishlist">
          <i class="fa-solid fa-heart"></i>
          <span v-if="wishlist.count" class="t6-count">{{ wishlist.count }}</span>
        </RouterLink>
        <RouterLink :to="auth.currentUser ? { name: 'account' } : { name: 'login' }" class="t6-icon" aria-label="Account">
          <i class="fa-solid fa-user"></i>
        </RouterLink>
        <RouterLink :to="{ name: 'cart' }" class="t6-icon t6-icon--fill" aria-label="Cart">
          <i class="fa-solid fa-cart-shopping" :class="{ 't6-bump': cartBump }"></i>
          <span v-if="cart.count" class="t6-count t6-count--light">{{ cart.count }}</span>
        </RouterLink>
        <button class="t6-icon t6-menu-toggle" aria-label="Menu" @click="menuOpen = !menuOpen">
          <i class="fa-solid" :class="menuOpen ? 'fa-xmark' : 'fa-bars'"></i>
        </button>
      </div>
    </div>

    <nav class="t6-chips">
      <div class="container t6-chips__row">
        <RouterLink :to="{ name: 'shop', query: { category: c.id } }" v-for="c in categories" :key="c.id" class="t6-chip">
          <i class="fa-solid" :class="c.icon"></i>{{ c.name }}
        </RouterLink>
      </div>
    </nav>
  </header>

  <Transition name="t6-menu">
    <div v-if="menuOpen" class="t6-menu">
      <nav class="t6-menu__nav">
        <RouterLink :to="{ name: 'shop' }" @click="menuOpen = false">Shop</RouterLink>
        <RouterLink :to="{ name: 'categories' }" @click="menuOpen = false">Categories</RouterLink>
        <RouterLink :to="{ name: 'shop', query: { filter: 'deal' } }" @click="menuOpen = false">Deals</RouterLink>
        <RouterLink :to="{ name: 'about' }" @click="menuOpen = false">About</RouterLink>
        <RouterLink :to="{ name: 'contact' }" @click="menuOpen = false">Contact</RouterLink>
      </nav>
      <div class="t6-menu__foot">
        <template v-if="auth.currentUser">
          <RouterLink :to="{ name: 'account' }" class="btn btn-primary" @click="menuOpen = false">My Profile</RouterLink>
          <button class="btn btn-outline" @click="logout">Logout</button>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'login' }" class="btn btn-primary" @click="menuOpen = false">Sign In</RouterLink>
          <RouterLink :to="{ name: 'signup' }" class="btn btn-outline" @click="menuOpen = false">Create Account</RouterLink>
        </template>
      </div>
    </div>
  </Transition>

  <!-- App-style bottom tab bar (mobile only) — a structural pattern unique
       to this theme's "marketplace app" feel. -->
  <nav class="t6-tabbar">
    <RouterLink :to="{ name: 'home' }" :class="{ active: route.name === 'home' }"><i class="fa-solid fa-house"></i><span>Home</span></RouterLink>
    <RouterLink :to="{ name: 'categories' }" :class="{ active: route.name === 'categories' }"><i class="fa-solid fa-grip"></i><span>Browse</span></RouterLink>
    <RouterLink :to="{ name: 'wishlist' }" :class="{ active: route.name === 'wishlist' }">
      <i class="fa-solid fa-heart"></i><span>Wishlist</span>
      <span v-if="wishlist.count" class="t6-tabbar__dot"></span>
    </RouterLink>
    <RouterLink :to="{ name: 'cart' }" :class="{ active: route.name === 'cart' }">
      <i class="fa-solid fa-cart-shopping"></i><span>Cart</span>
      <span v-if="cart.count" class="t6-tabbar__dot"></span>
    </RouterLink>
    <RouterLink :to="auth.currentUser ? { name: 'account' } : { name: 'login' }" :class="{ active: route.name === 'account' }"><i class="fa-solid fa-user"></i><span>Account</span></RouterLink>
  </nav>
</template>

<style scoped>
.t6-header { position: sticky; top: 0; z-index: var(--z-header); background: var(--color-surface); box-shadow: var(--shadow-sm); }
.t6-header.scrolled { box-shadow: var(--shadow-md); }

.t6-header__top { display: flex; align-items: center; gap: var(--sp-5); height: 80px; }
.t6-logo { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 800; font-size: 1.3rem; color: var(--color-secondary); flex-shrink: 0; }
.t6-logo__mark {
  width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); color: #fff; font-size: 1.1rem;
  box-shadow: var(--shadow-glow); transition: transform var(--dur-base) var(--ease-spring);
}
.t6-logo:hover .t6-logo__mark { transform: rotate(-10deg) scale(1.08); }

.t6-search { flex: 1; max-width: 480px; display: flex; align-items: center; gap: 10px; background: var(--color-bg-soft); border-radius: var(--radius-pill); padding: 0.7rem 1.2rem; border: 2px solid transparent; transition: border-color var(--dur-fast), background var(--dur-fast); }
.t6-search:focus-within { border-color: var(--color-primary); background: #fff; }
.t6-search i { color: var(--color-text-faint); }
.t6-search input { flex: 1; background: transparent; font-size: var(--fs-sm); }

.t6-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; flex-shrink: 0; }
.t6-pill { display: flex; align-items: center; gap: 8px; background: var(--color-primary-light); color: var(--color-primary-dark); padding: 0.6rem 1rem; border-radius: var(--radius-pill); font-size: var(--fs-xs); font-weight: 700; }
.t6-icon { position: relative; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--color-bg-soft); color: var(--color-secondary); transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast); }
.t6-icon:hover { transform: translateY(-3px) scale(1.05); background: var(--color-primary-light); }
.t6-icon--fill { background: var(--color-primary); color: #fff; }
.t6-icon--fill:hover { background: var(--color-primary-dark); }
.t6-count { position: absolute; top: -2px; right: -2px; min-width: 18px; height: 18px; padding: 0 4px; background: var(--color-accent); color: #fff; border-radius: 999px; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }
.t6-count--light { border-color: var(--color-primary); }
.t6-bump { animation: t6Pulse var(--dur-slow) var(--ease-premium); }
@keyframes t6Pulse { 50% { transform: scale(1.3) rotate(10deg); } }
.t6-menu-toggle { display: none; }

.t6-chips { border-top: 1px solid var(--color-border); }
.t6-chips__row { display: flex; gap: 10px; overflow-x: auto; padding-block: 12px; scrollbar-width: none; }
.t6-chips__row::-webkit-scrollbar { display: none; }
.t6-chip {
  flex-shrink: 0; display: flex; align-items: center; gap: 8px; padding: 0.55rem 1.05rem;
  background: var(--color-bg-soft); border-radius: var(--radius-pill); font-size: var(--fs-xs); font-weight: 700; color: var(--color-text-soft);
  transition: background var(--dur-fast), color var(--dur-fast), transform var(--dur-fast);
}
.t6-chip i { color: var(--color-primary); }
.t6-chip:hover { background: var(--color-primary); color: #fff; transform: translateY(-2px); }
.t6-chip:hover i { color: #fff; }

@media (max-width: 900px) {
  .t6-search { display: none; }
  .t6-pill span { display: none; }
  .t6-menu-toggle { display: flex; }
}
@media (max-width: 560px) {
  .t6-header__top { height: 68px; }
  .t6-pill { display: none; }
}

/* ---------- Full menu overlay (tablet/desktop nav links) ---------- */
.t6-menu-enter-active, .t6-menu-leave-active { transition: opacity var(--dur-base) var(--ease-premium); }
.t6-menu-enter-from, .t6-menu-leave-to { opacity: 0; }
.t6-menu {
  position: fixed; inset: 0; z-index: var(--z-drawer);
  background: linear-gradient(160deg, var(--color-secondary), var(--color-primary-dark));
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--sp-7); padding: var(--sp-8);
}
.t6-menu__nav { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); }
.t6-menu__nav a { font-family: var(--font-display); font-weight: 700; font-size: clamp(1.8rem, 5vw, 2.8rem); color: #fff; }
.t6-menu__nav a:hover { color: var(--color-gold); }
.t6-menu__foot { display: flex; gap: var(--sp-4); }

/* ---------- Bottom tab bar ---------- */
.t6-tabbar {
  display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: var(--z-header);
  height: var(--bottom-nav-h); background: var(--color-surface); border-top: 1px solid var(--color-border);
  box-shadow: 0 -6px 20px rgba(124,58,237,0.1);
  align-items: stretch; justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
}
.t6-tabbar a {
  position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  color: var(--color-text-faint); font-size: 10px; font-weight: 700;
}
.t6-tabbar a i { font-size: 1.05rem; transition: transform var(--dur-fast) var(--ease-spring); }
.t6-tabbar a.active { color: var(--color-primary); }
.t6-tabbar a.active i { transform: translateY(-3px) scale(1.12); }
.t6-tabbar__dot { position: absolute; top: 2px; right: calc(50% - 16px); width: 7px; height: 7px; border-radius: 50%; background: var(--color-accent); }
@media (max-width: 900px) { .t6-tabbar { display: flex; } }
</style>
