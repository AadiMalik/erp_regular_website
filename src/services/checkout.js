// Website checkout / payment methods / place-order API.

import { http } from './http';

function unwrap(data) {
  return { success: !!data?.Success, message: data?.Message, data: data?.Data };
}


export async function fetchPaymentMethods() {
  try {
    const { data } = await http.get('/v1/payment-methods');
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to load payment methods.', data: null };
  }
}

export async function placeOrder(formData) {
  try {
    const { data } = await http.post('/v1/checkout', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to place order.', data: null };
  }
}

export async function verifyDeliveryAddress({ branchId = null, lat, lng }) {
  try {
    const { data } = await http.post('/v1/checkout/verify-delivery-address', {
      branch_id: branchId || undefined,
      latitude: lat,
      longitude: lng,
    });
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Could not verify this delivery address.', data: null };
  }
}

export async function trackOrder({ orderNumber, email = null, phone = null }) {
  try {
    const { data } = await http.post('/v1/orders/track', {
      order_number: orderNumber,
      email,
      phone,
    });
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Order not found.', data: null };
  }
}
