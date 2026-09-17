<script setup>
// Ports assets/js/core/branch.js's store-selector modal (first-visit gate +
// dismissible re-opens from the topbar/mobile-drawer pill).

import { ref, onMounted } from 'vue';
import { useBranchStore } from '@/stores/branch';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { fetchBranches } from '@/services/branches';
import BaseModal from '@/components/ui/BaseModal.vue';

const branch = useBranchStore();
const site = useWebsiteSettingsStore();
const branches = ref([]);
const pendingId = ref(null);

onMounted(async () => {
  branches.value = await fetchBranches();
});

function selectCard(id) {
  pendingId.value = id;
}
function confirm() {
  if (!pendingId.value) return;
  branch.selectBranch(pendingId.value);
}
</script>

<template>
  <BaseModal
    :open="branch.modalOpen"
    :dismissible="branch.dismissible"
    overlay-class="branch-modal-overlay"
    box-class="branch-modal"
    @close="branch.closeModal()"
  >
    <div class="branch-modal__head">
      <span class="branch-modal__icon"><i class="fa-solid fa-store"></i></span>
      <h2>Choose Your Nearest Store</h2>
      <p>Select a {{ site.business.name }} branch to see accurate delivery times and availability for your area.</p>
    </div>
    <div class="branch-modal__list">
      <label
        v-for="b in branches"
        :key="b.id"
        class="branch-card"
        :class="{ active: (pendingId ?? branch.selectedId) === b.id }"
      >
        <input
          type="radio"
          name="branch-select"
          :value="b.id"
          :checked="(pendingId ?? branch.selectedId) === b.id"
          @change="selectCard(b.id)"
        >
        <img :src="b.image" alt="" class="branch-card__img">
        <div class="branch-card__meta">
          <strong>{{ b.name }}</strong>
          <span><i class="fa-solid fa-location-dot"></i> {{ b.address }}</span>
          <span><i class="fa-regular fa-clock"></i> {{ b.hours }}</span>
          <span class="branch-card__note"><i class="fa-solid fa-truck-fast"></i> {{ b.deliveryNote }}</span>
        </div>
        <i class="fa-solid fa-circle-check branch-card__check"></i>
      </label>
    </div>
    <button class="btn btn-primary btn-block" :disabled="!(pendingId ?? branch.selectedId)" @click="confirm">
      Confirm Store
    </button>
  </BaseModal>
</template>
