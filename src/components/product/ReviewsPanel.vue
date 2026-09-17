<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchProductReviews, submitReview } from '@/services/reviews';
import { useAuthStore } from '@/stores/auth';
import { showToast } from '@/composables/useToast';
import StarRating from '@/components/ui/StarRating.vue';

const props = defineProps({
  product: { type: Object, required: true },
});

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const average = ref(0);
const count = ref(0);
const reviews = ref([]);

const breakdown = computed(() => {
  const counts = [0, 0, 0, 0, 0];
  reviews.value.forEach((r) => { counts[r.rating - 1] += 1; });
  const total = reviews.value.length;
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    pct: total ? Math.round((counts[star - 1] / total) * 100) : 0,
  }));
});

async function loadReviews() {
  loading.value = true;
  const summary = await fetchProductReviews(props.product.id);
  average.value = summary.average;
  count.value = summary.count;
  reviews.value = summary.reviews;
  loading.value = false;
}

onMounted(loadReviews);

function goToLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } });
}

const pickedStars = ref(5);
const comment = ref('');
const submitting = ref(false);

async function handleSubmit() {
  const text = comment.value.trim();
  if (!text) return;

  submitting.value = true;
  const result = await submitReview({ product_id: props.product.id, rating: pickedStars.value, comment: text });
  submitting.value = false;

  if (!result.success) {
    showToast(result.message || 'Failed to submit your review.', 'error');
    return;
  }

  comment.value = '';
  pickedStars.value = 5;
  showToast('Thanks! Your review has been posted.', 'success');
  loadReviews();
}
</script>

<template>
  <div v-if="!loading && count > 0" class="reviews-summary">
    <div class="reviews-summary__score">
      <strong>{{ average.toFixed(1) }}</strong>
      <StarRating :rating="average" />
      <p class="text-muted" style="font-size:var(--fs-xs);margin-top:4px">{{ count }} review{{ count === 1 ? '' : 's' }}</p>
    </div>
    <div class="rating-bars">
      <div v-for="b in breakdown" :key="b.star" class="row">
        <span>{{ b.star }}★</span>
        <div class="bar"><span :style="{ width: b.pct + '%' }"></span></div>
        <span>{{ b.pct }}%</span>
      </div>
    </div>
  </div>

  <p v-else-if="!loading" class="text-muted" style="padding:var(--sp-4) 0">No reviews yet — be the first to review this product.</p>

  <div v-if="!loading && count > 0">
    <div v-for="r in reviews" :key="r.id" class="review-item">
      <div class="review-item__head">
        <div>
          <strong>{{ r.reviewer_name }}</strong>
          <span>{{ new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
        </div>
        <div class="rating" style="margin-left:auto"><StarRating :rating="r.rating" /></div>
      </div>
      <p>{{ r.comment }}</p>
    </div>
  </div>

  <div style="margin-top:var(--sp-7);padding-top:var(--sp-6);border-top:1px solid var(--color-border)">
    <h3 style="font-size:var(--fs-md);margin-bottom:var(--sp-4)">Write a Review</h3>

    <div v-if="!auth.isLoggedIn" class="alert-banner info">
      <i class="fa-solid fa-circle-info"></i>
      <span>Please <button type="button" style="font-weight:700;text-decoration:underline" @click="goToLogin">log in</button> to write a review.</span>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="field">
        <label>Your Rating</label>
        <div class="swatch-group">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            class="swatch"
            :class="{ active: n <= pickedStars }"
            @click="pickedStars = n"
          >{{ n }}★</button>
        </div>
      </div>
      <div class="field">
        <label for="reviewComment">Your Review</label>
        <textarea id="reviewComment" v-model="comment" rows="3" required placeholder="Share your thoughts about this product…"></textarea>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Submitting…' : 'Submit Review' }}
      </button>
    </form>
  </div>
</template>
