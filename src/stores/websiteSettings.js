// Global website settings - a plain reactive mirror of what main.js's
// bootstrap() already resolved from the ERP (business identity, currency,
// SEO, favicon, WhatsApp, hours, free delivery, bank details) before the
// app ever mounted. Components read from here instead of hard-coding site
// name/contact data. ERP-admin-controlled only - no client-side editing.
// Social links are a separate store-free call (services/cms.js).

import { defineStore } from 'pinia';
import { FALLBACK_WEBSITE_SETTINGS } from '@/services/websiteSettings';

export const useWebsiteSettingsStore = defineStore('websiteSettings', {
  state: () => ({
    business: { ...FALLBACK_WEBSITE_SETTINGS.business },
    currency: { ...FALLBACK_WEBSITE_SETTINGS.currency },
    seo: { ...FALLBACK_WEBSITE_SETTINGS.seo },
    favicon: FALLBACK_WEBSITE_SETTINGS.favicon,
    business_hours: FALLBACK_WEBSITE_SETTINGS.business_hours,
    whatsapp_number: FALLBACK_WEBSITE_SETTINGS.whatsapp_number,
    free_delivery: { ...FALLBACK_WEBSITE_SETTINGS.free_delivery },
    bank_details: { ...FALLBACK_WEBSITE_SETTINGS.bank_details },
    auth: {
      google: { ...FALLBACK_WEBSITE_SETTINGS.auth.google },
      facebook: { ...FALLBACK_WEBSITE_SETTINGS.auth.facebook },
      captcha: { ...FALLBACK_WEBSITE_SETTINGS.auth.captcha },
    },
  }),

  actions: {
    setSettings(settings) {
      if (!settings) return;
      this.business = { ...FALLBACK_WEBSITE_SETTINGS.business, ...settings.business };
      this.currency = { ...FALLBACK_WEBSITE_SETTINGS.currency, ...settings.currency };
      this.seo = { ...FALLBACK_WEBSITE_SETTINGS.seo, ...settings.seo };
      this.favicon = settings.favicon ?? FALLBACK_WEBSITE_SETTINGS.favicon;
      this.business_hours = settings.business_hours ?? FALLBACK_WEBSITE_SETTINGS.business_hours;
      this.whatsapp_number = settings.whatsapp_number ?? null;
      this.free_delivery = { ...FALLBACK_WEBSITE_SETTINGS.free_delivery, ...settings.free_delivery };
      this.bank_details = { ...FALLBACK_WEBSITE_SETTINGS.bank_details, ...(settings.bank_details || {}) };
      this.auth = {
        google: { ...FALLBACK_WEBSITE_SETTINGS.auth.google, ...(settings.auth?.google || {}) },
        facebook: { ...FALLBACK_WEBSITE_SETTINGS.auth.facebook, ...(settings.auth?.facebook || {}) },
        captcha: { ...FALLBACK_WEBSITE_SETTINGS.auth.captcha, ...(settings.auth?.captcha || {}) },
      };
    },
  },
});
