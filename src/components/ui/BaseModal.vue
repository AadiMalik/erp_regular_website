<script setup>
// Generic overlay/box shell shared by every modal (quick view, lightbox,
// branch selector, address form). Ports the open/close + Escape/backdrop
// behavior from assets/js/core/modal.js's openOverlay/closeOverlay.

import { watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, required: true },
  dismissible: { type: Boolean, default: true },
  boxClass: { type: [String, Array, Object], default: '' },
  overlayClass: { type: [String, Array, Object], default: '' },
});
const emit = defineEmits(['close']);

function close() {
  if (!props.dismissible) return;
  emit('close');
}

function onKeydown(e) {
  if (e.key === 'Escape') close();
}

watch(() => props.open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (isOpen) document.addEventListener('keydown', onKeydown);
  else document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div class="modal-overlay" :class="[overlayClass, { open }]" @click.self="close">
    <div class="modal-box" :class="boxClass">
      <button v-if="dismissible" class="modal-close" aria-label="Close" @click="close">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <slot />
    </div>
  </div>
</template>
