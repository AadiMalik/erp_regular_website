<script setup>
import { ref, onMounted } from 'vue';
import { fetchCategories } from '@/services/categories';

const categories = ref([]);
onMounted(async () => {
  categories.value = await fetchCategories();
});
</script>

<template>
  <nav class="main-nav" aria-label="Main">
    <RouterLink :to="{ name: 'home' }" active-class="active">Home</RouterLink>
    <RouterLink :to="{ name: 'shop' }" active-class="active">Shop</RouterLink>
    <div class="has-mega">
      <RouterLink :to="{ name: 'shop' }">Categories <i class="fa-solid fa-chevron-down" style="font-size:.6rem"></i></RouterLink>
      <div class="mega-menu">
        <RouterLink v-for="c in categories" :key="c.id" :to="{ name: 'shop', query: { category: c.id } }">
          <i class="fa-solid" :class="c.icon"></i> {{ c.name }}
        </RouterLink>
      </div>
    </div>
    <RouterLink :to="{ name: 'shop', query: { filter: 'deal' } }">Deals</RouterLink>
    <RouterLink :to="{ name: 'about' }" active-class="active">About</RouterLink>
    <RouterLink :to="{ name: 'contact' }" active-class="active">Contact</RouterLink>
  </nav>
</template>
