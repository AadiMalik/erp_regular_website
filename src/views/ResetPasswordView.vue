<script setup>
// Ports assets/js/pages/reset-password.js.

import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';
import FormField from '@/components/ui/FormField.vue';
import PasswordInput from '@/components/ui/PasswordInput.vue';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = String(route.query.email || auth.pendingEmail || '');
// Prefer in-memory code from the OTP step; query param is only a hard-refresh fallback.
const code = String(auth.pendingResetCode || route.query.code || '');

onMounted(() => {
  if (!email || !code) {
    router.replace({ name: 'forgot-password' });
  }
});

const form = reactive({ password: '', confirmPassword: '' });
const errors = reactive({ password: false, confirmPassword: false });
const alertMessage = ref('');
const loading = ref(false);

const STRENGTH_COLORS = ['var(--color-danger)', 'var(--color-accent)', 'var(--color-gold)', 'var(--color-primary)'];
const STRENGTH_LABELS = ['At least 8 characters', 'Weak', 'Fair', 'Good', 'Strong'];

const strengthScore = computed(() => {
  const value = form.password;
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 10) score += 1;
  if (/[0-9]/.test(value) && /[a-zA-Z]/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;
  return score;
});
const strengthColor = computed(() => (strengthScore.value ? STRENGTH_COLORS[strengthScore.value - 1] : ''));
const strengthLabel = computed(() => STRENGTH_LABELS[strengthScore.value]);

async function handleSubmit() {
  alertMessage.value = '';
  errors.password = form.password.length < 8
    || !/[a-z]/.test(form.password)
    || !/[A-Z]/.test(form.password)
    || !/[0-9]/.test(form.password);
  errors.confirmPassword = !(form.confirmPassword === form.password && form.confirmPassword.length > 0);
  if (errors.password || errors.confirmPassword) return;

  loading.value = true;
  const result = await auth.resetPassword(email, code, form.password);
  loading.value = false;

  if (!result.ok) { alertMessage.value = result.message; return; }

  showToast('Password updated! Please sign in with your new password.', 'success');
  setTimeout(() => router.push({ name: 'login' }), 800);
}
</script>

<template>
  <div class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <RouterLink :to="{ name: 'home' }">Home</RouterLink><span class="sep">/</span><RouterLink :to="{ name: 'login' }">Sign In</RouterLink><span class="sep">/</span><span class="current">Reset Password</span>
      </nav>
      <h1>Reset Password</h1>
    </div>
  </div>

  <div class="section">
    <div class="container">
      <div class="auth-layout__form" style="max-width:480px;margin-inline:auto;border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:var(--sp-8);box-shadow:var(--shadow-md)" v-reveal="'zoom'">
        <span class="branch-modal__icon" style="margin-inline:auto"><i class="fa-solid fa-lock"></i></span>
        <h2 style="text-align:center;margin-top:var(--sp-4)">Set a New Password</h2>
        <p class="lead" style="text-align:center">Choose a strong new password for your account.</p>

        <div v-if="alertMessage" class="alert-banner error"><i class="fa-solid fa-circle-exclamation"></i><span>{{ alertMessage }}</span></div>

        <form novalidate style="margin-top:var(--sp-5)" @submit.prevent="handleSubmit">
          <div class="field" :class="{ 'has-error': errors.password }">
            <label for="password">New Password</label>
            <PasswordInput id="password" v-model="form.password" placeholder="Create a new password" autocomplete="new-password" />
            <div class="pw-strength">
              <span v-for="n in 4" :key="n" :style="{ background: n <= strengthScore ? strengthColor : '' }"></span>
            </div>
            <span class="pw-strength-label" :style="{ color: strengthColor }">{{ strengthLabel }}</span>
            <span class="error-msg">Password must be at least 8 characters with upper, lower, and a number.</span>
          </div>
          <FormField
            id="confirmPassword" label="Confirm New Password" type="password" v-model="form.confirmPassword"
            placeholder="Re-enter your new password" autocomplete="new-password"
            :error="errors.confirmPassword" error-message="Passwords do not match."
          />
          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
            <i class="fa-solid" :class="loading ? 'fa-spinner spin' : 'fa-check'"></i> {{ loading ? 'Updating…' : 'Update Password' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
