<template>
  <div class="space-y-6">
    <!-- Top Up Requests -->
    <div class="bg-white rounded-[2rem] shadow-md p-8 border border-gray-100">
      <h2 class="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <span>📋</span> Yükleme Taleplerim
      </h2>
      <div
        v-if="requests && requests.length > 0"
        class="space-y-2"
      >
        <div
          v-for="request in requests"
          :key="request.id"
          class="flex items-center justify-between p-5 hover:bg-gray-50/50 rounded-2xl transition-all border border-transparent hover:border-gray-100"
        >
          <div>
            <p class="text-xl font-black text-gray-900 tracking-tight">
              {{ formatPrice(request.amount) }}
            </p>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {{ new Date(request.createdAt).toLocaleString('tr-TR') }}
            </p>
          </div>
          <div>
            <span
              class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm"
              :class="getStatusClass(request.status)"
            >
              {{ getStatusLabel(request.status) }}
            </span>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12 bg-gray-50/30 rounded-3xl border border-dashed border-gray-100">
        <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Henüz yükleme talebiniz bulunmuyor.</p>
      </div>
    </div>

    <!-- Withdrawal Requests -->
    <div
      v-if="isVendor"
      class="bg-white rounded-[2rem] shadow-md p-8 border border-gray-100"
    >
      <h2 class="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
        <span>💸</span> Para Çekme Taleplerim
      </h2>
      <div
        v-if="withdrawalRequests && withdrawalRequests.length > 0"
        class="space-y-2"
      >
        <div
          v-for="request in withdrawalRequests"
          :key="request.id"
          class="flex items-center justify-between p-5 hover:bg-gray-50/50 rounded-2xl transition-all border border-transparent hover:border-gray-100"
        >
          <div>
            <p class="text-xl font-black text-gray-900 tracking-tight">
              {{ formatPrice(request.amount) }}
            </p>
            <div class="flex items-center gap-3 mt-1">
              <span class="text-[10px] text-gray-400 uppercase font-black">{{ new Date(request.createdAt).toLocaleDateString('tr-TR') }}</span>
              <span
                v-if="request.bankName"
                class="text-[9px] text-blue-500 font-bold px-2 py-0.5 bg-blue-50 rounded-lg border border-blue-100"
              >{{ request.bankName }}</span>
            </div>
          </div>
          <div class="text-right">
            <span
              class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm"
              :class="getStatusClass(request.status)"
            >
              {{ request.status === 'pending_verification' ? 'Onay Bekliyor (Posta)' : getStatusLabel(request.status) }}
            </span>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12 bg-gray-50/30 rounded-3xl border border-dashed border-gray-100">
        <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Henüz bir para çekme talebi oluşturmadınız.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  requests: Array,
  withdrawalRequests: Array,
  isVendor: Boolean,
  formatPrice: Function
})

const getStatusLabel = (status) => {
  const s = (status || '').toUpperCase()
  switch (s) {
    case 'APPROVED':
    case 'COMPLETED': return 'Tamamlandı'
    case 'PENDING':
    case 'PENDING_VERIFICATION': return 'Bekliyor'
    case 'REJECTED':
    case 'FAILED':
    case 'CANCELLED': return 'Reddedildi'
    default: return status
  }
}

const getStatusClass = (status) => {
  const s = (status || '').toUpperCase()
  switch (s) {
    case 'APPROVED':
    case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200'
    case 'PENDING':
    case 'PENDING_VERIFICATION': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'REJECTED':
    case 'FAILED':
    case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}
</script>
