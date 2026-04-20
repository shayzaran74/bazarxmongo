<template>
  <div class="px-8 py-6 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center gap-6 shrink-0 font-sans italic">
    <div class="mr-auto">
      <div class="flex items-center gap-2">
        <span class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">EYE OF PROVIDENCE</span>
        <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      </div>
      <span class="text-[9px] text-slate-700 font-bold uppercase tracking-widest">GHOST MODE AKTİF // TÜM VERİLER KAYDEDİLİYOR</span>
    </div>

    <div class="flex items-center gap-3">
      <button
        class="px-6 py-3 bg-slate-900 hover:bg-blue-600 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest rounded-xl transition-all border border-slate-800 hover:border-blue-500 shadow-xl active:scale-95"
        @click="$emit('action', 'system')"
      >
        💬 SİSTEM MESAJI
      </button>
      <button
        class="px-6 py-3 bg-slate-900 hover:bg-amber-600 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest rounded-xl transition-all border border-slate-800 hover:border-amber-500 shadow-xl active:scale-95"
        @click="$emit('action', 'warning')"
      >
        ⚠️ DİSİPLİN UYARISI
      </button>
      <button
        v-if="!isFrozen"
        class="px-6 py-3 bg-slate-900 hover:bg-red-600 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest rounded-xl transition-all border border-slate-800 hover:border-red-500 shadow-xl active:scale-95"
        @click="$emit('action', 'freeze')"
      >
        🧊 SOHBETİ DONDUR
      </button>
      <button
        v-else
        class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black text-white uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95 shadow-emerald-900/20"
        @click="$emit('action', 'unfreeze')"
      >
        ✅ PROTOKOLÜ AKTİF ET
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isFrozen: boolean
}>()

defineEmits(['action'])
</script>
