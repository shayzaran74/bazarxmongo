<script setup lang="ts">
import { CurrencyDollarIcon } from '@heroicons/vue/24/outline'

interface Props {
  price: number
  stock: number
  dailyLimit: number
  sku: string
  productId?: string | null
}

defineProps<Props>()
const emit = defineEmits(['update:price', 'update:stock', 'update:dailyLimit', 'update:sku'])
</script>

<template>
  <section
    id="listing"
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
  >
    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
      <div class="flex items-center space-x-3">
        <div class="bg-emerald-100 p-2 rounded-lg">
          <CurrencyDollarIcon class="h-5 w-5 text-emerald-600" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">
          6. Fiyat ve Günlük Limit
        </h3>
      </div>
      <span class="text-[10px] font-black tracking-widest text-orange-500 uppercase">Restoran'a Özel</span>
    </div>
    <div class="p-6 space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Satış Fiyatı *</label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-gray-400 font-bold">₺</span>
            <input
              :value="price"
              type="number"
              step="0.01"
              class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              @input="e => emit('update:price', Number((e.target as HTMLInputElement).value))"
            >
          </div>
        </div>
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Günlük Stok Limiti</label>
          <input
            :value="dailyLimit"
            type="number"
            class="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500"
            placeholder="0"
            @input="e => emit('update:dailyLimit', Number((e.target as HTMLInputElement).value))"
          >
          <p class="text-[10px] text-orange-500 mt-1">Günlük satış上限</p>
        </div>
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">SKU</label>
          <input
            :value="sku"
            type="text"
            :disabled="!!productId"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="WH-01-A"
            @input="e => emit('update:sku', (e.target as HTMLInputElement).value)"
          >
        </div>
      </div>
    </div>
  </section>
</template>