// Wishlist API - product-level and variation-level entries for the
// authenticated customer within VITE_BUSINESS_ID.

import { http } from './http';

function unwrap(data) {
  return { success: !!data?.Success, message: data?.Message, data: data?.Data };
}

function businessId() {
  return import.meta.env.VITE_BUSINESS_ID || '';
}

export async function fetchWishlist() {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.', data: { items: [] } };
  try {
    const { data } = await http.get(`/v1/wishlist/${id}`);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to load wishlist.', data: { items: [] } };
  }
}

export async function toggleWishlist({ productId, productVariationId = null }) {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.' };
  try {
    const body = { product_id: productId };
    if (productVariationId) body.product_variation_id = productVariationId;
    const { data } = await http.post(`/v1/wishlist/${id}/toggle`, body);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to update wishlist.' };
  }
}
