// Smart Mart — Forgot password page.

import { qs } from '../core/utils.js';
import { requestOtp } from '../core/auth.js';
import { showToast } from '../core/toast.js';

function init() {
  const form = qs('[data-forgot-form]');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = qs('#email', form);
    const wrap = emailInput.closest('[data-field]');
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    wrap.classList.toggle('has-error', !valid);
    qs('[data-forgot-alert]').hidden = true;
    if (!valid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Sending…';

    setTimeout(() => {
      const result = requestOtp(emailInput.value, 'reset');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Reset Code';

      if (!result.ok) {
        qs('[data-forgot-alert-text]').textContent = result.message;
        qs('[data-forgot-alert]').hidden = false;
        return;
      }

      showToast(`Verification code: ${result.code} (demo — no email is actually sent)`, 'info', 6000);
      setTimeout(() => {
        window.location.href = `verify-otp.html?email=${encodeURIComponent(result.email)}&purpose=reset`;
      }, 900);
    }, 600);
  });
}

init();
