// Smart Mart — small shared helpers used across every module.

export const qs = (sel, ctx = document) => ctx.querySelector(sel);
export const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

export function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`;
}

export function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

export function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function starsMarkup(rating) {
  const pct = clamp((rating / 5) * 100, 0, 100);
  return `<span class="stars"><span class="stars-fill" style="width:${pct}%"></span></span>`;
}
