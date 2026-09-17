<script setup>
// Google/Facebook Sign-In buttons - shown only for the providers this
// business has enabled (Settings > Social Login & Security). Emits the
// provider access/id token; the parent view exchanges it via
// authStore.loginWithSocial(provider, token) same as any other login.
//
// Google's own rendered button doesn't match our .btn look, and GIS has no
// API to open its consent popup from an arbitrary button - so the *real*
// Google button is rendered invisibly on top of one of our own .btn's
// (CSS-scaled to exactly cover it), and the visible custom button
// underneath is what the user actually sees. Clicks land on the real
// (invisible) Google button either way, so it's still Google's genuine
// popup/credential flow, just restyled to match Facebook's button.
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { renderGoogleButton } from '@/composables/useGoogleSignIn';
import { loginWithFacebook } from '@/composables/useFacebookLogin';

const emit = defineEmits(['token', 'error']);

const site = useWebsiteSettingsStore();
const googleWrap = ref(null);
const googleButton = ref(null);
const fbBusy = ref(false);

async function mountGoogleButton() {
  if (!site.auth.google.enabled || !site.auth.google.client_id) return;
  await renderGoogleButton(googleButton.value, site.auth.google.client_id, (idToken) => {
    emit('token', { provider: 'google', token: idToken });
  });
  await nextTick();
  scaleGoogleButton();
  window.addEventListener('resize', scaleGoogleButton);
}

function scaleGoogleButton() {
  const wrap = googleWrap.value;
  const inner = googleButton.value?.firstElementChild;
  if (!wrap || !inner || !inner.offsetWidth) return;
  inner.style.transformOrigin = 'top left';
  inner.style.transform = `scale(${wrap.offsetWidth / inner.offsetWidth}, ${wrap.offsetHeight / inner.offsetHeight})`;
}

onMounted(mountGoogleButton);
onBeforeUnmount(() => window.removeEventListener('resize', scaleGoogleButton));
watch(() => site.auth.google.client_id, mountGoogleButton);

async function handleFacebook() {
  fbBusy.value = true;
  try {
    const accessToken = await loginWithFacebook(site.auth.facebook.app_id);
    emit('token', { provider: 'facebook', token: accessToken });
  } catch (err) {
    emit('error', err.message || 'Facebook login failed.');
  } finally {
    fbBusy.value = false;
  }
}
</script>

<template>
  <div v-if="site.auth.google.enabled || site.auth.facebook.enabled" class="social-login-buttons">
    <div v-if="site.auth.google.enabled" ref="googleWrap" class="social-login-buttons__google-wrap">
      <button type="button" class="btn btn-outline btn-block" tabindex="-1">
        <i class="fa-brands fa-google"></i> Continue with Google
      </button>
      <div ref="googleButton" class="social-login-buttons__google-overlay" aria-hidden="true"></div>
    </div>
    <button
      v-if="site.auth.facebook.enabled"
      type="button"
      class="btn btn-outline btn-block"
      :disabled="fbBusy"
      @click="handleFacebook"
    >
      <i class="fa-brands fa-facebook"></i> {{ fbBusy ? 'Connecting…' : 'Continue with Facebook' }}
    </button>
  </div>
</template>
