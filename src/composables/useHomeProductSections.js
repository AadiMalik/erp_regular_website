import { ref } from 'vue';
import { fetchHomeSections } from '@/services/products';
import { fetchSection, fetchWhyShopBenefits } from '@/services/cms';

const CONFIG_TYPES = ['featured_products', 'discounted_products', 'trending_products', 'new_arrivals', 'best_sellers', 'why_shop_with_us', 'categories', 'testimonials'];

// Calls fetchHomeSections() once and exposes the 5 homepage product rails
// as reactive refs, replacing the old per-theme client-side
// filter()/slice() derivation over a raw PRODUCTS array - the ERP now
// decides what's featured/trending/discounted/new/best-selling (with
// fallback fillers for Featured/Trending/New Arrivals/Best Sellers, and
// no fillers for Discounted — empty discounted means hide the section).
// Also fetches each section's CMS heading/description/icon (config), in
// parallel, so themes can render admin-editable headings instead of
// hard-coded ones - falls back to {} per type when the admin hasn't set one.
// The Why Shop With Us benefit items are fetched alongside as `benefits` -
// themes hide the whole section (heading + grid) when it's empty. Product
// rails should likewise use v-if="*.length" so empty sections (especially
// Discounted Products) never leave a heading or blank spacing.
export function useHomeProductSections() {
  const featured = ref([]);
  const discounted = ref([]);
  const trending = ref([]);
  const newArrivals = ref([]);
  const bestsellers = ref([]);
  const config = ref({});
  const benefits = ref([]);
  const loading = ref(true);

  (async () => {
    const [sections, configEntries, benefitItems] = await Promise.all([
      fetchHomeSections(),
      Promise.all(CONFIG_TYPES.map(async (type) => [type, (await fetchSection(type)) || {}])),
      fetchWhyShopBenefits(),
    ]);
    featured.value = sections.featured_products;
    discounted.value = sections.discounted_products;
    trending.value = sections.trending_products;
    newArrivals.value = sections.new_arrivals;
    bestsellers.value = sections.best_sellers;
    config.value = Object.fromEntries(configEntries);
    benefits.value = benefitItems;
    loading.value = false;
  })();

  return { featured, discounted, trending, newArrivals, bestsellers, config, benefits, loading };
}
