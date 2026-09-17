<script setup>
// Password input with show/hide toggle (eye icon).
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  id: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
});

defineEmits(['update:modelValue', 'blur']);

const visible = ref(false);
const inputType = computed(() => (visible.value ? 'text' : 'password'));

function toggle() {
  visible.value = !visible.value;
}
</script>

<template>
  <div class="password-input">
    <input
      :id="id"
      :type="inputType"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
    >
    <button
      type="button"
      class="password-input__toggle"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      tabindex="-1"
      @click="toggle"
    >
      <i class="fa-solid" :class="visible ? 'fa-eye-slash' : 'fa-eye'"></i>
    </button>
  </div>
</template>
