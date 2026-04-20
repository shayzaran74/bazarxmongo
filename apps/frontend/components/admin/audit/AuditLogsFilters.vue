<template>
  <div class="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans italic">
    <!-- Action Filter -->
    <div class="lg:col-span-3 space-y-4">
      <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">İŞLEM PROTOKOLÜ</label>
      <div class="relative group">
        <select
          v-model="modelValue.action"
          class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
        >
          <option value="">TÜM SİSTEM KAYITLARI</option>
          <option
            v-for="action in actionTypes"
            :key="action"
            :value="action"
          >
            {{ action }}
          </option>
        </select>
        <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-blue-500">▼</span>
      </div>
    </div>

    <!-- Search Input -->
    <div class="lg:col-span-7 space-y-4">
      <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">İSTİHBARAT TARAMASI (NEDEN, IP, ADMIN)</label>
      <div class="relative group">
        <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">🔍</span>
        <input
          v-model="modelValue.search"
          type="text"
          placeholder="ANAHTAR KELİME VEYA KİMLİK GİRİN..."
          class="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-700"
          @keyup.enter="$emit('search')"
        >
      </div>
    </div>

    <!-- Action Button -->
    <div class="lg:col-span-2 flex items-end pb-1">
      <button
        class="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
        @click="$emit('search')"
      >
        SİSTEMİ TARA
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: {
    action: string
    search: string
  }
  actionTypes: string[]
}>()

defineEmits(['update:modelValue', 'search'])
</script>
