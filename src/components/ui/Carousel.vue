<script setup>
// Thin Swiper wrapper — ports assets/js/core/carousel.js's two configs
// (product row vs. testimonial). Navigation buttons live in the parent
// section markup (matching the original section-head layout) and drive
// this component via a template ref exposing prev()/next().

import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { Swiper } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const props = defineProps({
  items: { type: Array, required: true },
  itemKey: { type: [String, Function], default: 'id' },
  variant: { type: String, default: 'product' }, // 'product' | 'testimonial'
});

const rootEl = ref(null);
let instance = null;

function keyFor(item, i) {
  return typeof props.itemKey === 'function' ? props.itemKey(item) : (item[props.itemKey] ?? i);
}

const CONFIGS = {
  product: {
    slidesPerView: 1.15,
    spaceBetween: 16,
    breakpoints: {
      560: { slidesPerView: 2, spaceBetween: 18 },
      860: { slidesPerView: 3, spaceBetween: 20 },
      1180: { slidesPerView: 4, spaceBetween: 22 },
    },
  },
  testimonial: {
    slidesPerView: 1,
    spaceBetween: 24,
    breakpoints: {
      760: { slidesPerView: 2 },
      1080: { slidesPerView: 3 },
    },
  },
};

function build() {
  instance?.destroy(true, true);
  const cfg = CONFIGS[props.variant] || CONFIGS.product;
  instance = new Swiper(rootEl.value, {
    modules: [Navigation, Pagination],
    speed: 500,
    grabCursor: true,
    pagination: props.variant === 'testimonial'
      ? { el: rootEl.value.querySelector('.swiper-pagination'), clickable: true }
      : false,
    ...cfg,
  });
}

onMounted(async () => {
  await nextTick();
  build();
});
onBeforeUnmount(() => instance?.destroy(true, true));

watch(() => props.items, async () => {
  await nextTick();
  build();
});

defineExpose({
  prev: () => instance?.slidePrev(),
  next: () => instance?.slideNext(),
});
</script>

<template>
  <div class="carousel-block">
    <div ref="rootEl" class="swiper" :class="{ 'product-swiper': variant === 'product' }">
      <div class="swiper-wrapper">
        <div v-for="(item, i) in items" :key="keyFor(item, i)" class="swiper-slide">
          <slot :item="item" />
        </div>
      </div>
      <div v-if="variant === 'testimonial'" class="swiper-pagination"></div>
    </div>
  </div>
</template>
