<template>
  <div
    class="relative overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 group transition-all duration-500 hover:shadow-primary-500/10 hover:-translate-y-1 h-full flex flex-col"
    :style="{ '--tier-color': tierData?.color || '#CD7F32' }"
  >
    <!-- tier accent line -->
    <div
      class="absolute top-0 left-0 right-0 h-1.5"
      :style="{ background: tierData?.bgGradient }"
    />

    <!-- Tier Header -->
    <div class="p-8 pb-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-black/5 bg-gray-50 group-hover:scale-110 transition-transform duration-500">
          {{ tierData?.icon }}
        </div>
        <div>
          <h3 class="text-xl font-black text-gray-900 uppercase tracking-tightest italic leading-none">
            {{ tierData?.nametr || tierData?.label }}
          </h3>
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 block">Mevcut Seviye</span>
        </div>
      </div>
      <div class="bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
        <span class="text-[9px] font-black text-primary-600 uppercase tracking-tighter italic">ACTIVE</span>
      </div>
    </div>

    <!-- Benefits Section -->
    <div class="px-8 py-6 space-y-4">
      <h4 class="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center">
        <ShieldCheckIcon class="h-4 w-4 mr-2 text-primary-600" />
        AVANTAJLARINIZ
      </h4>
      <ul class="space-y-3">
        <li
          v-for="(benefit, index) in tierData?.benefits?.slice(0, showAllBenefits ? undefined : 4)"
          :key="index"
          class="flex items-start gap-3 group/item"
        >
          <div class="mt-1 p-0.5 bg-green-50 rounded-md border border-green-100 group-hover/item:bg-green-500 group-hover/item:border-green-500 transition-colors">
            <CheckIcon class="h-3 w-3 text-green-600 group-hover/item:text-white" />
          </div>
          <span class="text-xs font-bold text-gray-600 leading-relaxed">{{ benefit }}</span>
        </li>
      </ul>
      <button 
        v-if="tierData?.benefits?.length > 4" 
        class="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors flex items-center pt-2"
        @click="showAllBenefits = !showAllBenefits"
      >
        {{ showAllBenefits ? 'Daha az göster' : `+${tierData.benefits.length - 4} DAHA FAZLA` }}
        <ChevronRightIcon :class="['h-3 w-3 ml-1 transition-transform', { 'rotate-90': showAllBenefits }]" />
      </button>
    </div>

    <!-- Metrics Grid -->
    <div class="px-8 py-6 bg-gray-50/50 border-y border-gray-100 grid grid-cols-2 gap-4">
      <div class="metric-glass p-4">
        <span class="text-lg font-black text-primary-600 italic leading-none block">%{{ (tierData?.commissionRate?.barter * 100).toFixed(0) }}</span>
        <span class="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1 block">Barter Komisyon</span>
      </div>
      <div class="metric-glass p-4">
        <span class="text-lg font-black text-primary-600 italic leading-none block">{{ tierData?.xpMultiplier }}x</span>
        <span class="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1 block">XP Çarpanı</span>
      </div>
    </div>

    <!-- Limits Wrapper -->
    <div class="p-8 space-y-4 flex-1">
      <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex flex-col">
          <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">İLAN LİMİTİ</span>
          <span class="text-xs font-black text-gray-900 mt-1">{{ tierData?.limits?.maxProducts || 'SINIRSIZ' }} Ürün</span>
        </div>
        <div class="p-2 bg-gray-50 rounded-xl">
          <CircleStackIcon class="h-4 w-4 text-gray-400" />
        </div>
      </div>
      <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex flex-col">
          <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">GÜNLÜK ÇEKİM</span>
          <span class="text-xs font-black text-gray-900 mt-1">{{ formatCurrency(tierData?.limits?.dailyWithdraw) }}</span>
        </div>
        <div class="p-2 bg-gray-50 rounded-xl">
          <BanknotesIcon class="h-4 w-4 text-gray-400" />
        </div>
      </div>

      <!-- Progress to Next Tier -->
      <div
        v-if="progress && !progress.isMaxTier"
        class="pt-6 mt-6 border-t border-gray-100"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex flex-col">
            <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">SONRAKİ SEVİYE</span>
            <span class="text-xs font-black text-primary-600 uppercase italic">{{ progress.nextTier }}</span>
          </div>
          <span class="text-[11px] font-black text-gray-900 tabular-nums">%{{ Math.round(progress.progress) }}</span>
        </div>
        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            class="h-full bg-primary-600 rounded-full transition-all duration-1000 ease-out"
            :style="{ width: `${Math.min(progress.progress, 100)}%` }"
          />
        </div>
        <p class="text-[10px] font-bold text-gray-400 mt-3 leading-tight italic">
          Hedef: {{ formatCurrency(progress.requirements?.volume) }} Hacim veya {{ formatNumber(progress.requirements?.xp) }} XP
        </p>
      </div>

      <!-- Max Tier Badge -->
      <div
        v-if="progress?.isMaxTier"
        class="pt-6 mt-6 border-t border-gray-100 flex items-center justify-center gap-3"
      >
        <div class="p-2 bg-yellow-50 rounded-xl border border-yellow-100">
          <TrophyIcon class="h-5 w-5 text-yellow-600" />
        </div>
        <span class="text-xs font-black text-gray-900 uppercase tracking-widest italic">Zirvedesiniz (Apex)</span>
      </div>
    </div>

    <!-- Footer Action -->
    <div class="p-8 pt-0">
      <NuxtLink
        to="/tier-info"
        class="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-primary-600 transition-colors duration-300"
      >
        Tüm Avantajları Gör
        <ArrowRightIcon class="h-3 w-3 group-hover:translate-x-1 transition-transform" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from '#imports'
import ShieldCheckIcon from '@heroicons/vue/24/outline/ShieldCheckIcon'
import CheckIcon from '@heroicons/vue/24/outline/CheckIcon'
import ChevronRightIcon from '@heroicons/vue/24/outline/ChevronRightIcon'
import BanknotesIcon from '@heroicons/vue/24/outline/BanknotesIcon'
import CircleStackIcon from '@heroicons/vue/24/outline/CircleStackIcon'
import TrophyIcon from '@heroicons/vue/24/outline/TrophyIcon'
import ArrowRightIcon from '@heroicons/vue/24/outline/ArrowRightIcon'

defineProps({
  tierData: {
    type: Object,
    default: () => ({})
  },
  progress: {
    type: Object,
    default: null
  }
})

const showAllBenefits = ref(false)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}

const formatNumber = (value) => {
    return new Intl.NumberFormat('tr-TR').format(value || 0)
}
</script>

<style scoped>
.metric-glass {
    background: white;
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: 1.5rem;
    position: relative;
    overflow: hidden;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 20px;
}

.tracking-tightest {
    letter-spacing: -0.05em;
}
</style>
