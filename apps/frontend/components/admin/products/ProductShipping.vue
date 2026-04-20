<template>
  <div class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
    <h3 class="text-sm font-black text-gray-900 uppercase italic mb-6">Kargo & <span class="text-indigo-600">Lojistik</span></h3>
    
    <div class="space-y-6">
      <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <input v-model="modelValue.requiresShipping" type="checkbox" class="w-4 h-4 rounded border-gray-300 text-indigo-600">
        <span class="text-[10px] font-black text-gray-900 uppercase tracking-widest">Bu fiziksel bir üründür</span>
      </div>

      <div v-if="modelValue.requiresShipping" class="space-y-1">
        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ürün Ağırlığı (KG)</label>
        <div class="relative">
          <input v-model.number="modelValue.weight" type="number" step="0.01" class="w-full pr-12 pl-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-black focus:bg-white focus:border-indigo-500 outline-none">
          <span class="absolute right-4 top-3 text-[10px] font-black text-gray-400 uppercase">KG</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ modelValue: Object })
</script>
