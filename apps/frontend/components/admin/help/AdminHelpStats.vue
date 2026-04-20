<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans italic uppercase">
    <div class="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 shadow-2xl backdrop-blur-md group hover:bg-slate-800/50 transition-all">
      <span class="text-slate-500 text-[10px] font-black tracking-[0.3em]">TOPLAM MAKALE</span>
      <div class="text-4xl font-black mt-2 text-slate-200 tracking-tightest">
        {{ articleCount }}
      </div>
    </div>
    <div class="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 shadow-2xl backdrop-blur-md group hover:bg-slate-800/50 transition-all">
      <span class="text-slate-500 text-[10px] font-black tracking-[0.3em]">AKTİF KATEGORİLER</span>
      <div class="text-4xl font-black mt-2 text-slate-200 tracking-tightest">
        {{ categoryCount }}
      </div>
    </div>
    <div class="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 shadow-2xl backdrop-blur-md group hover:bg-slate-800/50 transition-all">
      <span class="text-slate-500 text-[10px] font-black tracking-[0.3em]">TOPLAM OKUNMA</span>
      <div class="text-4xl font-black mt-2 text-blue-400 tracking-tightest">
        {{ totalViews }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  articleCount: number
  categoryCount: number
  totalViews: number
}>()
</script>
