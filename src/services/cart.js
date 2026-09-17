// Website cart API - authenticated, server-priced.

import { http } from './http';

function unwrap(data) {
  return { success: !!data?.Success, message: data?.Message, data: data?.Data };
}


export async function fetchCart(params = {}) {
  try {
    const { data } = await http.get('/v1/cart', { params });
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to load cart.', data: null };
  }
}

export async function addToCart({ productId, productVariationId, quantity = 1, branchId = null }) {
  try {
    const { data } = await http.post('/v1/cart', {
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
  try {
    const { data } = await http.put(`/v1/cart/items/${cartItemId}`, {
      quantity,
      branch_id: branchId,
    });
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to update cart.', data: null };
  }
}

export async function removeCartItem(cartItemId) {
  try {
    const { data } = await http.delete(`/v1/cart/items/${cartItemId}`);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to remove item.', data: null };
  }
}

export async function clearCart() {
  try {
    const { data } = await http.delete('/v1/cart');
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to clear cart.', data: null };
  }
}
