<script setup>
// Ports assets/js/pages/signup.js.

import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { showToast } from '@/composables/useToast';
import { fetchSection, fetchContentItems } from '@/services/cms';
import FormField from '@/components/ui/FormField.vue';
import PasswordInput from '@/components/ui/PasswordInput.vue';
import BusinessLogo from '@/components/common/BusinessLogo.vue';
import CaptchaWidget from '@/components/ui/CaptchaWidget.vue';
import SocialLoginButtons from '@/components/ui/SocialLoginButtons.vue';

const router = useRouter();
const auth = useAuthStore();
const site = useWebsiteSettingsStore();
const captcha = ref(null);

const promoSection = ref(null);
const promoBullets = ref([]);
onMounted(async () => {
  [promoSection.value, promoBullets.value] = await Promise.all([
    fetchSection('signup_promo'),
    fetchContentItems('signup_promo'),
  ]);
});

const form = reactive({ name: '', email: '', phone: '', password: '', confirmPassword: '', terms: false });
const errors = reactive({ name: false, email: false, phone: false, password: false, confirmPassword: false });
const alertMessage = ref('');
const loading = ref(false);

const VALIDATORS = {
  name: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: (v) => v.replace(/[^0-9]/g, '').length >= 7,
  password: (v) => v.length >= 8 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v),
  confirmPassword: (v) => v === form.password && v.length > 0,
};

function validate(field) {
  errors[field] = !VALIDATORS[field](form[field]);
  return !errors[field];
}

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
  let valid = ['name', 'email', 'phone', 'password', 'confirmPassword'].map(validate).every(Boolean);
  if (!form.terms) {
    valid = false;
    alertMessage.value = 'Please agree to the Terms & Conditions to continue.';
  }
  if (!valid) return;

  loading.value = true;
  const result = await auth.signup({
    name: form.name,
    email: form.email,
    phone: form.phone,
    password: form.password,
    captchaToken: captcha.value?.getToken(),
  });
  loading.value = false;

  if (!result.ok) {
    alertMessage.value = result.message;
    captcha.value?.reset();
    return;
  }

  showToast('We sent a verification code to your email.', 'info');
  router.push({ name: 'verify-otp', query: { email: result.email, purpose: 'signup' } });
}

async function handleSocialToken({ provider, token }) {
  alertMessage.value = '';
  loading.value = true;
  const result = await auth.loginWithSocial(provider, token, { createProfile: true });
  loading.value = false;

  if (!result.ok) { alertMessage.value = result.message; return; }
  showToast(`Welcome, ${result.user.name.split(' ')[0]}!`, 'success');
  setTimeout(() => router.push({ name: 'account' }), 500);
}
</script>

<template>
  <div class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <RouterLink :to="{ name: 'home' }">Home</RouterLink><span class="sep">/</span><span class="current">Create Account</span>
      </nav>
      <h1>Create Account</h1>
    </div>
  </div>

  <div class="section">
    <div class="container">
      <div class="auth-layout" style="border:1px solid var(--color-border);border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-md);background:#fff">
        <div class="auth-layout__visual" v-reveal="'left'">
          <BusinessLogo light style="margin-bottom:var(--sp-6)" />
          <h2>{{ promoSection?.heading || 'Join thousands of happy shoppers.' }}</h2>
          <p>{{ promoSection?.description || 'Create a free account to unlock faster checkout, order tracking and personalised deals.' }}</p>
          <ul v-if="promoBullets.length">
            <li v-for="b in promoBullets" :key="b.id"><i :class="b.icon || 'fa-solid fa-circle-check'"></i> {{ b.title }}</li>
          </ul>
          <ul v-else>
            <li><i class="fa-solid fa-gift"></i> Member-only offers &amp; coupons</li>
            <li><i class="fa-solid fa-map-pin"></i> Save multiple delivery addresses</li>
            <li><i class="fa-solid fa-clock-rotate-left"></i> Full order history, anytime</li>
          </ul>
        </div>
        <div class="auth-layout__form" v-reveal="'right'">
          <h2>Create Your Account</h2>
          <p class="lead">It only takes a minute to get started.</p>

          <div v-if="alertMessage" class="alert-banner error"><i class="fa-solid fa-circle-exclamation"></i><span>{{ alertMessage }}</span></div>

          <form novalidate @submit.prevent="handleSubmit">
            <FormField
              id="name" label="Full Name" v-model="form.name"
              placeholder="Jane Doe" autocomplete="name"
              :error="errors.name" error-message="Please enter your full name."
              @blur="validate('name')"
            />
            <FormField
              id="email" label="Email Address" type="email" v-model="form.email"
              placeholder="jane@example.com" autocomplete="email"
              :error="errors.email" error-message="Please enter a valid email address."
              @blur="validate('email')"
            />
            <FormField
              id="phone" label="Phone Number" type="tel" v-model="form.phone"
              placeholder="03001234567" autocomplete="tel"
              :error="errors.phone" error-message="Please enter a valid phone number."
              @blur="validate('phone')"
            />
            <div class="field" :class="{ 'has-error': errors.password }">
              <label for="password">Password</label>
              <PasswordInput
                id="password" v-model="form.password"
                placeholder="Create a password" autocomplete="new-password"
                @blur="validate('password')"
              />
              <div class="pw-strength">
                <span v-for="n in 4" :key="n" :style="{ background: n <= strengthScore ? strengthColor : '' }"></span>
              </div>
              <span class="pw-strength-label" :style="{ color: strengthColor }">{{ strengthLabel }}</span>
              <span class="error-msg">Password must be at least 8 characters with upper, lower, and a number.</span>
            </div>
            <FormField
              id="confirmPassword" label="Confirm Password" type="password" v-model="form.confirmPassword"
              placeholder="Re-enter your password" autocomplete="new-password"
              :error="errors.confirmPassword" error-message="Passwords do not match."
              @blur="validate('confirmPassword')"
            />
            <div class="field-check" style="margin-bottom:var(--sp-5)">
              <input id="terms" v-model="form.terms" type="checkbox">
              <label for="terms" style="font-weight:400">I agree to the <RouterLink :to="{ name: 'terms-conditions' }" style="color:var(--color-primary-dark);font-weight:700">Terms &amp; Conditions</RouterLink> and <RouterLink :to="{ name: 'privacy-policy' }" style="color:var(--color-primary-dark);font-weight:700">Privacy Policy</RouterLink></label>
            </div>
            <CaptchaWidget v-if="site.auth.captcha.enabled" ref="captcha" :site-key="site.auth.captcha.site_key" style="margin-bottom:var(--sp-4)" />
            <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
              <i class="fa-solid" :class="loading ? 'fa-spinner spin' : 'fa-user-plus'"></i> {{ loading ? 'Creating account…' : 'Create Account' }}
            </button>
          </form>

          <template v-if="site.auth.google.enabled || site.auth.facebook.enabled">
            <div class="auth-divider">or</div>
            <SocialLoginButtons @token="handleSocialToken" @error="alertMessage = $event" />
          </template>
          <p class="auth-layout__foot">Already have an account? <RouterLink :to="{ name: 'login' }">Sign in</RouterLink></p>
        </div>
      </div>
    </div>
  </div>
</template>
