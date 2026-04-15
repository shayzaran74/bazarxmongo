<template>
  <div
    v-if="show === 'true'"
    class="w-full bg-slate-900 py-10 md:py-16 relative overflow-hidden mb-8 md:mb-12"
  >
    <!-- Gradient Decorations -->
    <div class="absolute inset-0 opacity-20 pointer-events-none">
      <div class="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
      <div class="absolute bottom-0 left-0 w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]" />
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
        <div class="max-w-xl text-center md:text-left">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-xl"
          >
            <MagnifyingGlassIcon class="h-4 w-4" />
            {{ $t('vendorsHome.badge') }}
          </div>
          <h2 class="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none">
            {{ $t('vendorsHome.title') }} <span class="text-indigo-400">{{ $t('vendorsHome.subtitle') }}</span>
          </h2>
          <p class="text-slate-400 text-lg font-medium">
            {{ $t('vendorsHome.description') }}
          </p>
        </div>
        <NuxtLink
          to="/vendors"
          class="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl group"
        >
          {{ $t('vendorsHome.seeAll') }}
          <ArrowRightIcon class="h-4 w-4 ml-2 inline group-hover:translate-x-2 transition-transform" />
        </NuxtLink>
      </div>

      <div
        v-if="loading"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
      >
        <div
          v-for="i in 5"
          :key="'vendor-loading-' + i"
          class="bg-white/5 animate-pulse rounded-[2.5rem] h-64 border border-white/5"
        />
      </div>

      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-fade-in"
      >
        <div
          v-for="vendor in vendors"
          :key="vendor.id"
          class="group bg-white/5 backdrop-blur-sm rounded-[2.5rem] p-6 text-center border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col items-center justify-center h-64 active:scale-95 shadow-xl"
          @click="navigateTo(`/vendors/${vendor.id}`)"
        >
          <!-- Background Subtle Glow -->
          <div
            class="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
          />

          <div
            class="w-24 h-24 mb-6 bg-slate-800 rounded-3xl flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-indigo-500/30 transition-all z-10 shadow-2xl relative"
          >
            <img
              v-if="vendor.logoUrl"
              :src="resolveImageUrl(vendor.logoUrl, 'avatar')"
              :alt="vendor.businessName"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            <span
              v-else
              class="text-4xl font-black text-slate-600 uppercase"
            >{{ vendor.businessName.charAt(0) }}</span>

            <!-- Official Badge -->
            <div
              class="absolute -bottom-1 -right-1 bg-indigo-500 text-white p-1 rounded-lg border-2 border-slate-900 shadow-lg"
            >
              <ShieldCheckIcon class="h-3 w-3" />
            </div>
          </div>

          <h4
            class="text-sm font-black text-white uppercase tracking-widest z-10 group-hover:text-indigo-400 transition-colors line-clamp-1 italic"
          >
            {{ vendor.businessName }}
          </h4>

          <div class="flex items-center gap-1.5 mt-3 px-3 py-1 bg-white/5 rounded-full z-10">
            <StarIcon class="h-3 w-3 text-amber-400 fill-current" />
            <span class="text-[10px] font-black text-slate-400">{{ vendor.averageRating?.toFixed(1) || '5.0' }}</span>
          </div>

          <div
            class="absolute bottom-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0"
          >
            <span class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{{ $t('vendorsHome.visitStore')
            }}</span>
            <ArrowRightIcon class="h-3 w-3 text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon, ArrowRightIcon, ShieldCheckIcon, StarIcon } from '@heroicons/vue/24/outline'
import type { Vendor, ApiResponse } from '@barterborsa/shared-types'
import { ref, onMounted } from 'vue'

defineProps<{
  show?: string
}>()

const vendors = ref<Vendor[]>([])
const loading = ref(false)
const { resolveImageUrl } = useAppImage()

const fetchVendors = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const data = await $api('/api/vendors', {
      query: { limit: 10, status: 'APPROVED', isFeatured: true }
    }) as ApiResponse<Vendor[]>
    if (data.success && data.data) {
      vendors.value = data.data
    }
  } catch (error) {
    console.error('Fetch vendors error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVendors()
})
</script>
