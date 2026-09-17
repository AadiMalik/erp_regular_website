import { onMounted, onUnmounted } from 'vue';

export function useClickOutside(elRef, callback) {
  function handler(e) {
    const el = elRef.value;
    if (el && !el.contains(e.target)) callback(e);
  }
  onMounted(() => document.addEventListener('click', handler));
  onUnmounted(() => document.removeEventListener('click', handler));
}
