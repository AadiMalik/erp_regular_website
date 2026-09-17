// Smart Mart — Login page.

import { qs } from '../core/utils.js';
import { login } from '../core/auth.js';
import { showToast } from '../core/toast.js';

const VALIDATORS = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  password: (v) => v.length > 0,
};

function validateField(input) {
  const wrap = input.closest('[data-field]');
  const valid = VALIDATORS[wrap.dataset.field](input.value);
  wrap.classList.toggle('has-error', !valid);
  return valid;
}

function wireValidation(form) {
  form.querySelectorAll('[data-field] input').forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('[data-field]').classList.contains('has-error')) validateField(input);
    });
  });
}

function showAlert(message) {
  const alert = qs('[data-login-alert]');
  qs('[data-login-alert-text]').textContent = message;
  alert.hidden = false;
}

function init() {
  const form = qs('[data-login-form]');
  if (!form) return;
  wireValidation(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    qs('[data-login-alert]').hidden = true;
    const email = qs('#email', form);
    const password = qs('#password', form);
    const valid = [email, password].map(validateField).every(Boolean);
    if (!valid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Signing in…';

    setTimeout(() => {
      const result = login({ email: email.value, password: password.value });
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';

      if (result.ok) {
        showToast(`Welcome back, ${result.user.name.split(' ')[0]}!`, 'success');
        const params = new URLSearchParams(window.location.search);
        setTimeout(() => { window.location.href = params.get('redirect') || 'account.html'; }, 500);
        return;
      }

      if (result.needsVerification) {
        showToast(`Verification code: ${result.code} (demo — no email is actually sent)`, 'info', 6000);
        setTimeout(() => {
          window.location.href = `verify-otp.html?email=${encodeURIComponent(result.email)}&purpose=signup`;
        }, 900);
        return;
      }

      showAlert(result.message);
    }, 600);
  });
}

init();
