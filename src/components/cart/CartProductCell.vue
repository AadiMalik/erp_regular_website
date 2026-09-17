<script setup>
import { computed } from 'vue';

const props = defineProps({
  item: { type: Object, required: true },
  saveLabel: { type: String, default: 'Save for later' },
  compact: { type: Boolean, default: false },
});
defineEmits(['remove', 'save-for-later']);

const variationValue = computed(() => {
  const value = props.item?.variation;
  if (!value) return '';
  const label = props.item.variationLabel
    || props.item.product?.variations?.label
    || null;
  return label ? `${label}: ${value}` : String(value);
});

const unitValue = computed(() => props.item?.unit || props.item?.product?.unit || '');

const metaParts = computed(() => {
  const parts = [];
  if (variationValue.value) parts.push(variationValue.value);
  if (unitValue.value) parts.push(unitValue.value);
  return parts;
});

const imageSrc = computed(() => props.item?.product?.images?.[0] || '');
</script>

<template>
  <div class="cart-product" :class="{ 'cart-product--compact': compact }">
    <img :src="imageSrc" :alt="item.product?.name || ''">
    <div class="cart-product__body">
      <RouterLink
        class="cart-product__name"
        :to="{ name: 'product', params: { slug: item.product.slug } }"
      >
        {{ item.product.name }}
      </RouterLink>

      <p v-if="metaParts.length" class="cart-product__meta">
        <span
          v-for="(part, index) in metaParts"
          :key="`${part}-${index}`"
          class="cart-product__meta-part"
        >
          <template v-if="index"> <span class="cart-product__meta-sep" aria-hidden="true">–</span> </template>{{ part }}
        </span>
      </p>

      <p v-if="item.inStock === false" class="cart-product__stock-warning">
        <i class="fa-solid fa-triangle-exclamation"></i> Out of stock — remove it or check back later.
      </p>

      <div class="cart-product__actions">
        <button type="button" @click="$emit('save-for-later')">
          <i class="fa-regular fa-heart"></i> {{ saveLabel }}
        </button>
        <button type="button" @click="$emit('remove')">
          <i class="fa-solid fa-trash-can"></i> Remove
        </button>
      </div>
    </div>
  </div>
</template>
