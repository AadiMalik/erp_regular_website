<script setup>
// Ports legacy/404.html. Standalone centered layout — does not use PageHeader.
// Static content — no page JS existed in legacy/assets/js/pages/ for this page,
// so no interactive logic beyond scroll-reveal.
</script>

<template>
  <div class="section">
    <div class="container">
      <div class="error-page" v-reveal="'zoom'">
        <span class="error-page__code">404</span>
        <h2>Page Not Found</h2>
        <p>Sorry, the page you're looking for doesn't exist, may have been moved, or the link is broken.</p>
        <div class="error-page__actions">
          <RouterLink :to="{ name: 'home' }" class="btn btn-primary"><i class="fa-solid fa-house"></i> Back to Home</RouterLink>
          <RouterLink :to="{ name: 'shop' }" class="btn btn-outline"><i class="fa-solid fa-basket-shopping"></i> Browse Shop</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
