<script setup>
defineProps({
  address: { type: Object, required: true },
});
defineEmits(['edit', 'set-default', 'delete']);
</script>

<template>
  <div class="address-card" :class="{ 'is-default': address.isDefault }">
    <span v-if="address.isDefault" class="address-card__badge badge badge-soft">Default</span>
    <strong>{{ address.label || 'Address' }}</strong>
    <p>{{ address.fullName }}<br>{{ address.address }}, {{ address.city }} {{ address.zip }}<br>{{ address.country }}<br>{{ address.phone }}</p>
    <div class="address-card__actions">
      <button type="button" @click="$emit('edit', address)"><i class="fa-solid fa-pen"></i> Edit</button>
      <button v-if="!address.isDefault" type="button" @click="$emit('set-default', address)"><i class="fa-solid fa-star"></i> Set Default</button>
      <button type="button" class="danger" @click="$emit('delete', address)"><i class="fa-solid fa-trash-can"></i> Remove</button>
    </div>
  </div>
</template>
