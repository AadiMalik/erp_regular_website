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
import { PRODUCTS } from '@/services/products';
import { formatCurrency } from '@/utils/currency';
import { showToast } from '@/composables/useToast';

const cart = useCartStore();
const wishlist = useWishlistStore();
const auth = useAuthStore();
const branch = useBranchStore();
const site = useWebsiteSettingsStore();
const logoError = ref(false);
const router = useRouter();

const categories = ref([]);
const announcement = ref(null);
onMounted(async () => {
  categories.value = await fetchCategories();
  const items = await fetchContentItems('announcement_bar');
  announcement.value = items[0] || null;
});

const scrolled = ref(false);
function onScroll() { scrolled.value = window.scrollY > 12; }
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

const searchOpen = ref(false);
const query = ref('');
const suggestions = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)).slice(0, 5);
});
function submitSearch() {
  const q = query.value.trim();
  searchOpen.value = false;
  router.push({ name: 'shop', query: q ? { q } : {} });
}
function goToProduct(slug) {
  searchOpen.value = false;
  router.push({ name: 'product', params: { slug } });
}

const drawerOpen = ref(false);
function logout() {
  auth.logout();
  drawerOpen.value = false;
  showToast('You have been signed out.', 'info');
  setTimeout(() => router.push({ name: 'home' }), 400);
}
</script>

<template>
  <div class="t2-strip">
    <div class="container t2-strip__inner">
      <span v-if="announcement"><i :class="announcement.icon || 'fa-solid fa-bolt'"></i> {{ announcement.title }}</span>
      <button class="t2-strip__branch" type="button" @click="branch.openModal()">
        <i class="fa-solid fa-location-dot"></i> {{ branch.selectedBranch?.name || 'Select store' }}
      </button>
    </div>
  </div>

  <header class="t2-header" :class="{ scrolled }">
    <div class="container t2-header__inner">
      <RouterLink :to="{ name: 'home' }" class="t2-logo">
        <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:32px;width:auto;object-fit:contain" @error="logoError = true">
        <template v-else>
          <span class="t2-logo__mark"><i class="fa-solid fa-bag-shopping"></i></span>
          <span class="t2-logo__text">{{ site.business.name }}</span>
        </template>
      </RouterLink>

      <nav class="t2-nav" aria-label="Main">
        <RouterLink :to="{ name: 'home' }" active-class="active">Home</RouterLink>
        <RouterLink :to="{ name: 'shop' }" active-class="active">Shop</RouterLink>
        <RouterLink :to="{ name: 'categories' }" active-class="active">Categories</RouterLink>
        <RouterLink :to="{ name: 'shop', query: { filter: 'deal' } }">Deals</RouterLink>
        <RouterLink :to="{ name: 'about' }" active-class="active">About</RouterLink>
      </nav>

      <div class="t2-actions">
        <button class="t2-action" aria-label="Search" @click="searchOpen = !searchOpen">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
        <button class="t2-action" aria-label="Wishlist" @click="router.push({ name: 'wishlist' })">
          <i class="fa-solid fa-heart"></i>
          <span v-if="wishlist.count" class="t2-count">{{ wishlist.count }}</span>
        </button>
        <RouterLink v-if="auth.currentUser" :to="{ name: 'account' }" class="t2-action" aria-label="Account">
          <i class="fa-solid fa-user"></i>
        </RouterLink>
        <RouterLink v-else :to="{ name: 'login' }" class="t2-action" aria-label="Sign in">
          <i class="fa-regular fa-user"></i>
        </RouterLink>
        <RouterLink :to="{ name: 'cart' }" class="t2-action t2-cart" aria-label="Cart">
          <i class="fa-solid fa-cart-shopping" :class="{ 't2-bump': cartBump }"></i>
          <span v-if="cart.count" class="t2-count">{{ cart.count }}</span>
        </RouterLink>
        <button class="t2-burger" :class="{ open: drawerOpen }" aria-label="Toggle menu" @click="drawerOpen = !drawerOpen">
          <span></span>
        </button>
      </div>
    </div>

    <Transition name="t2-search">
      <div v-if="searchOpen" class="t2-search-panel">
        <div class="container">
          <form class="t2-search-form" @submit.prevent="submitSearch">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input v-model="query" type="search" placeholder="Search fruits, snacks, dairy, brands…" autofocus>
            <button type="submit" class="t2-btn t2-btn--sm">Go</button>
          </form>
          <div v-if="suggestions.length" class="t2-search-suggest">
            <a v-for="p in suggestions" :key="p.id" href="#" @click.prevent="goToProduct(p.slug)">
              <img :src="p.images[0]" alt="">
              <span class="name">{{ p.name }}</span>
              <span class="price">{{ formatCurrency(p.price) }}</span>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </header>

  <Transition name="t2-drawer">
    <div v-if="drawerOpen" class="t2-drawer-overlay" @click="drawerOpen = false"></div>
  </Transition>
  <aside class="t2-drawer" :class="{ open: drawerOpen }" aria-label="Menu">
    <button class="t2-drawer__close" aria-label="Close menu" @click="drawerOpen = false"><i class="fa-solid fa-xmark"></i></button>
    <nav class="t2-drawer__nav">
      <RouterLink :to="{ name: 'home' }" @click="drawerOpen = false">Home</RouterLink>
      <RouterLink :to="{ name: 'shop' }" @click="drawerOpen = false">Shop</RouterLink>
      <RouterLink :to="{ name: 'categories' }" @click="drawerOpen = false">Categories</RouterLink>
      <RouterLink :to="{ name: 'shop', query: { filter: 'deal' } }" @click="drawerOpen = false">Deals</RouterLink>
      <RouterLink :to="{ name: 'about' }" @click="drawerOpen = false">About</RouterLink>
      <RouterLink :to="{ name: 'contact' }" @click="drawerOpen = false">Contact</RouterLink>
      <RouterLink :to="{ name: 'wishlist' }" @click="drawerOpen = false">Wishlist</RouterLink>
    </nav>
    <div class="t2-drawer__cats">
      <h4>Shop by Category</h4>
      <RouterLink v-for="c in categories" :key="c.id" :to="{ name: 'shop', query: { category: c.id } }" @click="drawerOpen = false">
        <i class="fa-solid" :class="c.icon"></i> {{ c.name }}
      </RouterLink>
    </div>
    <div class="t2-drawer__foot">
      <template v-if="auth.currentUser">
        <RouterLink :to="{ name: 'account' }" class="t2-btn t2-btn--outline" @click="drawerOpen = false">My Profile</RouterLink>
        <button class="t2-btn" @click="logout">Logout</button>
      </template>
      <template v-else>
        <RouterLink :to="{ name: 'login' }" class="t2-btn t2-btn--outline" @click="drawerOpen = false">Sign In</RouterLink>
        <RouterLink :to="{ name: 'signup' }" class="t2-btn" @click="drawerOpen = false">Register</RouterLink>
      </template>
    </div>
  </aside>
</template>

<style scoped>
.t2-strip {
  background: linear-gradient(90deg, var(--color-primary), #C026D3, var(--color-accent));
  color: #fff; font-size: var(--fs-xs); font-weight: 600;
}
.t2-strip__inner { display: flex; align-items: center; justify-content: space-between; height: 34px; }
.t2-strip__branch { color: #fff; display: flex; align-items: center; gap: 6px; opacity: 0.92; }
.t2-strip__branch:hover { opacity: 1; }
@media (max-width: 640px) { .t2-strip__inner span:first-child { display: none; } }

.t2-header {
  position: sticky; top: 0; z-index: var(--z-header);
  background: #fff; border-bottom: 2px solid var(--color-primary-light);
  transition: box-shadow var(--dur-base) var(--ease-out);
}
.t2-header.scrolled { box-shadow: 0 12px 30px rgba(124,58,237,0.12); }
.t2-header__inner {
  display: flex; align-items: center; gap: var(--sp-6);
  height: 78px; transition: height var(--dur-base) var(--ease-out);
}
.t2-header.scrolled .t2-header__inner { height: 62px; }

.t2-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.t2-logo__mark {
  width: 42px; height: 42px; border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary), var(--color-gold));
  display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.15rem;
  transition: transform var(--dur-base) var(--ease-spring);
}
.t2-logo:hover .t2-logo__mark { transform: rotate(-10deg) scale(1.1); }
.t2-logo__text { font-family: var(--font-display); font-weight: 800; font-size: 1.3rem; color: var(--color-secondary); }
.t2-logo__text em { font-style: normal; color: var(--color-primary); }

.t2-nav { display: flex; align-items: center; gap: 4px; margin-inline: auto; background: var(--color-bg-alt); padding: 6px; border-radius: var(--radius-pill); }
.t2-nav a { padding: 10px 18px; border-radius: var(--radius-pill); font-weight: 700; font-size: var(--fs-sm); color: var(--color-text-soft); transition: all var(--dur-fast) var(--ease-out); }
.t2-nav a:hover { color: var(--color-primary); }
.t2-nav a.active { background: #fff; color: var(--color-primary); box-shadow: var(--shadow-sm); }
@media (max-width: 1080px) { .t2-nav { display: none; } }

.t2-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-left: auto; }
.t2-action {
  position: relative; width: 44px; height: 44px; border-radius: var(--radius-lg);
  display: flex; align-items: center; justify-content: center; color: var(--color-secondary);
  transition: all var(--dur-fast) var(--ease-spring);
}
.t2-action:hover { background: var(--color-primary-light); color: var(--color-primary); transform: translateY(-3px) rotate(-4deg); }
.t2-count {
  position: absolute; top: 2px; right: 2px; min-width: 17px; height: 17px; padding: 0 4px;
  background: var(--color-accent); color: #fff; border-radius: 999px;
  font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center;
}
.t2-bump { animation: t2Pop 420ms var(--ease-spring); }
@keyframes t2Pop { 40% { transform: scale(1.4) rotate(-10deg); } 100% { transform: scale(1); } }

.t2-burger { display: none; width: 44px; height: 44px; border-radius: var(--radius-lg); align-items: center; justify-content: center; position: relative; }
@media (max-width: 1080px) { .t2-burger { display: flex; } }
.t2-burger span, .t2-burger::before, .t2-burger::after {
  content: ''; position: absolute; width: 20px; height: 2.5px; border-radius: 2px; background: var(--color-primary);
  transition: transform var(--dur-base) var(--ease-premium), opacity var(--dur-fast);
}
.t2-burger::before { transform: translateY(-6px); }
.t2-burger::after { transform: translateY(6px); }
.t2-burger.open::before { transform: rotate(45deg); }
.t2-burger.open::after { transform: rotate(-45deg); }
.t2-burger.open span { opacity: 0; }

.t2-search-panel { background: #fff; border-bottom: 2px solid var(--color-primary-light); padding: var(--sp-4) 0; }
.t2-search-enter-active, .t2-search-leave-active { transition: all var(--dur-fast) var(--ease-out); }
.t2-search-enter-from, .t2-search-leave-to { opacity: 0; transform: translateY(-8px); }
.t2-search-form {
  display: flex; align-items: center; gap: var(--sp-3); max-width: 640px; margin: 0 auto;
  background: var(--color-bg-alt); border-radius: var(--radius-pill); padding: 6px 6px 6px 20px;
}
.t2-search-form i { color: var(--color-text-muted); }
.t2-search-form input { flex: 1; background: transparent; border: none; padding: 0.6rem 0; font-size: var(--fs-md); }
.t2-search-form input:focus { outline: none; }
.t2-search-suggest { max-width: 640px; margin: var(--sp-3) auto 0; display: flex; flex-direction: column; gap: 4px; }
.t2-search-suggest a { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: var(--radius-md); }
.t2-search-suggest a:hover { background: var(--color-bg-alt); }
.t2-search-suggest img { width: 38px; height: 38px; border-radius: 8px; object-fit: cover; }
.t2-search-suggest .name { font-size: var(--fs-sm); font-weight: 600; }
.t2-search-suggest .price { margin-left: auto; font-weight: 700; color: var(--color-primary); font-size: var(--fs-sm); }

.t2-drawer-overlay { position: fixed; inset: 0; background: rgba(30,21,51,0.5); z-index: var(--z-drawer); }
.t2-drawer-enter-active, .t2-drawer-leave-active { transition: opacity var(--dur-base) var(--ease-out); }
.t2-drawer-enter-from, .t2-drawer-leave-to { opacity: 0; }
.t2-drawer {
  position: fixed; top: 0; right: 0; height: 100%; width: min(340px, 88vw); background: #fff;
  z-index: calc(var(--z-drawer) + 1); transform: translateX(102%);
  transition: transform var(--dur-base) var(--ease-premium); display: flex; flex-direction: column;
  padding: var(--sp-6); overflow-y: auto;
}
.t2-drawer.open { transform: translateX(0); }
.t2-drawer__close { align-self: flex-end; width: 40px; height: 40px; border-radius: var(--radius-lg); background: var(--color-bg-alt); display: flex; align-items: center; justify-content: center; }
.t2-drawer__nav { display: flex; flex-direction: column; margin-top: var(--sp-4); }
.t2-drawer__nav a { padding: var(--sp-3) 0; font-weight: 700; border-bottom: 1px solid var(--color-border); }
.t2-drawer__cats { margin-top: var(--sp-5); display: flex; flex-direction: column; gap: 4px; }
.t2-drawer__cats h4 { font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); margin-bottom: var(--sp-2); }
.t2-drawer__cats a { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: var(--fs-sm); }
.t2-drawer__foot { margin-top: auto; padding-top: var(--sp-5); display: flex; gap: var(--sp-3); }
.t2-btn {
  flex: 1; text-align: center; padding: 0.8rem 1.2rem; border-radius: var(--radius-pill);
  background: var(--color-primary); color: #fff; font-weight: 700; font-size: var(--fs-sm);
  transition: transform var(--dur-fast) var(--ease-spring);
}
.t2-btn:hover { transform: translateY(-2px); }
.t2-btn--outline { background: transparent; border: 1.5px solid var(--color-border-strong); color: var(--color-text-soft); }
.t2-btn--sm { padding: 0.55rem 1rem; flex: none; }
</style>
