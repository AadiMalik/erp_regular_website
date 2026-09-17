import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { fetchWebsiteThemeConfig } from './services/websiteTheme';
import { fetchWebsiteSettings } from './services/websiteSettings';
import { fetchBranches } from './services/branches';
import { fetchCategories } from './services/categories';
import { fetchProducts } from './services/products';
import { applyThemeConfig } from './utils/applyThemeConfig';
import { applyWebsiteSettings } from './utils/applyWebsiteSettings';
import { useThemeStore } from './stores/theme';
import { useWebsiteSettingsStore } from './stores/websiteSettings';
import { useAuthStore } from './stores/auth';
import { useWishlistStore } from './stores/wishlist';
import { useCartStore } from './stores/cart';

import './styles/tokens.css';
import './styles/themes/theme1.css';
import './styles/themes/theme2.css';
import './styles/themes/theme3.css';
import './styles/themes/theme4.css';
import './styles/themes/theme5.css';
import './styles/themes/theme6.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/animations.css';
import './styles/pages.css';

import { vReveal } from './composables/useReveal';

// Business-wise website theme + global website settings (name, logo,
// contact, currency, SEO, favicon, social links), branches, and categories
// are all fetched from the ERP (business_id from .env) and applied BEFORE
// the app renders, so there is never a flash of the wrong theme/content -
// the ERP admin's Business Settings are the only source of truth.
async function bootstrap() {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  // Pinia doesn't exist yet at this point, so this reads the branch store's
  // own persisted key directly rather than via useBranchStore() - stock is
  // branch-scoped, so the warm-cache call below should already reflect
  // whichever branch (if any) the shopper picked on a previous visit.
  const persistedBranchId = localStorage.getItem('sm_branch') || undefined;
  const [config, settings] = await Promise.all([
    fetchWebsiteThemeConfig(businessId),
    fetchWebsiteSettings(businessId),
    fetchBranches(), // populates the branches service cache as a side effect
    fetchCategories(), // populates the categories service cache as a side effect
    fetchProducts({ per_page: 100, branch_id: persistedBranchId }), // populates the products service cache as a side effect
  ]);
  const activeTheme = applyThemeConfig(config);
  applyWebsiteSettings(settings);

  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  app.use(router);
  app.directive('reveal', vReveal);

  useThemeStore(pinia).setActiveTheme(activeTheme);
  useWebsiteSettingsStore(pinia).setSettings(settings);

  const auth = useAuthStore(pinia);
  if (auth.isLoggedIn) {
    useWishlistStore(pinia).load().catch(() => {});
    useCartStore(pinia).loadCart().catch(() => {});
    auth.fetchProfile().catch(() => {});
  }

  app.mount('#app');
}

bootstrap();
