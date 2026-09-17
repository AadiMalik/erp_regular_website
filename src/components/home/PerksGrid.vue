<script setup>
// Items come from the admin-managed "Why Shop With Us" benefits CRUD
// (see useHomeProductSections' `benefits`) - purely presentational here.
defineProps({
  items: { type: Array, default: () => [] },
});
</script>

<template>
  <div class="perks-grid stagger">
    <div v-for="(p, i) in items" :key="p.id" class="perk-card" v-reveal="['up', i, 60]">
      <span class="ico" :style="p.icon_color ? { color: p.icon_color } : null"><i class="fa-solid" :class="p.icon || 'fa-circle-check'"></i></span>
      <h3>{{ p.title }}</h3>
      <p>{{ p.description }}</p>
    </div>
  </div>
</template>
