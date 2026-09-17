// Wishlist API - product-level and variation-level entries for the
// authenticated customer.

import { http } from './http';

function unwrap(data) {
  return { success: !!data?.Success, message: data?.Message, data: data?.Data };
}


export async function fetchWishlist() {
  try {
    const { data } = await http.get('/v1/wishlist');
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to load wishlist.', data: { items: [] } };
  }
}

export async function toggleWishlist({ productId, productVariationId = null }) {
  try {
    const body = { product_id: productId };
    if (productVariationId) body.product_variation_id = productVariationId;
    const { data } = await http.post('/v1/wishlist/toggle', body);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to update wishlist.' };
  }
}
