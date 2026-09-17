// Toast notifications. Ports assets/js/core/toast.js onto a small shared
// reactive queue instead of manual DOM node creation — ToastStack.vue
// renders `toasts` and any component calls `showToast(...)` to push one.

import { reactive } from 'vue';

const ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-exclamation',
  info: 'fa-circle-info',
};

let uid = 0;
export const toasts = reactive([]);

export function showToast(message, type = 'success', duration = 3200) {
  const id = (uid += 1);
  toasts.push({ id, message, type, icon: ICONS[type] || ICONS.info });
  setTimeout(() => removeToast(id), duration);
}

export function removeToast(id) {
  const idx = toasts.findIndex((t) => t.id === id);
  if (idx > -1) toasts.splice(idx, 1);
}
