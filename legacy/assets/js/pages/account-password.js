// Smart Mart — Change Password (account) page.

import { qs } from '../core/utils.js';
import { requireAuth } from '../core/account-nav.js';
import { changePassword } from '../core/auth.js';
import { showToast } from '../core/toast.js';

const user = requireAuth();
if (user) init();

function passwordStrength(value) {
  let score = 0;
  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[0-9]/.test(value) && /[a-zA-Z]/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;
  return score;
}

function wirePasswordStrength(form) {
  const input = qs('#newPassword', form);
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
  const form = qs('[data-password-form]');
  wirePasswordStrength(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    qs('[data-pw-alert]').hidden = true;
    const current = qs('#current', form);
    const next = qs('#newPassword', form);
    const confirm = qs('#confirmPassword', form);

    const currentValid = current.value.length > 0;
    const nextValid = next.value.length >= 6;
    const confirmValid = confirm.value === next.value && confirm.value.length > 0;
    current.closest('[data-field]').classList.toggle('has-error', !currentValid);
    next.closest('[data-field]').classList.toggle('has-error', !nextValid);
    confirm.closest('[data-field]').classList.toggle('has-error', !confirmValid);
    if (!currentValid || !nextValid || !confirmValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Updating…';

    setTimeout(() => {
      const result = changePassword(user.id, current.value, next.value);
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Update Password';

      if (!result.ok) {
        qs('[data-pw-alert-text]').textContent = result.message;
        qs('[data-pw-alert]').hidden = false;
        return;
      }
      form.reset();
      qs('[data-pw-strength-label]').textContent = 'At least 6 characters';
      showToast('Password updated successfully.', 'success');
    }, 600);
  });
}
