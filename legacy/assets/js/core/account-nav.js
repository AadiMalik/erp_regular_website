// Smart Mart — shared sidebar for the account pages (account.html,
// account-edit.html, account-password.html, orders.html, order-details.html).
// Each page includes the same `.account-nav` markup with the correct `active`
// link already set; this just fills in the user's name/avatar and wires logout.

import { qs } from './utils.js';
import { getCurrentUser, logout } from './auth.js';
import { showToast } from './toast.js';

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?';
}

// Returns the current user, or redirects to login and returns null.
export function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    const redirect = encodeURIComponent(window.location.pathname.split('/').pop());
    window.location.href = `login.html?redirect=${redirect}`;
    return null;
  }
  const avatar = qs('[data-nav-avatar]');
  const name = qs('[data-nav-name]');
  const email = qs('[data-nav-email]');
  if (avatar) avatar.textContent = initials(user.name);
  if (name) name.textContent = user.name;
  if (email) email.textContent = user.email;

  qs('[data-nav-logout]')?.addEventListener('click', () => {
    logout();
    showToast('You have been signed out.', 'info');
    setTimeout(() => { window.location.href = 'index.html'; }, 500);
  });

  return user;
}
