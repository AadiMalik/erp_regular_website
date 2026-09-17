import { http } from './http';

// Global website settings assembled ERP-side from store identity (name, logo,
// contact, address), `accounting_settings` (currency) and
// `website_theme_settings` (favicon, SEO, WhatsApp, hours, free delivery).
// Fetched once at bootstrap, alongside the website theme config. Social
// links are a separate call (services/cms.js -> Social Media CRUD).
export const FALLBACK_WEBSITE_SETTINGS = {
  business: {
    name: 'Dukanaz',
    logo: null,
    email: 'support@smartmart.example',
    phone: '+1 (555) 010-2024',
    address: '221 Fresh Market Ave, Springfield',
    city: '',
    state: '',
    country: '',
  },
  currency: {
    code: 'USD',
    symbol: '$',
    position: 'before',
    decimal_points: 2,
  },
  seo: {
    title: 'Dukanaz',
    description: null,
    keywords: null,
    og_image: null,
  },
  // Local Dukanaz default; ERP API replaces this with the configured
  // upload when set, or the platform Dukanaz asset URL when unset.
  favicon: '/favicon/favicon-32.png',
  business_hours: 'Mon – Sun, 7am – 11pm',
  whatsapp_number: null,
  free_delivery: {
    enabled: false,
    min_amount: null,
  },
  bank_details: {
    bank_name: null,
    account_title: null,
    account_number: null,
    iban: null,
    branch: null,
    swift_code: null,
    instructions: null,
  },
  // Google/Facebook Login + CAPTCHA - off/absent until enabled and
  // configured in Settings > Social Login & Security. Public keys only,
  // never secrets (see App\Models\LoginSecuritySetting).
  auth: {
    google: { enabled: false, client_id: null },
    facebook: { enabled: false, app_id: null },
    captcha: { enabled: false, site_key: null },
  },
};

export async function fetchWebsiteSettings() {
  try {
    const { data } = await http.get('/v1/website-settings');
    if (!data?.Success || !data?.Data?.business) return FALLBACK_WEBSITE_SETTINGS;
    return data.Data;
  } catch {
    return FALLBACK_WEBSITE_SETTINGS;
  }
}
