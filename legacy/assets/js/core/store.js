// Smart Mart — client-side cart / wishlist / coupon state.
// Everything here is backed by localStorage and broadcasts `cart:change` /
// `wishlist:change` events on `window`, which is exactly the shape a real
// state layer (Redux/Zustand/Pinia store, or API calls) would take over.

import { PRODUCTS } from '../data/products.js';

const CART_KEY = 'sm_cart';
const WISHLIST_KEY = 'sm_wishlist';
const COUPON_KEY = 'sm_coupon';

const COUPONS = {
  SAVE10: { pct: 10, label: '10% off your order' },
  FRESH20: { pct: 20, label: '20% off — fresh deal' },
  WELCOME5: { pct: 5, label: '5% welcome discount' },
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function findProduct(productId) {
  return PRODUCTS.find((p) => p.id === productId);
}

function variationStock(product, variationLabel) {
  if (!product.variations) return product.stock;
  const opt = product.variations.options.find((o) => o.label === variationLabel);
  return opt ? opt.stock : product.stock;
}

function variationPrice(product, variationLabel) {
  if (!product.variations) return { price: product.price, oldPrice: product.oldPrice };
  const opt = product.variations.options.find((o) => o.label === variationLabel);
  return opt ? { price: opt.price, oldPrice: opt.oldPrice || null } : { price: product.price, oldPrice: product.oldPrice };
}

/* ---------------- Cart ---------------- */

export function getCart() {
  return read(CART_KEY, []);
}

export function getCartDetailed() {
  return getCart().map((item) => {
    const product = findProduct(item.productId);
    if (!product) return null;
    const { price, oldPrice } = variationPrice(product, item.variation);
    return {
      ...item,
      product,
      unitPrice: price,
      unitOldPrice: oldPrice,
      lineTotal: +(price * item.qty).toFixed(2),
      maxStock: variationStock(product, item.variation),
    };
  }).filter(Boolean);
}

export function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

export function getCartSubtotal() {
  return getCartDetailed().reduce((sum, i) => sum + i.lineTotal, 0);
}

export function addToCart(productId, variation = null, qty = 1) {
  const product = findProduct(productId);
  if (!product) return { ok: false, message: 'Product not found.' };
  const maxStock = variationStock(product, variation);
  if (maxStock <= 0) return { ok: false, message: 'This item is out of stock.' };

  const cart = getCart();
  const existing = cart.find((i) => i.productId === productId && i.variation === variation);
  const currentQty = existing ? existing.qty : 0;
  const nextQty = Math.min(currentQty + qty, maxStock);
  if (nextQty === currentQty) return { ok: false, message: `Only ${maxStock} in stock — already in your cart.` };

  if (existing) existing.qty = nextQty;
  else cart.push({ productId, variation, qty: nextQty });

  write(CART_KEY, cart);
  emit('cart:change', { cart });
  return { ok: true, qty: nextQty };
}

export function updateCartQty(productId, variation, qty) {
  const product = findProduct(productId);
  const maxStock = variationStock(product, variation);
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId && i.variation === variation);
  if (!item) return;
  item.qty = clampQty(qty, maxStock);
  write(CART_KEY, cart);
  emit('cart:change', { cart });
}

function clampQty(qty, max) {
  return Math.max(1, Math.min(qty, max));
}

export function removeFromCart(productId, variation) {
  const cart = getCart().filter((i) => !(i.productId === productId && i.variation === variation));
  write(CART_KEY, cart);
  emit('cart:change', { cart });
}

export function clearCart() {
  write(CART_KEY, []);
  localStorage.removeItem(COUPON_KEY);
  emit('cart:change', { cart: [] });
}

/* ---------------- Wishlist ---------------- */

export function getWishlist() {
  return read(WISHLIST_KEY, []);
}

export function isWishlisted(productId) {
  return getWishlist().includes(productId);
}

export function toggleWishlist(productId) {
  let list = getWishlist();
  const active = list.includes(productId);
  list = active ? list.filter((id) => id !== productId) : [...list, productId];
  write(WISHLIST_KEY, list);
  emit('wishlist:change', { wishlist: list });
  return !active;
}

/* ---------------- Coupon ---------------- */

export function applyCoupon(code) {
  const normalized = (code || '').trim().toUpperCase();
  const coupon = COUPONS[normalized];
  if (!coupon) return { ok: false, message: 'Invalid or expired coupon code.' };
  write(COUPON_KEY, { code: normalized, ...coupon });
  emit('cart:change', { cart: getCart() });
  return { ok: true, coupon };
}

export function removeCoupon() {
  localStorage.removeItem(COUPON_KEY);
  emit('cart:change', { cart: getCart() });
}

export function getCoupon() {
  return read(COUPON_KEY, null);
}

/* ---------------- Order totals ---------------- */

export function computeTotals() {
  const subtotal = getCartSubtotal();
  const coupon = getCoupon();
  const discount = coupon ? +(subtotal * (coupon.pct / 100)).toFixed(2) : 0;
  const shipping = subtotal === 0 ? 0 : subtotal >= 50 ? 0 : 4.99;
  const taxable = subtotal - discount;
  const tax = +(taxable * 0.05).toFixed(2);
  const total = +(taxable + tax + shipping).toFixed(2);
  return { subtotal, discount, shipping, tax, total, coupon };
}
