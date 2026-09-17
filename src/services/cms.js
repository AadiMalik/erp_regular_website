// CMS-controlled content (theme, navigation, banners, contact info, SEO, ...).
// Contact info comes from the ERP's global website settings (see
// services/websiteSettings.js + stores/websiteSettings.js), resolved before
// the app mounts. Social links come exclusively from the dedicated Social
// Media CRUD (App\Models\SocialMediaLink, Website CMS > Social Media) - the
// legacy fixed-platform JSON on website settings is no longer used.
// Contact form submissions and newsletter signups post to the ERP so they
// show up in the admin's Contact Messages / Newsletter Subscribers screens.

import { http } from './http';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';

export async function fetchContactInfo() {
  const { business, business_hours } = useWebsiteSettingsStore();
  return {
    address: business.address,
    phone: business.phone,
    email: business.email,
    hours: business_hours,
  };
}

export async function fetchSocialLinks() {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  let links = [];

  if (businessId) {
    try {
      const { data } = await http.get(`/v1/social-links/${businessId}`);
      if (data?.Success && Array.isArray(data?.Data)) {
        links = data.Data.map((l) => ({
          id: l.id,
          label: l.platform,
          icon: l.icon || 'fa-solid fa-link',
          url: l.url,
          iconColor: l.icon_color,
          displayColor: l.display_color,
        }));
      }
    } catch {
      // API unavailable - render no social icons rather than break the site
    }
  }

  // WhatsApp click-to-chat is a distinct, still-supported field on Website
  // Settings (not part of the Social Media CRUD) - appended when configured.
  const { whatsapp_number } = useWebsiteSettingsStore();
  if (whatsapp_number) {
    links.push({
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'fa-brands fa-whatsapp',
      url: `https://wa.me/${whatsapp_number.replace(/[^\d]/g, '')}`,
    });
  }

  return links.filter((link) => link.url);
}

// Repeatable Hero Stats/Highlights (App\Models\WebsiteHeroStat) shown in the
// Hero section (e.g. "12k+ Happy Customers"). Empty/unavailable means the
// admin hasn't configured any - callers hide the stats area entirely
// rather than rendering an empty row.
export async function fetchHeroStats() {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId) return [];

  try {
    const { data } = await http.get(`/v1/hero-stats/${businessId}`);
    return data?.Success && Array.isArray(data?.Data) ? data.Data : [];
  } catch {
    return [];
  }
}

// Generic repeatable "content card" list (App\Models\WebsiteBenefit, grouped
// by `group`) - the same icon/title/description(/value/code) shape reused
// for Why Shop With Us, product/cart trust badges, login/signup promo
// bullets, about-page values, delivery options, payment method info,
// payment icons and announcement bar messages. Empty/unavailable means the
// admin hasn't configured any - callers hide the whole block rather than
// rendering an empty heading/grid.
export async function fetchContentItems(group) {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId || !group) return [];

  try {
    const { data } = await http.get(`/v1/content-items/${businessId}/${group}`);
    return data?.Success && Array.isArray(data?.Data) ? data.Data : [];
  } catch {
    return [];
  }
}

export async function fetchWhyShopBenefits() {
  return fetchContentItems('why_shop_with_us');
}

// Curated marketing testimonials (App\Models\WebsiteTestimonial) - distinct
// from real per-product reviews. Empty/unavailable hides the section.
export async function fetchTestimonials() {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId) return [];

  try {
    const { data } = await http.get(`/v1/testimonials/${businessId}`);
    const items = data?.Success && Array.isArray(data?.Data) ? data.Data : [];
    return items.map((t) => ({
      name: t.author_name,
      role: t.author_title,
      avatar: t.avatar,
      quote: t.quote,
      rating: t.rating,
    }));
  } catch {
    return [];
  }
}

// Generic CMS content block (App\Models\WebsiteSection) - hero, about us,
// contact us intro, why-shop-with-us, promo/discount banners, and page
// headers (shop/categories/cart/checkout/wishlist). Returns null when the
// admin hasn't configured that type yet, so callers keep their own static
// fallback content (per CLAUDE.md #13).
export async function fetchSection(type) {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId) return null;

  try {
    const { data } = await http.get(`/v1/sections/${businessId}/${type}`);
    return data?.Success ? (data.Data || null) : null;
  } catch {
    return null;
  }
}

// Resolves a section's button/banner destination to a Vue Router path.
// Only 'shop' and 'custom' are fully resolvable without a product/category
// slug lookup - 'category' falls back to a filtered shop link, everything
// else falls back to the shop page rather than a dead link.
function resolveLink(linkType, buttonLink, targetId) {
  if (linkType === 'custom' && buttonLink) return buttonLink;
  if (linkType === 'category' && targetId) return { name: 'shop', query: { category: targetId } };
  if (buttonLink) return buttonLink;
  return null;
}

export function resolveSectionLink(section) {
  if (!section) return { name: 'shop' };
  return resolveLink(section.link_type, section.button_link, section.link_target_id) || { name: 'shop' };
}

// Same resolution for a section's optional secondary call-to-action.
// Returns null (rather than falling back to the shop page) so callers can
// hide the secondary button entirely when it isn't configured.
export function resolveSecondaryLink(section) {
  if (!section) return null;
  return resolveLink(section.secondary_link_type, section.secondary_button_link, section.secondary_link_target_id);
}

export async function submitContactMessage({ name, email, phone, subject, message }) {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId) return { success: false, message: 'Contact form is not configured.' };

  try {
    const { data } = await http.post(`/v1/contact/${businessId}`, { name, email, phone, subject, message });
    return { success: !!data?.Success, message: data?.Message };
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to send message.' };
  }
}

export async function subscribeNewsletter(email, source = 'website') {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId) return { success: false, message: 'Newsletter is not configured.' };

  try {
    const { data } = await http.post(`/v1/newsletter/subscribe/${businessId}`, { email, source });
    return { success: !!data?.Success, message: data?.Message };
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to subscribe.' };
  }
}
