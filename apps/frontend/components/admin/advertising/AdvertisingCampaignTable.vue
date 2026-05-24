<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-gray-50/50 border-b border-gray-100">
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mağaza / Kampanya</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Reklam Türü</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Bütçe</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Performans</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Durum</th>
          <th class="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">İşlemler</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="ad in campaigns" :key="ad.id" class="hover:bg-indigo-50/30 transition-colors group">
          <td class="px-8 py-5">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-white border border-gray-100 p-1 flex items-center justify-center shrink-0">
                <img :src="ad.vendor?.logoUrl || '/images/default-store.png'" class="w-full h-full object-contain rounded-xl">
              </div>
              <div>
                <div class="text-sm font-black text-gray-900 group-hover:text-indigo-700 transition-colors">{{ ad.vendor?.businessName || 'Bilinmeyen Mağaza' }}</div>
                <div class="text-[11px] font-bold text-gray-500">{{ ad.name }}</div>
              </div>
            </div>
          </td>
          <td class="px-8 py-5 text-center">
            <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
              {{ formatType(ad.type) }}
            </span>
          </td>
          <td class="px-8 py-5 text-center">
            <div class="text-sm font-black text-gray-900">₺{{ (ad.budget || 0).toLocaleString('tr-TR') }}</div>
            <div class="text-[11px] font-bold text-gray-400">{{ formatTypeLabel(ad.type) }}</div>
          </td>
          <td class="px-8 py-5 text-center">
            <div class="flex items-center justify-center gap-6">
              <div class="text-center">
                <div class="text-xs font-black text-gray-900">{{ ad.impressions || 0 }}</div>
                <div class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Gösterim</div>
              </div>
              <div class="text-center border-l border-gray-100 pl-6">
                <div class="text-xs font-black text-gray-900">{{ ad.clicks || 0 }}</div>
                <div class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Tıklama</div>
              </div>
            </div>
          </td>
          <td class="px-8 py-5 text-center">
            <span :class="getStatusClass(ad.status)" class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
              {{ getStatusLabel(ad.status) }}
            </span>
          </td>
          <td class="px-8 py-5 text-right">
            <div class="flex items-center justify-end gap-2">
              <button
                class="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                @click="$emit('view', ad)"
              >
                <EyeIcon class="w-4 h-4" />
              </button>
              <button
                v-if="ad.status === 'PENDING'"
                class="w-8 h-8 rounded-xl bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                @click="$emit('update-status', { id: ad.id, status: 'ENABLED' })"
              >
                <CheckCircleIcon class="w-4 h-4" />
              </button>
              <button
                v-if="ad.status === 'PENDING'"
                class="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                @click="$emit('reject', ad)"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
              <button
                v-if="ad.status === 'ENABLED'"
                class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                @click="$emit('update-status', { id: ad.id, status: 'PAUSED' })"
              >
                <PauseIcon class="w-4 h-4" />
              </button>
              <button
                v-if="ad.status === 'PAUSED'"
                class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                @click="$emit('update-status', { id: ad.id, status: 'ENABLED' })"
              >
                <PlayIcon class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="campaigns.length === 0">
          <td colspan="6" class="px-8 py-20 text-center">
            <div class="flex flex-col items-center gap-4">
              <div class="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
                <MegaphoneIcon class="w-8 h-8 text-gray-300" />
              </div>
              <p class="text-sm font-bold text-gray-400">Aradığınız kriterlerde kampanya bulunamadı.</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { 
  EyeIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  PauseIcon, 
  PlayIcon,
  MegaphoneIcon
} from '@heroicons/vue/24/outline'

defineProps({
  campaigns: {
    type: Array,
    required: true
  }
})

defineEmits(['view', 'reject', 'update-status'])

const formatType = (type) => {
  const types = {
    'FIXED': 'SABİT',
    'CPM': 'BİN GÖSTERİM BAŞI',
    'CPC': 'TIKLAMA BAŞI',
    'SPONSORED_PRODUCT': 'SPONSORLU ÜRÜN',
    'SPONSORED_BRAND': 'SPONSORLU MARKA',
    'SPONSORED_DISPLAY': 'GÖRÜNTÜLÜ',
    'REWARD_DISTRIBUTION': 'HEDİYE DAĞITIMI (AD-SWAP)',
    'SAMPLING': 'SAMPLING (AD-SWAP)'
  }
  return types[type] || type
}

const formatTypeLabel = (type) => {
  const labels = {
    'FIXED': 'Sabit Ödeme',
    'CPM': 'Maliyet / 1K Gösterim',
    'CPC': 'Maliyet / Tıklama',
    'SPONSORED_PRODUCT': 'Sponsorlu Ürün',
    'SPONSORED_BRAND': 'Sponsorlu Marka',
    'SPONSORED_DISPLAY': 'Görüntülü',
    'REWARD_DISTRIBUTION': 'Hediye Dağıtımı (Ad-Swap)',
    'SAMPLING': 'Sampling (Ad-Swap)'
  }
  return labels[type] || ''
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
