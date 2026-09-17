// Website cart API - authenticated, business-scoped, server-priced.

import { http } from './http';

function unwrap(data) {
  return { success: !!data?.Success, message: data?.Message, data: data?.Data };
}

function businessId() {
  return import.meta.env.VITE_BUSINESS_ID || '';
}

export async function fetchCart(params = {}) {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.', data: null };
  try {
    const { data } = await http.get(`/v1/cart/${id}`, { params });
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to load cart.', data: null };
  }
}

export async function addToCart({ productId, productVariationId, quantity = 1, branchId = null }) {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.', data: null };
  try {
    const { data } = await http.post(`/v1/cart/${id}`, {
      product_id: productId,
      product_variation_id: productVariationId,
      quantity,
      branch_id: branchId,
    });
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to add to cart.', data: null };
  }
}

export async function updateCartItem(cartItemId, quantity, branchId = null) {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.', data: null };
  try {
    const { data } = await http.put(`/v1/cart/${id}/items/${cartItemId}`, {
      quantity,
      branch_id: branchId,
    });
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to update cart.', data: null };
  }
}

export async function removeCartItem(cartItemId) {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.', data: null };
  try {
    const { data } = await http.delete(`/v1/cart/${id}/items/${cartItemId}`);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to remove item.', data: null };
  }
}

export async function clearCart() {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.', data: null };
  try {
    const { data } = await http.delete(`/v1/cart/${id}`);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to clear cart.', data: null };
  }
}
