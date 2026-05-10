<script setup lang="ts">
import { StarIcon } from '@heroicons/vue/24/solid'
import { useFormat } from '~/composables/useFormat'
import type { Product } from '@barterborsa/shared-types'

interface Props {
  product: Product
  averageRating: number
  displayPrice: number
}

const props = defineProps<Props>()
const { formatPrice } = useFormat()

const totalReviews = computed(() => props.product.Review?.length || 0)
const discountPercentage = computed(() => {
  if (!props.product.compareAtPrice || props.product.compareAtPrice <= props.displayPrice) return 0
  return Math.round(((props.product.compareAtPrice - props.displayPrice) / props.product.compareAtPrice) * 100)
})
</script>

<template>
  <div class="space-y-6">

    <!-- Title & Brand -->
    <div class="space-y-2">
      <h1 class="text-3xl md:text-5xl font-black text-slate-900 italic tracking-tighter leading-[0.9] break-words">
        {{ product.name }}
      </h1>
      <p class="text-lg font-bold text-slate-400">
        {{ product.brand }}
      </p>
    </div>

    <!-- Rating Summary -->
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
        <div class="flex items-center gap-0.5">
          <StarIcon
            v-for="i in 5"
            :key="i"
            class="w-4 h-4"
            :class="i <= Math.round(averageRating) ? 'text-amber-500' : 'text-slate-200'"
          />
        </div>
        <span class="text-xs font-black text-amber-900">{{ averageRating.toFixed(1) }}</span>
      </div>
      <a
        href="#reviews"
        class="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-all border-b-2 border-transparent hover:border-indigo-100 pb-0.5"
      >
        {{ totalReviews }} {{ $t('products.detail.reviewCount') }}
      </a>
    </div>

    <!-- Pricing Area -->
    <div class="flex flex-col gap-1 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 group transition-all hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/50">
      <div
        v-if="discountPercentage > 0"
        class="flex items-center gap-3"
      >
        <span class="px-3 py-1 bg-rose-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-rose-200 animate-pulse">
          {{ discountPercentage }}% {{ $t('products.detail.discount') }}
        </span>
        <span class="text-lg text-slate-400 line-through font-bold opacity-50">{{ formatPrice(product.compareAtPrice!) }}</span>
      </div>
      <div class="flex items-baseline gap-3">
        <span class="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">
          {{ formatPrice(Math.floor(displayPrice)).split(',')[0] }}
        </span>
        <span class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ $t('products.detail.includingVat') }}</span>
      </div>
    </div>
  </div>
</template>
