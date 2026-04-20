<template>
  <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-10 space-y-8 font-sans italic">
    <div class="flex items-center gap-3">
      <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">ARAMA MOTORU OPTİMİZASYONU</h3>
      <span class="text-[8px] font-black bg-blue-600/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full tracking-widest uppercase">SEO ENGINE</span>
    </div>

    <div class="space-y-6">
      <div class="space-y-4">
        <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">META BAŞLIK</label>
        <input
          v-model="modelValue.metaTitle"
          type="text"
          placeholder="SEO ODAKLI BAŞLIK GİRİN..."
          class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200"
        >
      </div>

      <div class="space-y-4">
        <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">META AÇIKLAMA</label>
        <textarea
          v-model="modelValue.metaDescription"
          rows="3"
          placeholder="ARAMA SONUÇLARINDA GÖRÜNECEK ÖZET BİLGİ..."
          class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-bold tracking-tight outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-400"
        />
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <label class="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">URL HANDLE</label>
          <span class="text-[8px] font-black text-slate-700 uppercase tracking-widest">OTOMATİK ÜRETİLDİ</span>
        </div>
        <div class="relative">
          <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] font-black">/collections/</span>
          <input
            v-model="modelValue.handle"
            type="text"
            placeholder="yaz-koleksiyonu"
            class="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-28 pr-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all text-blue-400"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: any
}>()

defineEmits(['update:modelValue'])
</script>
