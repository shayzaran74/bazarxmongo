<template>
  <div class="bg-white rounded-[4rem] border border-neutral-100 shadow-2xl overflow-hidden italic animate-in fade-in slide-in-from-bottom-10 duration-700">
    <div class="p-10 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/50">
      <div class="flex items-center gap-5">
        <div class="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-black/20 italic font-black">L</div>
        <h2 class="text-xl font-black text-gray-900 uppercase tracking-tightest leading-none italic">SİSTEM AUDIT LOGLARI <span class="text-indigo-600 block text-[10px] tracking-widest mt-1">WATCHTOWER DENETİMİ</span></h2>
      </div>
      <button class="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-[0.3em] transition-all bg-white px-6 py-3 rounded-xl shadow-sm border border-black/5" @click="$emit('close')">KAPAT PANELİ →</button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-white">
          <tr class="border-b border-neutral-50">
            <th v-for="h in headers" :key="h" class="px-8 py-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] italic">{{ h }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-50">
          <tr v-for="log in items" :key="log.id" class="hover:bg-neutral-50 transition-all duration-300 group">
            <td class="px-8 py-6 whitespace-nowrap text-[11px] font-black text-gray-400 uppercase italic">{{ formatDate(log.createdAt) }}</td>
            <td class="px-8 py-6 whitespace-nowrap"><span class="text-xs font-black text-gray-900 uppercase italic group-hover:text-indigo-600 transition-colors">{{ formatAction(log.action) }}</span></td>
            <td class="px-8 py-6 whitespace-nowrap">
              <div class="flex flex-col">
                <span class="text-xs font-black text-gray-900 uppercase italic">{{ log.Vendor?.businessName || 'SİSTEM' }}</span>
                <span class="text-[9px] font-black text-indigo-400 uppercase tracking-tight italic mt-0.5 opacity-60">{{ log.Ecosystem?.name || 'GENEL HAVUZ' }}</span>
              </div>
            </td>
            <td class="px-8 py-6 whitespace-nowrap italic"><span :class="getSeverityColor(log.severity)" class="text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.2em] shadow-sm">{{ formatSeverity(log.severity) }}</span></td>
            <td class="px-8 py-6 max-w-md">
              <div v-if="typeof log.details === 'object' && log.details !== null" class="flex flex-wrap gap-2">
                <div v-for="(val, key) in log.details" :key="key" class="bg-white border border-neutral-200 rounded-lg px-3 py-1.5 shadow-sm">
                   <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest italic mr-2">{{ formatLogKey(key) }}:</span>
                   <span class="text-[10px] font-black text-gray-900 uppercase italic">{{ formatLogValue(val) }}</span>
                </div>
              </div>
              <span v-else class="text-[11px] font-black text-gray-400 uppercase italic opacity-60">{{ log.details || '-' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({ items: Array })
defineEmits(['close'])

const headers = ['TARİH', 'OLAY PROTOKOLÜ', 'SATICI / EKOSİSTEM', 'GÜVENLİK', 'DURUM DETAYLARI']

const formatDate = (d) => new Date(d).toLocaleString('tr-TR')
const formatLogValue = (v) => typeof v === 'boolean' ? (v ? 'EVET' : 'HAYIR') : v
const formatSeverity = (sev) => ({ INFO: 'BİLGİ', WARN: 'UYARI', CRITICAL: 'KRİTİK' }[sev] || sev)
const getSeverityColor = (sev) => {
    switch (sev) {
        case 'CRITICAL': return 'bg-rose-600 text-white'
        case 'WARN': return 'bg-amber-100 text-amber-700'
        default: return 'bg-neutral-100 text-neutral-500'
    }
}

const formatLogKey = (k) => ({
    isUpdate: 'GÜNCELLEME', quantity: 'MİKTAR', listingId: 'İLAN ID', listingName: 'ÜRÜN ADI',
    oldScore: 'ESKİ SKOR', newScore: 'YENİ SKOR', reason: 'SEBEP', vendorId: 'SATICI ID',
    productId: 'ÜRÜN ID', ecosystemId: 'EKOSİSTEM', status: 'DURUM', type: 'TİP', amount: 'TUTAR'
}[k] || k)

const formatAction = (a) => ({
    CART_ADD: 'SEPETE EKLEME', CART_UPDATE: 'SEPET GÜNCELLEME', VISIBILITY_VIOLATION: 'GÖRÜNÜRLÜK İHLALİ',
    COMMISSION_APPLY: 'KOMİSYON UYGULANDI', SMART_CAP_FAIL: 'AKILLI LİMİT İHLALİ', PRICE_FLOOR_FAIL: 'TABAN FİYAT İHLALİ',
    PRICE_FLOOR_DEVIATION: 'TABAN FİYAT SAPMASI', MEMBER_ADDED: 'BAYİ EKLENDİ', MEMBER_REMOVED: 'BAYİ ÇIKARILDI',
    TRUST_SCORE_OVERRIDE: 'GÜVEN SKORU DEĞİSİMİ', XP_BURN: 'XP YAKIMI', XP_EXPIRATION_WARNING: 'XP SÜRE SONU UYARISI'
}[a] || a)
</script>
