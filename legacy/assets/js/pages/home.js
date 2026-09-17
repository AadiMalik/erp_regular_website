// Smart Mart — Home page.

import { qs, escapeHtml } from '../core/utils.js';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCTS } from '../data/products.js';
import { TESTIMONIALS } from '../data/reviews.js';
import { productCardHTML } from '../core/product-card.js';
import { staggerReveal, observe } from '../core/reveal.js';
import { initCarousel, initTestimonialCarousel } from '../core/carousel.js';
import { showToast } from '../core/toast.js';

function renderCategories() {
  const grid = qs('[data-category-grid]');
  grid.innerHTML = CATEGORIES.map((c) => `
    <a class="category-card" data-reveal="up" href="shop.html?category=${c.id}">
      <img src="${c.image}" alt="${c.name}" loading="lazy">
      <span class="category-card__arrow"><i class="fa-solid fa-up-right-from-square"></i></span>
      <div class="category-card__body">
        <span class="category-card__icon"><i class="fa-solid ${c.icon}"></i></span>
        <h3>${c.name}</h3>
        <span>${c.subcategories.length} subcategories</span>
      </div>
    </a>
  `).join('');
  staggerReveal(grid, 60);
}

function productsForFeatured() {
  const byCategory = new Map();
  PRODUCTS.forEach((p) => { if (!byCategory.has(p.category)) byCategory.set(p.category, p); });
  return Array.from(byCategory.values()).slice(0, 8);
}

function renderGrid(selector, products) {
  const grid = qs(selector);
  if (!grid) return;
  grid.innerHTML = products.map((p) => productCardHTML(p, { reveal: true })).join('');
  staggerReveal(grid, 60);
}

function renderCarousel(selector, wrapperGetter, products, testimonial = false) {
  const swiperEl = qs(selector);
  if (!swiperEl) return;
  const wrapper = swiperEl.querySelector('.swiper-wrapper');
  wrapper.innerHTML = products.map((p) => `<div class="swiper-slide">${productCardHTML(p)}</div>`).join('');
  observe(wrapper);
  initCarousel(swiperEl);
}

function renderTestimonials() {
  const swiperEl = qs('[data-testimonial-carousel]');
  const wrapper = qs('[data-testimonial-wrapper]');
  wrapper.innerHTML = TESTIMONIALS.map((t) => `
    <div class="swiper-slide">
      <div class="testimonial-card">
        <div class="rating"><span class="stars"><span class="stars-fill" style="width:${(t.rating / 5) * 100}%"></span></span></div>
        <p class="quote">"${escapeHtml(t.quote)}"</p>
        <div class="testimonial-card__author">
          <img src="${t.avatar}" alt="${t.name}">
          <div><strong>${t.name}</strong><span>${t.role}</span></div>
        </div>
      </div>
    </div>
  `).join('');
  initTestimonialCarousel(swiperEl);
}

function initCountdown() {
  const target = Date.now() + (2 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000);
  const els = {
    d: qs('[data-cd-d]'), h: qs('[data-cd-h]'), m: qs('[data-cd-m]'), s: qs('[data-cd-s]'),
  };
  if (!els.d) return;
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    els.d.textContent = pad(d); els.h.textContent = pad(h); els.m.textContent = pad(m); els.s.textContent = pad(s);
  };
  tick();
  setInterval(tick, 1000);
}

function initNewsletter() {
  const form = qs('[data-newsletter-form]');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('You\'re subscribed! Watch your inbox for fresh deals.', 'success');
    form.reset();
  });
}

renderCategories();
renderGrid('[data-featured-grid]', productsForFeatured());
renderCarousel('[data-trending-carousel]', null, PRODUCTS.filter((p) => p.badges.includes('trending')));
renderGrid('[data-discounted-grid]', PRODUCTS.filter((p) => p.oldPrice).slice(0, 8));
renderCarousel('[data-newarrivals-carousel]', null, PRODUCTS.filter((p) => p.badges.includes('new')));
renderGrid('[data-bestsellers-grid]', PRODUCTS.filter((p) => p.badges.includes('bestseller')).slice(0, 8));
renderTestimonials();
initCountdown();
initNewsletter();
