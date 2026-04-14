<script setup lang="ts">
import { CurrencyDollarIcon } from '@heroicons/vue/24/outline'

interface Props {
  price: number
  compareAtPrice: number
  costPerItem: number
  stock: number
  sku: string
  trackInventory: boolean
  continueSellingOutOfStock: boolean
  productId?: string | null
}

defineProps<Props>()
const emit = defineEmits([
  'update:price',
  'update:compareAtPrice',
  'update:costPerItem',
  'update:stock',
  'update:sku',
  'update:trackInventory',
  'update:continueSellingOutOfStock'
])
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
          6. Listeleme ve Envanter Bilgileri
        </h3>
      </div>
      <span class="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Satıcıya Özel</span>
    </div>
    <div class="p-6 space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Trendyx Satış Fiyatı *</label>
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
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Liste / Üst Çizili Fiyat</label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-gray-400 font-bold">₺</span>
            <input
              :value="compareAtPrice"
              type="number"
              step="0.01"
              class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              @input="e => emit('update:compareAtPrice', Number((e.target as HTMLInputElement).value))"
            >
          </div>
        </div>
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Maliyet (Sadece Siz Görürsünüz)</label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-gray-400 font-bold">₺</span>
            <input
              :value="costPerItem"
              type="number"
              step="0.01"
              class="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              @input="e => emit('update:costPerItem', Number((e.target as HTMLInputElement).value))"
            >
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Stok Miktarı *</label>
          <input
            :value="stock"
            type="number"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            @input="e => emit('update:stock', Number((e.target as HTMLInputElement).value))"
          >
        </div>
        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">SKU (Satıcı Stok Kodu)</label>
          <input
            :value="sku"
            type="text"
            :disabled="!!productId"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Örn: WH-01-A"
            @input="e => emit('update:sku', (e.target as HTMLInputElement).value)"
          >
        </div>
        <div class="flex flex-col justify-center space-y-2">
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              :checked="trackInventory"
              type="checkbox"
              class="h-5 w-5 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500"
              @change="e => emit('update:trackInventory', (e.target as HTMLInputElement).checked)"
            >
            <span class="text-sm font-bold text-gray-700 group-hover:text-blue-600">Envanter Takibi Yap</span>
          </label>
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              :checked="continueSellingOutOfStock"
              type="checkbox"
              class="h-5 w-5 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500"
              @change="e => emit('update:continueSellingOutOfStock', (e.target as HTMLInputElement).checked)"
            >
            <span class="text-sm font-bold text-gray-700 group-hover:text-blue-600">Stok Biterse de Satışa Devam</span>
          </label>
        </div>
      </div>
    </div>
  </section>
</template>
