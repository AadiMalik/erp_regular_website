// Customer orders API - authenticated "My Orders" against the ERP orders table.

import { http } from './http';

function unwrap(data) {
  return { success: !!data?.Success, message: data?.Message, data: data?.Data };
}

function businessId() {
  return import.meta.env.VITE_BUSINESS_ID || '';
}

export async function fetchOrders(params = {}) {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.', data: null };
  try {
    const { data } = await http.get(`/v1/orders/${id}`, { params });
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to load orders.', data: null };
  }
}

export async function fetchOrder(orderId) {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.', data: null };
  try {
    const { data } = await http.get(`/v1/orders/${id}/${orderId}`);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Order not found.', data: null };
  }
}

export { trackOrder } from './checkout';

