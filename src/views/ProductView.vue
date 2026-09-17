<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchProductBySlug, fetchRelatedProducts } from '@/services/products';
import { useWebsiteSettingsStore } from '@/stores/websiteSettings';
import { useBranchStore } from '@/stores/branch';
import ProductGallery from '@/components/product/ProductGallery.vue';
import ProductInfo from '@/components/product/ProductInfo.vue';
import ProductTabs from '@/components/product/ProductTabs.vue';
import ReviewsPanel from '@/components/product/ReviewsPanel.vue';
import ProductCard from '@/components/ui/ProductCard.vue';

const route = useRoute();
const site = useWebsiteSettingsStore();
const branch = useBranchStore();
const product = ref(null);
const related = ref([]);
const loading = ref(true);
const galleryImage = ref('');

async function loadProduct(slug) {
  loading.value = true;
  const p = await fetchProductBySlug(slug, branch.selectedId);
  product.value = p;
  related.value = p ? await fetchRelatedProducts(p) : [];
  galleryImage.value = p ? p.images[0] : '';
  document.title = p ? `${p.name} — ${site.business.name}` : `Product Not Found — ${site.business.name}`;
  loading.value = false;
}

watch(() => route.params.slug, (slug) => { loadProduct(slug); }, { immediate: true });
// Stock is branch-scoped - refresh the open product's figures immediately
// when the shopper switches branches, not only on next navigation.
watch(() => branch.selectedId, () => { loadProduct(route.params.slug); });
</script>

<template>
  <div v-if="loading" class="section container center" style="padding-block:var(--sp-9)">
    <p class="text-muted">Loading product…</p>
  </div>

  <template v-else-if="product">
    <div class="page-header" style="padding-block:var(--sp-4)">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <RouterLink :to="{ name: 'home' }">Home</RouterLink><span class="sep">/</span>
          <RouterLink :to="{ name: 'shop' }">Shop</RouterLink><span class="sep">/</span>
          <RouterLink :to="{ name: 'shop', query: { category: product.category_id } }">{{ product.subcategory || product.category }}</RouterLink><span class="sep">/</span>
          <span class="current">{{ product.name }}</span>
        </nav>
      </div>
    </div>

    <div class="section" style="padding-top:var(--sp-6)">
      <div class="container">
        <div class="product-detail">
          <ProductGallery :images="product.images" :current-image="galleryImage" :product-name="product.name" />
          <ProductInfo :product="product" :key="product.id" @image-change="galleryImage = $event" />
        </div>

        <ProductTabs :product="product" :key="'tabs-' + product.id">
          <template #reviews>
            <ReviewsPanel :product="product" />
          </template>
        </ProductTabs>

        <div class="section-head related-title">
          <div>
            <span class="eyebrow"><i class="fa-solid fa-layer-group"></i> You Might Also Like</span>
            <h2>Related Products</h2>
          </div>
        </div>
        <div class="product-grid stagger">
          <ProductCard v-for="(p, i) in related" :key="p.id" :product="p" reveal :reveal-index="i" />
        </div>
      </div>
    </div>
  </template>

  <div v-else class="section container center">
    <h1>Product Not Found</h1>
    <p class="text-muted" style="margin:var(--sp-4) 0">The product you're looking for doesn't exist or may have been removed.</p>
    <RouterLink :to="{ name: 'shop' }" class="btn btn-primary">Back to Shop</RouterLink>
  </div>
</template>
