// Product reviews/ratings - App\Models\ProductReview via the ERP's public
// storefront API. Only published, business+product-scoped reviews are ever
// returned; submission requires a logged-in customer (Bearer token attached
// by services/http.js) - the server derives identity, never trusts the client.

import { http } from './http';

const EMPTY_SUMMARY = { average: 0, count: 0, reviews: [] };

export async function fetchProductReviews(productId) {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId || !productId) return EMPTY_SUMMARY;

  try {
    const { data } = await http.get(`/v1/reviews/${businessId}/${productId}`);
    if (!data?.Success || !data?.Data) return EMPTY_SUMMARY;
    const { average = 0, count = 0, reviews = [] } = data.Data;
    return { average, count, reviews };
  } catch {
    return EMPTY_SUMMARY;
  }
}

export async function submitReview({ product_id, rating, comment }) {
  const businessId = import.meta.env.VITE_BUSINESS_ID;
  if (!businessId) return { success: false, message: 'Reviews are not configured.' };

  try {
    const { data } = await http.post(`/v1/reviews/${businessId}`, { product_id, rating, comment });
    return { success: !!data?.Success, message: data?.Message, review: data?.Data };
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to submit your review.' };
  }
}
