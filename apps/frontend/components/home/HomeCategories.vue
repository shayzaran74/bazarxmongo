<template>
  <section class="home-categories py-20 bg-slate-50/50 rounded-[4rem] mx-4">
    <div class="container mx-auto px-12">
      <div class="mb-12 text-center lg:text-left">
        <h2 class="text-3xl lg:text-4xl font-display font-black text-slate-800 italic tracking-tighter leading-none">
          {{ $t('home.popularCategories') }}
        </h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <NuxtLink
          v-for="cat in categories.slice(0, 12)"
          :key="cat.id"
          :to="`/products?categorySlug=${cat.slug}`"
          class="group bg-white p-6 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center space-y-4"
        >
          <div class="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <Icon :name="cat.icon || 'heroicons:squares-2x2'" class="w-8 h-8" />
          </div>
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-800 line-clamp-1">
            {{ cat.name }}
          </p>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Category } from '~/types/catalog'

defineProps<{
  categories: Category[]
}>()
</script>
