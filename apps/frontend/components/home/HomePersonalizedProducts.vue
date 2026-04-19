<template>
  <section
    id="personalized-section"
    class="w-full bg-slate-50 py-6 md:py-10 relative overflow-hidden mb-6 md:mb-8"
  >
    <!-- Decorative Background Text -->
    <div
      class="absolute -top-10 -right-20 text-[10rem] font-black text-slate-100 pointer-events-none select-none -z-0 opacity-20 leading-none rotate-12"
    >
      AI
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-100 rotate-3 transition-transform"
          >
            <SparklesIcon class="h-6 w-6 text-white" />
          </div>
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <span
                class="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded-md"
              >{{
                $t('personalized.badge') }}</span>
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            </div>
            <h2 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
              {{
                $t('personalized.title') }}
              <span class="text-indigo-600">{{ $t('personalized.subtitle') }}</span>
            </h2>
            <p class="text-slate-500 text-sm md:text-base font-medium mt-0.5">
              {{ $t('personalized.description') }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 bg-white/50 backdrop-blur-md p-1.5 rounded-xl border border-white shadow-lg">
          <div class="flex items-center gap-1.5 px-3 py-1.5 border-r border-slate-200">
            <ClockIcon class="h-4 w-4 text-slate-400" />
            <span class="text-[10px] font-black text-slate-500 uppercase">{{ $t('personalized.sortBy') }}</span>
          </div>
          <select
            v-model="sortBy"
            class="bg-transparent text-xs font-black text-slate-700 py-1.5 pr-6 focus:outline-none cursor-pointer appearance-none"
            @change="applySort"
          >
            <option value="created_desc">
              {{ $t('personalized.sortOptions.created_desc') }}
            </option>
            <option value="price_asc">
              {{ $t('personalized.sortOptions.price_asc') }}
            </option>
            <option value="price_desc">
              {{ $t('personalized.sortOptions.price_desc') }}
            </option>
            <option value="popular">
              {{ $t('personalized.sortOptions.popular') }}
            </option>
          </select>
        </div>
      </div>

      <!-- Loading state -->
      <div
        v-if="loading"
        class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      >
        <div
          v-for="i in 4"
          :key="i"
          class="bg-indigo-50/50 animate-pulse rounded-2xl h-72"
        />
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
      >
        <div class="flex flex-col items-center gap-2 text-red-600">
          <ExclamationTriangleIcon class="h-8 w-8" />
          <p class="font-bold text-base">
            {{ error }}
          </p>
          <button
            class="text-xs font-black underline uppercase tracking-widest"
            @click="fetchProducts"
          >
            {{ $t('personalized.tryAgain') }}
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div
        v-else-if="products.length > 0"
        class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 md:gap-6 animate-fade-in"
      >
        <ProductCard
          v-for="product in products.slice(0, 7)"
          :key="'featured-' + product.id"
          :product="product"
          :badges="getProductBadges(product)"
          @click="navigateTo(getProductUrl(product))"
          @add-to-cart="(p) => cartStore.addToCart(String(p.bestListingId || p.id), 1, undefined, p)"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-inner"
      >
        <div class="text-6xl mb-6 grayscale opacity-50">
          ✨
        </div>
        <h3 class="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">
          {{
            $t('personalized.emptyTitle') }}
        </h3>
        <p class="text-slate-500 text-lg mb-8 font-medium">
          {{ $t('personalized.emptyDescription') }}
        </p>
        <NuxtLink
          to="/products"
          class="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
        >
          {{ $t('personalized.exploreProducts') }}
          <ArrowRightIcon class="h-5 w-5" />
        </NuxtLink>
      </div>

      <div class="mt-16 text-center">
        <NuxtLink
          to="/products?isFeatured=true"
          class="inline-flex items-center gap-4 px-12 py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-slate-900 font-black text-sm uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-xl hover:shadow-indigo-100 group"
        >
          {{ $t('personalized.exploreMore') }}
          <ArrowRightIcon class="h-5 w-5 group-hover:translate-x-3 transition-transform duration-500" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SparklesIcon, ClockIcon, ArrowRightIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import type { Product, ApiResponse } from '@barterborsa/shared-types'

const { getProductBadges } = useProductBadges()
const cartStore = useCartStore()

const products = ref<Product[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const sortBy = ref('created_desc')

const fetchProducts = async () => {
  loading.value = true
  error.value = null
  try {
    const { $api } = useApi()
    const data = await $api<Product[]>('/api/products', {
      query: { isFeatured: true, limit: 7, sort: sortBy.value }
    })
    if (data.success && data.data) {
      products.value = data.data
    } else {
      error.value = data.message || 'Failed to fetch products'
    }
  } catch (err: unknown) {
    error.value = (err as Error).message || 'An error occurred'
    console.error('Personalized products error:', err)
  } finally {
    loading.value = false
  }
}

const applySort = () => {
  fetchProducts()
}

onMounted(() => {
  fetchProducts()
})
</script>
