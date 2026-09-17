// Store/branch selector. Ports assets/js/core/branch.js's state + rules;
// the modal markup itself now lives in components/layout/BranchModal.vue.

import { defineStore } from 'pinia';
import { findBranch } from '@/services/branches';

const BRANCH_KEY = 'sm_branch';

export const useBranchStore = defineStore('branch', {
  state: () => ({
    selectedId: localStorage.getItem(BRANCH_KEY) || null,
    modalOpen: false,
    dismissible: true,
  }),

  getters: {
    selectedBranch(state) {
      return state.selectedId ? findBranch(state.selectedId) : null;
    },
  },

  actions: {
    init() {
      if (!this.selectedId) {
        this.openModal({ dismissible: false });
      }
    },
    openModal({ dismissible = true } = {}) {
      this.dismissible = dismissible;
      this.modalOpen = true;
    },
    closeModal() {
      if (!this.dismissible && !this.selectedId) return;
      this.modalOpen = false;
    },
    selectBranch(id) {
      this.selectedId = id;
      localStorage.setItem(BRANCH_KEY, id);
      this.modalOpen = false;
      // Cart totals/stock are branch-scoped — refresh so the user doesn't
      // keep seeing the previous branch's pricing until they open /cart.
      import('./cart').then(({ useCartStore }) => {
        useCartStore().loadCart().catch(() => {});
      }).catch(() => {});
    },
  },
});
