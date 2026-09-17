<script setup>
// Ports the repeated `.page-header` breadcrumb+title block that opens every
// inner page (account.html, shop.html, about.html, ...). When `sectionType`
// is given, heading/icon/description are pulled from the CMS
// (App\Models\WebsiteSection) and override the static title/slot content -
// the admin can then rename any page's header without a code change. Falls
// back to the static props/slot when the CMS has nothing for that type yet.
import { ref, watchEffect } from 'vue';
import { fetchSection } from '@/services/cms';

const props = defineProps({
  title: { type: String, required: true },
  crumb: { type: String, default: '' }, // defaults to `title` when omitted
  sectionType: { type: String, default: null },
});

const section = ref(null);
watchEffect(async () => {
  section.value = props.sectionType ? await fetchSection(props.sectionType) : null;
});
</script>

<template>
  <div class="page-header">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <RouterLink :to="{ name: 'home' }">Home</RouterLink>
        <span class="sep">/</span>
        <span class="current">{{ crumb || section?.heading || title }}</span>
      </nav>
      <h1><i v-if="section?.heading_icon" :class="section.heading_icon" style="margin-inline-end:0.5em"></i>{{ section?.heading || title }}</h1>
      <p v-if="section?.description">{{ section.description }}</p>
      <slot v-else />
    </div>
  </div>
</template>
