<script setup>
import { formatDateTime } from '@/utils/date';

defineProps({
  steps: { type: Array, required: true },
});
</script>

<template>
  <div class="order-timeline">
    <div
      v-for="step in steps"
      :key="step.key"
      class="order-timeline__step"
      :class="{ done: step.done, alt: step.isAlt }"
    >
      <span class="order-timeline__dot"><i class="fa-solid" :class="step.icon"></i></span>
      <div class="order-timeline__body">
        <strong>{{ step.label }}</strong>
        <span>{{ step.at ? formatDateTime(step.at) : 'Pending' }}</span>
      </div>
    </div>
  </div>
</template>
