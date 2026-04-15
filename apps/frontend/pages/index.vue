<template>
  <div class="space-y-12 lg:space-y-24 pb-20">
    <!-- Main Banner Slider -->
    <HomeBanner :banners="banners" />

    <div class="container mx-auto px-4 space-y-24">
      <!-- Popular Categories -->
      <HomeCategories :categories="categories" />

      <!-- Featured Selection -->
      <HomeFeaturedProducts :products="featuredProducts" />

      <!-- Active Campaigns -->
      <HomeCampaigns :campaigns="campaigns" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Banner, Product, Category, Campaign } from '~/types/catalog'
import type { ApiResponse, PaginatedResponse } from '~/types/api'

definePageMeta({ layout: 'default' })

const { $api } = useApi()

// Parallel data fetching for SSR performance
const { data: banners } = await useAsyncData('home-banners', async () => {
  const res = await $api<ApiResponse<Banner[]>>('banners', { query: { ecosystem: 'BAZARX' } })
  return res.success ? res.data : []
}, { default: () => [] })

const { data: featuredProducts } = await useAsyncData('home-featured', async () => {
  const res = await $api<PaginatedResponse<Product>>('products', { query: { isFeatured: true, limit: 8 } })
  return res.success ? res.data : []
}, { default: () => [] })

const { data: campaigns } = await useAsyncData('home-campaigns', async () => {
  const res = await $api<ApiResponse<Campaign[]>>('campaigns', { query: { status: 'ACTIVE' } })
  return res.success ? res.data : []
}, { default: () => [] })

const { data: categories } = await useCategoryTree()

useAppSeo({
  title: 'Anasayfa',
  description: 'BarterBorsa — Ticari sektörde fazla malzeme ve stokların takası için modern platform',
})
</script>
