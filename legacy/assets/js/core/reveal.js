// Smart Mart — scroll reveal via IntersectionObserver.
// Pairs with the `[data-reveal]` CSS in animations.css. Call `observe()`
// after injecting any new markup (product grids, modals, etc.) so it also
// gets animated in.

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

export function observe(root = document) {
  const obs = getObserver();
  root.querySelectorAll('[data-reveal]:not(.in-view)').forEach((el) => obs.observe(el));
}

// Sets an incrementing --reveal-delay on children carrying [data-reveal]
// inside any [data-stagger] container, then observes them.
export function staggerReveal(container, stepMs = 80) {
  if (!container) return;
  const items = container.querySelectorAll(':scope > [data-reveal]');
  items.forEach((el, i) => el.style.setProperty('--reveal-delay', `${i * stepMs}ms`));
  observe(container);
}

export function initReveal() {
  observe(document);
}
