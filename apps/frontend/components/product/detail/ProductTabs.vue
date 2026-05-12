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
    <!-- Trendyol tarzı tab navigasyonu -->
    <div class="flex items-stretch border-b-2 border-slate-100 gap-0">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="relative px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap -mb-[2px]"
        :class="[
          activeTab === tab.id
            ? 'text-orange-500 border-b-2 border-orange-500'
            : 'text-slate-400 hover:text-slate-700 border-b-2 border-transparent'
        ]"
        @click="emit('update:activeTab', tab.id)"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="relative min-h-[400px] pt-2">
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
