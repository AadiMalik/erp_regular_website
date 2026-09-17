<script setup>
// Ports assets/js/pages/account-password.js.

import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';
import PageHeader from '@/components/ui/PageHeader.vue';
import AccountSidebar from '@/components/account/AccountSidebar.vue';
import PasswordInput from '@/components/ui/PasswordInput.vue';

const router = useRouter();
const auth = useAuthStore();

const form = reactive({ current: '', newPassword: '', confirmPassword: '' });
const errors = reactive({ current: false, newPassword: false, confirmPassword: false });
const alertMessage = ref('');
const submitting = ref(false);

const STRENGTH_COLORS = ['var(--color-danger)', 'var(--color-accent)', 'var(--color-gold)', 'var(--color-primary)'];
const STRENGTH_LABELS = ['At least 8 characters', 'Weak', 'Fair', 'Good', 'Strong'];

function passwordStrength(value) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 10) score += 1;
  if (/[0-9]/.test(value) && /[a-zA-Z]/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;
  return score;
}

const strengthScore = computed(() => (form.newPassword ? passwordStrength(form.newPassword) : 0));
const strengthLabel = computed(() => STRENGTH_LABELS[strengthScore.value]);
const strengthColor = computed(() => (strengthScore.value ? STRENGTH_COLORS[strengthScore.value - 1] : ''));

function barColor(i) {
  return i < strengthScore.value ? STRENGTH_COLORS[strengthScore.value - 1] : '';
}

async function submit() {
  alertMessage.value = '';
  errors.current = form.current.length === 0;
  errors.newPassword = form.newPassword.length < 8
    || !/[a-z]/.test(form.newPassword)
    || !/[A-Z]/.test(form.newPassword)
    || !/[0-9]/.test(form.newPassword);
  errors.confirmPassword = form.confirmPassword !== form.newPassword || form.confirmPassword.length === 0;
  if (errors.current || errors.newPassword || errors.confirmPassword) return;

  submitting.value = true;
  const result = await auth.changePassword(auth.currentUser.id, form.current, form.newPassword);
  submitting.value = false;

  if (!result.ok) {
    alertMessage.value = result.message;
    return;
  }
  form.current = '';
  form.newPassword = '';
  form.confirmPassword = '';
  showToast('Password updated. Please sign in again.', 'success');
  router.push({ name: 'login' });
}
</script>

<template>
  <PageHeader title="Change Password" crumb="Change Password" />

  <div class="section">
    <div class="container">
      <div class="account-layout">
        <AccountSidebar active="password" />

        <div>
          <div class="account-card" style="max-width:520px">
            <div class="account-card__head">
              <div><h3>Change Password</h3><p>Use a strong password you don't use elsewhere</p></div>
            </div>
            <div v-if="alertMessage" class="alert-banner error"><i class="fa-solid fa-circle-exclamation"></i><span>{{ alertMessage }}</span></div>
            <form novalidate @submit.prevent="submit">
              <div class="field" :class="{ 'has-error': errors.current }">
                <label for="current">Current Password</label>
                <PasswordInput id="current" v-model="form.current" autocomplete="current-password" />
                <span class="error-msg">Please enter your current password.</span>
              </div>
              <div class="field" :class="{ 'has-error': errors.newPassword }">
                <label for="newPassword">New Password</label>
                <PasswordInput id="newPassword" v-model="form.newPassword" autocomplete="new-password" />
                <div class="pw-strength">
                  <span :style="{ background: barColor(0) }"></span>
                  <span :style="{ background: barColor(1) }"></span>
                  <span :style="{ background: barColor(2) }"></span>
                  <span :style="{ background: barColor(3) }"></span>
                </div>
                <span class="pw-strength-label" :style="{ color: strengthColor }">{{ strengthLabel }}</span>
                <span class="error-msg">Password must be at least 8 characters with upper, lower, and a number.</span>
              </div>
              <div class="field" :class="{ 'has-error': errors.confirmPassword }">
                <label for="confirmPassword">Confirm New Password</label>
                <PasswordInput id="confirmPassword" v-model="form.confirmPassword" autocomplete="new-password" />
                <span class="error-msg">Passwords do not match.</span>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <i class="fa-solid" :class="submitting ? 'fa-spinner spin' : 'fa-check'"></i> {{ submitting ? 'Updating…' : 'Update Password' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
