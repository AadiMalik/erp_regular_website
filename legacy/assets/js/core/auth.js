// Smart Mart — client-side auth simulation (no backend exists on this static
// site, so accounts/sessions/OTP all live in localStorage). Mirrors the
// read/write/emit pattern used by ./store.js for cart/wishlist.
// OTP codes are surfaced directly in the UI (toast/banner) since there is no
// email/SMS service to actually deliver them.

import { seedDemoOrders } from './orders.js';

const USERS_KEY = 'sm_users';
const SESSION_KEY = 'sm_session';
const PENDING_OTP_KEY = 'sm_pending_otp';
const RESET_ALLOWED_KEY = 'sm_reset_allowed';
const OTP_TTL_MS = 5 * 60 * 1000;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function getUsers() {
  return read(USERS_KEY, []);
}
function saveUsers(users) {
  write(USERS_KEY, users);
}
function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
function genOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}
function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

/* ---------------- Session ---------------- */

export function getCurrentUser() {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return getUsers().find((u) => u.id === id) || null;
}

export function isLoggedIn() {
  return !!getCurrentUser();
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  emit('auth:change', { user: null });
}

function setSession(userId) {
  localStorage.setItem(SESSION_KEY, userId);
  emit('auth:change', { user: getCurrentUser() });
}

/* ---------------- Signup / OTP / Login ---------------- */

export function findUserByEmail(email) {
  return getUsers().find((u) => u.email === normalizeEmail(email));
}

export function signup({ name, email, phone, password }) {
  const normalized = normalizeEmail(email);
  if (findUserByEmail(normalized)) {
    return { ok: false, message: 'An account with this email already exists.' };
  }
  const users = getUsers();
  const user = {
    id: genId('u'),
    name: name.trim(),
    email: normalized,
    phone: phone.trim(),
    password,
    verified: false,
    addresses: [],
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);

  const code = genOtp();
  write(PENDING_OTP_KEY, { email: normalized, purpose: 'signup', code, expiresAt: Date.now() + OTP_TTL_MS });
  return { ok: true, email: normalized, code };
}

export function login({ email, password }) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return { ok: false, message: 'Incorrect email or password.' };
  }
  if (!user.verified) {
    const code = genOtp();
    write(PENDING_OTP_KEY, { email: user.email, purpose: 'signup', code, expiresAt: Date.now() + OTP_TTL_MS });
    return { ok: false, needsVerification: true, email: user.email, code, message: 'Please verify your email to continue.' };
  }
  setSession(user.id);
  return { ok: true, user };
}

export function requestOtp(email, purpose = 'reset') {
  const normalized = normalizeEmail(email);
  const user = findUserByEmail(normalized);
  if (!user) return { ok: false, message: 'No account found with that email address.' };
  const code = genOtp();
  write(PENDING_OTP_KEY, { email: normalized, purpose, code, expiresAt: Date.now() + OTP_TTL_MS });
  return { ok: true, email: normalized, code };
}

export function getPendingOtp() {
  return read(PENDING_OTP_KEY, null);
}

export function verifyOtp(code) {
  const pending = getPendingOtp();
  if (!pending) return { ok: false, message: 'No verification in progress. Please start again.' };
  if (Date.now() > pending.expiresAt) return { ok: false, message: 'This code has expired. Please request a new one.' };
  if (String(code).trim() !== pending.code) return { ok: false, message: 'Incorrect verification code.' };

  localStorage.removeItem(PENDING_OTP_KEY);

  if (pending.purpose === 'signup') {
    const users = getUsers();
    const user = users.find((u) => u.email === pending.email);
    if (!user) return { ok: false, message: 'Account not found.' };
    user.verified = true;
    saveUsers(users);
    seedDemoOrders(user.id);
    setSession(user.id);
    return { ok: true, purpose: 'signup', user };
  }

  // purpose === 'reset'
  write(RESET_ALLOWED_KEY, { email: pending.email, expiresAt: Date.now() + OTP_TTL_MS });
  return { ok: true, purpose: 'reset', email: pending.email };
}

export function resetPassword(email, newPassword) {
  const normalized = normalizeEmail(email);
  const allowed = read(RESET_ALLOWED_KEY, null);
  if (!allowed || allowed.email !== normalized || Date.now() > allowed.expiresAt) {
    return { ok: false, message: 'Your password reset session has expired. Please start again.' };
  }
  const users = getUsers();
  const user = users.find((u) => u.email === normalized);
  if (!user) return { ok: false, message: 'Account not found.' };
  user.password = newPassword;
  saveUsers(users);
  localStorage.removeItem(RESET_ALLOWED_KEY);
  return { ok: true };
}

/* ---------------- Profile ---------------- */

export function updateProfile(userId, patch) {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return { ok: false, message: 'Account not found.' };
  Object.assign(user, patch);
  saveUsers(users);
  emit('auth:change', { user: getCurrentUser() });
  return { ok: true, user };
}

export function changePassword(userId, currentPassword, newPassword) {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return { ok: false, message: 'Account not found.' };
  if (user.password !== currentPassword) return { ok: false, message: 'Current password is incorrect.' };
  user.password = newPassword;
  saveUsers(users);
  return { ok: true };
}

/* ---------------- Addresses ---------------- */

export function saveAddress(userId, address) {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return { ok: false, message: 'Account not found.' };
  if (address.id) {
    const idx = user.addresses.findIndex((a) => a.id === address.id);
    if (idx > -1) user.addresses[idx] = { ...user.addresses[idx], ...address };
  } else {
    address.id = genId('addr');
    if (user.addresses.length === 0) address.isDefault = true;
    user.addresses.push(address);
  }
  if (address.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = a.id === address.id; });
  }
  saveUsers(users);
  emit('auth:change', { user: getCurrentUser() });
  return { ok: true, user };
}

export function deleteAddress(userId, addressId) {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return { ok: false };
  user.addresses = user.addresses.filter((a) => a.id !== addressId);
  if (user.addresses.length && !user.addresses.some((a) => a.isDefault)) user.addresses[0].isDefault = true;
  saveUsers(users);
  emit('auth:change', { user: getCurrentUser() });
  return { ok: true };
}
