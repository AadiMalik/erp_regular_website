<script setup>
// Wraps the repeated `.field` (label + input/select/textarea + .error-msg)
// markup used across checkout, address, auth and profile forms.
import PasswordInput from '@/components/ui/PasswordInput.vue';

defineProps({
  label: { type: String, default: '' },
  id: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  as: { type: String, default: 'input' }, // input | select | textarea
  error: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  maxlength: { type: [String, Number], default: undefined },
  autocomplete: { type: String, default: undefined },
  rows: { type: [String, Number], default: 3 },
  disabled: { type: Boolean, default: false },
});
defineEmits(['update:modelValue', 'blur']);
</script>

<template>
  <div class="field" :class="{ 'has-error': error }">
    <label v-if="label" :for="id">{{ label }}</label>
    <select
      v-if="as === 'select'"
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
    ><slot /></select>
    <textarea
      v-else-if="as === 'textarea'"
      :id="id"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
    ></textarea>
    <PasswordInput
      v-else-if="type === 'password'"
      :id="id"
      :model-value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      @update:model-value="$emit('update:modelValue', $event)"
      @blur="$emit('blur')"
    />
    <input
      v-else
      :id="id"
      :type="type"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur')"
    >
    <span v-if="errorMessage" class="error-msg">{{ errorMessage }}</span>
  </div>
</template>
