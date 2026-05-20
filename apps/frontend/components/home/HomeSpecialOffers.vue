<template>
  <div
    v-if="show !== 'false'"
    class="w-full bg-gradient-to-br from-rose-50 via-white to-orange-50 py-8 md:py-12 relative overflow-hidden mb-6 md:mb-10"
  >
    <!-- Subtle Background Decorations -->
    <div class="absolute inset-0 opacity-40 pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-rose-200/50 rounded-full blur-[100px]" />
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-200/50 rounded-full blur-[100px]" />
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-6">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-xl shadow-rose-200 rotate-3 group-hover:rotate-0 transition-transform"
          >
            <SparklesIcon class="h-6 w-6" />
          </div>
          <div class="text-center md:text-left">
            <h2 class="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none uppercase italic">
              {{ $t('specialOffers.title') }}
            </h2>
          </div>
        </div>
        <NuxtLink
          to="/products?isSpecialOffer=true"
          class="group/all flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-rose-100 rounded-xl text-rose-600 font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-lg hover:shadow-rose-200"
        >
          {{ $t('specialOffers.exploreAll') }}
          <ArrowRightIcon class="h-4 w-4 group-hover/all:translate-x-2 transition-transform" />
        </NuxtLink>
      </div>

      <div
        v-if="specialOfferLoading"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <div
          v-for="i in 6"
          :key="'special-loading-' + i"
          class="aspect-[3/4] bg-white/50 backdrop-blur-sm animate-pulse rounded-2xl border border-slate-100"
        />
      </div>
      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in"
      >
        <div
          v-for="(product, index) in specialOfferProducts.slice(0, 6)"
          :key="product.id"
        >
          <ProductCard
            :product="product"
            :badges="index === 0 ? { ...getProductBadges(product), topLeft: { text: $t('specialOffers.dealOfDay'), class: 'bg-rose-600 text-white' } } : getProductBadges(product)"
            @click="navigateTo(getProductUrl(product))"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SparklesIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import type { Product, ApiResponse } from '@barterborsa/shared-types'

defineProps<{
  show?: string
}>()

const { getProductBadges } = useProductBadges()
const specialOfferProducts = ref<Product[]>([])
const specialOfferLoading = ref(false)

const fetchSpecialOffers = async () => {
  specialOfferLoading.value = true
  try {
    const { $api } = useApi()
    const res = await $api<{ success: boolean; data: { items: Product[] } }>('/api/v1/listings/marketplace', {
      query: { isSpecialOffer: 'true', limit: 6, vendorType: 'COMMERCE' }
    })
    specialOfferProducts.value = res?.data?.items ?? []
  } catch {
    // sessizce geç — bölüm gizlenir
  } finally {
    specialOfferLoading.value = false
  }
}

onMounted(() => {
  fetchSpecialOffers()
})
</script>
