// Website voucher API — apply / remove (cart-scoped).

import { http } from './http';

function unwrap(data) {
  return { success: !!data?.Success, message: data?.Message, data: data?.Data };
}

function businessId() {
  return import.meta.env.VITE_BUSINESS_ID || '';
}

export async function applyVoucher({ voucherCode, voucherId, branchId = null } = {}) {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.', data: null };
  try {
    const { data } = await http.post(`/v1/vouchers/${id}/apply`, {
      voucher_code: voucherCode,
      voucher_id: voucherId,
      branch_id: branchId,
    });
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to apply voucher.', data: null };
  }
}

export async function removeVoucher() {
  const id = businessId();
  if (!id) return { success: false, message: 'Business is not configured.', data: null };
  try {
    const { data } = await http.delete(`/v1/vouchers/${id}`);
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to remove voucher.', data: null };
  }
}
