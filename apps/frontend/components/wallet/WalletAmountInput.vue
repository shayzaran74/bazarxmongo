<template>
  <div class="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl font-sans italic space-y-8">
    <div class="flex items-center justify-between">
      <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">
        YÜKLENECEK MİKTAR (TL)
      </label>
      <div
        v-if="tierName"
        class="flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 rounded-full border border-blue-500/20"
      >
        <span class="text-[9px] font-black text-blue-500 uppercase tracking-widest">
          {{ tierName }} PROTOKOLÜ
        </span>
      </div>
    </div>

    <div class="relative flex items-center group">
      <div class="absolute left-8 z-10 text-3xl font-black text-slate-700 transition-colors group-focus-within:text-blue-500">
        ₺
      </div>
      <input
        :value="modelValue"
        type="number"
        min="1"
        class="w-full bg-slate-950 border border-slate-800 rounded-[2rem] pl-16 pr-8 py-8 text-4xl font-black text-slate-100 outline-none focus:ring-2 focus:ring-blue-600/50 transition-all shadow-inner"
        :class="{ 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]': isOverLimit }"
        @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
      >
    </div>

    <!-- Limit Warning -->
    <div
      v-if="isOverLimit" 
      class="p-6 bg-red-500/5 border border-red-500/20 rounded-[1.5rem] flex items-start gap-4 animate-pulse"
    >
      <span class="text-2xl mt-1">⚠️</span>
      <div>
        <p class="text-[11px] font-black text-red-500 uppercase tracking-tight leading-none mb-2">
          İŞLEM LİMİTİ İHLALİ
        </p>
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
          MEVCUT SEVİYENİZE GÖRE TEK SEFERDE EN FAZLA {{ limit }} TL YÜKLEME YAPABİLİRSİNİZ.
        </p>
      </div>
    </div>

    <!-- Quick Badges -->
    <div class="grid grid-cols-4 gap-4">
      <button
        v-for="amount in quickAmounts"
        :key="amount"
        type="button"
        :class="[
          'py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border',
          modelValue === amount
            ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/20 scale-105'
            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white hover:border-slate-600'
        ]"
        @click="$emit('update:modelValue', amount)"
      >
        +{{ amount }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
  isOverLimit: boolean
  limit: number
  tierName?: string
  quickAmounts: number[]
}>()

defineEmits(['update:modelValue'])
</script>
