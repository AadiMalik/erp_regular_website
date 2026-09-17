// FAQ / Help Center - CMS-managed via the ERP (App\Models\WebsiteFaq).
// Falls back to static reference content when the API has nothing yet, so
// the Help Center page is never empty (per CLAUDE.md #13).

import { http } from './http';
import { FAQ_CATEGORIES } from '@/data/faqs';

export async function fetchFaqCategories() {
  try {
    const { data } = await http.get('/v1/faqs');
    const faqs = data?.Success && Array.isArray(data?.Data) ? data.Data : [];
    if (!faqs.length) return FAQ_CATEGORIES;

    // The ERP FAQ list is flat (no per-question category) - present it as a
    // single "General" topic rather than inventing categories it has no
    // data for.
    return [{
      id: 'general',
      label: 'General',
      icon: 'fa-circle-question',
      items: faqs.map((f) => ({ q: f.question, a: f.answer })),
    }];
  } catch {
    return FAQ_CATEGORIES;
  }
}

export { FAQ_CATEGORIES };
