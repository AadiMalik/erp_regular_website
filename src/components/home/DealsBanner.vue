<script setup>
// Falls back to this static deal copy when the ERP admin hasn't configured
// the "promo_banner" CMS section yet (Website CMS > Homepage Sections). The
// countdown only renders when the admin sets a real countdown_end_at deadline
// on that section - no more faking "2 days 14 hours from now" on every load.
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { fetchSection, resolveSectionLink } from '@/services/cms';

const section = ref(null);
const remaining = reactive({ days: '00', hours: '00', mins: '00', secs: '00' });
let timer = null;

function tick(targetDate) {
  const diff = Math.max(0, targetDate.getTime() - Date.now());
  const s = Math.floor(diff / 1000);
  remaining.days = String(Math.floor(s / 86400)).padStart(2, '0');
  remaining.hours = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
  remaining.mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  remaining.secs = String(s % 60).padStart(2, '0');
}

onMounted(async () => {
  section.value = await fetchSection('promo_banner');
  if (section.value?.countdown_end_at) {
    const target = new Date(section.value.countdown_end_at);
    tick(target);
    timer = setInterval(() => tick(target), 1000);
  }
});
onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div class="deals-banner" v-reveal="'zoom'">
    <div class="deals-banner__bg">
      <img :src="section?.image || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1400&q=70'" alt="">
    </div>
    <div class="deals-banner__content">
      <span class="eyebrow" v-if="section?.tagline">{{ section.tagline }}</span>
      <h2>{{ section?.heading || 'Weekend Grocery Deals — Up to 40% Off' }}</h2>
      <p>{{ section?.description || 'Stock up on fresh produce, pantry staples and household essentials before the deal ends. New discounts every day.' }}</p>
      <div class="countdown" v-if="section?.countdown_end_at">
        <div><strong>{{ remaining.days }}</strong><span>Days</span></div>
        <div><strong>{{ remaining.hours }}</strong><span>Hours</span></div>
        <div><strong>{{ remaining.mins }}</strong><span>Mins</span></div>
        <div><strong>{{ remaining.secs }}</strong><span>Secs</span></div>
      </div>
      <RouterLink :to="section ? resolveSectionLink(section) : { name: 'shop', query: { filter: 'deal' } }" class="btn btn-primary">{{ section?.button_text || 'Shop Fresh Deals' }} <i class="fa-solid fa-arrow-right"></i></RouterLink>
    </div>
  </div>
</template>
