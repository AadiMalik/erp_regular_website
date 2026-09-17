// Product catalog service - fetched from the ERP's public products API
// Mirrors services/categories.js's pattern:
// module-level caches for synchronous lookups (findProductById, PRODUCTS),
// silent failure with the last-known cache kept intact so a down/
// misconfigured API never breaks the site (per CLAUDE.md #13).

import { http } from './http';
import { unsplash } from '@/data/categories';

export const FALLBACK_IMAGE = unsplash('1618160702438-9b02ab6515c9', 800, 800);

const EMPTY_SECTIONS = {
  featured_products: [],
  discounted_products: [],
  trending_products: [],
  new_arrivals: [],
  best_sellers: [],
};

let cachedProducts = [];
let cachedSections = { ...EMPTY_SECTIONS };
let sectionsLoaded = false;

// Listing items and the detail payload are already ~flat/1:1 with what the
// UI expects (by design, per the API contract) - this is mostly a
// pass-through, just guaranteeing an image always exists.
// Reviews/ratings are a separate, still-mocked feature - the ERP API never
// returns rating/reviewCount/highlights. Default them once here (rather
// than in every ProductCard/ProductInfo/ReviewsPanel that reads them) so
// nothing downstream throws on `undefined.toFixed()`.
function mapProduct(raw) {
  if (!raw) return null;
  return {
    ...raw,
    images: Array.isArray(raw.images) && raw.images.length ? raw.images : [FALLBACK_IMAGE],
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    highlights: raw.highlights ?? [],
    badges: Array.isArray(raw.badges) ? raw.badges : [],
  };
}

function mapSections(sections) {
  return {
    featured_products: Array.isArray(sections?.featured_products) ? sections.featured_products.map(mapProduct) : [],
    discounted_products: Array.isArray(sections?.discounted_products) ? sections.discounted_products.map(mapProduct) : [],
    trending_products: Array.isArray(sections?.trending_products) ? sections.trending_products.map(mapProduct) : [],
    new_arrivals: Array.isArray(sections?.new_arrivals) ? sections.new_arrivals.map(mapProduct) : [],
    best_sellers: Array.isArray(sections?.best_sellers) ? sections.best_sellers.map(mapProduct) : [],
  };
}

// Merges a freshly-fetched detail object into the listing cache so
// findProductById() (used synchronously by stores/cart.js and
// stores/wishlist.js) returns the richer object - including `variations` -
// for any product the shopper has actually opened, instead of only the
// flat listing shape.
function mergeIntoCache(product) {
  if (!product) return;
  const idx = cachedProducts.findIndex((p) => p.id === product.id);
  if (idx >= 0) cachedProducts[idx] = { ...cachedProducts[idx], ...product };
  else cachedProducts.push(product);
}

function fallbackData() {
  return {
    sections: cachedSections,
    products: {
      data: cachedProducts, current_page: 1, per_page: cachedProducts.length, total: cachedProducts.length, last_page: 1,
    },
    filters_meta: { price_min: 0, price_max: 0 },
  };
}

export async function fetchProducts(params = {}) {
  try {
    const { data } = await http.get('/v1/products', { params });
    if (data?.Success && data?.Data) {
      const list = Array.isArray(data.Data.products?.data) ? data.Data.products.data.map(mapProduct) : [];
      cachedProducts = list;
      if (data.Data.sections) {
        cachedSections = mapSections(data.Data.sections);
        sectionsLoaded = true;
      }

      return {
        ...data.Data,
        products: { ...data.Data.products, data: list },
        sections: data.Data.sections ? cachedSections : null,
      };
    }
  } catch {
    // keep last-known products/sections (possibly empty) rather than breaking the site
  }

  return fallbackData();
}

// An unfiltered page-1 call so the backend includes `sections`. main.js's
// bootstrap already makes exactly this call before the app mounts (to warm
// the products cache for cart/wishlist), which already carries `sections` -
// reuse that instead of firing a second identical request, so the homepage
// genuinely costs one /v1/products request, not two. Defensive per-key
// fallback to [] so the homepage never breaks even if the backend omits a
// key.
export async function fetchHomeSections() {
  if (sectionsLoaded) return cachedSections;
  const { sections } = await fetchProducts({});
  return sections || cachedSections || { ...EMPTY_SECTIONS };
}

export async function fetchProductBySlug(slug, branchId) {
  if (!slug) return null;

  try {
    const { data } = await http.get(`/v1/products/${slug}`, {
      params: branchId ? { branch_id: branchId } : {},
    });
    if (data?.Success && data?.Data) {
      const product = mapProduct(data.Data);
      mergeIntoCache(product);
      return product;
    }
  } catch (err) {
    console.warn('fetchProductBySlug failed', err);
  }
  return null;
}

// Per-warehouse (and, for batch/expiry-tracked variations, per-batch) stock
// breakdown for the current branch - powers the "Stock: N" click/hover
// detail. Loaded on demand (only when the shopper actually opens it), never
// cached - it's a live, branch-scoped figure. Returns [] on any failure so
// the UI can just render "no breakdown available" rather than erroring.
export async function fetchStockBreakdown(variationId, branchId) {
  if (!variationId || !branchId) return [];

  try {
    const { data } = await http.get(`/v1/products/stock/${variationId}`, {
      params: { branch_id: branchId },
    });
    return data?.Success && Array.isArray(data.Data) ? data.Data : [];
  } catch (err) {
    console.warn('fetchStockBreakdown failed', err);
    return [];
  }
}

// The detail payload already includes `related_products` (same flat shape
// as listing items) - nothing to fetch separately.
export async function fetchRelatedProducts(product) {
  return Array.isArray(product?.related_products) ? product.related_products.map(mapProduct) : [];
}

export function findProductById(id) {
  return cachedProducts.find((p) => p.id === id) || null;
}

// Fire-and-forget share analytics - never blocks or breaks the share action
// itself if it fails (network hiccup, guest with an expired token, etc.).
export async function recordProductShare(productId, platform) {
  if (!productId || !platform) return;

  try {
    await http.post(`/v1/products/${productId}/share`, { platform });
  } catch (err) {
    console.warn('recordProductShare failed', err);
  }
}

export { cachedProducts as PRODUCTS };
