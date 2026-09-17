// Real customer auth against the ERP's Sanctum-based email+OTP API
// (services/auth.js). Session (token + user) persists in localStorage so a
// refresh keeps the customer signed in and the http.js interceptor can
// attach the bearer token to authenticated calls.

import { defineStore } from 'pinia';
import * as authApi from '@/services/auth';

const TOKEN_KEY = 'sm_token';
const USER_KEY = 'sm_user';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: readJson(USER_KEY, null),
    // In-flight OTP context (not persisted - lost on refresh).
    pendingEmail: null,
    pendingPurpose: null,
    pendingSignupInfo: null,
    // Reset-password OTP code kept in memory (not URL) after verify step.
    pendingResetCode: null,
    profileLoading: false,
  }),

  getters: {
    currentUser(state) {
      if (!state.user) return null;
      return {
        ...state.user,
        addresses: Array.isArray(state.user.addresses) ? state.user.addresses : [],
      };
    },
    isLoggedIn(state) {
      return !!state.token && !!state.user;
    },
  },

  actions: {
    setSession(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem(TOKEN_KEY, token);
      writeJson(USER_KEY, user);
    },
    clearSession() {
      this.token = null;
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // Clear legacy local profile overlays if present.
      localStorage.removeItem('sm_profile_overrides');
    },
    logout() {
      authApi.logout().catch(() => {});
      this.clearSession();
      import('./wishlist').then(({ useWishlistStore }) => {
        const w = useWishlistStore();
        w.items = [];
        w.loaded = false;
      }).catch(() => {});
    },

    async signup({ name, email, phone, password, captchaToken }) {
      const normalized = normalizeEmail(email);
      const result = await authApi.sendOtp(normalized, { name: name.trim(), phone: phone.trim(), captchaToken });
      if (!result.success) return { ok: false, message: result.message };

      this.pendingEmail = normalized;
      this.pendingPurpose = 'signup';
      this.pendingSignupInfo = { name: name.trim(), phone: phone.trim(), password };
      return { ok: true, email: normalized };
    },

    async login({ email, password, captchaToken }) {
      const result = await authApi.loginWithPassword({ email: normalizeEmail(email), password, captchaToken });
      if (!result.success) return { ok: false, message: result.message };
      this.setSession(result.data.token, result.data.user);
      const { useWishlistStore } = await import('./wishlist');
      useWishlistStore().load().catch(() => {});
      return { ok: true, user: result.data.user };
    },

    async loginWithSocial(provider, token, { createProfile = false } = {}) {
      const result = provider === 'google'
        ? await authApi.loginWithGoogle(token, { createProfile })
        : await authApi.loginWithFacebook(token, { createProfile });
      if (!result.success) return { ok: false, message: result.message };
      this.setSession(result.data.token, result.data.user);
      const { useWishlistStore } = await import('./wishlist');
      useWishlistStore().load().catch(() => {});
      return { ok: true, user: result.data.user };
    },

    async requestOtp(email, purpose = 'reset', captchaToken) {
      const normalized = normalizeEmail(email);
      const result = purpose === 'signup'
        ? await authApi.resendOtp(normalized, {
          name: this.pendingSignupInfo?.name,
          phone: this.pendingSignupInfo?.phone,
          captchaToken,
        })
        : await authApi.forgotPassword(normalized);
      if (!result.success) return { ok: false, message: result.message };

      this.pendingEmail = normalized;
      this.pendingPurpose = purpose;
      return { ok: true, email: normalized };
    },

    async verifyOtp(code) {
      const email = this.pendingEmail;
      const purpose = this.pendingPurpose;
      if (!email) return { ok: false, message: 'No verification in progress. Please start again.' };

      if (purpose === 'reset') {
        // The ERP verifies the reset code together with the new password in
        // one call - keep {email, code} in memory for the reset-password
        // step (not in the URL, so it never lands in browser history).
        this.pendingResetCode = code;
        return { ok: true, purpose: 'reset', email };
      }

      const info = this.pendingSignupInfo;
      const result = await authApi.verifyOtp({
        email,
        code,
        name: info?.name,
        phone: info?.phone,
      });
      if (!result.success) return { ok: false, message: result.message };

      this.setSession(result.data.token, result.data.user);

      // Only set a password when the account has none. A second-business
      // signup reuses the same users row; overwriting would change the
      // password at every store they already use.
      if (info?.password && result.data?.requires_password) {
        const pw = await authApi.setPassword(info.password);
        if (!pw.success) {
          return { ok: false, message: pw.message || 'Account created but password could not be set.' };
        }
      }
      this.pendingSignupInfo = null;

      const { useWishlistStore } = await import('./wishlist');
      useWishlistStore().load().catch(() => {});

      return { ok: true, purpose: 'signup', user: result.data.user };
    },

    async resetPassword(email, code, newPassword) {
      const result = await authApi.resetPassword({
        email: normalizeEmail(email),
        code,
        password: newPassword,
      });
      if (!result.success) return { ok: false, message: result.message };
      this.pendingResetCode = null;
      this.pendingEmail = null;
      this.pendingPurpose = null;
      return { ok: true };
    },

    async fetchProfile() {
      if (!this.isLoggedIn) return { ok: false, message: 'Not signed in.' };
      this.profileLoading = true;
      const result = await authApi.fetchProfile();
      this.profileLoading = false;
      if (!result.success) return { ok: false, message: result.message };
      this.user = result.data;
      writeJson(USER_KEY, result.data);
      return { ok: true, user: result.data };
    },

    async updateProfile(_userId, patch) {
      const result = await authApi.updateProfile({
        name: patch.name,
        profileImage: patch.profileImage || null,
      });
      if (!result.success) return { ok: false, message: result.message };
      this.user = result.data;
      writeJson(USER_KEY, result.data);
      return { ok: true, user: result.data };
    },

    async changePassword(_userId, currentPassword, newPassword) {
      const result = await authApi.changePassword({
        currentPassword,
        password: newPassword,
      });
      if (!result.success) return { ok: false, message: result.message };
      // Server revokes tokens after password change - clear local session.
      this.clearSession();
      return { ok: true, reauth: true };
    },

    async saveAddress(_userId, address) {
      const result = await authApi.saveAddress(address);
      if (!result.success) return { ok: false, message: result.message };
      await this.fetchProfile();
      return { ok: true, address: result.data, user: this.currentUser };
    },

    async deleteAddress(_userId, addressId) {
      const result = await authApi.deleteAddress(addressId);
      if (!result.success) return { ok: false, message: result.message };
      await this.fetchProfile();
      return { ok: true, user: this.currentUser };
    },
  },
});
