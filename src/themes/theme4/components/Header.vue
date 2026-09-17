<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';
import { useBranchStore } from '@/stores/branch';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { fetchCategories } from '@/services/categories';
import { fetchContentItems } from '@/services/cms';
import { showToast } from '@/composables/useToast';

const cart = useCartStore();
const wishlist = useWishlistStore();
const auth = useAuthStore();
const branch = useBranchStore();
const site = useWebsiteSettingsStore();
const logoError = ref(false);
const router = useRouter();

const categories = ref([]);
const announcements = ref([]);
onMounted(async () => {
  [categories.value, announcements.value] = await Promise.all([fetchCategories(), fetchContentItems('announcement_bar')]);
});

const scrolled = ref(false);
function onScroll() { scrolled.value = window.scrollY > 30; }
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
  setTimeout(() => router.push({ name: 'home' }), 300);
}
</script>

<template>
  <div class="t4-marquee" v-if="announcements.length">
    <div class="t4-marquee__track">
      <span v-for="n in 2" :key="n">
        <template v-for="item in announcements" :key="item.id">
          <span>{{ item.title }}</span>
          <span>·</span>
        </template>
      </span>
    </div>
  </div>

  <header class="t4-header" :class="{ scrolled }">
    <div class="container t4-header__inner">
      <button class="t4-burger" aria-label="Toggle menu" @click="menuOpen = !menuOpen">
        <i class="fa-solid" :class="menuOpen ? 'fa-xmark' : 'fa-bars'"></i>
      </button>

      <RouterLink :to="{ name: 'home' }" class="t4-logo">
        <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:32px;width:auto;object-fit:contain" @error="logoError = true">
        <template v-else>
          <span class="t4-logo__mark">{{ site.business.name.slice(0, 2).toUpperCase() }}</span>
          <span class="t4-logo__text">{{ site.business.name }}</span>
        </template>
      </RouterLink>

      <nav class="t4-nav">
        <RouterLink :to="{ name: 'shop' }">Shop</RouterLink>
        <RouterLink :to="{ name: 'categories' }">Categories</RouterLink>
        <RouterLink :to="{ name: 'shop', query: { filter: 'deal' } }">Deals</RouterLink>
        <RouterLink :to="{ name: 'about' }">About</RouterLink>
        <RouterLink :to="{ name: 'contact' }">Contact</RouterLink>
      </nav>

      <div class="t4-actions">
        <button class="t4-action t4-action--branch" type="button" @click="branch.openModal()">
          <i class="fa-solid fa-location-dot"></i>
          <span>{{ branch.selectedBranch?.name || 'Select Store' }}</span>
        </button>
        <RouterLink :to="{ name: 'wishlist' }" class="t4-action t4-icon-btn" aria-label="Wishlist">
          <i class="fa-solid fa-heart"></i>
          <span v-if="wishlist.count" class="t4-count">{{ wishlist.count }}</span>
        </RouterLink>
        <RouterLink :to="auth.currentUser ? { name: 'account' } : { name: 'login' }" class="t4-action t4-icon-btn" aria-label="Account">
          <i class="fa-solid fa-user"></i>
        </RouterLink>
        <RouterLink :to="{ name: 'cart' }" class="t4-action t4-icon-btn t4-icon-btn--fill" aria-label="Cart">
          <i class="fa-solid fa-bag-shopping" :class="{ 't4-bump': cartBump }"></i>
          <span v-if="cart.count" class="t4-count t4-count--accent">{{ cart.count }}</span>
        </RouterLink>
      </div>
    </div>
  </header>

  <Transition name="t4-menu">
    <div v-if="menuOpen" class="t4-menu">
      <nav class="t4-menu__nav">
        <RouterLink :to="{ name: 'home' }" @click="menuOpen = false">Home</RouterLink>
        <RouterLink :to="{ name: 'shop' }" @click="menuOpen = false">Shop</RouterLink>
        <RouterLink :to="{ name: 'categories' }" @click="menuOpen = false">Categories</RouterLink>
        <RouterLink :to="{ name: 'shop', query: { filter: 'deal' } }" @click="menuOpen = false">Deals</RouterLink>
        <RouterLink :to="{ name: 'about' }" @click="menuOpen = false">About</RouterLink>
        <RouterLink :to="{ name: 'contact' }" @click="menuOpen = false">Contact</RouterLink>
      </nav>
      <div class="t4-menu__cats">
        <button v-for="c in categories" :key="c.id" @click="router.push({ name: 'shop', query: { category: c.id } }); menuOpen = false">
          {{ c.name }}
        </button>
      </div>
      <div class="t4-menu__foot">
        <template v-if="auth.currentUser">
          <RouterLink :to="{ name: 'account' }" class="btn btn-dark" @click="menuOpen = false">My Profile</RouterLink>
          <button class="btn btn-outline" @click="logout">Logout</button>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'login' }" class="btn btn-dark" @click="menuOpen = false">Sign In</RouterLink>
          <RouterLink :to="{ name: 'signup' }" class="btn btn-outline" @click="menuOpen = false">Create Account</RouterLink>
        </template>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ---------- Marquee ---------- */
.t4-marquee { background: var(--color-secondary); color: #fff; overflow: hidden; height: 34px; display: flex; align-items: center; }
.t4-marquee__track { display: flex; white-space: nowrap; animation: t4Scroll 22s linear infinite; }
.t4-marquee__track span { display: inline-flex; gap: 10px; align-items: center; }
.t4-marquee__track > span span { font-size: 11px; font-weight: 800; letter-spacing: 0.06em; padding-inline: 8px; }
.t4-marquee__track > span span:nth-child(even) { color: var(--color-gold); padding-inline: 0; }
@keyframes t4Scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

/* ---------- Header ---------- */
.t4-header {
  position: sticky; top: 0; z-index: var(--z-header);
  background: var(--color-bg);
  border-bottom: 3px solid var(--color-secondary);
}
.t4-header__inner { display: flex; align-items: center; gap: var(--sp-6); height: 88px; transition: height var(--dur-base) var(--ease-out); }
.t4-header.scrolled .t4-header__inner { height: 70px; }

.t4-burger { display: none; width: 44px; height: 44px; align-items: center; justify-content: center; border: 2px solid var(--color-secondary); border-radius: var(--radius-btn); font-size: 1.1rem; }

.t4-logo { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.t4-logo__mark {
  width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
  background: var(--color-primary); color: #fff; font-family: var(--font-display); font-weight: 900;
  border-radius: 10px; border: 2px solid var(--color-secondary); box-shadow: var(--shadow-hard);
  transition: transform var(--dur-fast) var(--ease-premium), box-shadow var(--dur-fast);
}
.t4-logo:hover .t4-logo__mark { transform: translate(-2px, -2px); box-shadow: 7px 7px 0 var(--color-secondary); }
.t4-logo__text { font-family: var(--font-display); font-weight: 800; font-size: 1.3rem; color: var(--color-secondary); }
.t4-logo__text em { font-style: normal; color: var(--color-primary); }

.t4-nav { display: flex; align-items: center; gap: var(--sp-6); margin-left: var(--sp-4); }
.t4-nav a {
  font-weight: 800; font-size: var(--fs-sm); text-transform: uppercase; letter-spacing: 0.03em;
  color: var(--color-secondary); position: relative; padding-bottom: 4px;
}
.t4-nav a::after { content: ''; position: absolute; left: 0; bottom: 0; height: 4px; width: 0; background: var(--color-accent); transition: width var(--dur-base) var(--ease-premium); }
.t4-nav a:hover::after, .t4-nav a.router-link-exact-active::after { width: 100%; }

.t4-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.t4-action--branch {
  display: flex; align-items: center; gap: 8px; padding: 0.55rem 0.9rem;
  border: 2px solid var(--color-secondary); border-radius: var(--radius-btn); font-size: var(--fs-xs); font-weight: 800;
  color: var(--color-secondary); text-transform: uppercase;
}
.t4-action--branch i { color: var(--color-primary); }
.t4-icon-btn {
  position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--color-secondary); border-radius: var(--radius-btn); color: var(--color-secondary);
  transition: transform var(--dur-fast) var(--ease-premium), background var(--dur-fast);
}
.t4-icon-btn:hover { transform: translate(-2px, -2px); box-shadow: var(--shadow-hard); }
.t4-icon-btn--fill { background: var(--color-secondary); color: #fff; }
.t4-count {
  position: absolute; top: -8px; right: -8px; min-width: 20px; height: 20px; padding: 0 4px;
  background: var(--color-primary); color: #fff; border: 2px solid var(--color-secondary); border-radius: 999px;
  font-size: 10px; font-weight: 900; display: flex; align-items: center; justify-content: center;
}
.t4-count--accent { background: var(--color-accent); }
.t4-bump { animation: t4Pulse var(--dur-slow) var(--ease-premium); }
@keyframes t4Pulse { 50% { transform: scale(1.3) rotate(-8deg); } }

@media (max-width: 1140px) {
  .t4-nav { display: none; }
  .t4-burger { display: flex; }
  .t4-action--branch span { display: none; }
}
@media (max-width: 560px) {
  .t4-logo__text { display: none; }
  .t4-action--branch { padding: 0.5rem; }
}

/* ---------- Full menu overlay ---------- */
.t4-menu-enter-active, .t4-menu-leave-active { transition: opacity var(--dur-base) var(--ease-out); }
.t4-menu-enter-from, .t4-menu-leave-to { opacity: 0; }
.t4-menu {
  position: fixed; inset: 0; top: 0; z-index: var(--z-drawer); background: var(--color-bg);
  overflow-y: auto; padding: calc(var(--sp-9) + 34px) var(--sp-6) var(--sp-8);
  display: flex; flex-direction: column; gap: var(--sp-7);
}
.t4-menu__nav { display: flex; flex-direction: column; gap: var(--sp-2); }
.t4-menu__nav a {
  font-family: var(--font-display); font-weight: 800; font-size: clamp(2rem, 8vw, 3rem);
  color: var(--color-secondary); text-transform: uppercase; border-bottom: 3px solid var(--color-border);
  padding-block: 10px; transition: color var(--dur-fast);
}
.t4-menu__nav a:hover { color: var(--color-primary); }
.t4-menu__cats { display: flex; flex-wrap: wrap; gap: 10px; }
.t4-menu__cats button {
  padding: 0.55rem 1rem; border: 2px solid var(--color-secondary); border-radius: var(--radius-btn);
  font-size: var(--fs-sm); font-weight: 700;
}
.t4-menu__cats button:hover { background: var(--color-secondary); color: #fff; }
.t4-menu__foot { display: flex; gap: var(--sp-4); margin-top: auto; }
</style>
