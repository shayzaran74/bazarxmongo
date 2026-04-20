<template>
  <div
    class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
    @click="navigateTo('/surplus/' + item.id)"
  >
    <div class="relative h-48 overflow-hidden">
      <img
        :src="getMainImage(item)"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        :alt="item.title"
      >
      <div class="absolute top-3 left-3">
        <span class="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-600 shadow-lg">
          {{ item.category }}
        </span>
      </div>
      <div v-if="item.status === 'active'" class="absolute top-3 right-3">
        <div class="flex items-center gap-1 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          <div class="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          <span>Aktif</span>
        </div>
      </div>
    </div>

    <div class="p-4">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
          <img v-if="item.company?.logoUrl" :src="item.company.logoUrl" class="w-full h-full object-cover">
          <span v-else class="text-xs font-bold">{{ item.company?.name?.charAt(0) || 'B' }}</span>
        </div>
        <span class="text-xs font-medium text-gray-500 truncate">{{ item.company?.name || 'Firma' }}</span>
      </div>

      <h3 class="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary-600 transition-colors">
        {{ item.title }}
      </h3>

      <div class="grid grid-cols-2 gap-2 mb-3">
        <div class="bg-gray-50 rounded-lg p-2 border border-gray-100">
          <p class="text-xs font-bold text-gray-400 uppercase mb-0.5">Miktar</p>
          <p class="text-sm font-bold text-gray-900">{{ item.quantity }} {{ item.unit }}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-2 border border-gray-100">
          <p class="text-xs font-bold text-gray-400 uppercase mb-0.5">Birim Fiyat</p>
          <p class="text-sm font-bold text-primary-600 truncate">
            {{ item.unitPrice ? formatPrice(item.unitPrice) : 'Teklif' }}
          </p>
        </div>
        <div class="bg-gray-50 rounded-lg p-2 border border-gray-100 col-span-2">
          <p class="text-xs font-bold text-gray-400 uppercase mb-0.5">Konum</p>
          <p class="text-sm font-bold text-gray-900 truncate">{{ item.location || '—' }}</p>
        </div>
      </div>

      <div class="flex items-center justify-center w-full bg-gray-50 hover:bg-primary-600 hover:text-white rounded-lg py-3 transition-all group/btn border border-gray-200 hover:border-primary-500">
        <span class="text-xs font-bold uppercase tracking-wide">Detayları İncele</span>
        <ArrowRightIcon class="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  item: Object,
  formatPrice: Function,
  getMainImage: Function
})
</script>
