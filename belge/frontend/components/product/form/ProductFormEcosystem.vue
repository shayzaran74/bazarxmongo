<script setup lang="ts">
import { GlobeAltIcon } from '@heroicons/vue/24/outline'

interface Props {
  visibility?: 'PUBLIC' | 'PRIVATE_ECOSYSTEM'
  minMarketPrice?: number | null
  maxPurchasePerMember?: number | null
}

defineProps<Props>()
const emit = defineEmits(['update:visibility', 'update:minMarketPrice', 'update:maxPurchasePerMember'])
</script>

<template>
  <section
    id="ecosystem"
    class="bg-indigo-50/50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden"
  >
    <div class="p-6 border-b border-indigo-100/50 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="bg-indigo-100 p-2 rounded-lg">
          <GlobeAltIcon class="h-5 w-5 text-indigo-600" />
        </div>
        <h3 class="text-lg font-bold text-indigo-900">
          BazarX Private Ayarları
        </h3>
      </div>
    </div>
    <div class="p-6 space-y-6">
      <div>
        <label class="block text-xs font-black text-indigo-800 uppercase tracking-wider mb-2">Görünürlük</label>
        <div class="flex space-x-6 bg-white p-3 rounded-xl border border-indigo-100">
          <label class="inline-flex items-center cursor-pointer">
            <input 
              :checked="visibility === 'PUBLIC'"
              type="radio"
              class="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500" 
              @change="emit('update:visibility', 'PUBLIC')" 
            >
            <span class="ml-2 text-sm font-bold text-gray-700">Herkese Açık (Marketplace)</span>
          </label>
          <label class="inline-flex items-center cursor-pointer">
            <input 
              :checked="visibility === 'PRIVATE_ECOSYSTEM'"
              type="radio"
              class="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500" 
              @change="emit('update:visibility', 'PRIVATE_ECOSYSTEM')" 
            >
            <span class="ml-2 text-sm font-bold text-gray-700">Sadece Ekosistem</span>
          </label>
        </div>
      </div>

      <div
        v-if="visibility === 'PRIVATE_ECOSYSTEM'"
        class="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div>
          <label class="block text-xs font-black text-indigo-800 uppercase tracking-wider mb-2">Price Floor (Fiyat Tabanı - Örn: %80)</label>
          <div class="relative">
            <span class="absolute left-3 top-2 text-indigo-500 font-bold">₺</span>
            <input 
              :value="minMarketPrice || ''"
              type="number"
              step="0.01"
              class="w-full pl-8 pr-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-black font-bold" 
              placeholder="0.00"
              @input="e => emit('update:minMarketPrice', Number((e.target as HTMLInputElement).value))"
            >
          </div>
          <p class="mt-2 text-[10px] text-indigo-600 font-medium tracking-tight">
            Bayilerin bu fiyatın altında satış yapması engellenir.
          </p>
        </div>

        <div>
          <label class="block text-xs font-black text-indigo-800 uppercase tracking-wider mb-2">Smart Cap (Akıllı Kota)</label>
          <input 
            :value="maxPurchasePerMember || ''"
            type="number"
            class="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-black font-bold" 
            placeholder="0"
            @input="e => emit('update:maxPurchasePerMember', Number((e.target as HTMLInputElement).value))"
          >
          <p class="mt-2 text-[10px] text-indigo-600 font-medium tracking-tight">
            Tek bir bayinin alabileceği maksimum stok adedi.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
