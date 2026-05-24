<template>
  <div
    v-if="show === 'true'"
    class="mx-4 md:mx-6 xl:mx-auto max-w-7xl rounded-[1.5rem] md:rounded-[2rem] bg-neutral-700 py-6 md:py-10 relative overflow-hidden mb-6 md:mb-10 shadow-xl border border-white/5"
  >

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
        <div class="max-w-xl text-center md:text-left">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary-300 text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-xl"
          >
            <MagnifyingGlassIcon class="h-4 w-4" />
            {{ $t('vendorsHome.badge') }}
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-white mb-3 tracking-tighter uppercase italic leading-none">
            {{ $t('vendorsHome.title') }} <span class="text-primary-300">{{ $t('vendorsHome.subtitle') }}</span>
          </h2>
          <p class="text-slate-400 text-base font-medium">
            {{ $t('vendorsHome.description') }}
          </p>
        </div>
        <NuxtLink
          to="/vendors"
          class="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all shadow-xl group"
        >
          {{ $t('vendorsHome.seeAll') }}
          <ArrowRightIcon class="h-4 w-4 ml-2 inline group-hover:translate-x-2 transition-transform" />
        </NuxtLink>
      </div>

      <div
        v-if="loading"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        <div
          v-for="i in 5"
          :key="'vendor-loading-' + i"
          class="bg-white/5 animate-pulse rounded-[2rem] h-48 border border-white/5"
        />
      </div>

      <div
        v-else
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in"
      >
        <div
          v-for="vendor in vendors"
          :key="vendor.id"
          class="group bg-white/5 backdrop-blur-sm rounded-[2rem] p-4 text-center border border-white/10 hover:border-primary-500/50 hover:bg-white/10 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col items-center justify-center h-48 active:scale-95 shadow-xl"
          @click="navigateTo(`/vendors/${vendor.id}`)"
        >
          <!-- Background Subtle Glow -->
          <div
            class="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
          />

          <div
            class="w-16 h-16 mb-4 bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-primary-500/30 transition-all z-10 shadow-2xl relative"
          >
            <NuxtImg
              v-if="vendor.logoUrl"
              :src="resolveImageUrl(vendor.logoUrl, 'avatar')"
              :alt="vendor.businessName"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <span
              v-else
              class="text-2xl font-black text-slate-600 uppercase"
            >{{ (vendor.businessName || 'V').charAt(0) }}</span>

            <!-- Official Badge -->
            <div
              class="absolute -bottom-1 -right-1 bg-primary-600 text-white p-1 rounded-lg border-2 border-md3-primary shadow-lg"
            >
              <ShieldCheckIcon class="h-3 w-3" />
            </div>
          </div>

          <h4
            class="text-sm font-black text-white uppercase tracking-widest z-10 group-hover:text-primary-300 transition-colors line-clamp-1 italic"
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
            <span class="text-[9px] font-black text-primary-300 uppercase tracking-widest">{{ $t('vendorsHome.visitStore')
            }}</span>
            <ArrowRightIcon class="h-3 w-3 text-primary-300" />
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
      vendors.value = (data.data as any).items || data.data
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
