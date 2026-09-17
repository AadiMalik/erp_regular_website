<script setup>
import { onMounted } from 'vue';
import { useBranchStore } from '@/stores/branch';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import ToastStack from '@/components/ui/ToastStack.vue';
import QuickViewModal from '@/components/product/QuickViewModal.vue';
import LightboxModal from '@/components/ui/LightboxModal.vue';
import BranchModal from '@/components/layout/BranchModal.vue';
import ShareModal from '@/components/common/ShareModal.vue';

const branchStore = useBranchStore();

onMounted(() => {
  branchStore.init();
});
</script>

<template>
  <DefaultLayout />
  <ToastStack />
  <QuickViewModal />
  <LightboxModal />
  <BranchModal />
  <ShareModal />
</template>
