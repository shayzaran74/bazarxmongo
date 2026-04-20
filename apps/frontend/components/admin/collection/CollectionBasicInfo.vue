<template>
  <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-10 space-y-8 font-sans italic">
    <div class="space-y-4">
      <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">KOLEKSİYON BAŞLIĞI</label>
      <input
        v-model="modelValue.title"
        type="text"
        placeholder="ÖRN: 2026 YAZ KOLEKSİYONU"
        class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-lg font-black uppercase tracking-tight outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200"
      >
    </div>

    <div class="space-y-4">
      <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">STRATEJİK AÇIKLAMA</label>
      <textarea
        v-model="modelValue.description"
        rows="4"
        placeholder="KOLEKSİYONUN VİZYONU VE İÇERİĞİ HAKKINDA BİLGİ GİRİN..."
        class="w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-6 text-sm font-bold tracking-tight outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-400 placeholder:text-slate-800"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: any
}>()

defineEmits(['update:modelValue'])
</script>
