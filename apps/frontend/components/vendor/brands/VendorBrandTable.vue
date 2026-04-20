<template>
  <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <th class="px-8 py-5">Marka & Tür</th>
            <th class="px-8 py-5">Başvuru Tarihi</th>
            <th class="px-8 py-5">Timeline / Aşamalar</th>
            <th class="px-8 py-5">Mevcut Durum</th>
            <th class="px-8 py-5 text-right">Belgeler</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="loading">
            <td colspan="5" class="px-8 py-12 text-center text-gray-400">Yükleniyor...</td>
          </tr>
          <tr
            v-for="brand in brands"
            :key="brand.id"
            class="hover:bg-gray-50/50 transition-all group"
          >
            <td class="px-8 py-6">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center overflow-hidden">
                  <img v-if="brand.image || brand.icon" :src="resolveImageUrl(brand.image || brand.icon)" class="w-full h-full object-contain">
                  <DocumentTextIcon v-else class="h-6 w-6 text-gray-300" />
                </div>
                <div>
                  <p class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ brand.name }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{{ getApplicationTypeLabel(brand.applicationType) }}</p>
                </div>
              </div>
            </td>
            <td class="px-8 py-6">
              <p class="text-xs font-bold text-gray-600">{{ formatDate(brand.createdAt) }}</p>
            </td>
            <td class="px-8 py-6">
              <!-- Inline Timeline -->
              <div class="flex items-center gap-1">
                <div 
                  v-for="(step, idx) in 3" 
                  :key="idx" 
                  class="flex items-center"
                >
                  <div 
                    class="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black"
                    :class="getStepClass(brand, idx)"
                  >
                    <CheckIcon v-if="isStepPassed(brand, idx)" class="h-3 w-3" />
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <div 
                    v-if="idx < 2" 
                    class="w-4 h-0.5" 
                    :class="isStepPassed(brand, idx) ? 'bg-green-500' : 'bg-gray-100'"
                  />
                </div>
              </div>
              <p class="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-wide">
                {{ getTimelineStatus(brand) }}
              </p>
            </td>
            <td class="px-8 py-6">
              <span 
                :class="getStatusBadgeClass(brand.status, brand.additionalDocsRequestedAt)"
                class="px-3 py-1.5 rounded-xl text-[10px] font-bold border shadow-sm"
              >
                {{ getStatusLabel(brand.status, brand.additionalDocsRequestedAt) }}
              </span>
            </td>
            <td class="px-8 py-6 text-right">
              <div class="flex justify-end gap-2">
                <button
                  v-if="brand.documentUrl"
                  class="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Belgeyi Görüntüle"
                  @click="openDoc(brand.documentUrl)"
                >
                  <ArrowTopRightOnSquareIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && brands.length === 0">
            <td colspan="5" class="px-8 py-16 text-center">
              <div class="max-w-xs mx-auto">
                <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                  <ArchiveBoxIcon class="h-8 w-8 text-gray-300" />
                </div>
                <h3 class="text-gray-900 font-bold mb-1">Marka Başvurunuz Yok</h3>
                <p class="text-xs text-gray-500">Henüz bir marka temsilciliği veya mülkiyeti için başvuruda bulunmadınız.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { 
  DocumentTextIcon, 
  CheckIcon, 
  ArrowTopRightOnSquareIcon, 
  ArchiveBoxIcon 
} from '@heroicons/vue/24/outline'
import { 
  getStatusBadgeClass, 
  getStatusLabel, 
  getApplicationTypeLabel 
} from '~/utils/brand-helpers'

const props = defineProps({
  brands: Array,
  loading: Boolean
})

const { resolveImageUrl } = useAppImage()

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR')
}

const openDoc = (url) => {
  window.open(resolveImageUrl(url), '_blank')
}

// Timeline Helpers
const getStepClass = (brand, idx) => {
  if (brand.status === 'APPROVED') return 'bg-green-500 text-white'
  if (brand.status === 'REJECTED') return 'bg-red-500 text-white'
  
  if (idx === 0) return 'bg-green-500 text-white' // Başvuru Alındı her zaman yeşildir
  if (idx === 1) return brand.status === 'PENDING' ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'
  return 'bg-gray-100 text-gray-400'
}

const isStepPassed = (brand, idx) => {
  if (brand.status === 'APPROVED') return true
  return idx === 0
}

const getTimelineStatus = (brand) => {
  if (brand.status === 'APPROVED') return 'Süreç Tamamlandı'
  if (brand.status === 'REJECTED') return 'Reddedildi'
  if (brand.status === 'PENDING') {
    return brand.additionalDocsRequestedAt ? 'Belge Revizyonu Gerekli' : 'İnceleme Aşamasında'
  }
  return 'Süreç Başlatıldı'
}
</script>
