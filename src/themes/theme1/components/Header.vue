<script setup>
// Composes the header pieces (TopBar/MainNav/SearchPanel/AccountMenu/
// drawers), and owns the bits that are genuinely cross-cutting: sticky
// scroll state, mobile drawer + wishlist drawer open state (and the shared
// overlay that closes either), and the cart-icon "bump" pulse.
// Ports assets/js/core/header.js's initStickyHeader/initMobileDrawer/etc.

import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import TopBar from './TopBar.vue';
import MainNav from './MainNav.vue';
import SearchPanel from './SearchPanel.vue';
import AccountMenu from './AccountMenu.vue';
import MobileDrawer from './MobileDrawer.vue';
import WishlistDrawer from './WishlistDrawer.vue';

const cart = useCartStore();
const wishlist = useWishlistStore();
const site = useWebsiteSettingsStore();
const logoError = ref(false);

const scrolled = ref(false);
function onScroll() {
  scrolled.value = window.scrollY > 12;
}
onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});
onUnmounted(() => window.removeEventListener('scroll', onScroll));

const mobileDrawerOpen = ref(false);
const wishlistDrawerOpen = ref(false);
const anyDrawerOpen = computed(() => mobileDrawerOpen.value || wishlistDrawerOpen.value);
function closeDrawers() {
  mobileDrawerOpen.value = false;
  wishlistDrawerOpen.value = false;
}

const cartBump = ref(false);
watch(() => cart.count, () => {
  cartBump.value = false;
  requestAnimationFrame(() => { cartBump.value = true; });
});

const wishlistCountBump = ref(false);
watch(() => wishlist.count, () => {
  wishlistCountBump.value = false;
  requestAnimationFrame(() => { wishlistCountBump.value = true; });
});
</script>

<template>
  <TopBar />

  <header class="site-header" :class="{ scrolled }">
    <div class="container header-inner">
      <RouterLink :to="{ name: 'home' }" class="logo">
        <img v-if="site.business.logo && !logoError" :src="site.business.logo" :alt="site.business.name" style="height:32px;width:auto;object-fit:contain" @error="logoError = true">
        <template v-else>
          <span class="logo__mark"><i class="fa-solid fa-basket-shopping"></i></span>
          <span class="logo-text">{{ site.business.name }}</span>
        </template>
      </RouterLink>

      <MainNav />

      <div class="header-actions">
        <SearchPanel />
        <button class="header-action" aria-label="Wishlist" @click="wishlistDrawerOpen = true">
          <i class="fa-regular fa-heart"></i>
          <span class="count" :class="{ 'count-pop': wishlistCountBump }">{{ wishlist.count }}</span>
        </button>
        <AccountMenu />
        <RouterLink class="header-action" :to="{ name: 'cart' }" aria-label="Cart" data-header-cart-icon>
          <i class="fa-solid fa-cart-shopping" :class="{ 'cart-bump': cartBump }"></i>
          <span class="count" :class="{ 'count-pop': cartBump }">{{ cart.count }}</span>
        </RouterLink>
        <button class="hamburger" :class="{ open: mobileDrawerOpen }" aria-label="Toggle menu" @click="mobileDrawerOpen = !mobileDrawerOpen">
          <span></span>
        </button>
      </div>
    </div>
  </header>

  <div class="drawer-overlay" :class="{ open: anyDrawerOpen }" @click="closeDrawers"></div>
  <MobileDrawer :open="mobileDrawerOpen" @close="mobileDrawerOpen = false" />
  <WishlistDrawer :open="wishlistDrawerOpen" @close="wishlistDrawerOpen = false" />
</template>
