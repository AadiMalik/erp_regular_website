// Smart Mart — Help Center / FAQ page.

import { qs, qsa, debounce, escapeHtml } from '../core/utils.js';
import { FAQ_CATEGORIES } from '../data/faqs.js';
import { showToast } from '../core/toast.js';

let activeCategory = 'all';
let query = '';

function renderCategoryChips() {
  const container = qs('[data-faq-cats]');
  const chips = [{ id: 'all', label: 'All Topics', icon: 'fa-list' }, ...FAQ_CATEGORIES];
  container.innerHTML = chips.map((c) => `
    <button type="button" class="filter-tabs-chip${c.id === activeCategory ? ' active' : ''}" data-faq-cat="${c.id}" style="padding:0.55rem 1.1rem;border-radius:var(--radius-pill);font-size:var(--fs-sm);font-weight:600;border:1.5px solid var(--color-border-strong);color:var(--color-text-soft);transition:all var(--dur-fast)${c.id === activeCategory ? ';background:var(--color-primary);border-color:var(--color-primary);color:#fff' : ''}">
      <i class="fa-solid ${c.icon}"></i> ${c.label}
    </button>`).join('');

  qsa('[data-faq-cat]', container).forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.faqCat;
      renderCategoryChips();
      renderList();
    });
  });
}

function matchingItems() {
  const q = query.trim().toLowerCase();
  const cats = activeCategory === 'all' ? FAQ_CATEGORIES : FAQ_CATEGORIES.filter((c) => c.id === activeCategory);
  return cats.flatMap((c) => c.items
    .filter((item) => !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
    .map((item) => ({ ...item, category: c.label })));
}

function renderList() {
  const items = matchingItems();
  const list = qs('[data-faq-list]');
  qs('[data-faq-empty]').hidden = items.length > 0;
  list.innerHTML = items.map((item, i) => `
    <div class="accordion__item${i === 0 ? ' open' : ''}" data-faq-item>
      <button type="button" class="accordion__head" data-faq-toggle>
        <span>${escapeHtml(item.q)}</span>
        <i class="fa-solid fa-chevron-down"></i>
      </button>
      <div class="accordion__body" style="${i === 0 ? 'max-height:300px' : ''}">
        <div class="accordion__body-inner"><p class="text-muted">${escapeHtml(item.a)}</p></div>
      </div>
    </div>`).join('');

  qsa('[data-faq-toggle]', list).forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-faq-item]');
      const body = item.querySelector('.accordion__body');
      const isOpen = item.classList.toggle('open');
      body.style.maxHeight = isOpen ? `${body.scrollHeight}px` : '';
    });
  });
}

function wireSearch() {
  const input = qs('[data-faq-search]');
  input.addEventListener('input', debounce(() => {
    query = input.value;
    renderList();
  }, 200));
}

function wireLiveChat() {
  qs('[data-live-chat]')?.addEventListener('click', () => {
    showToast('Live chat is a demo feature — please use Contact Us or email for now.', 'info');
  });
}

renderCategoryChips();
renderList();
wireSearch();
wireLiveChat();
