<script setup>
// Ports assets/js/pages/forgot-password.js.

import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';
import FormField from '@/components/ui/FormField.vue';

const router = useRouter();
const auth = useAuthStore();

const form = reactive({ email: '' });
const errors = reactive({ email: false });
const alertMessage = ref('');
const loading = ref(false);

function validateEmail() {
  errors.email = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  return !errors.email;
}

async function handleSubmit() {
  alertMessage.value = '';
  if (!validateEmail()) return;

  loading.value = true;
  const result = await auth.requestOtp(form.email, 'reset');
  loading.value = false;

  if (!result.ok) { alertMessage.value = result.message; return; }

  showToast('If this email is registered, a reset code has been sent.', 'info');
  router.push({ name: 'verify-otp', query: { email: result.email, purpose: 'reset' } });
}
</script>

<template>
  <div class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <RouterLink :to="{ name: 'home' }">Home</RouterLink><span class="sep">/</span><RouterLink :to="{ name: 'login' }">Sign In</RouterLink><span class="sep">/</span><span class="current">Forgot Password</span>
      </nav>
      <h1>Forgot Password</h1>
    </div>
  </div>

  <div class="section">
    <div class="container">
      <div class="auth-layout__form" style="max-width:480px;margin-inline:auto;border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:var(--sp-8);box-shadow:var(--shadow-md)" v-reveal="'zoom'">
        <span class="branch-modal__icon" style="margin-inline:auto"><i class="fa-solid fa-key"></i></span>
        <h2 style="text-align:center;margin-top:var(--sp-4)">Reset Your Password</h2>
        <p class="lead" style="text-align:center">Enter the email linked to your account and we'll send you a verification code to reset your password.</p>

        <div v-if="alertMessage" class="alert-banner error"><i class="fa-solid fa-circle-exclamation"></i><span>{{ alertMessage }}</span></div>

        <form novalidate style="margin-top:var(--sp-5)" @submit.prevent="handleSubmit">
          <FormField
            id="email" label="Email Address" type="email" v-model="form.email"
            placeholder="jane@example.com" autocomplete="email"
            :error="errors.email" error-message="Please enter a valid email address."
            @blur="validateEmail"
          />
          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
            <i class="fa-solid" :class="loading ? 'fa-spinner spin' : 'fa-paper-plane'"></i> {{ loading ? 'Sending…' : 'Send Reset Code' }}
          </button>
        </form>

        <p class="auth-layout__foot">Remembered your password? <RouterLink :to="{ name: 'login' }">Sign in</RouterLink></p>
      </div>
    </div>
  </div>
</template>
