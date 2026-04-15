<template>
  <div class="product-info space-y-6">
    <div class="space-y-2">
      <div v-if="product.brand" class="text-xs font-black text-slate-400 uppercase tracking-widest">
        {{ typeof product.brand === 'string' ? product.brand : product.brand.name }}
      </div>
      <h1 class="text-4xl lg:text-6xl font-display font-black text-slate-800 italic tracking-tighter leading-[0.9]">
        {{ product.name }}
      </h1>
    </div>

    <div class="flex items-center gap-6">
      <div class="flex items-center gap-1">
        <Icon v-for="i in 5" :key="i" name="material-symbols:star-rounded" :class="['w-5 h-5', i <= Math.round(product.averageRating || 0) ? 'text-amber-400' : 'text-slate-200']" />
        <span class="text-xs font-black text-slate-400 ml-2">({{ product.reviewCount || 0 }})</span>
      </div>
      <div class="w-1 h-1 bg-slate-200 rounded-full" />
      <div class="text-xs font-black uppercase tracking-widest" :class="product.stock > 0 ? 'text-green-600' : 'text-red-600'">
        {{ product.stock > 0 ? $t('products.detail.inStock') : $t('products.detail.outOfStock') }}
      </div>
    </div>

    <div class="flex items-baseline gap-4">
      <div class="text-5xl font-display font-black text-slate-900 italic tracking-tighter">
        {{ formatPrice(product.price) }}
      </div>
      <div v-if="product.compareAtPrice && product.compareAtPrice > product.price" class="text-xl text-slate-300 line-through font-bold">
        {{ formatPrice(product.compareAtPrice) }}
      </div>
    </div>

    <p v-if="product.shortDescription" class="text-slate-500 font-medium leading-relaxed">
      {{ product.shortDescription }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/catalog'

defineProps<{
  product: Product
}>()

const { formatPrice } = useFormat()
</script>
