<script setup>
import { ref, onMounted } from 'vue';
import { showToast } from '@/composables/useToast';
import { fetchSection, subscribeNewsletter } from '@/services/cms';

const email = ref('');
const submitting = ref(false);
const section = ref(null);
onMounted(async () => { section.value = await fetchSection('newsletter'); });

async function subscribe() {
  submitting.value = true;
  const result = await subscribeNewsletter(email.value, 'homepage_newsletter');
  submitting.value = false;

  if (result.success) {
    showToast("You're subscribed! Watch your inbox for fresh deals.", 'success');
    email.value = '';
  } else {
    showToast(result.message || 'Failed to subscribe. Please try again.', 'error');
  }
}
</script>

<template>
  <div class="newsletter" v-reveal="'zoom'">
    <div class="newsletter__text">
      <h2>{{ section?.heading || 'Get Fresh Deals in Your Inbox' }}</h2>
      <p>{{ section?.description || 'Subscribe for weekly offers, new arrivals and exclusive discounts.' }}</p>
    </div>
    <form @submit.prevent="subscribe">
      <input v-model="email" type="email" required placeholder="Enter your email address" aria-label="Email address" :disabled="submitting">
      <button type="submit" class="btn btn-dark" :disabled="submitting">{{ submitting ? 'Subscribing…' : (section?.button_text || 'Subscribe') }}</button>
    </form>
  </div>
</template>
