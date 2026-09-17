// Smart Mart — Wishlist page: saved products via the shared product-card component.

import { qs } from '../core/utils.js';
import { getWishlist } from '../core/store.js';
import { PRODUCTS } from '../data/products.js';
import { productCardHTML } from '../core/product-card.js';
import { staggerReveal } from '../core/reveal.js';

function render() {
  const ids = getWishlist();
  const items = PRODUCTS.filter((p) => ids.includes(p.id));
  const grid = qs('[data-wishlist-grid]');
  qs('[data-wishlist-empty]').hidden = items.length !== 0;
  grid.hidden = items.length === 0;
  grid.innerHTML = items.map((p) => productCardHTML(p, { reveal: true })).join('');
  staggerReveal(grid, 60);
}

render();
window.addEventListener('wishlist:change', render);
