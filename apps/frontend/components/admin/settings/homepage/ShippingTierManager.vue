<template>
  <div class="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-8">
    <div class="p-6 border-b border-gray-100 bg-gray-50/50">
      <h2 class="text-lg font-black text-gray-900 flex items-center italic uppercase leading-none">
        <TruckIcon class="h-5 w-5 mr-2 text-indigo-600" />
        Kargo <span class="text-indigo-600 ml-1">Baremleri</span>
      </h2>
    </div>

    <div class="p-8 space-y-4">
      <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2 mb-4 leading-relaxed">
        Tanımlanan baremler dışında kalan tüm siparişler için kargo ücreti <span class="text-green-600 font-black">0 TL (ÜCRETSİZ)</span> olarak hesaplanacaktır.
      </p>

      <div v-for="(tier, index) in modelValue" :key="index" class="flex flex-col md:flex-row items-center gap-4 bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 group transition-all hover:bg-white hover:border-indigo-100">
        <div class="flex-1 w-full space-y-1">
          <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Min. Tutar (TL)</label>
          <input v-model.number="tier.min" type="number" class="w-full px-4 py-3 bg-white border border-transparent rounded-xl text-sm font-bold focus:border-indigo-500 outline-none shadow-sm">
        </div>
        <div class="flex-1 w-full space-y-1">
          <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Maks. Tutar (TL)</label>
          <input v-model.number="tier.max" type="number" class="w-full px-4 py-3 bg-white border border-transparent rounded-xl text-sm font-bold focus:border-indigo-500 outline-none shadow-sm">
        </div>
        <div class="flex-1 w-full space-y-1">
          <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Kargo Ücreti (TL)</label>
          <input v-model.number="tier.cost" type="number" class="w-full px-4 py-3 bg-white border border-transparent rounded-xl text-sm font-bold focus:border-indigo-500 outline-none shadow-sm">
        </div>
        <button class="mt-4 md:mt-5 p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" @click="$emit('remove', index)">
          <TrashIcon class="h-5 w-5" />
        </button>
      </div>

      <button 
        class="w-full py-5 border-2 border-dashed border-gray-100 rounded-[24px] text-xs font-black text-gray-400 uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
        @click="$emit('add')"
      >
        <PlusIcon class="h-5 w-5" /> YENİ BAREM EKLE
      </button>
    </div>
  </div>
</template>

<script setup>
import { TruckIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'

defineProps({ modelValue: Array })
defineEmits(['add', 'remove'])
</script>
