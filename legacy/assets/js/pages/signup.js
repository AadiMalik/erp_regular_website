// Smart Mart — Sign up page.

import { qs } from '../core/utils.js';
import { signup } from '../core/auth.js';
import { showToast } from '../core/toast.js';

const VALIDATORS = {
  name: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: (v) => v.replace(/[^0-9]/g, '').length >= 7,
  password: (v) => v.length >= 6,
  confirmPassword: (v, form) => v === form.password.value && v.length > 0,
  terms: (v, form) => form.terms.checked,
};

function validateField(input, form) {
  const wrap = input.closest('[data-field]');
  const valid = VALIDATORS[wrap.dataset.field](input.value, form);
  wrap.classList.toggle('has-error', !valid);
  return valid;
}

function passwordStrength(value) {
  let score = 0;
  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[0-9]/.test(value) && /[a-zA-Z]/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;
  return score;
}

function wirePasswordStrength(form) {
  const input = qs('#password', form);
  const bars = qs('[data-pw-strength]', form).querySelectorAll('span');
  const label = qs('[data-pw-strength-label]', form);
  const colors = ['var(--color-danger)', 'var(--color-accent)', 'var(--color-gold)', 'var(--color-primary)'];
  const labels = ['At least 6 characters', 'Weak', 'Fair', 'Good', 'Strong'];
  input.addEventListener('input', () => {
    const score = input.value ? passwordStrength(input.value) : 0;
    bars.forEach((bar, i) => { bar.style.background = i < score ? colors[score - 1] : ''; });
    label.textContent = labels[score];
    label.style.color = score ? colors[score - 1] : '';
  });
}

function wireValidation(form) {
  form.querySelectorAll('[data-field] input[type], [data-field] input:not([type])').forEach((input) => {
    if (input.type === 'checkbox') return;
    input.addEventListener('blur', () => validateField(input, form));
    input.addEventListener('input', () => {
      if (input.closest('[data-field]').classList.contains('has-error')) validateField(input, form);
    });
  });
}

function showAlert(message) {
  const alert = qs('[data-signup-alert]');
  qs('[data-signup-alert-text]').textContent = message;
  alert.hidden = false;
}

function init() {
  const form = qs('[data-signup-form]');
  if (!form) return;
  wireValidation(form);
  wirePasswordStrength(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    qs('[data-signup-alert]').hidden = true;

    const fields = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    let allValid = fields.map((key) => validateField(qs(`#${key}`, form), form)).every(Boolean);
    const termsWrap = qs('[data-field="terms"]', form) || qs('#terms', form).closest('.field-check');
    if (!form.terms.checked) {
      allValid = false;
      showAlert('Please agree to the Terms & Conditions to continue.');
    }
    if (!allValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Creating account…';

    setTimeout(() => {
      const result = signup({
        name: qs('#name', form).value,
        email: form.email.value,
        phone: form.phone.value,
        password: form.password.value,
      });
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';

      if (!result.ok) { showAlert(result.message); return; }

      showToast(`Verification code: ${result.code} (demo — no email is actually sent)`, 'info', 6000);
      setTimeout(() => {
        window.location.href = `verify-otp.html?email=${encodeURIComponent(result.email)}&purpose=signup`;
      }, 900);
    }, 700);
  });
}

init();
