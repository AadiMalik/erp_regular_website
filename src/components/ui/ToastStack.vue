<script setup>
import { toasts } from '@/composables/useToast';
</script>

<template>
  <div class="toast-stack" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="{ 'toast-error': t.type === 'error' }">
        <i class="fa-solid" :class="t.icon"></i>
        <span>{{ t.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>
