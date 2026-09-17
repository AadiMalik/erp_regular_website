// Customer order history from the ERP API (services/orders.js).
// Checkout places orders via the website checkout API.

import { defineStore } from 'pinia';
import * as ordersApi from '@/services/orders';
import * as checkoutApi from '@/services/checkout';

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

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    currentOrder: null,
    loading: false,
    loaded: false,
    pagination: { current_page: 1, per_page: 20, total: 0, last_page: 1 },
  }),

  actions: {
    async fetchOrders(params = {}) {
      this.loading = true;
      const result = await ordersApi.fetchOrders(params);
      this.loading = false;

      if (!result.success) {
        this.orders = [];
        return { ok: false, message: result.message };
      }

      const payload = result.data || {};
      this.orders = payload.data || [];
      this.pagination = {
        current_page: payload.current_page || 1,
        per_page: payload.per_page || 20,
        total: payload.total || 0,
        last_page: payload.last_page || 1,
      };
      this.loaded = true;
      return { ok: true, orders: this.orders };
    },

    async fetchOrder(orderId) {
      this.loading = true;
      const result = await ordersApi.fetchOrder(orderId);
      this.loading = false;

      if (!result.success) {
        this.currentOrder = null;
        return { ok: false, message: result.message };
      }

      this.currentOrder = result.data;
      return { ok: true, order: result.data };
    },

    async placeOrder(formData) {
      const result = await checkoutApi.placeOrder(formData);
      if (!result.success) {
        return { ok: false, message: result.message };
      }
      this.currentOrder = result.data;
      return { ok: true, order: result.data };
    },

    async trackOrder({ orderNumber, email = null, phone = null }) {
      const result = await checkoutApi.trackOrder({ orderNumber, email, phone });
      if (!result.success) {
        return { ok: false, message: result.message };
      }
      return { ok: true, order: result.data };
    },

    getOrdersForUser() {
      return [...this.orders].sort(
        (a, b) => new Date(b.placedAt) - new Date(a.placedAt),
      );
    },

    getOrderById(id) {
      return this.orders.find((o) => o.id === id)
        || (this.currentOrder?.id === id ? this.currentOrder : null);
    },

    getOrderTimeline(order) {
      const steps = FLOW_STEPS.map((s) => {
        const hist = (order.statusHistory || []).find((h) => h.status === s.key);
        return { ...s, done: !!hist, at: hist?.at || null };
      });
      if (order.status === 'cancelled') {
        const hist = (order.statusHistory || []).find((h) => h.status === 'cancelled');
        steps.push({ key: 'cancelled', label: 'Order Cancelled', icon: 'fa-circle-xmark', done: true, at: hist?.at, isAlt: true });
      } else if (order.status === 'return_requested' || order.status === 'returned') {
        const hist = (order.statusHistory || []).find((h) => h.status === order.status);
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
    },
  },
});
