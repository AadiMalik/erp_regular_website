// Smart Mart — thin Swiper wrapper so pages don't repeat config boilerplate.
// Swiper is loaded globally via CDN <script> in each page (see index.html).

export function initCarousel(el, overrides = {}) {
  if (!el || typeof Swiper === 'undefined') return null;
  const wrapper = el.closest('.container') || el.closest('.carousel-block') || el.parentElement;
  return new Swiper(el, {
    slidesPerView: 1.15,
    spaceBetween: 16,
    speed: 500,
    grabCursor: true,
    navigation: {
      nextEl: wrapper?.querySelector('.carousel-next'),
      prevEl: wrapper?.querySelector('.carousel-prev'),
    },
    breakpoints: {
      560: { slidesPerView: 2, spaceBetween: 18 },
      860: { slidesPerView: 3, spaceBetween: 20 },
      1180: { slidesPerView: 4, spaceBetween: 22 },
    },
    ...overrides,
  });
}

export function initTestimonialCarousel(el) {
  if (!el || typeof Swiper === 'undefined') return null;
  return new Swiper(el, {
    slidesPerView: 1,
    spaceBetween: 24,
    speed: 500,
    grabCursor: true,
    pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
    breakpoints: {
      760: { slidesPerView: 2 },
      1080: { slidesPerView: 3 },
    },
  });
}
