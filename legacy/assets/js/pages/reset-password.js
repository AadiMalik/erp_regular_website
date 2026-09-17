// Smart Mart — Reset password page (final step after OTP verification).

import { qs } from '../core/utils.js';
import { resetPassword } from '../core/auth.js';
import { showToast } from '../core/toast.js';

const params = new URLSearchParams(window.location.search);
const email = params.get('email') || '';

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

function init() {
  const form = qs('[data-reset-form]');
  if (!form) return;
  wirePasswordStrength(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    qs('[data-reset-alert]').hidden = true;
    const password = qs('#password', form);
    const confirm = qs('#confirmPassword', form);

    const passwordValid = password.value.length >= 6;
    const confirmValid = confirm.value === password.value && confirm.value.length > 0;
    password.closest('[data-field]').classList.toggle('has-error', !passwordValid);
    confirm.closest('[data-field]').classList.toggle('has-error', !confirmValid);
    if (!passwordValid || !confirmValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Updating…';

    setTimeout(() => {
      const result = resetPassword(email, password.value);
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Update Password';

      if (!result.ok) {
        qs('[data-reset-alert-text]').textContent = result.message;
        qs('[data-reset-alert]').hidden = false;
        return;
      }

      showToast('Password updated! Please sign in with your new password.', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 800);
    }, 600);
  });
}

init();
