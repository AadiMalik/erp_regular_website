// Customer identity/auth - the ERP's shared email+OTP API
// (App\Http\Controllers\Api\Auth\AuthController). business_id comes from
// VITE_BUSINESS_ID so customers register/login against this storefront's
// business (one signup covers every branch of that business; the same
// email may Sign up again at a different business).

import { http } from './http';

function unwrap(data) {
  return { success: !!data?.Success, message: data?.Message, data: data?.Data };
}

function businessId() {
  return import.meta.env.VITE_BUSINESS_ID || '';
}

function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const status = err?.response?.status;
  const data = err?.response?.data;
  if (status === 429) {
    return data?.Message || data?.message || 'Too many attempts. Please wait a minute and try again.';
  }
  return data?.Message || data?.message || fallback;
}

async function post(url, body) {
  try {
    const { data } = await http.post(url, body);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: errorMessage(err) };
  }
}

export function sendOtp(email, { name, phone, captchaToken } = {}) {
  return post('/v1/auth/send-otp', {
    email,
    business_id: businessId(),
    name,
    phone,
    captcha_token: captchaToken,
  });
}

export function resendOtp(email, { name, phone, captchaToken } = {}) {
  return post('/v1/auth/resend-otp', {
    email,
    business_id: businessId(),
    name,
    phone,
    captcha_token: captchaToken,
  });
}

export function verifyOtp({ email, code, name, phone }) {
  return post('/v1/auth/verify-otp', {
    email,
    code,
    name,
    phone,
    business_id: businessId(),
  });
}

export function loginWithPassword({ email, password, captchaToken }) {
  return post('/v1/auth/login-password', {
    email,
    password,
    business_id: businessId(),
    captcha_token: captchaToken,
  });
}

export function loginWithGoogle(idToken, { createProfile = false } = {}) {
  return post('/v1/auth/login-google', {
    id_token: idToken,
    business_id: businessId(),
    create_profile: createProfile ? 1 : 0,
  });
}

export function loginWithFacebook(accessToken, { createProfile = false } = {}) {
  return post('/v1/auth/login-facebook', {
    access_token: accessToken,
    business_id: businessId(),
    create_profile: createProfile ? 1 : 0,
  });
}

export function forgotPassword(email) {
  return post('/v1/auth/forgot-password', {
    email,
    business_id: businessId(),
  });
}

export function resetPassword({ email, code, password }) {
  return post('/v1/auth/reset-password', {
    email,
    code,
    password,
    password_confirmation: password,
  });
}

export function setPassword(password) {
  return post('/v1/auth/set-password', {
    password,
    password_confirmation: password,
  });
}

export function changePassword({ currentPassword, password }) {
  return post('/v1/auth/change-password', {
    current_password: currentPassword,
    password,
    password_confirmation: password,
  });
}

export function logout() {
  return post('/v1/auth/logout', {});
}

export async function fetchProfile() {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.', data: null };
  try {
    const { data } = await http.get(`/v1/profile/${id}`);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: errorMessage(err, 'Failed to load profile.'), data: null };
  }
}

export async function updateProfile({ name, profileImage }) {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.' };
  try {
    const form = new FormData();
    form.append('name', name);
    if (profileImage) {
      form.append('profile_image', profileImage);
    }
    const { data } = await http.post(`/v1/profile/${id}`, form);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: errorMessage(err, 'Failed to update profile.') };
  }
}

export async function saveAddress(address) {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.' };
  try {
    const { data } = await http.post(`/v1/profile/${id}/addresses`, address);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: errorMessage(err, 'Failed to save address.') };
  }
}

export async function deleteAddress(addressId) {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.' };
  try {
    const { data } = await http.delete(`/v1/profile/${id}/addresses/${addressId}`);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: errorMessage(err, 'Failed to delete address.') };
  }
}
