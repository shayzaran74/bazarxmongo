<template>
  <div class="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl relative overflow-hidden group">
    <!-- Header Decor -->
    <div
      class="absolute -right-10 -top-10 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl group-hover:bg-primary-600/10 transition-all duration-700"
    />

    <div
      v-if="loading"
      class="flex items-center justify-center py-10"
    >
      <ArrowPathIcon class="h-8 w-8 text-gray-200 animate-spin" />
    </div>

    <div
      v-else-if="!stats"
      class="text-center py-10 text-gray-300 italic text-xs font-black uppercase tracking-widest"
    >
      Veri bulunamadı
    </div>

    <div
      v-else
      class="space-y-10 relative z-10"
    >
      <!-- Top Section -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h4 class="text-2xl font-black text-gray-900 uppercase tracking-tightest italic leading-none">
            TİCARİ <span class="text-primary-600">İTİBAR</span>
          </h4>
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono">
            Trading
            Reputation Portfolio
          </p>
        </div>
        <div class="text-right">
          <p class="text-4xl font-black text-gray-900 italic leading-none">
            {{ stats.averageRating?.toFixed(1)
              || '0.0' }}
          </p>
          <div class="flex items-center justify-end mt-2">
            <StarIcon
              v-for="i in 5"
              :key="i"
              class="h-3 w-3"
              :class="i <= Math.round(stats.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'"
            />
          </div>
        </div>
      </div>

      <!-- Distribution Bars -->
      <div class="space-y-4">
        <div
          v-for="star in [5, 4, 3, 2, 1]"
          :key="star"
          class="flex items-center space-x-4"
        >
          <span class="text-[9px] font-black text-gray-400 w-4">{{ star }}</span>
          <div
            class="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50 shadow-inner"
          >
            <div
              class="h-full bg-gradient-to-r transition-all duration-1000 ease-out"
              :class="barColor(star)"
              :style="{ width: getPercentage(stats.ratingsDistribution[star]) + '%' }"
            />
          </div>
          <span class="text-[10px] font-black text-gray-900 w-8 text-right">{{ stats.ratingsDistribution[star]
          }}</span>
        </div>
      </div>

      <!-- Report Button -->
      <div class="pt-4">
        <button
          class="w-full py-4 px-6 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 border border-red-100"
          @click="showReportModal = true"
        >
          <ExclamationTriangleIcon class="h-3 w-3" />
          <span>KULLANICIYI ŞİKAYET ET</span>
        </button>
      </div>

      <!-- Footer Info -->
      <div class="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
        <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
          <p class="text-xl font-black text-gray-900 leading-none italic">
            {{ stats.totalReviews }}
          </p>
          <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-2">
            Toplam İşlem
          </p>
        </div>
        <div
          class="p-4 bg-gray-900 rounded-2xl border border-black shadow-lg relative overflow-hidden group/badge"
        >
          <p
            class="text-xl font-black leading-none italic uppercase"
            :class="statusColorClass"
          >
            {{ statusLabel }}
          </p>
          <p class="text-[8px] font-black text-white/40 uppercase tracking-widest mt-2">
            İtibar Durumu
          </p>

          <!-- Decorative pulse for under review -->
          <div
            v-if="stats.userStatus === 'UNDER_REVIEW'"
            class="absolute inset-0 bg-amber-500/10 animate-pulse pointer-events-none"
          />
        </div>
      </div>
    </div>

    <ReportComplaintModal
      :is-open="showReportModal"
      :target-id="userId"
      @close="showReportModal = false"
    />
  </div>
</template>

<script setup>
import { StarIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'
import ReportComplaintModal from './ReportComplaintModal.vue'

const props = defineProps({
    userId: {
        type: String,
        required: true
    }
})

const stats = ref(null)
const loading = ref(true)
const showReportModal = ref(false)
const config = useRuntimeConfig()

const fetchStats = async () => {
    if (!props.userId) return
    loading.value = true
    try {
        const response = await $fetch(`/api/trade-reviews/stats/${props.userId}`, {
            baseURL: config.public.apiBase
        })
        if (response.success) {
            stats.value = response.data
        }
    } catch (error) {
        console.error('Fetch user review stats error:', error)
    } finally {
        loading.value = false
    }
}

const getPercentage = (count) => {
    if (!stats.value?.totalReviews) return 0
    return (count / stats.value.totalReviews) * 100
}

const barColor = (star) => {
    if (star >= 4) return 'from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
    if (star === 3) return 'from-amber-400 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
    return 'from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
}

const statusLabel = computed(() => {
    if (!stats.value?.userStatus) return 'GÜVENİLİR'
    const s = stats.value.userStatus
    if (s === 'ACTIVE') return 'GÜVENİLİR'
    if (s === 'UNDER_REVIEW') return 'İNCELEMEDE'
    if (s === 'SUSPENDED') return 'ASKIDA'
    if (s === 'BANNED') return 'YASAKLI'
    return 'GÜVENİLİR'
})

const statusColorClass = computed(() => {
    if (!stats.value?.userStatus) return 'text-primary-400'
    const s = stats.value.userStatus
    if (s === 'ACTIVE') return 'text-primary-400'
    if (s === 'UNDER_REVIEW') return 'text-amber-400'
    if (s === 'SUSPENDED') return 'text-rose-400'
    if (s === 'BANNED') return 'text-rose-600'
    return 'text-primary-400'
})

onMounted(() => {
    fetchStats()
})

watch(() => props.userId, () => {
    fetchStats()
})
</script>

<style scoped>
.tracking-tightest {
    letter-spacing: -0.05em;
}
</style>
