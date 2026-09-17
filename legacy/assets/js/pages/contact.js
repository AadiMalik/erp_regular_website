// Smart Mart — Contact Us page.

import { qs } from '../core/utils.js';
import { getSelectedBranch } from '../core/branch.js';
import { showToast } from '../core/toast.js';

const VALIDATORS = {
  name: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  subject: (v) => v.trim().length > 0,
  message: (v) => v.trim().length >= 10,
};

function fillBranchInfo() {
  const branch = getSelectedBranch();
  if (!branch) return;
  qs('[data-contact-address]').textContent = branch.address;
  qs('[data-contact-phone]').textContent = branch.phone;
  qs('[data-contact-hours]').textContent = branch.hours;
}

function validateField(input) {
  const wrap = input.closest('[data-field]');
  const valid = VALIDATORS[wrap.dataset.field](input.value);
  wrap.classList.toggle('has-error', !valid);
  return valid;
}

function init() {
  fillBranchInfo();
  window.addEventListener('branch:change', fillBranchInfo);

  const form = qs('[data-contact-form]');
  form.querySelectorAll('[data-field] input, [data-field] select, [data-field] textarea').forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('[data-field]').classList.contains('has-error')) validateField(input);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    qs('[data-contact-success]').hidden = true;
    const inputs = ['name', 'email', 'subject', 'message'].map((id) => qs(`#${id}`, form));
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Sending…';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
      qs('[data-contact-success]').hidden = false;
      showToast('Message sent — we\'ll be in touch soon.', 'success');
      form.reset();
    }, 700);
  });
}

init();
