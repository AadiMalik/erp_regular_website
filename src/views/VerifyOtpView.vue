<script setup>
// Ports assets/js/pages/verify-otp.js.

import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { showToast } from '@/composables/useToast';
import { useCountdown } from '@/composables/useCountdown';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const site = useWebsiteSettingsStore();

const email = String(route.query.email || '');
const purpose = String(route.query.purpose || 'signup');

// Rehydrate OTP context from the URL when the store lost it (page refresh).
onMounted(() => {
  if (email && !auth.pendingEmail) {
    auth.pendingEmail = email;
    auth.pendingPurpose = purpose;
  }
});

const digits = reactive(['', '', '', '', '', '']);
const digitEls = [];
function setDigitEl(el, i) { digitEls[i] = el; }

function onDigitInput(i, e) {
  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
  digits[i] = value;
  e.target.value = value;
  if (value && digitEls[i + 1]) digitEls[i + 1].focus();
}
function onDigitKeydown(i, e) {
  if (e.key === 'Backspace' && !digits[i] && digitEls[i - 1]) digitEls[i - 1].focus();
}
function onDigitPaste(i, e) {
  e.preventDefault();
  const text = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '').slice(0, digits.length);
  text.split('').forEach((ch, idx) => {
    digits[idx] = ch;
    if (digitEls[idx]) digitEls[idx].value = ch;
  });
  (digitEls[text.length - 1] || digitEls[digits.length - 1])?.focus();
}

// Resend cooldown reuses useCountdown by mutating the same Date instance it
// observes; resendTarget starts in the past so the button is enabled immediately.
const resendTarget = new Date();
const cooldown = useCountdown(resendTarget);
const cooldownSecs = computed(() => Number(cooldown.mins) * 60 + Number(cooldown.secs));
const canResend = computed(() => cooldownSecs.value <= 0);

async function resend() {
  if (!canResend.value || !email) return;
  const result = await auth.requestOtp(email, purpose);
  if (!result.ok) { showToast(result.message, 'error'); return; }
  showToast('A new code has been sent to your email.', 'info');
  resendTarget.setTime(Date.now() + 30000);
}

const errorMessage = ref('');
const loading = ref(false);

async function handleSubmit() {
  errorMessage.value = '';
  const code = digits.join('');
  if (code.length !== 6) {
    errorMessage.value = 'Please enter the full 6-digit code.';
    return;
  }

  loading.value = true;
  const result = await auth.verifyOtp(code);
  loading.value = false;

  if (!result.ok) {
    errorMessage.value = result.message;
    return;
  }

  if (result.purpose === 'signup') {
    showToast(`Account verified! Welcome to ${site.business.name}.`, 'success');
    setTimeout(() => router.push({ name: 'account' }), 700);
  } else {
    router.push({ name: 'reset-password', query: { email: result.email } });
  }
}
</script>

<template>
  <div class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <RouterLink :to="{ name: 'home' }">Home</RouterLink><span class="sep">/</span><span class="current">Verify Email</span>
      </nav>
      <h1>Verify Your Email</h1>
    </div>
  </div>

  <div class="section">
    <div class="container">
      <div class="auth-layout__form" style="max-width:480px;margin-inline:auto;text-align:center;border:1px solid var(--color-border);border-radius:var(--radius-xl);padding:var(--sp-8);box-shadow:var(--shadow-md)" v-reveal="'zoom'">
        <span class="branch-modal__icon" style="margin-inline:auto"><i class="fa-solid fa-envelope-open-text"></i></span>
        <h2 style="margin-top:var(--sp-4)">Enter Verification Code</h2>
        <p class="lead" style="text-align:center">We've sent a 6-digit code to <strong>{{ email || 'your email' }}</strong>. It expires in a few minutes.</p>
        <div v-if="errorMessage" class="alert-banner error" style="text-align:left"><i class="fa-solid fa-circle-exclamation"></i><span>{{ errorMessage }}</span></div>

        <form style="margin-top:var(--sp-6)" @submit.prevent="handleSubmit">
          <div class="otp-inputs">
            <input
              v-for="(d, i) in digits" :key="i"
              type="text" inputmode="numeric" maxlength="1" :value="d"
              :ref="(el) => setDigitEl(el, i)"
              @input="onDigitInput(i, $event)"
              @keydown="onDigitKeydown(i, $event)"
              @paste="onDigitPaste(i, $event)"
            >
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:var(--sp-6)" :disabled="loading">
            <i class="fa-solid" :class="loading ? 'fa-spinner spin' : 'fa-shield-check'"></i> {{ loading ? 'Verifying…' : 'Verify Code' }}
          </button>
        </form>

        <p class="auth-layout__foot">
          Didn't get a code?
          <button type="button" style="color:var(--color-primary-dark);font-weight:700" :disabled="!canResend" @click="resend">
            {{ canResend ? 'Resend Code' : `Resend in ${cooldownSecs}s` }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
