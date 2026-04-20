<template>
  <div class="space-y-8 italic">
    <div v-if="selectedEco" class="bg-white rounded-[3.5rem] border border-neutral-100 p-10 shadow-sm space-y-10 sticky top-8">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-black text-gray-900 tracking-tightest uppercase italic">{{ selectedEco.name }}</h2>
        <button class="w-10 h-10 bg-neutral-50 text-gray-400 hover:text-black rounded-xl transition-all shadow-inner flex items-center justify-center font-black" @click="$emit('deselect')">&times;</button>
      </div>

      <div class="space-y-6">
        <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2 italic">EKOSİSTEM ÜYELERİ</h3>
        <div class="divide-y divide-neutral-50">
          <div v-for="member in selectedEco.Members" :key="member.id" class="py-5 flex items-center justify-between group/member">
            <div class="flex flex-col">
              <span class="text-[13px] font-black text-gray-900 leading-tight uppercase italic group-hover/member:text-indigo-600 transition-colors">{{ member.businessName }}</span>
              <span class="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-60 italic">{{ member.tier || 'STANDART' }}</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex flex-col items-end">
                <span :class="getTrustScoreColor(member.trustScore)" class="text-sm font-black italic">{{ member.trustScore }}%</span>
                <span class="text-[7px] text-gray-300 font-black uppercase tracking-widest italic leading-none">SCORE</span>
              </div>
              <div class="flex gap-2">
                <button class="w-9 h-9 bg-neutral-50 rounded-xl hover:bg-black hover:text-white text-gray-400 transition-all flex items-center justify-center shadow-inner" title="SKORU DEĞIŞTIR" @click="$emit('override', member)">
                  <WrenchScrewdriverIcon class="h-4 w-4" />
                </button>
                <button class="w-9 h-9 bg-neutral-50 rounded-xl hover:bg-rose-600 hover:text-white text-gray-400 transition-all flex items-center justify-center shadow-inner" title="ÜYELIĞI SIL" @click="$emit('remove', member.id)">
                  <TrashIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-6 border-t border-neutral-50">
         <button class="w-full h-16 bg-neutral-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-neutral-100 flex items-center justify-center gap-4 active:scale-95" @click="$emit('logs')">
            <ShieldCheckIcon class="h-5 w-5" />
            AUDIT LOGLARI →
         </button>
      </div>
    </div>

    <!-- Quick Actions if no selection -->
    <div v-else class="bg-indigo-600 rounded-[3.5rem] p-10 text-white shadow-2xl space-y-8 italic relative overflow-hidden group">
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      <div class="w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-2xl"><BoltIcon class="h-8 w-8 text-white" /></div>
      <div>
        <h3 class="font-black text-2xl leading-tight uppercase tracking-tightest">WATCHTOWER <span class="text-indigo-200">HAZIR</span></h3>
        <p class="text-indigo-100/60 text-[11px] font-black leading-relaxed mt-4 uppercase tracking-widest italic">EKOSİSTEM BAZLI DENETİM YAPMAK İÇİN LİSTEDEN BİR MARKA SEÇİN.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { WrenchScrewdriverIcon, TrashIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/vue/24/solid'

defineProps({ selectedEco: Object })
defineEmits(['deselect', 'override', 'remove', 'logs'])

const getTrustScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-500'
    if (score >= 70) return 'text-blue-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-rose-500'
}
</script>
