<script setup>
// Ports assets/js/pages/help-center.js.

import { ref, reactive, computed, watch, onMounted } from 'vue';
import { fetchFaqCategories } from '@/services/faqs';
import { showToast } from '@/composables/useToast';
import PageHeader from '@/components/ui/PageHeader.vue';

const categories = ref([]);
const activeCategory = ref('all');
const query = ref('');
const openKeys = reactive(new Set());

const chips = computed(() => [{ id: 'all', label: 'All Topics', icon: 'fa-list' }, ...categories.value]);

const items = computed(() => {
  const q = query.value.trim().toLowerCase();
  const cats = activeCategory.value === 'all' ? categories.value : categories.value.filter((c) => c.id === activeCategory.value);
  return cats.flatMap((c) => c.items
    .filter((item) => !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q))
    .map((item) => ({ ...item, category: c.label })));
});

watch(items, (list) => {
  openKeys.clear();
  if (list.length) openKeys.add(list[0].q);
}, { immediate: true });

function toggle(item) {
  if (openKeys.has(item.q)) openKeys.delete(item.q);
  else openKeys.add(item.q);
}

function selectCategory(id) {
  activeCategory.value = id;
}

function startLiveChat() {
  showToast('Live chat is a demo feature — please use Contact Us or email for now.', 'info');
}

onMounted(async () => {
  categories.value = await fetchFaqCategories();
});
</script>

<template>
  <PageHeader title="Help Center" crumb="Help Center" />

  <div class="section">
    <div class="container">
      <div class="faq-hero" v-reveal="'up'">
        <span class="eyebrow"><i class="fa-solid fa-circle-question"></i> How can we help?</span>
        <h2>Frequently Asked Questions</h2>
        <p class="text-muted">Search our knowledge base or browse by topic below.</p>
        <div role="search" style="background:var(--color-bg-alt);border-radius:var(--radius-pill);padding:6px 6px 6px 20px;display:flex;align-items:center;gap:10px;max-width:560px;margin:var(--sp-5) auto 0">
          <i class="fa-solid fa-magnifying-glass" style="color:var(--color-text-muted)"></i>
          <input
            v-model="query" type="search" placeholder="Search for a topic, e.g. 'refund'" aria-label="Search FAQs"
            style="flex:1;background:transparent;padding:0.65rem 0;border:none;outline:none" autocomplete="off" spellcheck="false"
          >
        </div>
        <div class="help-cats">
          <button
            v-for="c in chips" :key="c.id" type="button"
            class="filter-tabs-chip" :class="{ active: c.id === activeCategory }"
            style="padding:0.55rem 1.1rem;border-radius:var(--radius-pill);font-size:var(--fs-sm);font-weight:600;border:1.5px solid var(--color-border-strong);color:var(--color-text-soft);transition:all var(--dur-fast)"
            :style="c.id === activeCategory ? 'background:var(--color-primary);border-color:var(--color-primary);color:#fff' : ''"
            @click="selectCategory(c.id)"
          >
            <i class="fa-solid" :class="c.icon"></i> {{ c.label }}
          </button>
        </div>
      </div>

      <div style="max-width:780px;margin:var(--sp-8) auto 0" v-reveal="'up'">
        <div v-if="items.length">
          <div v-for="item in items" :key="item.q" class="accordion__item" :class="{ open: openKeys.has(item.q) }">
            <button type="button" class="accordion__head" @click="toggle(item)">
              <span>{{ item.q }}</span>
              <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion__body" :style="{ maxHeight: openKeys.has(item.q) ? '600px' : '' }">
              <div class="accordion__body-inner"><p class="text-muted">{{ item.a }}</p></div>
            </div>
          </div>
        </div>
        <div v-else class="no-results">
          <i class="fa-solid fa-magnifying-glass"></i>
          <h2>No results found</h2>
          <p class="text-muted">Try a different search term, or contact our support team below.</p>
        </div>
      </div>

      <div class="support-grid">
        <div class="support-card" v-reveal="'up'">
          <i class="fa-solid fa-comments"></i>
          <h3>Live Chat</h3>
          <p>Chat with our support team in real time, available during business hours.</p>
          <button type="button" class="btn btn-outline btn-sm" @click="startLiveChat">Start Chat</button>
        </div>
        <div class="support-card" v-reveal="'up'">
          <i class="fa-solid fa-envelope"></i>
          <h3>Email Support</h3>
          <p>Send us the details and we'll get back to you within one business day.</p>
          <RouterLink :to="{ name: 'contact' }" class="btn btn-outline btn-sm">Contact Us</RouterLink>
        </div>
        <div class="support-card" v-reveal="'up'">
          <i class="fa-solid fa-truck-fast"></i>
          <h3>Track an Order</h3>
          <p>Check the live status of an existing order with your order number.</p>
          <RouterLink :to="{ name: 'track-order' }" class="btn btn-outline btn-sm">Track Order</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
