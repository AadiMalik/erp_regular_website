import { useWebsiteSettingsStore } from '@/stores/websiteSettings';

// Currency code/symbol/position come from the ERP's Accounting settings
// (see stores/websiteSettings.js), not hard-coded — falls back to USD/$ if
// the store hasn't been populated yet.
export function formatTaxPercent(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '0';
  return String(parseFloat(n.toFixed(4)));
}

export function taxLineLabel(percent, taxType) {
  const mode = taxType === 'inclusive' ? 'Inclusive' : 'Exclusive';
  return `Tax (${formatTaxPercent(percent)}%) (${mode})`;
}

export function taxDiscountLineLabel(percent) {
  return `Tax Discount (${formatTaxPercent(percent)}%)`;
}

export function formatCurrency(value) {
  const { symbol, position, decimal_points } = useWebsiteSettingsStore().currency;
  const amount = Number(value).toFixed(decimal_points ?? 2);
  // Keep a clear gap between symbol and amount (e.g. "$ 12.00" / "12.00 $").
  return position === 'after' ? `${amount} ${symbol}` : `${symbol} ${amount}`;
}
