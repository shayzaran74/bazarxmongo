<template>
  <div class="overflow-x-auto text-[10px]">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-gray-50/50 border-b border-gray-100">
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mağaza / Görsel</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Reklam Alanı</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Hedef Şehirler</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Durum</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">İşlemler</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="banner in banners" :key="banner.id" class="hover:bg-indigo-50/30 transition-colors group">
          <td class="px-8 py-5">
            <div class="flex items-center gap-4">
              <div class="w-20 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                <img :src="banner.imageUrl" class="w-full h-full object-cover">
              </div>
              <div>
                <div class="text-sm font-black text-gray-900">{{ banner.vendor?.businessName }}</div>
                <div class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  Şablon: {{ banner.template || 'Standart' }}
                </div>
              </div>
            </div>
          </td>
          <td class="px-8 py-5 text-center">
            <span class="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg border border-amber-100 uppercase">
              {{ formatBannerType(banner.type) }}
            </span>
          </td>
          <td class="px-8 py-5 text-center">
            <div class="text-[10px] text-gray-600 font-bold max-w-[200px] mx-auto line-clamp-2">
              {{ (banner.targetCities || []).join(', ') || 'Tüm Türkiye' }}
            </div>
          </td>
          <td class="px-8 py-5 text-center">
            <span :class="getStatusClass(banner.status)" class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
              {{ getStatusLabel(banner.status) }}
            </span>
          </td>
          <td class="px-8 py-5 text-right">
            <div class="flex items-center justify-end gap-2">
              <a
                :href="banner.imageUrl"
                target="_blank"
                class="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm"
              >
                <PhotoIcon class="w-4 h-4" />
              </a>
              <button
                v-if="banner.status === 'PENDING'"
                class="w-8 h-8 rounded-xl bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                @click="$emit('update-status', { id: banner.id, status: 'ENABLED' })"
              >
                <CheckCircleIcon class="w-4 h-4" />
              </button>
              <button
                v-if="banner.status === 'PENDING'"
                class="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                @click="$emit('reject', banner)"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="banners.length === 0">
          <td colspan="5" class="px-8 py-20 text-center">
            <div class="flex flex-col items-center gap-4">
              <div class="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
                <PhotoIcon class="w-8 h-8 text-gray-300" />
              </div>
              <p class="text-sm font-bold text-gray-400">Onay bekleyen banner reklam bulunamadı.</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { 
  PhotoIcon, 
  CheckCircleIcon, 
  XMarkIcon 
} from '@heroicons/vue/24/outline'

defineProps({
  banners: {
    type: Array,
    required: true
  }
})

defineEmits(['reject', 'update-status'])

const formatBannerType = (type) => {
  if (type === 1) return 'KATEGORİ SIDEBAR'
  if (type === 2) return 'ÜRÜN BANNERS'
  return 'ARAMA SIDEBAR'
}

const getStatusLabel = (status) => {
  const labels = {
    'PENDING': 'ONAY BEKLİYOR',
    'ENABLED': 'AKTİF',
    'PAUSED': 'DURAKLATILDI',
    'REJECTED': 'REDDEDİLDİ',
    'COMPLETED': 'TAMAMLANDI'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-orange-50 text-orange-600 border border-orange-100'
    case 'ENABLED': return 'bg-green-50 text-green-600 border border-green-100'
    case 'PAUSED': return 'bg-amber-50 text-amber-600 border border-amber-100'
    case 'REJECTED': return 'bg-red-50 text-red-600 border border-red-100'
    case 'COMPLETED': return 'bg-blue-50 text-blue-600 border border-blue-100'
    default: return 'bg-gray-100 text-gray-600'
  }
}
</script>
