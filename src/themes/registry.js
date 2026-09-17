// Centralized theme configuration — the seam the ERP will eventually drive.
// Each theme registers its Header/Footer/Hero/ProductCard/CategoryCard/Home
// components here; shared resolver components (AppHeader, AppFooter,
// ProductCard, CategoryCard, HomeView) pick the active one from this map at
// render time, so the rest of the app never imports a theme directly.
// Adding a Theme4-7 later is: build its folder, add one entry below.

import { defineAsyncComponent } from 'vue';

export const THEME_REGISTRY = {
  theme1: {
    id: 'theme1',
    name: 'Classic Market',
    description: 'Fresh & trusted grocery classic',
    swatch: ['#1E9E5A', '#FF6B35'],
    components: {
      Header: defineAsyncComponent(() => import('./theme1/components/Header.vue')),
      Footer: defineAsyncComponent(() => import('./theme1/components/Footer.vue')),
      Hero: defineAsyncComponent(() => import('./theme1/components/Hero.vue')),
      ProductCard: defineAsyncComponent(() => import('./theme1/components/ProductCard.vue')),
      CategoryCard: defineAsyncComponent(() => import('./theme1/components/CategoryCard.vue')),
    },
    home: defineAsyncComponent(() => import('./theme1/Home.vue')),
  },
  theme2: {
    id: 'theme2',
    name: 'Vibrant Bazaar',
    description: 'Bold, colorful & energetic',
    swatch: ['#7C3AED', '#FB923C'],
    components: {
      Header: defineAsyncComponent(() => import('./theme2/components/Header.vue')),
      Footer: defineAsyncComponent(() => import('./theme2/components/Footer.vue')),
      Hero: defineAsyncComponent(() => import('./theme2/components/Hero.vue')),
      ProductCard: defineAsyncComponent(() => import('./theme2/components/ProductCard.vue')),
      CategoryCard: defineAsyncComponent(() => import('./theme2/components/CategoryCard.vue')),
    },
    home: defineAsyncComponent(() => import('./theme2/Home.vue')),
  },
  theme3: {
    id: 'theme3',
    name: 'Luxury Edit',
    description: 'Elegant, spacious & editorial',
    swatch: ['#1C1917', '#A16207'],
    components: {
      Header: defineAsyncComponent(() => import('./theme3/components/Header.vue')),
      Footer: defineAsyncComponent(() => import('./theme3/components/Footer.vue')),
      Hero: defineAsyncComponent(() => import('./theme3/components/Hero.vue')),
      ProductCard: defineAsyncComponent(() => import('./theme3/components/ProductCard.vue')),
      CategoryCard: defineAsyncComponent(() => import('./theme3/components/CategoryCard.vue')),
    },
    home: defineAsyncComponent(() => import('./theme3/Home.vue')),
  },
  theme4: {
    id: 'theme4',
    name: 'Fresh Block',
    description: 'Bold, brutalist & editorial',
    swatch: ['#0F7A3D', '#FF5722'],
    components: {
      Header: defineAsyncComponent(() => import('./theme4/components/Header.vue')),
      Footer: defineAsyncComponent(() => import('./theme4/components/Footer.vue')),
      Hero: defineAsyncComponent(() => import('./theme4/components/Hero.vue')),
      ProductCard: defineAsyncComponent(() => import('./theme4/components/ProductCard.vue')),
      CategoryCard: defineAsyncComponent(() => import('./theme4/components/CategoryCard.vue')),
    },
    home: defineAsyncComponent(() => import('./theme4/Home.vue')),
  },
  theme5: {
    id: 'theme5',
    name: 'Atelier',
    description: 'Clean, quiet & minimal boutique',
    swatch: ['#14181A', '#A6803C'],
    components: {
      Header: defineAsyncComponent(() => import('./theme5/components/Header.vue')),
      Footer: defineAsyncComponent(() => import('./theme5/components/Footer.vue')),
      Hero: defineAsyncComponent(() => import('./theme5/components/Hero.vue')),
      ProductCard: defineAsyncComponent(() => import('./theme5/components/ProductCard.vue')),
      CategoryCard: defineAsyncComponent(() => import('./theme5/components/CategoryCard.vue')),
    },
    home: defineAsyncComponent(() => import('./theme5/Home.vue')),
  },
  theme6: {
    id: 'theme6',
    name: 'Bazaar Bento',
    description: 'Vibrant, playful marketplace',
    swatch: ['#7C3AED', '#16A34A'],
    components: {
      Header: defineAsyncComponent(() => import('./theme6/components/Header.vue')),
      Footer: defineAsyncComponent(() => import('./theme6/components/Footer.vue')),
      Hero: defineAsyncComponent(() => import('./theme6/components/Hero.vue')),
      ProductCard: defineAsyncComponent(() => import('./theme6/components/ProductCard.vue')),
      CategoryCard: defineAsyncComponent(() => import('./theme6/components/CategoryCard.vue')),
    },
    home: defineAsyncComponent(() => import('./theme6/Home.vue')),
  },
};
