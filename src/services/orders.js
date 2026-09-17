// Customer orders API - authenticated "My Orders" against the ERP orders table.

import { http } from './http';

function unwrap(data) {
  return { success: !!data?.Success, message: data?.Message, data: data?.Data };
}


export async function fetchOrders(params = {}) {
  try {
    const { data } = await http.get('/v1/orders', { params });
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to load orders.', data: null };
  }
}

export async function fetchOrder(orderId) {
  try {
    const { data } = await http.get(`/v1/orders/${orderId}`);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Order not found.', data: null };
  }
}

export { trackOrder } from './checkout';

