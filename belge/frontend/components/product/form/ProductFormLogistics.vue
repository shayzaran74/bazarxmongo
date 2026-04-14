<script setup lang="ts">
import { TruckIcon } from '@heroicons/vue/24/outline'

interface Props {
  requiresShipping: boolean
  weight: number
  volume: number
}

defineProps<Props>()
const emit = defineEmits(['update:requiresShipping', 'update:weight', 'update:volume'])
</script>

<template>
  <section
    id="logistics"
    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
  >
    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
      <div class="flex items-center space-x-3">
        <div class="bg-gray-100 p-2 rounded-lg">
          <TruckIcon class="h-5 w-5 text-gray-600" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">
          7. Lojistik ve Gönderim
        </h3>
      </div>
    </div>
    <div class="p-6 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <label
          class="flex items-center space-x-3 cursor-pointer bg-blue-50/50 px-6 py-4 rounded-2xl border border-blue-100 h-[58px]"
        >
          <input
            :checked="requiresShipping"
            type="checkbox"
            class="h-5 w-5 text-blue-600 rounded-lg"
            @change="e => emit('update:requiresShipping', (e.target as HTMLInputElement).checked)"
          >
          <div class="flex flex-col">
            <span class="text-sm font-black text-blue-900">Fiziksel Ürün</span>
            <span class="text-[10px] text-blue-600 tracking-wide">Kargo ile gönderilir</span>
          </div>
        </label>

        <div class="space-y-1">
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider">Ağırlık (kg)</label>
          <div class="relative">
            <input
              :value="weight"
              type="number"
              step="0.01"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="0.0"
              @input="e => emit('update:weight', Number((e.target as HTMLInputElement).value))"
            >
            <span class="absolute right-3 top-3.5 text-[10px] font-bold text-gray-400">KG</span>
          </div>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-black text-gray-500 uppercase tracking-wider">Hacim (Desi)</label>
          <div class="relative">
            <input
              :value="volume"
              type="number"
              step="0.01"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="0.0"
              @input="e => emit('update:volume', Number((e.target as HTMLInputElement).value))"
            >
            <span class="absolute right-3 top-3.5 text-[10px] font-bold text-gray-400">DESİ</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
