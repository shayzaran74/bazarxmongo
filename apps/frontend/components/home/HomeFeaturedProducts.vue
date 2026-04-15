<template>
  <section class="featured-products py-20 lg:py-32">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between mb-16 px-4">
        <div class="space-y-2">
          <span class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">
            Haftanın Favorileri
          </span>
          <h2 class="text-4xl lg:text-5xl font-display font-black text-slate-800 italic tracking-tighter leading-none">
            {{ $t('home.featuredProducts') }}
          </h2>
        </div>
        <NuxtLink to="/products?isFeatured=true">
          <UiButton variant="ghost">{{ $t('home.viewAll') }}</UiButton>
        </NuxtLink>
      </div>

      <ProductGrid :products="products" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from '~/types/catalog'

defineProps<{
  products: Product[]
}>()
</script>
