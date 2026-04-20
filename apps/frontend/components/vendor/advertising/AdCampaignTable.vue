<!-- apps/frontend/pages/vendor/advertising/components/AdCampaignTable.vue -->
<script setup lang="ts">
import { 
  MegaphoneIcon, 
  TrashIcon, 
  GiftIcon,
  ListBulletIcon
} from '@heroicons/vue/24/outline'
import type { AdCampaign } from '~/types/advertising'

const props = defineProps<{
  campaigns: AdCampaign[]
  filteredAds: AdCampaign[]
  currentTab: string
}>()

const emit = defineEmits<{
  (e: 'update:currentTab', tab: string): void
  (e: 'toggleStatus', ad: AdCampaign): void
  (e: 'delete', id: string): void
  (e: 'openReport', ad: AdCampaign): void
  (e: 'openCreate'): void
}>()

const tabs = ['HEPSİ', 'AKTİF', 'DURAKLATILDI']

// Formatting helpers (copied or could be a shared util)
const formatNumber = (num: number) => new Intl.NumberFormat('tr-TR').format(num || 0)
const formatCurrency = (amount: number) => {
    return ((amount || 0) / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const formatDate = (date: string) => new Date(date).toLocaleDateString('tr-TR')

const getMetricTotal = (ad: AdCampaign, key: 'impressions' | 'clicks' | 'spend' | 'sales') => {
    return ad.metrics?.reduce((sum, m) => sum + (m[key] || 0), 0) || 0
}

const formatCTR = (ad: AdCampaign) => {
    const clicks = getMetricTotal(ad, 'clicks')
    const impressions = getMetricTotal(ad, 'impressions')
    if (impressions === 0) return '0.00'
    return ((clicks / impressions) * 100).toFixed(2)
}

const formatROAS = (ad: AdCampaign) => {
    const sales = getMetricTotal(ad, 'sales')
    const spend = getMetricTotal(ad, 'spend')
    if (spend === 0) return '0.00'
    return (sales / spend).toFixed(1)
}

const mapType = (type: string) => {
    const types: Record<string, string> = {
        'SPONSORED_PRODUCT': 'Sponsorlu Ürün',
        'SPONSORED_BRAND': 'Sponsorlu Marka',
        'SPONSORED_DISPLAY': 'Görüntülü'
    }
    return types[type] || type
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div class="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
      <div class="flex items-center gap-6">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ListBulletIcon class="w-5 h-5 text-indigo-600" />
          Kampanyalar
        </h2>
        <div class="flex bg-gray-100 p-1 rounded-xl">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${currentTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`"
            @click="emit('update:currentTab', tab)"
          >
            {{ tab }}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-4 text-sm text-gray-400 font-medium">
        <span>Toplam {{ filteredAds.length }} kampanya listeleniyor</span>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50/50">
          <tr>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Reklam</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kampanya</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tür</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Bütçe</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Gösterim</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Tıklama</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">CTR</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Harcama</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right font-bold text-indigo-700">ROAS</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">İşlem</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="ad in filteredAds" :key="ad.id" class="hover:bg-gray-50/80 transition-colors group">
            <td class="px-6 py-4">
              <template v-if="ad.status === 'PENDING'">
                <span class="px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 rounded-lg">Onay Bekliyor</span>
              </template>
              <template v-else-if="ad.status === 'REJECTED'">
                <span class="px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 rounded-lg" :title="ad.rejectionReason">Reddedildi</span>
              </template>
              <template v-else>
                <button
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="ad.status === 'ENABLED' ? 'bg-indigo-600' : 'bg-gray-200'"
                  @click="emit('toggleStatus', ad)"
                >
                  <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" :class="ad.status === 'ENABLED' ? 'translate-x-5' : 'translate-x-0'" />
                </button>
              </template>
            </td>
            <td class="px-6 py-4">
              <div class="flex -space-x-2">
                <img
                  v-for="p in (ad.products || []).slice(0, 3)"
                  :key="p.id"
                  :src="p.product?.image"
                  class="w-8 h-8 rounded-lg border-2 border-white object-cover"
                  :title="p.product?.name"
                >
                <div v-if="(ad.products || []).length > 3" class="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                  +{{ ad.products.length - 3 }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900 group-hover:text-indigo-700 truncate max-w-[200px]">{{ ad.name }}</div>
              <div class="text-[10px] text-gray-400 mt-0.5 flex flex-wrap gap-x-2">
                <span>Başlangıç: {{ formatDate(ad.startDate) }}</span>
                <span v-if="ad.endDate" class="text-orange-500">Bitiş: {{ formatDate(ad.endDate) }}</span>
                <span v-else class="text-indigo-500">Süresiz</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-[10px] font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">{{ mapType(ad.type) }}</span>
            </td>
            <td class="px-6 py-4 font-medium text-gray-700">₺{{ ad.budget }}</td>
            <td class="px-6 py-4 text-right tabular-nums text-gray-600">{{ formatNumber(getMetricTotal(ad, 'impressions')) }}</td>
            <td class="px-6 py-4 text-right tabular-nums text-gray-600">{{ formatNumber(getMetricTotal(ad, 'clicks')) }}</td>
            <td class="px-6 py-4 text-right tabular-nums text-gray-600">{{ formatCTR(ad) }}%</td>
            <td class="px-6 py-4 text-right tabular-nums font-medium text-gray-900">₺{{ formatCurrency(getMetricTotal(ad, 'spend')) }}</td>
            <td class="px-6 py-4 text-right tabular-nums font-bold text-indigo-700">{{ formatROAS(ad) }}x</td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  v-if="ad.adPackage"
                  @click="emit('openReport', ad)"
                  class="p-2 text-primary-500 hover:text-primary-700 bg-primary-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                >
                  <GiftIcon class="w-4 h-4" /> RAPOR
                </button>
                <button
                  class="p-2 text-gray-300 hover:text-red-600 transition-colors"
                  @click="emit('delete', ad.id)"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
          
          <tr v-if="filteredAds.length === 0">
            <td colspan="11" class="px-6 py-20 text-center">
              <div class="flex flex-col items-center gap-4">
                <div class="w-20 h-20 bg-gray-50 flex items-center justify-center rounded-full text-gray-200">
                  <MegaphoneIcon class="w-12 h-12" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900">Kampanya Bulunamadı</h3>
                  <p class="text-sm text-gray-500 max-w-xs mx-auto mt-1">
                    Filtrelemeye uygun kampanya bulunamadı veya henüz hiç reklam oluşturulmadı.
                  </p>
                </div>
                <button class="mt-2 text-indigo-600 font-bold hover:underline" @click="emit('openCreate')">İlk kampanyanı oluştur</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
