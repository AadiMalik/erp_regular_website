// Smart Mart — toast notifications. Expects a `#toast-stack` container
// (present in every page's markup) to append into.

const ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-exclamation',
  info: 'fa-circle-info',
};

export function showToast(message, type = 'success', duration = 3200) {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;

  const toast = document.createElement('div');
  toast.className = `toast${type === 'error' ? ' toast-error' : ''}`;
  toast.innerHTML = `<i class="fa-solid ${ICONS[type] || ICONS.info}"></i><span>${message}</span>`;
  stack.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}
