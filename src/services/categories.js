// Category + subcategory data - fetched from the ERP's public categories API
// (business_id from .env), nested parent -> children. Falls back to an empty
// list on any failure so a down/misconfigured API never breaks the site
// (per CLAUDE.md #13).

import { http } from './http';
import { unsplash } from '@/data/categories';

const FALLBACK_IMAGE = unsplash('1618160702438-9b02ab6515c9', 800, 800);

let cachedBrands = [];

// Decorative only - the ERP has no per-category icon field, so cards cycle
// through this fixed palette purely for visual variety.
const ICONS = [
  'fa-carrot', 'fa-cheese', 'fa-bread-slice', 'fa-mug-saucer', 'fa-cookie-bite',
  'fa-drumstick-bite', 'fa-snowflake', 'fa-jar', 'fa-pump-soap', 'fa-spray-can-sparkles',
  'fa-basket-shopping', 'fa-tags',
];

let cachedCategories = [];

function mapSubCategory(s) {
  return {
    id: s.id,
    categoryId: s.category_id,
    name: s.name,
    slug: s.slug,
    image: s.image || FALLBACK_IMAGE,
  };
}

function mapCategory(c, index) {
  const subCategories = Array.isArray(c.sub_categories) ? c.sub_categories.map(mapSubCategory) : [];
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: ICONS[index % ICONS.length],
    image: c.image || FALLBACK_IMAGE,
    // Legacy shape kept so existing nav/filter UI (which expects plain
    // subcategory name strings) needs no changes.
    subcategories: subCategories.map((s) => s.name),
    // Richer nested data, for shop/filter/search features to consume later.
    subCategories,
  };
}

export async function fetchCategories() {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId) return cachedCategories;

  try {
    const { data } = await http.get(`/v1/categories/${businessId}`);
    if (data?.Success && Array.isArray(data?.Data)) {
      cachedCategories = data.Data.map(mapCategory);
    }
  } catch {
    // keep last-known categories (possibly empty) rather than breaking the site
  }

  return cachedCategories;
}

export async function fetchBrands() {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId) return cachedBrands;

  try {
    const { data } = await http.get(`/v1/brands/${businessId}`);
    if (data?.Success && Array.isArray(data?.Data)) {
      cachedBrands = data.Data.map((b) => ({ id: b.id, name: b.name, slug: b.slug, image: b.image || FALLBACK_IMAGE }));
    }
  } catch {
    // keep last-known brands (possibly empty) rather than breaking the site
  }

  return cachedBrands;
}

export function findCategory(id) {
  return cachedCategories.find((c) => c.id === id);
}

export { cachedCategories as CATEGORIES, cachedBrands as BRANDS, unsplash };
