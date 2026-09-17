<script setup>
import { ref, onMounted } from 'vue';
import { useBranchStore } from '@/stores/branch';
import { fetchContentItems } from '@/services/cms';

const branch = useBranchStore();
const announcement = ref(null);
onMounted(async () => {
  const items = await fetchContentItems('announcement_bar');
  announcement.value = items[0] || null;
});
</script>

<template>
  <div class="topbar">
    <div class="container">
      <div class="topbar__links" v-if="announcement">
        <span><i :class="announcement.icon || 'fa-solid fa-truck-fast'"></i>&nbsp; {{ announcement.title }}</span>
      </div>
      <div class="topbar__links">
        <button class="branch-pill" type="button" aria-haspopup="dialog" @click="branch.openModal()">
          <i class="fa-solid fa-location-dot"></i>
          <span>{{ branch.selectedBranch?.name || 'Select store' }}</span>
          <i class="fa-solid fa-chevron-down branch-pill__chev"></i>
        </button>
        <RouterLink :to="{ name: 'help-center' }"><i class="fa-solid fa-circle-question"></i> Help Center</RouterLink>
      </div>
    </div>
  </div>
</template>
