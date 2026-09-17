<script setup>
// Ports assets/js/pages/contact.js.

import { reactive, ref, onMounted } from 'vue';
import { fetchContactInfo, submitContactMessage } from '@/services/cms';
import { showToast } from '@/composables/useToast';
import PageHeader from '@/components/ui/PageHeader.vue';
import FormField from '@/components/ui/FormField.vue';

const contact = ref({ address: '', phone: '', email: '', hours: '' });

const SUBJECTS = ['Order Inquiry', 'Delivery Issue', 'Returns & Refunds', 'Product Feedback', 'Other'];

const form = reactive({ name: '', email: '', subject: '', message: '' });
const errors = reactive({ name: false, email: false, subject: false, message: false });
const submitting = ref(false);
const submitted = ref(false);

const VALIDATORS = {
  name: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  subject: (v) => v.trim().length > 0,
  message: (v) => v.trim().length >= 10,
};

function validateField(field) {
  errors[field] = !VALIDATORS[field](form[field]);
  return !errors[field];
}

function onBlur(field) {
  validateField(field);
}

function onInput(field) {
  if (errors[field]) validateField(field);
}

async function submit() {
  submitted.value = false;
  const allValid = Object.keys(VALIDATORS).map(validateField).every(Boolean);
  if (!allValid) return;

  submitting.value = true;
  const result = await submitContactMessage({
    name: form.name,
    email: form.email,
    subject: form.subject,
    message: form.message,
  });
  submitting.value = false;

  if (result.success) {
    submitted.value = true;
    showToast("Message sent — we'll be in touch soon.", 'success');
    form.name = '';
    form.email = '';
    form.subject = '';
    form.message = '';
    Object.keys(errors).forEach((k) => { errors[k] = false; });
  } else {
    showToast(result.message || 'Failed to send message. Please try again.', 'error');
  }
}

onMounted(async () => {
  contact.value = await fetchContactInfo();
});
</script>

<template>
  <PageHeader title="Contact Us" crumb="Contact Us" section-type="contact_us">
    <p>Questions, feedback or need a hand with an order? We're here to help.</p>
  </PageHeader>

  <div class="section">
    <div class="container">
      <div class="contact-layout">
        <div class="contact-info-card" v-reveal="'left'">
          <div class="contact-info-card__item">
            <i class="fa-solid fa-location-dot"></i>
            <div><strong>Visit a Branch</strong><span>{{ contact.address }}</span></div>
          </div>
          <div class="contact-info-card__item">
            <i class="fa-solid fa-phone"></i>
            <div><strong>Call Us</strong><span>{{ contact.phone }}</span></div>
          </div>
          <div class="contact-info-card__item">
            <i class="fa-solid fa-envelope"></i>
            <div><strong>Email Us</strong><span>{{ contact.email }}</span></div>
          </div>
          <div class="contact-info-card__item">
            <i class="fa-solid fa-clock"></i>
            <div><strong>Hours</strong><span>{{ contact.hours }}</span></div>
          </div>
          <div class="contact-map"><img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=70" alt="Map placeholder"></div>
        </div>

        <div v-reveal="'right'">
          <div class="account-card">
            <div class="account-card__head"><div><h3>Send Us a Message</h3><p>We typically reply within one business day</p></div></div>

            <div v-if="submitted" class="alert-banner success"><i class="fa-solid fa-circle-check"></i><span>Thanks! Your message has been sent — our support team will get back to you shortly.</span></div>

            <form novalidate @submit.prevent="submit">
              <div class="field-row">
                <FormField
                  id="name" label="Full Name" v-model="form.name" placeholder="Jane Doe"
                  :error="errors.name" error-message="Please enter your name."
                  @blur="onBlur('name')" @update:model-value="onInput('name')"
                />
                <FormField
                  id="email" label="Email Address" type="email" v-model="form.email" placeholder="jane@example.com"
                  :error="errors.email" error-message="Please enter a valid email address."
                  @blur="onBlur('email')" @update:model-value="onInput('email')"
                />
              </div>
              <FormField
                id="subject" label="Subject" as="select" v-model="form.subject"
                :error="errors.subject" error-message="Please select a subject."
                @blur="onBlur('subject')" @update:model-value="onInput('subject')"
              >
                <option value="">Select a topic</option>
                <option v-for="s in SUBJECTS" :key="s" :value="s">{{ s }}</option>
              </FormField>
              <FormField
                id="message" label="Message" as="textarea" :rows="5" v-model="form.message" placeholder="How can we help?"
                :error="errors.message" error-message="Please enter a message (at least 10 characters)."
                @blur="onBlur('message')" @update:model-value="onInput('message')"
              />
              <button type="submit" class="btn btn-primary btn-lg" :disabled="submitting">
                <i class="fa-solid" :class="submitting ? 'fa-spinner spin' : 'fa-paper-plane'"></i> {{ submitting ? 'Sending…' : 'Send Message' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
