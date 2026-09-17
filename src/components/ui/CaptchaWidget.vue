<script setup>
// Google reCAPTCHA v2 checkbox - vanilla <script> integration, no npm
// package (see CLAUDE.md "no unnecessary dependencies"). Rendered only when
// the business has enabled CAPTCHA (site.auth.captcha.enabled); the parent
// form calls getToken() at submit time and resets the widget on failure so
// the (single-use) token isn't silently reused.
import { ref, onMounted } from 'vue';
import { loadScript } from '@/utils/loadScript';

const props = defineProps({
  siteKey: { type: String, required: true },
});

const container = ref(null);
const widgetId = ref(null);

onMounted(async () => {
  await loadScript('https://www.google.com/recaptcha/api.js?render=explicit');
  await waitForGrecaptcha();
  if (!container.value || !window.grecaptcha) return;
  widgetId.value = window.grecaptcha.render(container.value, { sitekey: props.siteKey });
});

function waitForGrecaptcha() {
  return new Promise((resolve) => {
    if (window.grecaptcha?.render) {
      resolve();
      return;
    }
    const check = setInterval(() => {
      if (window.grecaptcha?.render) {
        clearInterval(check);
        resolve();
      }
    }, 100);
  });
}

function getToken() {
  if (widgetId.value === null || !window.grecaptcha) return '';
  return window.grecaptcha.getResponse(widgetId.value);
}

function reset() {
  if (widgetId.value !== null && window.grecaptcha) {
    window.grecaptcha.reset(widgetId.value);
  }
}

defineExpose({ getToken, reset });
</script>

<template>
  <div ref="container" class="captcha-widget"></div>
</template>
