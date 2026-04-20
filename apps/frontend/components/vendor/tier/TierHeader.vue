<script setup lang="ts">
const props = defineProps<{
  tierData: any
  commissionDisplay: { multi: boolean, cash?: string, barter?: string, rate?: number }
}>()
</script>

<template>
  <div class="p-8 flex items-center gap-6 text-white relative overflow-hidden group" :style="{ background: tierData?.bgGradient }">
    <!-- Animated background element -->
    <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    
    <div class="text-6xl filter drop-shadow-2xl animate-in zoom-in duration-500">
      {{ tierData?.icon }}
    </div>
    <div class="flex-1">
      <h3 class="text-3xl font-black italic tracking-tighter uppercase leading-none mb-1">
        {{ tierData?.nametr || tierData?.name }}
      </h3>
      <span class="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">SATICISINIZ</span>
    </div>
    <div class="bg-black/20 backdrop-blur-md px-6 py-4 rounded-[1.5rem] text-center border border-white/10">
      <template v-if="commissionDisplay.multi">
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between gap-4 min-w-[80px]">
             <span class="text-lg font-black italic">%{{ commissionDisplay.cash }}</span>
             <span class="text-[8px] font-black uppercase opacity-60">Nakit</span>
          </div>
          <div class="flex items-center justify-between gap-4">
             <span class="text-lg font-black italic">%{{ commissionDisplay.barter }}</span>
             <span class="text-[8px] font-black uppercase opacity-60">Barter</span>
          </div>
        </div>
      </template>
      <template v-else>
        <span class="block text-2xl font-black italic">%{{ commissionDisplay.rate }}</span>
        <span class="text-[8px] font-black uppercase opacity-60 tracking-widest">Komisyon Oranı</span>
      </template>
    </div>
  </div>
</template>
