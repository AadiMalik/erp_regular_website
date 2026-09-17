// Scroll-reveal via IntersectionObserver, exposed as the `v-reveal`
// directive. Ports assets/js/core/reveal.js: `data-reveal="up"` in the
// original markup becomes `v-reveal="'up'"` on the same element, and
// `--reveal-delay` staggering is handled by passing an index modifier,
// e.g. `v-reveal="['up', i]"` for `:step="80"`ms increments.

let observer;
function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  return observer;
}

export const vReveal = {
  mounted(el, binding) {
    const value = binding.value;
    const type = Array.isArray(value) ? value[0] : value;
    const index = Array.isArray(value) ? value[1] : undefined;
    const step = Array.isArray(value) ? (value[2] ?? 80) : 80;

    el.setAttribute('data-reveal', type || 'up');
    if (typeof index === 'number') {
      el.style.setProperty('--reveal-delay', `${index * step}ms`);
    }
    getObserver().observe(el);
  },
  unmounted(el) {
    if (observer) observer.unobserve(el);
  },
};
