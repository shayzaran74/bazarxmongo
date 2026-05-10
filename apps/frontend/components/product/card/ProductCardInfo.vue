<template>
  <div class="p-5 flex flex-col flex-grow relative bg-white dark:bg-gray-900 overflow-hidden">
    <!-- Background Glow (Hover) -->
    <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

    <!-- Meta Info -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <!-- "Genel" kategoriyi gösterme; anlamlı kategori varsa göster -->

      </div>
      <div v-if="Number(rating) > 0" class="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
        <StarIcon class="h-2.5 w-2.5 text-amber-500 fill-current" />
        <span class="text-[10px] font-black text-amber-700 dark:text-amber-400 leading-none">{{ rating }}</span>
      </div>
    </div>

    <!-- Title -->
    <h3 class="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-3 mb-3 group-hover:text-primary-600 transition-colors italic tracking-tight leading-tight h-[3.75rem]">
      {{ name }}
    </h3>

    <!-- Pricing Section -->
    <div class="mt-auto pt-4 border-t border-slate-50 dark:border-gray-800">
      <div class="flex items-end justify-between">
        <div class="flex flex-col">
          <span v-if="compareAtPrice && compareAtPrice > price" class="text-[10px] text-slate-400 line-through font-bold mb-0.5 opacity-60">
            {{ formatPrice(compareAtPrice) }}
          </span>
          <div class="flex items-baseline gap-1.5">
            <span class="text-xl font-black text-gray-950 dark:text-white tracking-tighter leading-none">
              {{ formattedPriceParts[0] }}<span class="text-xs opacity-50">{{ formattedPriceParts[1] }}</span>
            </span>
            <span v-if="(sellerCount || 0) > 1" class="text-[8px] font-black text-primary-500 uppercase tracking-widest pb-1 leading-none">
              {{ $t('product.startingFromShort') }}
            </span>
          </div>
        </div>

        <!-- Indicators -->
        <div class="flex gap-1 items-center h-4">
          <div v-if="(sellerCount || 0) > 1" class="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(var(--primary-600),0.4)]" :title="$t('product.multiVendor')" />
          <div v-if="hasVariants" class="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
            + VAR
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StarIcon from '@heroicons/vue/24/outline/StarIcon'

const props = defineProps<{
  name: string
  categoryName?: string
  brandName?: string
  rating: number | string
  price: number
  compareAtPrice?: number
  formattedPrice: string
  sellerCount?: number
  hasVariants?: boolean
}>()

const formatPrice = (p: number) => props.formattedPrice // This is just for the strike-through, we use prop formatting

const formattedPriceParts = computed(() => {
  const parts = props.formattedPrice.split(',')
  return [parts[0], parts[1] ? ',' + parts[1] : '']
})
</script>
