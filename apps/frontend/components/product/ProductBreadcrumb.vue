<template>
  <nav class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
    <NuxtLink to="/" class="hover:text-primary-600 transition-colors">Anasayfa</NuxtLink>
    <Icon name="heroicons:chevron-right" class="w-3 h-3 text-slate-200" />
    <template v-if="category">
      <NuxtLink :to="`/products?categorySlug=${category.slug}`" class="hover:text-primary-600 transition-colors">
        {{ category.name }}
      </NuxtLink>
      <Icon name="heroicons:chevron-right" class="w-3 h-3 text-slate-200" />
    </template>
    <span class="text-slate-900 line-clamp-1 truncate max-w-[200px]">{{ productName }}</span>
  </nav>
</template>

<script setup lang="ts">
import type { Category } from '~/types/catalog'

defineProps<{
  category?: Category | null
  productName: string
}>()
</script>
