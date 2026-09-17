// Static policy/help pages (Privacy Policy, Terms & Conditions, Shipping
// Information, Cancellation Policy, Return Policy) - CMS-managed via the
// ERP (App\Models\WebsitePage). Returns null when the API has no content
// yet so callers can keep their own static fallback copy on screen
// (per CLAUDE.md #13 - missing CMS values must never break the page).

import { http } from './http';

export async function fetchPage(slug) {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId) return null;

  try {
    const { data } = await http.get(`/v1/pages/${businessId}/${slug}`);
    if (!data?.Success || !data?.Data?.content) return null;
    return data.Data;
  } catch {
    return null;
  }
}
