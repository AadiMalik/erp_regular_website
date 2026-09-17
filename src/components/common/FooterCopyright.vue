<script setup>
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';

const props = defineProps({
  tagline: { type: String, default: '' },
  taglineSeparator: { type: String, default: ' — ' },
  showAllRights: { type: Boolean, default: false },
  prefix: { type: String, default: '© ' },
  showYear: { type: Boolean, default: true },
});

const site = useWebsiteSettingsStore();
const year = new Date().getFullYear();

function displayName(name) {
  const normalized = (name || '').trim();
  if (normalized === 'Smart' || normalized === 'Smart Mart') {
    return 'Dukanaz';
  }
  return normalized || 'Dukanaz';
}

const businessName = displayName(site.business.name);
</script>

<template>
  <span>
    <template v-if="prefix">{{ prefix }}</template><template v-if="showYear">{{ year }} </template>{{ businessName }}<template v-if="tagline">{{ taglineSeparator }}{{ tagline }}</template><template v-if="showAllRights">. All rights reserved.</template>
  </span>
</template>
