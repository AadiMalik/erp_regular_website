// Active site theme - a plain reactive mirror of what main.js's bootstrap()
// already resolved from the ERP's business-wise Website Theme setting (see
// services/websiteTheme.js + utils/applyThemeConfig.js) before the app ever
// mounted. Components that pick per-theme UI (AppHeader, AppFooter,
// ProductCard, CategoryCard, HomeView) read `activeTheme` from here.
// Theme selection is ERP-admin-controlled only - there is no client-side
// switcher.

import { defineStore } from 'pinia';
import { DEFAULT_THEME } from '@/utils/applyThemeConfig';

export const AVAILABLE_THEMES = ['theme1', 'theme2', 'theme3', 'theme4', 'theme5', 'theme6'];

export const useThemeStore = defineStore('theme', {
  state: () => ({
    activeTheme: DEFAULT_THEME,
  }),

  actions: {
    setActiveTheme(id) {
      this.activeTheme = AVAILABLE_THEMES.includes(id) ? id : DEFAULT_THEME;
    },
  },
});
