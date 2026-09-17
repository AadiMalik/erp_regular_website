// Smart Mart — OTP verification page (used for both signup email verification
// and password-reset flows, distinguished by ?purpose=).

import { qs, qsa } from '../core/utils.js';
import { verifyOtp, requestOtp, getPendingOtp } from '../core/auth.js';
import { showToast } from '../core/toast.js';

const params = new URLSearchParams(window.location.search);
const email = params.get('email') || '';
const purpose = params.get('purpose') || 'signup';

function init() {
  qs('[data-otp-email]').textContent = email || 'your email';
  showDemoCode();
  wireDigits();
  wireResend();
  wireSubmit();
}

function showDemoCode() {
  const pending = getPendingOtp();
  const codeEl = qs('[data-otp-demo-code]');
  if (pending && pending.email === email.toLowerCase()) {
    codeEl.innerHTML = `Your demo verification code is <strong>${pending.code}</strong>. It expires in 5 minutes.`;
  } else {
    codeEl.textContent = 'Your verification code will appear here once sent.';
  }
}

function wireDigits() {
  const digits = qsa('[data-otp-digit]');
  digits.forEach((input, i) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (input.value && digits[i + 1]) digits[i + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && digits[i - 1]) digits[i - 1].focus();
    });
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '').slice(0, digits.length);
      text.split('').forEach((ch, idx) => { if (digits[idx]) digits[idx].value = ch; });
      (digits[text.length - 1] || digits[digits.length - 1]).focus();
    });
  });
}

function wireResend() {
  const btn = qs('[data-otp-resend]');
  let cooldown = 0;
  btn.addEventListener('click', () => {
    if (cooldown > 0 || !email) return;
    const result = requestOtp(email, purpose);
    if (!result.ok) { showToast(result.message, 'error'); return; }
    showToast(`New code: ${result.code} (demo — no email is actually sent)`, 'info', 6000);
    showDemoCode();
    cooldown = 30;
    const original = btn.textContent;
    const tick = () => {
      btn.textContent = `Resend in ${cooldown}s`;
      cooldown -= 1;
      if (cooldown >= 0) setTimeout(tick, 1000);
      else btn.textContent = original;
    };
    tick();
  });
}

function wireSubmit() {
  const form = qs('[data-otp-form]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    qs('[data-otp-error]').hidden = true;
    const code = qsa('[data-otp-digit]').map((d) => d.value).join('');
    if (code.length !== 4) {
      qs('[data-otp-error-text]').textContent = 'Please enter the full 4-digit code.';
      qs('[data-otp-error]').hidden = false;
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner spin"></i> Verifying…';

    setTimeout(() => {
      const result = verifyOtp(code);
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-shield-check"></i> Verify Code';

      if (!result.ok) {
        qs('[data-otp-error-text]').textContent = result.message;
        qs('[data-otp-error]').hidden = false;
        return;
      }

      if (result.purpose === 'signup') {
        showToast('Account verified! Welcome to Smart Mart.', 'success');
        setTimeout(() => { window.location.href = 'account.html'; }, 700);
      } else {
        showToast('Email verified — set your new password.', 'success');
        setTimeout(() => { window.location.href = `reset-password.html?email=${encodeURIComponent(result.email)}`; }, 700);
      }
    }, 600);
  });
}

init();
