// Smart Mart — Full category browse page.

import { qs, escapeHtml } from '../core/utils.js';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS } from '../data/products.js';
import { staggerReveal } from '../core/reveal.js';

function productCount(categoryId) {
  return PRODUCTS.filter((p) => p.category === categoryId).length;
}

function render() {
  const grid = qs('[data-categories-grid]');
  grid.innerHTML = CATEGORIES.map((c) => `
    <a class="category-full-card" href="shop.html?category=${c.id}" data-reveal="up">
      <div class="category-full-card__img"><img src="${c.image}" alt="${escapeHtml(c.name)}"></div>
      <div class="category-full-card__body">
        <h3><i class="fa-solid ${c.icon}"></i> ${escapeHtml(c.name)}</h3>
        <p>${productCount(c.id)} products &middot; ${c.subcategories.slice(0, 3).join(', ')}</p>
      </div>
    </a>`).join('');
  staggerReveal(grid, 50);
}

render();
