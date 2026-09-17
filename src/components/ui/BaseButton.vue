<script setup>
// Thin wrapper around the existing .btn class system (components.css) —
// renders an <a> when `to`/`href` is given, a <button> otherwise, so
// callers don't hand-assemble class lists for every CTA.
defineProps({
  variant: { type: String, default: 'primary' }, // primary | dark | outline | accent | ghost
  size: { type: String, default: '' }, // '' | sm | lg
  block: { type: Boolean, default: false },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
});
</script>

<template>
  <RouterLink
    v-if="to"
    :to="to"
    class="btn"
    :class="[`btn-${variant}`, size && `btn-${size}`, { 'btn-block': block }]"
  >
    <slot />
  </RouterLink>
  <a
    v-else-if="href"
    :href="href"
    class="btn"
    :class="[`btn-${variant}`, size && `btn-${size}`, { 'btn-block': block }]"
  >
    <slot />
  </a>
  <button
    v-else
    :type="type"
    :disabled="disabled"
    class="btn"
    :class="[`btn-${variant}`, size && `btn-${size}`, { 'btn-block': block }]"
  >
    <slot />
  </button>
</template>
