<script setup lang="ts">
import { IdentificationIcon, QrCodeIcon, ExclamationCircleIcon, CheckIcon } from '@heroicons/vue/24/outline'
import type { Product } from '@barterborsa/shared-types'

interface Props {
  barcode: string
  modelCode: string
  productId?: string | null
  isBarcodeChecking: boolean
  foundCatalogProduct: Product | null
}

defineProps<Props>()
const emit = defineEmits(['update:barcode', 'update:modelCode'])
</script>

<template>
  <section
    id="identity"
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
  >
    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
      <div class="flex items-center space-x-3">
        <div class="bg-blue-100 p-2 rounded-lg">
          <IdentificationIcon class="h-5 w-5 text-blue-600" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">
          1. Kimlik ve Katalog Eşleşmesi
        </h3>
      </div>
      <span class="text-[10px] font-black tracking-widest text-blue-500 uppercase">Zorunlu</span>
    </div>
    <div class="p-6 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="relative">
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Barkod (GTIN) *</label>
          <div class="relative group">
            <input
              :value="barcode"
              type="text"
              :disabled="!!productId"
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
              placeholder="Barkod okutun veya yazın"
              @input="e => emit('update:barcode', (e.target as HTMLInputElement).value)"
            >
            <QrCodeIcon class="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
            <div
              v-if="isBarcodeChecking"
              class="absolute right-3 top-3.5"
            >
              <div class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          </div>
          <p
            v-if="!!productId"
            class="mt-2 text-[10px] text-amber-600 font-bold flex items-center"
          >
            <ExclamationCircleIcon class="h-3 w-3 mr-1" /> Barkod değiştirilemez
          </p>
          <div
            v-else-if="foundCatalogProduct"
            class="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center animate-bounce-subtle"
          >
            <span class="bg-green-500 text-white p-1 rounded-full mr-3">
              <CheckIcon class="h-3 w-3" />
            </span>
            <span class="text-xs text-green-700 font-bold">Katalogda eşleşen ürün bulundu! Bilgiler dolduruldu.</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Model Kodu (Üst Kimlik) *</label>
          <input
            :value="modelCode"
            type="text"
            required
            :disabled="!!productId"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
            placeholder="Örn: MK-12345"
            @input="e => emit('update:modelCode', (e.target as HTMLInputElement).value)"
          >
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}
@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
</style>
