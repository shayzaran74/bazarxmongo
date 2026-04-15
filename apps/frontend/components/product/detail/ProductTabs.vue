<script setup lang="ts">
import type { Product } from '@barterborsa/shared-types'
import ProductDescription from './ProductDescription.vue'
import ProductSpecifications from './ProductSpecifications.vue'
import ProductReviews from './ProductReviews.vue'

interface Props {
  product: Product | null
  activeTab: string
  tabs: { id: string, name: string }[]
  averageRating: number
  canReview: boolean
  canReviewReason: string
  submittingReview: boolean
  reviewDraft: { rating: number, comment: string }
  loadingReviewEligibility: boolean
}

withDefaults(defineProps<Props>(), {
  canReview: false,
  submittingReview: false,
  loadingReviewEligibility: false
})
const emit = defineEmits(['update:activeTab', 'submitReview', 'update:reviewDraftRating', 'update:reviewDraftComment'])
</script>

<template>
  <div
    v-if="product"
    class="space-y-10"
  >
    <!-- Premium Tabs Navigation -->
    <div class="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        :class="[activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
        @click="emit('update:activeTab', tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="relative min-h-[400px]">
      <ProductDescription 
        v-if="activeTab === 'description'"
        :product="product"
      />

      <ProductSpecifications 
        v-if="activeTab === 'specifications'"
        :product="product"
      />

      <ProductReviews 
        v-if="activeTab === 'reviews'"
        :product="product"
        :average-rating="averageRating"
        :can-review="canReview"
        :can-review-reason="canReviewReason"
        :submitting-review="submittingReview"
        :review-draft="reviewDraft"
        :loading-review-eligibility="loadingReviewEligibility"
        @submit-review="emit('submitReview')"
        @update:review-draft-rating="v => emit('update:reviewDraftRating', v)"
        @update:review-draft-comment="v => emit('update:reviewDraftComment', v)"
      />
    </div>
  </div>
</template>
