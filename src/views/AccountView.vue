<script setup>
// Ports assets/js/pages/account.js.

import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useOrdersStore } from '@/stores/orders';
import { useCartStore } from '@/stores/cart';
import { showToast } from '@/composables/useToast';
import { formatDate } from '@/utils/date';
import PageHeader from '@/components/ui/PageHeader.vue';
import AccountSidebar from '@/components/account/AccountSidebar.vue';
import OrderCard from '@/components/account/OrderCard.vue';

const auth = useAuthStore();
const ordersStore = useOrdersStore();
const cart = useCartStore();

onMounted(async () => {
  await Promise.all([
    auth.fetchProfile(),
    ordersStore.fetchOrders({ per_page: 3 }),
  ]);
});

const user = computed(() => auth.currentUser);
const addresses = computed(() => user.value?.addresses?.slice(0, 4) || []);
const recentOrders = computed(() => ordersStore.getOrdersForUser(user.value?.id).slice(0, 3));

async function reorder(order) {
  let added = 0;
  let failed = null;
  for (const item of order.items || []) {
    const result = await cart.addToCart(item.productId, {
      productVariationId: item.product_variation_id,
      quantity: item.qty || 1,
    });
    if (result.needsAuth) {
      showToast(result.message, 'info');
      return;
    }
    if (result.ok) added += 1;
    else failed = result.message;
  }
  if (added) showToast('Items added to your cart.', 'success');
  else showToast(failed || 'Could not add items to cart.', 'error');
}
</script>

<template>
  <PageHeader title="My Profile" crumb="My Profile" />

  <div class="section">
    <div class="container">
      <div class="account-layout">
        <AccountSidebar active="profile" />

        <div>
          <div class="account-card">
            <div class="account-card__head">
              <div><h3>Personal Information</h3><p>Your basic account details</p></div>
              <RouterLink :to="{ name: 'account-edit' }" class="btn btn-outline btn-sm"><i class="fa-solid fa-pen"></i> Edit</RouterLink>
            </div>
            <div class="field-row">
              <div class="profile-photo-preview" style="margin-right:12px">
                <img v-if="user?.profile_image" :src="user.profile_image" :alt="user?.name">
                <span v-else>{{ (user?.name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?' }}</span>
              </div>
              <div><span class="text-muted" style="font-size:var(--fs-xs)">Full Name</span><p style="font-weight:600;margin-top:4px">{{ user?.name }}</p></div>
              <div><span class="text-muted" style="font-size:var(--fs-xs)">Email Address</span><p style="font-weight:600;margin-top:4px">{{ user?.email }}</p></div>
            </div>
            <div class="field-row">
              <div><span class="text-muted" style="font-size:var(--fs-xs)">Phone Number</span><p style="font-weight:600;margin-top:4px">{{ user?.phone || '—' }}</p></div>
              <div><span class="text-muted" style="font-size:var(--fs-xs)">Member Since</span><p style="font-weight:600;margin-top:4px">{{ formatDate(user?.createdAt) }}</p></div>
            </div>
          </div>

          <div class="account-card">
            <div class="account-card__head">
              <div><h3>Saved Addresses</h3><p>Manage your delivery addresses</p></div>
              <RouterLink :to="{ name: 'account-edit' }" class="btn btn-outline btn-sm"><i class="fa-solid fa-plus"></i> Add / Manage</RouterLink>
            </div>
            <div class="address-grid">
              <div v-if="!addresses.length" class="add-address-card" style="grid-column:1/-1"><i class="fa-solid fa-location-dot"></i> No saved addresses yet — add one from Edit Profile.</div>
              <div v-for="a in addresses" :key="a.id" class="address-card" :class="{ 'is-default': a.isDefault }">
                <span v-if="a.isDefault" class="address-card__badge badge badge-soft">Default</span>
                <strong>{{ a.label || 'Address' }}</strong>
                <p>{{ a.fullName }}<br>{{ a.address }}, {{ a.city }} {{ a.zip }}<br>{{ a.country }}</p>
              </div>
            </div>
          </div>

          <div class="account-card">
            <div class="account-card__head">
              <div><h3>Recent Orders</h3><p>Your most recent purchases</p></div>
              <RouterLink :to="{ name: 'orders' }" class="btn btn-outline btn-sm">View All <i class="fa-solid fa-arrow-right"></i></RouterLink>
            </div>
            <div v-if="!recentOrders.length" class="cart-empty" style="padding:var(--sp-7) var(--sp-4)">
              <i class="fa-solid fa-bag-shopping"></i>
              <h2 style="font-size:var(--fs-lg)">No orders yet</h2>
              <p class="text-muted" style="margin-top:8px">Your placed orders will show up here.</p>
              <RouterLink :to="{ name: 'shop' }" class="btn btn-primary" style="margin-top:var(--sp-4)">Start Shopping</RouterLink>
            </div>
            <OrderCard v-for="o in recentOrders" :key="o.id" :order="o" @reorder="reorder" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
