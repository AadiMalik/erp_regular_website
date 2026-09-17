// Website voucher API — apply / remove (cart-scoped).

import { http } from './http';

function unwrap(data) {
  return { success: !!data?.Success, message: data?.Message, data: data?.Data };
}


export async function applyVoucher({ voucherCode, voucherId, branchId = null } = {}) {
  try {
    const { data } = await http.post('/v1/vouchers/apply', {
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
  try {
    const { data } = await http.delete('/v1/vouchers');
    return unwrap(data);
  } catch (err) {
    return { success: false, message: err?.response?.data?.Message || 'Failed to remove voucher.', data: null };
  }
}
