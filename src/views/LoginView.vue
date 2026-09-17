<script setup>
// Ports assets/js/pages/login.js.

import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { showToast } from '@/composables/useToast';
import { fetchSection, fetchContentItems } from '@/services/cms';
import FormField from '@/components/ui/FormField.vue';
import BusinessLogo from '@/components/common/BusinessLogo.vue';
import CaptchaWidget from '@/components/ui/CaptchaWidget.vue';
import SocialLoginButtons from '@/components/ui/SocialLoginButtons.vue';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const site = useWebsiteSettingsStore();
const captcha = ref(null);

const promoSection = ref(null);
const promoBullets = ref([]);
onMounted(async () => {
  [promoSection.value, promoBullets.value] = await Promise.all([
    fetchSection('login_promo'),
    fetchContentItems('login_promo'),
  ]);
});

const form = reactive({ email: '', password: '', remember: false });
const errors = reactive({ email: false, password: false });
const alertMessage = ref('');
const loading = ref(false);

const VALIDATORS = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  password: (v) => v.length > 0,
};

function validate(field) {
  errors[field] = !VALIDATORS[field](form[field]);
  return !errors[field];
}

function afterLogin(result) {
  if (result.ok) {
    showToast(`Welcome back, ${result.user.name.split(' ')[0]}!`, 'success');
    setTimeout(() => {
      router.push(route.query.redirect ? String(route.query.redirect) : { name: 'account' });
    }, 500);
    return;
  }
  alertMessage.value = result.message;
  captcha.value?.reset();
}

async function handleSubmit() {
  alertMessage.value = '';
  const valid = ['email', 'password'].map(validate).every(Boolean);
  if (!valid) return;

  loading.value = true;
  const result = await auth.login({
    email: form.email,
    password: form.password,
    captchaToken: captcha.value?.getToken(),
  });
  loading.value = false;
  afterLogin(result);
}

async function handleSocialToken({ provider, token }) {
  alertMessage.value = '';
  loading.value = true;
  const result = await auth.loginWithSocial(provider, token);
  loading.value = false;
  afterLogin(result);
}
</script>

<template>
  <div class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <RouterLink :to="{ name: 'home' }">Home</RouterLink><span class="sep">/</span><span class="current">Sign In</span>
      </nav>
      <h1>Sign In</h1>
    </div>
  </div>

  <div class="section">
    <div class="container">
      <div class="auth-layout" style="border:1px solid var(--color-border);border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-md);background:#fff">
        <div class="auth-layout__visual" v-reveal="'left'">
          <BusinessLogo light style="margin-bottom:var(--sp-6)" />
          <h2>{{ promoSection?.heading || 'Fresh groceries, delivered fast.' }}</h2>
          <p>{{ promoSection?.description || 'Sign in to track your orders, reorder favourites in one tap, and check out faster with saved addresses.' }}</p>
          <ul v-if="promoBullets.length">
            <li v-for="b in promoBullets" :key="b.id"><i :class="b.icon || 'fa-solid fa-circle-check'"></i> {{ b.title }}</li>
          </ul>
          <ul v-else>
            <li><i class="fa-solid fa-truck-fast"></i> Track every order in real time</li>
            <li><i class="fa-solid fa-heart"></i> Sync your wishlist across visits</li>
            <li><i class="fa-solid fa-bolt"></i> One-tap reorder from history</li>
          </ul>
        </div>
        <div class="auth-layout__form" v-reveal="'right'">
          <h2>Welcome Back</h2>
          <p class="lead">Sign in to continue shopping with {{ site.business.name }}.</p>

          <div v-if="alertMessage" class="alert-banner error"><i class="fa-solid fa-circle-exclamation"></i><span>{{ alertMessage }}</span></div>

          <form novalidate @submit.prevent="handleSubmit">
            <FormField
              id="email" label="Email Address" type="email" v-model="form.email"
              placeholder="jane@example.com" autocomplete="email"
              :error="errors.email" error-message="Please enter a valid email address."
              @blur="validate('email')"
            />
            <FormField
              id="password" label="Password" type="password" v-model="form.password"
              placeholder="Enter your password" autocomplete="current-password"
              :error="errors.password" error-message="Please enter your password."
              @blur="validate('password')"
            />
            <div class="field-between">
              <label class="field-check"><input v-model="form.remember" type="checkbox"> Remember me</label>
              <RouterLink :to="{ name: 'forgot-password' }">Forgot password?</RouterLink>
            </div>
            <CaptchaWidget v-if="site.auth.captcha.enabled" ref="captcha" :site-key="site.auth.captcha.site_key" style="margin-bottom:var(--sp-4)" />
            <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="loading">
              <i class="fa-solid" :class="loading ? 'fa-spinner spin' : 'fa-right-to-bracket'"></i> {{ loading ? 'Signing in…' : 'Sign In' }}
            </button>
          </form>

          <template v-if="site.auth.google.enabled || site.auth.facebook.enabled">
            <div class="auth-divider">or</div>
            <SocialLoginButtons @token="handleSocialToken" @error="alertMessage = $event" />
          </template>
          <p class="auth-layout__foot">New to {{ site.business.name }}? <RouterLink :to="{ name: 'signup' }">Create an account</RouterLink></p>
        </div>
      </div>
    </div>
  </div>
</template>
