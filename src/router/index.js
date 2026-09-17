import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/shop', name: 'shop', component: () => import('@/views/ShopView.vue') },
  { path: '/product/:slug', name: 'product', component: () => import('@/views/ProductView.vue') },
  { path: '/cart', name: 'cart', component: () => import('@/views/CartView.vue') },
  { path: '/wishlist', name: 'wishlist', component: () => import('@/views/WishlistView.vue'), meta: { requiresAuth: true } },
  { path: '/checkout', name: 'checkout', component: () => import('@/views/CheckoutView.vue'), meta: { requiresAuth: true } },
  { path: '/order-success/:id', name: 'order-success', component: () => import('@/views/OrderSuccessView.vue') },

  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
  { path: '/signup', name: 'signup', component: () => import('@/views/SignupView.vue') },
  { path: '/verify-otp', name: 'verify-otp', component: () => import('@/views/VerifyOtpView.vue') },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('@/views/ForgotPasswordView.vue') },
  { path: '/reset-password', name: 'reset-password', component: () => import('@/views/ResetPasswordView.vue') },

  { path: '/account', name: 'account', component: () => import('@/views/AccountView.vue'), meta: { requiresAuth: true } },
  { path: '/account/edit', name: 'account-edit', component: () => import('@/views/AccountEditView.vue'), meta: { requiresAuth: true } },
  { path: '/account/password', name: 'account-password', component: () => import('@/views/AccountPasswordView.vue'), meta: { requiresAuth: true } },
  { path: '/orders', name: 'orders', component: () => import('@/views/OrdersView.vue'), meta: { requiresAuth: true } },
  { path: '/orders/:id', name: 'order-details', component: () => import('@/views/OrderDetailsView.vue'), meta: { requiresAuth: true } },
  { path: '/track-order', name: 'track-order', component: () => import('@/views/TrackOrderView.vue') },

  { path: '/categories', name: 'categories', component: () => import('@/views/CategoriesView.vue') },
  { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
  { path: '/contact', name: 'contact', component: () => import('@/views/ContactView.vue') },
  { path: '/help-center', name: 'help-center', component: () => import('@/views/HelpCenterView.vue') },
  { path: '/shipping-info', name: 'shipping-info', component: () => import('@/views/ShippingInfoView.vue') },
  { path: '/returns-refunds', name: 'returns-refunds', component: () => import('@/views/ReturnsRefundsView.vue') },
  { path: '/cancellation-policy', name: 'cancellation-policy', component: () => import('@/views/CancellationPolicyView.vue') },
  { path: '/privacy-policy', name: 'privacy-policy', component: () => import('@/views/PrivacyPolicyView.vue') },
  { path: '/terms-conditions', name: 'terms-conditions', component: () => import('@/views/TermsConditionsView.vue') },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash };
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore();
    if (!auth.isLoggedIn) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }
  }
  return true;
});

export default router;
