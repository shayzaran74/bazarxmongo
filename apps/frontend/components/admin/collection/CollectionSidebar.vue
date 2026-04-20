<template>
  <div class="space-y-6 font-sans italic">
    <!-- Status Card -->
    <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-8 space-y-6">
      <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">KAYIT DURUMU</h3>
      <div class="space-y-4">
        <select
          v-model="modelValue.isPublished"
          class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 :ring-blue-500 transition-all"
          :class="modelValue.isPublished ? 'text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'text-amber-500'"
        >
          <option :value="true">● YAYINDA / AKTİF</option>
          <option :value="false">○ TASLAK / GİZLİ</option>
        </select>
      </div>
    </div>

    <!-- Image Card -->
    <div class="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 p-8 space-y-6">
      <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">KAPAK GÖRSELİ</h3>
      
      <div v-if="modelValue.image" class="group relative aspect-square rounded-[2rem] overflow-hidden border border-slate-800">
        <img
          :src="modelValue.image"
          class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
        >
        <div class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
           <button
             class="px-6 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl active:scale-95 transition-all"
             @click="$emit('update:modelValue', { ...modelValue, image: '' })"
           >
             GÖRSELİ SİL
           </button>
        </div>
      </div>

      <div v-else class="aspect-square rounded-[2rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-4 bg-slate-950/20">
         <span class="text-3xl opacity-20">🖼️</span>
         <p class="text-[8px] font-black text-slate-600 uppercase tracking-widest px-10 text-center">İÇERİK İÇİN BİR KAPAK GÖRSEL URL'Sİ GİRİN</p>
      </div>

      <div class="space-y-4">
        <label class="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-1">GÖRSEL KAYNAK (URL)</label>
        <input
          v-model="modelValue.image"
          type="text"
          placeholder="https://..."
          class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[9px] font-black tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-400"
        >
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
