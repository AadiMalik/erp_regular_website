// Customer identity/auth - the ERP's shared email+OTP API
// (App\Http\Controllers\Api\Auth\AuthController).

import { http } from './http';

function unwrap(data) {
  return { success: !!data?.Success, message: data?.Message, data: data?.Data };
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
    name,
    phone,
    captcha_token: captchaToken,
  });
}

export function resendOtp(email, { name, phone, captchaToken } = {}) {
  return post('/v1/auth/resend-otp', {
    email,
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
  });
}

export function loginWithPassword({ email, password, captchaToken }) {
  return post('/v1/auth/login-password', {
    email,
    password,
    captcha_token: captchaToken,
  });
}

export function loginWithGoogle(idToken, { createProfile = false } = {}) {
  return post('/v1/auth/login-google', {
    id_token: idToken,
    create_profile: createProfile ? 1 : 0,
  });
}

export function loginWithFacebook(accessToken, { createProfile = false } = {}) {
  return post('/v1/auth/login-facebook', {
    access_token: accessToken,
    create_profile: createProfile ? 1 : 0,
  });
}

export function forgotPassword(email) {
  return post('/v1/auth/forgot-password', {
    email,
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
  try {
    const { data } = await http.get('/v1/profile');
    return unwrap(data);
  } catch (err) {
    return { success: false, message: errorMessage(err, 'Failed to load profile.'), data: null };
  }
}

export async function updateProfile({ name, profileImage }) {
  try {
    const form = new FormData();
    form.append('name', name);
    if (profileImage) {
      form.append('profile_image', profileImage);
    }
    const { data } = await http.post('/v1/profile', form);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: errorMessage(err, 'Failed to update profile.') };
  }
}

export async function saveAddress(address) {
  try {
    const { data } = await http.post('/v1/profile/addresses', address);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: errorMessage(err, 'Failed to save address.') };
  }
}

export async function deleteAddress(addressId) {
  try {
    const { data } = await http.delete(`/v1/profile/addresses/${addressId}`);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: errorMessage(err, 'Failed to delete address.') };
  }
}
