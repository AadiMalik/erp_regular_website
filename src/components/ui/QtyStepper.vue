<script setup>
const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 99 },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

function clamp(n) {
  return Math.max(props.min, Math.min(n, props.max));
}
function dec() {
  if (props.disabled) return;
  emit('update:modelValue', clamp(props.modelValue - 1));
}
function inc() {
  if (props.disabled) return;
  emit('update:modelValue', clamp(props.modelValue + 1));
}
function onInput(e) {
  if (props.disabled) return;
  const n = Number(e.target.value);
  emit('update:modelValue', clamp(Number.isNaN(n) ? props.min : n));
}
</script>

<template>
  <div class="qty-control" :class="{ 'qty-control--disabled': disabled }">
    <button type="button" :disabled="disabled" @click="dec">−</button>
    <input type="number" :value="modelValue" :min="min" :max="max" :disabled="disabled" @change="onInput">
    <button type="button" :disabled="disabled" @click="inc">+</button>
  </div>
</template>
