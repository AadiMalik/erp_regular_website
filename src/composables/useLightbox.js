import { reactive } from 'vue';

export const lightboxState = reactive({ open: false, src: '', alt: '' });

export function openLightbox(src, alt = '') {
  lightboxState.src = src;
  lightboxState.alt = alt;
  lightboxState.open = true;
}
export function closeLightbox() {
  lightboxState.open = false;
}
