<template>
  <div
    v-if="show === 'true' && (loading || restaurants.length > 0)"
    class="w-full bg-gradient-to-br from-rose-50 to-orange-50 py-10 md:py-16 relative overflow-hidden mb-8 md:mb-12"
  >
    <div class="absolute inset-0 opacity-40 pointer-events-none">
      <div class="absolute top-0 right-0 w-96 h-96 bg-rose-200/50 rounded-full blur-[100px]" />
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-orange-200/50 rounded-full blur-[100px]" />
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
        <div class="flex items-center gap-6">
          <div
            class="w-14 h-14 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-rose-200 rotate-3 group-hover:rotate-0 transition-transform"
          >
            <span class="text-3xl">🍕</span>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span
                class="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] bg-white/60 px-2 py-0.5 rounded-lg border border-rose-100"
              >{{
                $t('restaurantsHome.badge') }}</span>
              <span class="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            </div>
            <h2 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
              {{
                $t('restaurantsHome.title') }}
              <span class="text-rose-600">{{ $t('restaurantsHome.subtitle') }}</span>
            </h2>
            <p class="text-rose-900/60 text-base font-medium mt-1 italic opacity-80">
              {{
                $t('restaurantsHome.description') }}
            </p>
          </div>
        </div>

        <NuxtLink
          to="/products?categorySlug=restoran-kafe"
          class="flex items-center gap-3 px-8 py-4 bg-white border border-rose-200 rounded-2xl text-slate-900 font-black text-sm uppercase tracking-widest hover:border-rose-600 hover:text-rose-600 transition-all shadow-lg group/link"
        >
          {{ $t('restaurantsHome.seeAll') }}
          <ArrowRightIcon class="h-5 w-5 group-hover/link:translate-x-3 transition-transform duration-500" />
        </NuxtLink>
      </div>

      <div
        v-if="loading"
        class="flex overflow-x-auto hide-scrollbar gap-6 pb-4"
      >
        <div
          v-for="i in 4"
          :key="'rest-loading-' + i"
          class="min-w-[280px] bg-white/50 backdrop-blur-md animate-pulse border border-white rounded-[2rem] h-72 shadow-xl shadow-rose-100/50"
        />
      </div>

      <!-- Restaurants Horizontal Scroll -->
      <div
        v-else
        class="flex overflow-x-auto hide-scrollbar gap-6 pb-6 snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        <div
          v-for="vendor in restaurants"
          :key="'restaurant-' + vendor.id"
          class="snap-center group bg-white rounded-[2rem] p-5 shadow-xl shadow-rose-100/50 border border-white hover:border-rose-200 hover:shadow-2xl hover:shadow-rose-200/50 transition-all duration-500 flex flex-col justify-between h-72 min-w-[280px] cursor-pointer"
          @click="navigateTo(`/vendors/${vendor.id}`)"
        >
          <div class="relative mb-4">
            <div
              class="w-full h-32 rounded-[1.5rem] overflow-hidden bg-rose-50 border border-slate-100 flex items-center justify-center relative z-10"
            >
              <NuxtImg
                v-if="vendor.coverImageUrl || vendor.logoUrl"
                :src="resolveImageUrl(vendor.coverImageUrl || vendor.logoUrl, 'avatar')"
                :alt="vendor.businessName"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
                placeholder
              />
              <span
                v-else
                class="text-4xl"
              >🍽️</span>
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            <div
              class="absolute -bottom-4 left-4 w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center overflow-hidden z-20"
            >
              <NuxtImg
                v-if="vendor.logoUrl"
                :src="resolveImageUrl(vendor.logoUrl, 'avatar')"
                :alt="vendor.businessName"
                class="w-full h-full object-cover p-1"
              />
              <span
                v-else
                class="text-lg font-black text-slate-300"
              >{{ (vendor.businessName || 'R').charAt(0).toUpperCase()
              }}</span>
            </div>
          </div>

          <div class="flex-grow flex flex-col pt-3">
            <h3
              class="text-lg font-black text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors uppercase tracking-tight italic"
            >
              {{ vendor.businessName }}
            </h3>

            <div class="flex items-center gap-2 mt-2">
              <span
                class="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg"
              >
                {{ vendor.categories?.[0]?.category?.name || $t('restaurantsHome.defaultCategory') }}
              </span>
              <div class="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                <StarIcon class="h-3 w-3 text-amber-500 fill-current" />
                <span class="text-[10px] font-black text-slate-700">{{ vendor.averageRating?.toFixed(1) || '5.0'
                }}</span>
              </div>
            </div>
          </div>

          <div
            class="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          >
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest"><span
              class="text-rose-600"
            >{{
              vendor._count?.listings || 0 }}</span> {{ $t('restaurantsHome.products') }}</span>
            <span class="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
              <ArrowRightIcon class="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowRightIcon, StarIcon } from '@heroicons/vue/24/outline'
import type { Category, Vendor, ApiResponse } from '@barterborsa/shared-types'
import { ref, onMounted } from 'vue'

defineProps<{
  show?: string
}>()

const restaurants = ref<Vendor[]>([])
const loading = ref(false)
const { resolveImageUrl } = useAppImage()

const fetchRestaurants = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    // Find category ID dynamically if possible, or use fallback
    const catResponse = await $api('/api/categories', { query: { all: true } }) as ApiResponse<Category[]>
    let categoryId = 'cmls7lxw1008xtldg78gdzze6' 
    if (catResponse.success && catResponse.data) {
      const resCat = catResponse.data.find(c => c.slug === 'restoran-kafe' || c.name.includes('Restoran'))
      if (resCat) categoryId = String(resCat.id)
    }

    const data = await $api('/api/vendors', {
      query: { limit: 12, status: 'APPROVED', categoryId: categoryId }
    }) as ApiResponse<Vendor[]>
    if (data.success && data.data) {
      restaurants.value = data.data
    }
  } catch (error) {
    console.error('Fetch restaurants error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRestaurants()
})
</script>
