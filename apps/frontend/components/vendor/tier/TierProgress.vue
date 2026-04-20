<script setup lang="ts">
const props = defineProps<{
  progress: any
  tierColor: string
}>()

const { formatCurrency } = useCalculators()
</script>

<template>
  <div v-if="progress && !progress.isMaxTier" class="p-8 space-y-6">
    <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">
           {{ progress.nextTierBenefits?.icon }}
        </div>
        <div>
          <span class="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">SONRAKİ HEDEF</span>
          <h4 class="font-black text-gray-900 italic uppercase">{{ progress.nextTierBenefits?.nametr }}</h4>
        </div>
      </div>
    </div>

    <div class="space-y-5">
      <div v-for="(item, key) in progress.progress" :key="key" class="space-y-2">
        <div class="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
           <span>{{ String(key) === 'sales' ? 'SATIŞ' : String(key) === 'revenue' ? 'CİRO' : 'PUAN' }}</span>
           <span class="text-gray-900">{{ String(key) === 'revenue' ? formatCurrency(item.current) : item.current }} / {{ String(key) === 'revenue' ? formatCurrency(item.required) : item.required }}</span>
        </div>
        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
           <div class="h-full rounded-full transition-all duration-1000" :style="{ width: `${Math.min(item.percent || 0, 100)}%`, backgroundColor: String(key) === 'rating' ? '#f59e0b' : tierColor }"></div>
        </div>
      </div>
    </div>

    <!-- Motivational Message -->
    <div v-if="progress.progress?.revenue && progress.progress.revenue.current < progress.progress.revenue.required" class="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-4 animate-bounce-slow">
       <div class="text-2xl italic">🎯</div>
       <p class="text-[10px] font-bold text-orange-900 leading-relaxed uppercase">
         Yeni seviyeye sadece <span class="italic text-lg" :style="{ color: tierColor }">{{ formatCurrency(progress.progress.revenue.required - progress.progress.revenue.current) }}</span> ciro kaldı!
       </p>
    </div>
  </div>

  <div v-else-if="progress?.isMaxTier" class="p-10 text-center bg-gradient-to-br from-purple-50 to-orange-50">
     <div class="text-5xl mb-4">🏆</div>
     <h4 class="text-xl font-black italic uppercase tracking-tighter text-gray-900">{{ progress.message }}</h4>
     <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">EN ÜST SEVİYE SATICI AYRICALIKLARI AKTİF</p>
  </div>
</template>

<style scoped>
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}
</style>
