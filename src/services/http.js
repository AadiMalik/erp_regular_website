import axios from 'axios';

// Base URL comes from the environment so it never needs a source change
// between deployments.
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
});

// Attach the customer's Sanctum token (if any) to every request. Read
// directly from localStorage rather than importing the auth store, to avoid
// a store -> http -> store import cycle.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('sm_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On expired/invalid sessions, clear local auth so protected routes redirect
// to login. Skip the logout endpoint itself to avoid loops.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    if (status === 401 && !url.includes('/v1/auth/logout')) {
      localStorage.removeItem('sm_token');
      localStorage.removeItem('sm_user');
      localStorage.removeItem('sm_profile_overrides');
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.assign(`/login?redirect=${redirect}`);
      }
    }
    return Promise.reject(error);
  },
);
