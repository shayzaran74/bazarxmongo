<script setup lang="ts">
import { StarIcon as StarSolidIcon } from '@heroicons/vue/24/solid'
import type { Product, Review } from '@barterborsa/shared-types'
import ProductReviewForm from './ProductReviewForm.vue'
import ProductReviewItem from './ProductReviewItem.vue'

interface Props {
  product: Product
  averageRating: number
  canReview: boolean
  canReviewReason: string
  submittingReview: boolean
  reviewDraft: { rating: number, comment: string }
  loadingReviewEligibility: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['submitReview', 'update:reviewDraftRating', 'update:reviewDraftComment'])

const getStarPercentage = (star: number) => {
  if (!props.product?.Review || props.product.Review.length === 0) return 0
  const count = props.product.Review.filter((r: Review) => r.rating === star).length
  return (count / props.product.Review.length) * 100
}
</script>

<template>
  <div class="animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <!-- Rating Stats -->
      <div class="lg:col-span-4 space-y-8">
        <div class="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-4">
          <span class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ $t('products.detail.averageRating') }}</span>
          <div class="text-6xl font-black text-slate-900 tracking-tighter">
            {{ averageRating.toFixed(1) }}
          </div>
          <div class="flex items-center gap-1">
            <StarSolidIcon
              v-for="i in 5"
              :key="i"
              class="w-5 h-5"
              :class="i <= Math.round(averageRating) ? 'text-amber-400' : 'text-slate-200'"
            />
          </div>
          <p class="text-[10px] font-bold text-slate-400">
            {{ product.Review?.length || 0 }} YORUM
          </p>
        </div>

        <div class="space-y-3">
          <div
            v-for="star in [5,4,3,2,1]"
            :key="star"
            class="flex items-center gap-4 group"
          >
            <div class="flex items-center gap-1 w-8">
              <span class="text-xs font-black text-slate-600">{{ star }}</span>
              <StarSolidIcon class="w-3 h-3 text-amber-400" />
            </div>
            <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-amber-400 rounded-full transition-all duration-1000"
                :style="{ width: `${getStarPercentage(star)}%` }"
              />
            </div>
            <span class="text-[10px] font-black text-slate-400 w-8 text-right">%{{ Math.round(getStarPercentage(star)) }}</span>
          </div>
        </div>
      </div>

      <!-- Reviews List & Form -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Review Form -->
        <ProductReviewForm
          v-if="canReview"
          :submitting-review="submittingReview"
          :review-draft="reviewDraft"
          @submit-review="emit('submitReview')"
          @update:review-draft-rating="v => emit('update:reviewDraftRating', v)"
          @update:review-draft-comment="v => emit('update:reviewDraftComment', v)"
        />
        
        <div
          v-else-if="loadingReviewEligibility"
          class="p-8 text-center animate-pulse"
        >
          <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ $t('common.loading') }}</span>
        </div>
        
        <div
          v-else-if="canReviewReason"
          class="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center"
        >
          <p class="text-xs font-bold text-slate-500 uppercase tracking-tight">
            {{ canReviewReason }}
          </p>
        </div>

        <!-- List -->
        <div class="space-y-6">
          <ProductReviewItem 
            v-for="review in product.Review" 
            :key="review.id" 
            :review="review" 
          />
        </div>
      </div>
    </div>
  </div>
</template>
