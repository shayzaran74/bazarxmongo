<template>
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10 bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-xl shadow-2xl font-sans italic">
    <div class="space-y-4">
      <div class="flex items-center gap-4">
        <h2 class="text-3xl md:text-5xl font-black text-slate-100 uppercase tracking-tightest leading-none flex items-center gap-4">
          🔭 WATCHTOWER
          <span class="text-[9px] font-black bg-blue-600/10 text-blue-500 border border-blue-500/20 px-4 py-2 rounded-full tracking-[0.3em] shadow-lg">GHOST PROTOCOL</span>
        </h2>
      </div>
      <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">AKTİF TİCARİ SOHBETLERİN GİZLİ DENETİM VE MODERASYON ÜSSÜ</p>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <!-- Socket Status -->
      <div
        class="flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all"
        :class="isConnected ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400'"
      >
        <span
          class="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]"
          :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
        />
        <span class="text-[9px] font-black uppercase tracking-widest">{{ isConnected ? 'SOCKET AKTİF' : 'BAĞLANTI KESİLDİ' }}</span>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
        <button
          class="flex items-center gap-2 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
          :class="sortByRisk ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'"
          @click="$emit('toggleSortByRisk')"
        >
          ⚖️ RİSK SIRALAMASI
        </button>
        <button
          class="flex items-center gap-2 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
          :class="filterRisky ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-500 hover:text-slate-300'"
          @click="$emit('toggleRiskyFilter')"
        >
          🚨 KRİTİK FİLTRE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isConnected: boolean
  sortByRisk: boolean
  filterRisky: boolean
}>()

defineEmits(['toggleSortByRisk', 'toggleRiskyFilter'])
</script>
