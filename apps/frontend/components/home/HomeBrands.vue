<template>
  <div
    v-if="show !== 'false' && (loading || brands.length > 0)"
    class="mb-16 relative"
  >
    <div class="absolute inset-0 bg-gradient-to-b from-gray-100/50 to-transparent -mx-20 rounded-[4rem] -z-10" />

    <div class="p-6">
      <div class="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
        <div class="max-w-xl">
          <h2 class="text-xl font-black text-gray-900 mb-3 uppercase tracking-tighter italic leading-none">
            🏆 {{ $t('brandsHome.title') }} <span class="text-primary-600">{{ $t('brandsHome.subtitle') }}</span>
          </h2>
          <p class="text-gray-500 text-lg font-medium">
            {{ $t('brandsHome.description') }}
          </p>
        </div>
        <button
          class="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-black text-xs text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm hover:shadow-lg flex items-center gap-2 group"
          @click="navigateTo('/markalar')"
        >
          {{ $t('brandsHome.seeAll') }}
          <ArrowRightIcon class="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div
        v-if="loading"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <div
          v-for="i in 6"
          :key="'brand-loading-' + i"
          class="aspect-square bg-white animate-pulse rounded-[2rem] border-2 border-white shadow-xl shadow-gray-200/50"
        />
      </div>

      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <div
          v-for="brand in brands"
          :key="brand.id"
          class="group bg-white rounded-[2rem] p-6 text-center shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary-200/50 transition-all duration-500 cursor-pointer border-2 border-white hover:border-primary-500 relative overflow-hidden flex flex-col items-center justify-center h-52 active:scale-95"
          @click="searchBrand(brand.name)"
        >
          <!-- Background Glow & Decoration -->
          <div
            class="absolute -top-12 -right-12 w-40 h-40 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          />
          <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            <SparklesIcon class="h-5 w-5 text-primary-400" />
          </div>

          <div
            class="w-24 h-24 mb-4 bg-surface-container-lowest rounded-2xl flex items-center justify-center overflow-hidden border border-outline-variant group-hover:border-primary-200 transition-all z-10 p-2"
          >
            <NuxtImg
              v-if="brand.image"
              :src="resolveImageUrl(brand.image, 'category')"
              class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
              placeholder
            />
            <span
              v-else
              class="text-4xl transform group-hover:scale-125 transition-transform duration-500 select-none"
            >{{
              brand.icon || '🏷️' }}</span>
          </div>

          <h4
            class="text-sm font-black text-gray-900 uppercase tracking-widest z-10 group-hover:text-primary-600 transition-colors"
          >
            {{ brand.name }}
          </h4>

          <div
            class="absolute bottom-4 flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 group-hover:bg-primary-600 group-hover:text-white transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <span>{{ brand.productCount || 0 }}</span>
            <span class="opacity-70">{{ $t('brandsHome.products') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRightIcon, SparklesIcon } from '@heroicons/vue/24/outline'
import type { Brand, ApiResponse } from '@barterborsa/shared-types'
import { ref, onMounted } from 'vue'

defineProps<{
  show?: string
}>()

const brands = ref<Brand[]>([])
const loading = ref(false)
const { resolveImageUrl } = useAppImage()

const fetchBrands = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const data = await $api('/api/brands', {
      query: { limit: 12 }
    }) as ApiResponse<Brand[]>
    if (data.success && data.data) {
      brands.value = data.data
    }
  } catch (error) {
    console.error('Fetch brands error:', error)
  } finally {
    loading.value = false
  }
}

const searchBrand = (brandName: string) => {
  navigateTo(`/products?brand=${encodeURIComponent(brandName)}`)
}

onMounted(() => {
  fetchBrands()
})
</script>
