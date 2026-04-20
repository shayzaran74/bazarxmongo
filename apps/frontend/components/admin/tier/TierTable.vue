<template>
  <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden relative italic">
    <div v-if="loading" class="p-24 flex flex-col items-center justify-center">
      <div class="relative">
        <div class="animate-spin h-16 w-16 border-[6px] border-indigo-500/20 border-t-indigo-600 rounded-full mb-6" />
        <ChartBarIcon class="h-6 w-6 text-indigo-600 absolute top-5 left-5" />
      </div>
      <p class="text-gray-400 font-black uppercase tracking-widest animate-pulse text-[10px]">VERİLER SENKRONİZE EDİLİYOR...</p>
    </div>

    <div v-else-if="tiers.length === 0" class="p-24 text-center">
      <div class="bg-neutral-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner transform -rotate-12">
        <ChartBarIcon class="h-10 w-10 text-gray-300" />
      </div>
      <h3 class="text-2xl font-black text-gray-900 uppercase">SEVİYE KONFİGÜRASYONU BULUNAMADI</h3>
      <p class="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest">LÜTFEN SİSTEM YÖNETİCİSİ İLE İLETİŞİME GEÇİN VEYA SEED KOMUTUNU ÇALIŞTIRIN.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr class="bg-neutral-50/50">
            <th v-for="h in ['SEVİYE', 'KOMİSYON (NAKİT / BARTER)', 'AİDAT (YILLIK)', 'İLAN & LİMİT', 'MAKS ROI / XP', 'İŞLEMLER']" :key="h" class="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{{ h }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-50">
          <tr v-for="tier in sortedTiers" :key="tier.tier" class="group hover:bg-neutral-50/50 transition-all cursor-pointer relative" @click="$emit('edit', tier)">
            <td class="px-10 py-8">
              <div class="flex items-center gap-4">
                <div :class="getTierBadgeColor(tier.tier)" class="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all group-hover:scale-110">{{ tier.tier }}</div>
                <div v-if="tier.tier === 'APEX'" class="flex h-2 w-2 relative">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </div>
              </div>
            </td>
            <td class="px-10 py-8">
              <div class="flex items-center gap-3">
                <div class="bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100/50">
                  <span class="text-[9px] font-black text-indigo-400 uppercase block leading-none mb-1">NAKİT</span>
                  <span class="text-sm font-black text-indigo-700">%{{ (tier.commissionCash * 100).toFixed(1) }}</span>
                </div>
                <div class="bg-purple-50/50 px-4 py-2 rounded-xl border border-purple-100/50">
                  <span class="text-[9px] font-black text-purple-400 uppercase block leading-none mb-1">BARTER</span>
                  <span class="text-sm font-black text-purple-700">%{{ (tier.commissionBarter * 100).toFixed(1) }}</span>
                </div>
              </div>
            </td>
            <td class="px-10 py-8">
              <div class="flex flex-col">
                <span class="text-lg font-black text-gray-900 tracking-tighter">{{ formatCurrency(tier.annualFee) }}</span>
                <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">YILLIK ÜYELİK</span>
              </div>
            </td>
            <td class="px-10 py-8">
              <div class="grid grid-cols-2 gap-x-8 gap-y-3">
                <div v-for="l in [{c:'bg-green-500', t:'İlan', v:tier.listingLimit}, {c:'bg-blue-500', t:'API', v:tier.apiRatePerMin + '/dk'}, {c:'bg-amber-500', t:'Excel', v:tier.excelBatchLimit}]" :key="l.t" class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="l.c" />
                  <span class="text-[10px] font-black text-gray-400 uppercase">{{ l.t }}: <span class="text-gray-900 ml-1">{{ l.v }}</span></span>
                </div>
              </div>
            </td>
            <td class="px-10 py-8">
              <div class="flex items-center gap-6">
                <div class="flex flex-col">
                  <span class="text-base font-black text-gray-900">%{{ (tier.roiRate * 100).toFixed(0) }}</span>
                  <span class="text-[8px] font-black text-gray-400 uppercase mt-0.5">MAKS ROI</span>
                </div>
                <div class="h-10 w-[1px] bg-neutral-100" />
                <div class="flex flex-col">
                  <span class="text-base font-black text-indigo-600">{{ tier.xpMultiplier }}X</span>
                  <span class="text-[8px] font-black text-gray-400 uppercase mt-0.5">XP ÇARPANI</span>
                </div>
              </div>
            </td>
            <td class="px-10 py-8 text-right">
              <button class="h-12 w-12 bg-white rounded-xl shadow-sm border border-neutral-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all flex items-center justify-center" @click.stop="$emit('edit', tier)">
                <PencilSquareIcon class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ChartBarIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ tiers: Array, loading: Boolean })
defineEmits(['edit'])

const sortedTiers = computed(() => {
  const order = { 'CORE': 1, 'PRIME': 2, 'ELITE': 3, 'APEX': 4 }
  return [...props.tiers].sort((a, b) => (order[a.tier] || 0) - (order[b.tier] || 0))
})

const getTierBadgeColor = (tierName) => {
  const colors = {
    'CORE': 'bg-slate-900 text-white',
    'PRIME': 'bg-blue-600 text-white',
    'ELITE': 'bg-purple-600 text-white',
    'APEX': 'bg-amber-500 text-white shadow-amber-200',
  }
  return colors[tierName] || 'bg-gray-200 text-gray-800'
}

const formatCurrency = (val) => {
  const v = typeof val === 'object' && val?.$numberDecimal ? parseFloat(val.$numberDecimal) : val
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v || 0)
}
</script>
