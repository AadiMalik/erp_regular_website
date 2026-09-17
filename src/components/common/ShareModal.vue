<script setup>
// Global "share this product" modal, opened via composables/useShare.js's
// openShare(productId, fallback). Mirrors QuickViewModal's data pattern
// (findProductById for the rich fields) but degrades gracefully to the
// caller's own fallback fields (order line items don't carry the full
// product - description/rating/variations - only name/image/price).

import { computed, ref, watch } from 'vue';
import { shareState, closeShare } from '@/composables/useShare';
import { findProductById, fetchProductBySlug, recordProductShare } from '@/services/products';
import { formatCurrency } from '@/utils/currency';
import { buildProductShareText, getShareLinks } from '@/utils/share';
import { showToast } from '@/composables/useToast';
import BaseModal from '@/components/ui/BaseModal.vue';
import StarRating from '@/components/ui/StarRating.vue';

// Order line items only carry name/image/price/slug (no description,
// rating or variations) - if a slug is known, fetch the full product so
// the share content is as rich as the product page itself instead of
// staying limited to whatever the caller already had on hand.
const fetchedProduct = ref(null);
const loadingProduct = ref(false);

watch(() => shareState.open, async (open) => {
  fetchedProduct.value = null;
  if (!open) return;
  const inCache = findProductById(shareState.productId);
  if (inCache?.description !== undefined && inCache?.description !== null) {
    fetchedProduct.value = inCache;
    return;
  }
  const slug = inCache?.slug || shareState.fallback?.slug;
  if (!slug) return;
  loadingProduct.value = true;
  const fresh = await fetchProductBySlug(slug);
  loadingProduct.value = false;
  if (shareState.open) fetchedProduct.value = fresh || inCache || null;
}, { immediate: true });

const cached = computed(() => fetchedProduct.value);
const product = computed(() => cached.value || shareState.fallback);

const image = computed(() => cached.value?.images?.[0] || product.value?.image || '');
const price = computed(() => product.value?.price ?? null);
const oldPrice = computed(() => cached.value?.oldPrice || null);

const variations = computed(() => {
  const opts = cached.value?.variations?.options;
  if (!Array.isArray(opts)) return [];
  return opts.map((o) => ({ label: o.label, priceText: formatCurrency(o.price) }));
});

const shareUrl = computed(() => {
  const origin = window.location.origin;
  const slug = cached.value?.slug || shareState.fallback?.slug;
  return slug ? `${origin}/product/${slug}` : origin;
});

const shareText = computed(() => buildProductShareText({
  name: product.value?.name,
  priceText: price.value != null ? formatCurrency(price.value) : '',
  oldPriceText: oldPrice.value ? formatCurrency(oldPrice.value) : '',
  rating: cached.value?.rating,
  reviewCount: cached.value?.reviewCount,
  description: cached.value?.description,
  variations: variations.value,
  url: shareUrl.value,
}));

const links = computed(() => getShareLinks({
  url: shareUrl.value,
  text: shareText.value,
  title: product.value?.name,
  image: image.value,
}));

const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

function openLink(href, platform) {
  window.open(href, '_blank', 'noopener,noreferrer,width=600,height=650');
  recordProductShare(shareState.productId, platform);
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    showToast('Link copied to clipboard', 'success');
    recordProductShare(shareState.productId, 'copy_link');
  } catch {
    showToast('Could not copy link', 'error');
  }
}

async function nativeShare() {
  try {
    await navigator.share({ title: product.value?.name, text: shareText.value, url: shareUrl.value });
    recordProductShare(shareState.productId, 'native');
  } catch {
    // user cancelled the native share sheet - nothing to do
  }
}
</script>

<template>
  <BaseModal :open="shareState.open" box-class="modal-box--share" @close="closeShare">
    <div v-if="product" class="share-modal">
      <h3 class="share-modal__title"><i class="fa-solid fa-share-nodes"></i> Share this product</h3>

      <div class="share-preview">
        <img :src="image" :alt="product.name">
        <div class="share-preview__info">
          <h4>{{ product.name }}</h4>
          <div v-if="cached?.rating" class="rating">
            <StarRating :rating="cached.rating" />
            <span class="count">({{ cached.reviewCount || 0 }})</span>
          </div>
          <div v-if="price != null" class="share-preview__price">
            <span class="now">{{ formatCurrency(price) }}</span>
            <span v-if="oldPrice" class="old">{{ formatCurrency(oldPrice) }}</span>
          </div>
          <p v-if="cached?.description" class="share-preview__desc">{{ cached.description }}</p>
          <div v-if="variations.length" class="share-preview__variations">
            <span v-for="v in variations" :key="v.label" class="chip">{{ v.label }}: {{ v.priceText }}</span>
          </div>
          <p v-if="loadingProduct" class="share-preview__loading"><i class="fa-solid fa-spinner spin"></i> Loading full details…</p>
        </div>
      </div>

      <div class="share-platforms">
        <button type="button" class="share-platform share-platform--whatsapp" @click="openLink(links.whatsapp, 'whatsapp')">
          <i class="fa-brands fa-whatsapp"></i><span>WhatsApp</span>
        </button>
        <button type="button" class="share-platform share-platform--facebook" @click="openLink(links.facebook, 'facebook')">
          <i class="fa-brands fa-facebook-f"></i><span>Facebook</span>
        </button>
        <button type="button" class="share-platform share-platform--linkedin" @click="openLink(links.linkedin, 'linkedin')">
          <i class="fa-brands fa-linkedin-in"></i><span>LinkedIn</span>
        </button>
        <button type="button" class="share-platform share-platform--twitter" @click="openLink(links.twitter, 'twitter')">
          <i class="fa-brands fa-x-twitter"></i><span>X</span>
        </button>
        <button type="button" class="share-platform share-platform--telegram" @click="openLink(links.telegram, 'telegram')">
          <i class="fa-brands fa-telegram"></i><span>Telegram</span>
        </button>
        <button v-if="links.pinterest" type="button" class="share-platform share-platform--pinterest" @click="openLink(links.pinterest, 'pinterest')">
          <i class="fa-brands fa-pinterest-p"></i><span>Pinterest</span>
        </button>
        <a class="share-platform share-platform--email" :href="links.email" @click="recordProductShare(shareState.productId, 'email')">
          <i class="fa-solid fa-envelope"></i><span>Email</span>
        </a>
        <button v-if="canNativeShare" type="button" class="share-platform share-platform--more" @click="nativeShare">
          <i class="fa-solid fa-ellipsis"></i><span>More</span>
        </button>
      </div>

      <div class="share-link-row">
        <input type="text" readonly :value="shareUrl" @click="$event.target.select()">
        <button type="button" class="btn btn-primary btn-sm" @click="copyLink"><i class="fa-solid fa-link"></i> Copy Link</button>
      </div>
    </div>
  </BaseModal>
</template>
