// Smart Mart — injects the shared header/footer partials into every page.
// Static `fetch()` of an .html fragment today; swap for a real component
// (React/Vue/etc.) later without touching any page markup.

async function inject(targetSelector, url) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  const res = await fetch(url);
  target.innerHTML = await res.text();
}

export async function loadPartials() {
  await Promise.all([
    inject('#site-header', 'partials/header.html'),
    inject('#site-footer', 'partials/footer.html'),
  ]);
  document.dispatchEvent(new CustomEvent('partials:ready'));
}
