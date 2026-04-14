<template>
  <section
    v-if="show !== 'false'"
    class="w-full bg-slate-50 py-10 md:py-16 relative overflow-hidden mb-8 md:mb-12"
  >
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div>
        <div>
          <div class="mb-8">
            <h2 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              {{
                $t('performance.title') }}
              <span class="text-indigo-400">{{ $t('performance.subtitle') }}</span>
            </h2>
            <p class="text-slate-500 text-base font-medium mt-1">
              {{ $t('performance.description') }}
            </p>
          </div>

          <!-- 1. En Çok Satanlar -->
          <div
            v-if="bestSellers.length > 0"
            class="mb-8"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shadow-lg shadow-amber-100/50">
                  <FireIcon class="h-5 w-5 text-amber-600" />
                </div>
                <h3 class="text-xl font-black text-black uppercase italic tracking-tight">
                  {{
                    $t('performance.bestSellers') }}
                </h3>
              </div>
              <NuxtLink
                to="/products?sort=sales_desc"
                class="group flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
              >
                {{ $t('performance.seeAll') }}
                <ArrowRightIcon class="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </NuxtLink>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 animate-fade-in">
              <div
                v-for="product in bestSellers.slice(0, 5)"
                :key="'bs-' + product.id"
              >
                <ProductCard
                  :product="product"
                  :badges="getProductBadges(product)"
                  @click="navigateTo(getProductUrl(product))"
                  @add-to-cart="(p) => cartStore.addToCart(String(p.bestListingId || p.id), 1, undefined, p)"
                />
              </div>
            </div>
          </div>

          <!-- 2. En Çok Tekrar Satın Alınanlar -->
          <div
            v-if="mostRepurchased.length > 0"
            class="mb-12"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100/50"
                >
                  <ArrowPathIcon class="h-5 w-5 text-emerald-600" />
                </div>
                <h3 class="text-xl font-black text-black uppercase italic tracking-tight">
                  {{
                    $t('performance.mostRepurchased') }}
                </h3>
              </div>
              <span
                class="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase tracking-widest"
              >{{
                $t('performance.mostRepurchasedBadge') }}</span>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 animate-fade-in">
              <div
                v-for="product in mostRepurchased.slice(0, 5)"
                :key="'rep-' + product.id"
              >
                <ProductCard
                  :product="product"
                  :badges="getProductBadges(product)"
                  @click="navigateTo(getProductUrl(product))"
                />
              </div>
            </div>
          </div>

          <!-- 3. En Çok Ziyaret Edilenler -->
          <div
            v-if="mostVisited.length > 0"
            class="mb-12"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100/50">
                  <EyeIcon class="h-5 w-5 text-blue-600" />
                </div>
                <h3 class="text-xl font-black text-black uppercase italic tracking-tight">
                  {{
                    $t('performance.trending') }}
                </h3>
              </div>
              <span
                class="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-widest"
              >{{
                $t('performance.mostVisitedBadge') }}</span>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 animate-fade-in">
              <div
                v-for="product in mostVisited.slice(0, 5)"
                :key="'visit-' + product.id"
              >
                <ProductCard
                  :product="product"
                  :badges="getProductBadges(product)"
                  @click="navigateTo(getProductUrl(product))"
                  @add-to-cart="(p) => cartStore.addToCart(String(p.bestListingId || p.id), 1, undefined, p)"
                />
              </div>
            </div>
          </div>

          <!-- 4. Genel Favorileri -->
          <div
            v-if="mostFavorited.length > 0"
            class="mb-12"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center shadow-lg shadow-rose-100/50">
                  <HeartIcon class="h-5 w-5 text-rose-600" />
                </div>
                <h3 class="text-xl font-black text-black uppercase italic tracking-tight">
                  {{
                    $t('performance.generalFavorites') }}
                </h3>
              </div>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 animate-fade-in">
              <div
                v-for="product in mostFavorited.slice(0, 5)"
                :key="'fav-' + product.id"
              >
                <ProductCard
                  :product="product"
                  :badges="getProductBadges(product)"
                  @click="navigateTo(getProductUrl(product))"
                  @add-to-cart="(p) => cartStore.addToCart(String(p.bestListingId || p.id), 1, undefined, p)"
                />
              </div>
            </div>
          </div>

          <!-- 5. En Çok Konuşulanlar -->
          <div
            v-if="mostRated.length > 0"
            class="mb-12"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100/50"
                >
                  <ChatBubbleBottomCenterTextIcon class="h-5 w-5 text-indigo-600" />
                </div>
                <h3 class="text-xl font-black text-black uppercase italic tracking-tight">
                  {{
                    $t('performance.mostDiscussed') }}
                </h3>
              </div>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 animate-fade-in">
              <div
                v-for="product in mostRated.slice(0, 5)"
                :key="'rated-' + product.id"
              >
                <ProductCard
                  :product="product"
                  :badges="getProductBadges(product)"
                  @click="navigateTo(getProductUrl(product))"
                  @add-to-cart="(p) => cartStore.addToCart(String(p.bestListingId || p.id), 1, undefined, p)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ChatBubbleBottomCenterTextIcon,
  FireIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/vue/24/outline'
import type { Product, ApiResponse } from '@barterborsa/shared-types'

defineProps<{
  show?: string
}>()

const { getProductBadges } = useProductBadges()
const cartStore = useCartStore()

const bestSellers = ref<Product[]>([])
const mostRepurchased = ref<Product[]>([])
const mostVisited = ref<Product[]>([])
const mostFavorited = ref<Product[]>([])
const mostRated = ref<Product[]>([])

const fetchPerformanceData = async () => {
  try {
    const { $api } = useApi()
    const data = await $api<ApiResponse<{
      bestSellers?: Product[]
      mostRepurchased?: Product[]
      mostVisited?: Product[]
      mostFavorited?: Product[]
      mostRated?: Product[]
    }>>('/api/products/homepage-bulk')
    if (data.success && data.data) {
      bestSellers.value = data.data.bestSellers || []
      mostRepurchased.value = data.data.mostRepurchased || []
      mostVisited.value = data.data.mostVisited || []
      mostFavorited.value = data.data.mostFavorited || []
      mostRated.value = data.data.mostRated || []
    }
  } catch (error) {
    console.error('Performance showcase error:', error)
  }
}

onMounted(() => {
  fetchPerformanceData()
})
</script>
