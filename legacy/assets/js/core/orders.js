// Smart Mart — order history simulation (no backend exists, so placed orders
// are persisted to localStorage). Mirrors the read/write/emit pattern used by
// ./store.js for cart/wishlist.

import { PRODUCTS } from '../data/products.js';

const ORDERS_KEY = 'sm_orders';

export const FLOW_STEPS = [
  { key: 'processing', label: 'Order Placed', icon: 'fa-receipt' },
  { key: 'shipped', label: 'Shipped', icon: 'fa-box' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'fa-truck-fast' },
  { key: 'delivered', label: 'Delivered', icon: 'fa-circle-check' },
];

export const STATUS_LABELS = {
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return Requested',
  returned: 'Returned',
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
function genOrderNumber() {
  return `SM-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

export function getAllOrders() {
  return read(ORDERS_KEY, []);
}
function saveAllOrders(orders) {
  write(ORDERS_KEY, orders);
}

export function getOrdersForUser(userId) {
  return getAllOrders()
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));
}

export function getOrderById(id) {
  return getAllOrders().find((o) => o.id === id) || null;
}

export function findOrderByNumberAndEmail(orderNumber, email) {
  const num = (orderNumber || '').trim().toUpperCase();
  const mail = (email || '').trim().toLowerCase();
  return getAllOrders().find((o) => o.orderNumber.toUpperCase() === num && o.email.toLowerCase() === mail) || null;
}

export function createOrder({ items, totals, address, deliveryMethod, paymentMethod, branchId, userId, notes }) {
  const orders = getAllOrders();
  const now = new Date().toISOString();
  const order = {
    id: `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    orderNumber: genOrderNumber(),
    userId: userId || null,
    email: address.email,
    items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    deliveryMethod,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    branchId,
    address,
    notes: notes || '',
    status: 'processing',
    statusHistory: [{ status: 'processing', at: now }],
    placedAt: now,
  };
  orders.push(order);
  saveAllOrders(orders);
  emit('orders:change', { orders });
  return order;
}

export function getOrderTimeline(order) {
  const steps = FLOW_STEPS.map((s) => {
    const hist = order.statusHistory.find((h) => h.status === s.key);
    return { ...s, done: !!hist, at: hist?.at || null };
  });
  if (order.status === 'cancelled') {
    const hist = order.statusHistory.find((h) => h.status === 'cancelled');
    steps.push({ key: 'cancelled', label: 'Order Cancelled', icon: 'fa-circle-xmark', done: true, at: hist?.at, isAlt: true });
  } else if (order.status === 'return_requested' || order.status === 'returned') {
    const hist = order.statusHistory.find((h) => h.status === order.status);
    steps.push({
      key: order.status,
      label: order.status === 'returned' ? 'Return Completed' : 'Return Requested',
      icon: 'fa-rotate-left',
      done: true,
      at: hist?.at,
      isAlt: true,
    });
  }
  return steps;
}

function setStatus(order, status) {
  order.status = status;
  order.statusHistory.push({ status, at: new Date().toISOString() });
}

export function cancelOrder(id) {
  const orders = getAllOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return { ok: false, message: 'Order not found.' };
  if (order.status !== 'processing') return { ok: false, message: 'This order can no longer be cancelled.' };
  setStatus(order, 'cancelled');
  saveAllOrders(orders);
  emit('orders:change', { orders });
  return { ok: true, order };
}

export function requestReturn(id) {
  const orders = getAllOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return { ok: false, message: 'Order not found.' };
  if (order.status !== 'delivered') return { ok: false, message: 'Only delivered orders are eligible for return.' };
  setStatus(order, 'return_requested');
  saveAllOrders(orders);
  emit('orders:change', { orders });
  return { ok: true, order };
}

/* ---------------- Demo seeding ---------------- */

function pickProducts(n) {
  const shuffled = [...PRODUCTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function itemsFromProducts(products) {
  return products.map((p) => {
    const qty = 1 + Math.floor(Math.random() * 3);
    const unitPrice = p.variations ? p.variations.options[0].price : p.price;
    return {
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0],
      variation: p.variations ? p.variations.options[0].label : null,
      qty,
      unitPrice,
      lineTotal: +(unitPrice * qty).toFixed(2),
    };
  });
}

function totalsFromItems(items) {
  const subtotal = +items.reduce((s, i) => s + i.lineTotal, 0).toFixed(2);
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const tax = +(subtotal * 0.05).toFixed(2);
  return { subtotal, discount: 0, shipping, tax, total: +(subtotal + shipping + tax).toFixed(2) };
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function buildDemoOrder({ userId, email, daysBack, finalStatus }) {
  const items = itemsFromProducts(pickProducts(1 + Math.floor(Math.random() * 3)));
  const totals = totalsFromItems(items);
  const placedAt = daysAgo(daysBack);
  const history = [{ status: 'processing', at: placedAt.toISOString() }];

  const stepGap = 20 * 60 * 60 * 1000; // 20h between steps
  if (finalStatus !== 'processing') {
    history.push({ status: 'shipped', at: new Date(placedAt.getTime() + stepGap).toISOString() });
  }
  if (['out_for_delivery', 'delivered', 'return_requested', 'returned'].includes(finalStatus)) {
    history.push({ status: 'out_for_delivery', at: new Date(placedAt.getTime() + stepGap * 2).toISOString() });
  }
  if (['delivered', 'return_requested', 'returned'].includes(finalStatus)) {
    history.push({ status: 'delivered', at: new Date(placedAt.getTime() + stepGap * 2.5).toISOString() });
  }
  if (finalStatus === 'return_requested' || finalStatus === 'returned') {
    history.push({ status: finalStatus, at: new Date(placedAt.getTime() + stepGap * 4).toISOString() });
  }
  if (finalStatus === 'cancelled') {
    history.push({ status: 'cancelled', at: new Date(placedAt.getTime() + stepGap / 2).toISOString() });
  }

  return {
    id: `ord_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    orderNumber: genOrderNumber(),
    userId,
    email,
    items,
    ...totals,
    deliveryMethod: 'standard',
    paymentMethod: ['card', 'cod', 'paypal'][Math.floor(Math.random() * 3)],
    paymentStatus: finalStatus === 'cancelled' ? 'refunded' : 'paid',
    branchId: null,
    address: { fullName: '', phone: '', email, address: '', city: '', zip: '', country: '' },
    notes: '',
    status: finalStatus,
    statusHistory: history,
    placedAt: placedAt.toISOString(),
  };
}

export function seedDemoOrders(userId) {
  const user = JSON.parse(localStorage.getItem('sm_users') || '[]').find((u) => u.id === userId);
  if (!user) return;
  const existing = getOrdersForUser(userId);
  if (existing.length > 0) return;

  const orders = getAllOrders();
  orders.push(
    buildDemoOrder({ userId, email: user.email, daysBack: 18, finalStatus: 'delivered' }),
    buildDemoOrder({ userId, email: user.email, daysBack: 6, finalStatus: 'out_for_delivery' }),
    buildDemoOrder({ userId, email: user.email, daysBack: 32, finalStatus: 'cancelled' }),
  );
  saveAllOrders(orders);
}
