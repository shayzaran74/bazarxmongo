<template>
  <div class="product-grid-container h-full">
    <!-- Loading State -->
    <div v-if="loading" :class="gridClasses">
      <ProductCardSkeleton v-for="i in skeletonCount" :key="i" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!products.length" class="flex items-center justify-center py-20">
      <div class="text-center space-y-4">
        <Icon name="heroicons:shopping-bag" class="w-16 h-16 text-slate-200 mx-auto" />
        <h3 class="text-xl font-display font-black text-slate-800 uppercase italic tracking-tighter">
          {{ $t('products.noProductFound') }}
        </h3>
        <p class="text-slate-400 text-sm max-w-xs mx-auto">
          {{ $t('products.noProductFoundDesc') }}
        </p>
        <UiButton
          variant="secondary"
          class="mt-4"
          @click="$emit('clear-filters')"
        >
          {{ $t('products.clearFilters') }}
        </UiButton>
      </div>
    </div>

    <!-- Grid State -->
    <div v-else :class="gridClasses">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @click="$emit('product-click', product)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/catalog'

const props = withDefaults(defineProps<{
  products: Product[]
  loading?: boolean
  columns?: 2 | 3 | 4 | 5
}>(), {
  loading: false,
  columns: 4
})

defineEmits<{
  (e: 'product-click', product: Product): void
  (e: 'clear-filters'): void
}>()

const skeletonCount = computed(() => props.columns * 2)

const gridClasses = computed(() => {
  return {
    'grid gap-6 sm:gap-8 transition-all duration-500': true,
    'grid-cols-1 sm:grid-cols-2': true,
    'lg:grid-cols-3': props.columns >= 3,
    'xl:grid-cols-4': props.columns >= 4,
    '2xl:grid-cols-5': props.columns >= 5
  }
})
</script>
