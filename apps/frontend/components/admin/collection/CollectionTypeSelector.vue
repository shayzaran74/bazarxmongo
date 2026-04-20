<template>
  <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-10 space-y-6 font-sans italic">
    <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">KOLEKSİYON ALGORİTMASI</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        type="button"
        class="flex flex-col gap-2 p-6 rounded-[2rem] border transition-all text-left group"
        :class="modelValue.type === 'Manual' ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-900/40' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'"
        @click="$emit('update:modelValue', { ...modelValue, type: 'Manual' })"
      >
        <span class="text-xs font-black uppercase tracking-widest">MANUEL PROTOKOL</span>
        <span class="text-[9px] font-bold uppercase tracking-widest opacity-60">Ürünleri bireysel olarak seçin ve yönetin</span>
      </button>

      <button
        type="button"
        class="flex flex-col gap-2 p-6 rounded-[2rem] border transition-all text-left group"
        :class="modelValue.type === 'Automatic' ? 'bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-900/40' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'"
        @click="$emit('update:modelValue', { ...modelValue, type: 'Automatic' })"
      >
        <span class="text-xs font-black uppercase tracking-widest">OTOMATİK ALGORİTMA</span>
        <span class="text-[9px] font-bold uppercase tracking-widest opacity-60">Kriterlere dayalı dinamik ürün eşleşmesi</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: any
}>()

defineEmits(['update:modelValue'])
</script>
