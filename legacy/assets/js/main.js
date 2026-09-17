// Smart Mart — shared bootstrap, loaded on every page before the
// page-specific script (assets/js/pages/*.js).

import { loadPartials } from './core/partials.js';
import { initHeader } from './core/header.js';
import { initReveal } from './core/reveal.js';
import { initProductCardEvents } from './core/product-card.js';
import { initQuickView, initLightbox } from './core/modal.js';
import { initBranch } from './core/branch.js';

initProductCardEvents();
initQuickView();
initLightbox();
initReveal();

loadPartials().then(() => {
  initHeader();
  initBranch();
  document.dispatchEvent(new CustomEvent('app:ready'));
});
