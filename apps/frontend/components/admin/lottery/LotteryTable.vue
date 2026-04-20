<template>
  <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden italic">
    <div v-if="loading" class="p-24 flex flex-col items-center justify-center">
      <div class="animate-spin h-16 w-16 border-[6px] border-indigo-500/20 border-t-indigo-600 rounded-full mb-6" />
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">ÇEKİLİŞLER YÜKLENİYOR...</p>
    </div>

    <div v-else-if="lotteries.length === 0" class="p-24 text-center">
      <div class="bg-neutral-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner transform -rotate-12">
        <TicketIcon class="h-10 w-10 text-gray-200" />
      </div>
      <h3 class="text-2xl font-black text-gray-900 uppercase">HENÜZ ÇEKİLİŞ BULUNMUYOR</h3>
      <p class="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest">YENİ BİR TASLAK OLUŞTURARAK BAŞLAYABİLİRSİNİZ.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr class="bg-neutral-50/50">
            <th v-for="h in ['ÇEKİLİŞ / ÖDÜL', 'DURUM', 'ÖDÜL DEĞERİ', 'KATILIM', 'BİTİŞ TARİHİ', 'İŞLEMLER']" :key="h" class="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{{ h }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-50">
          <tr v-for="lottery in lotteries" :key="lottery.id" class="group hover:bg-neutral-50/50 transition-all relative">
            <td class="px-10 py-8">
              <div class="flex items-center gap-6">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <TicketIcon class="h-8 w-8 text-white" />
                </div>
                <div>
                  <div class="text-sm font-black text-gray-900 uppercase tracking-tight">{{ lottery.title }}</div>
                  <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ lottery.prizeDescription }}</div>
                </div>
              </div>
            </td>
            <td class="px-10 py-8">
              <span :class="getStatusBadgeClass(lottery.status)" class="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-current opacity-80">{{ getStatusText(lottery.status) }}</span>
            </td>
            <td class="px-10 py-8">
              <div class="flex flex-col">
                <span class="text-lg font-black text-gray-900 tracking-tighter">₺{{ (lottery.prizeValue || 0).toLocaleString('tr-TR') }}</span>
                <span class="text-[9px] font-black text-gray-400 uppercase mt-1">BİLET: ₺{{ lottery.ticketPrice || 0 }}</span>
              </div>
            </td>
            <td class="px-10 py-8">
              <div class="flex flex-col">
                <span class="text-base font-black text-gray-900">{{ lottery._count?.Tickets || 0 }} BİLET</span>
                <div class="mt-2 w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden shadow-inner">
                  <div class="h-full bg-indigo-600 rounded-full" :style="{ width: Math.min((lottery._count?.Tickets || 0) / 100 * 100, 100) + '%' }" />
                </div>
              </div>
            </td>
            <td class="px-10 py-8">
              <div class="flex flex-col">
                <span class="text-[11px] font-black text-gray-900 uppercase">{{ formatDate(lottery.endTime) }}</span>
                <span :class="getTimeStatusClass(lottery.endTime)" class="text-[9px] font-black uppercase tracking-widest mt-1 italic">{{ getTimeRemaining(lottery.endTime) }}</span>
              </div>
            </td>
            <td class="px-10 py-8 text-right">
              <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button v-if="lottery.status === 'Active'" class="w-10 h-10 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 hover:bg-amber-600 hover:text-white transition-all shadow-sm flex items-center justify-center" @click="$emit('end', lottery)">
                  <FireIcon class="h-5 w-5" />
                </button>
                <button class="w-10 h-10 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center" @click="$emit('edit', lottery)">
                  <PencilSquareIcon class="h-5 w-5" />
                </button>
                <button class="w-10 h-10 bg-red-50 rounded-xl text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center" @click="$emit('delete', lottery)">
                  <TrashIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.pages > 1" class="p-10 bg-neutral-50/50 border-t border-gray-100 flex items-center justify-between">
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">LİSTELENEN: <span class="text-gray-900">{{ (pagination.page - 1) * pagination.limit + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> / {{ pagination.total }}</p>
      <div class="flex gap-2 font-black text-[10px]">
        <button v-for="p in pagination.pages" :key="p" :class="pagination.page === p ? 'bg-gray-900 text-white shadow-xl' : 'bg-white text-gray-400 hover:text-gray-900'" class="w-10 h-10 rounded-xl transition-all shadow-sm flex items-center justify-center" @click="$emit('change-page', p)">{{ p }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { TicketIcon, FireIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'

defineProps({ lotteries: Array, loading: Boolean, pagination: Object })
defineEmits(['edit', 'delete', 'end', 'change-page'])

const getStatusBadgeClass = (s) => ({
  Active: 'text-green-600 bg-green-50',
  Completed: 'text-blue-600 bg-blue-50',
  Cancelled: 'text-red-600 bg-red-50',
  Pending: 'text-amber-600 bg-amber-50'
}[s] || 'text-gray-600 bg-gray-50')

const getStatusText = (s) => ({
  Active: '🔥 AKTİF',
  Completed: '✅ TAMAMLANDI',
  Cancelled: '❌ İPTAL EDİLDİ',
  Pending: '⏳ BEKLEMEDE'
}[s] || s)

const formatDate = (date) => new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })

const getTimeStatusClass = (endTime) => {
  const diff = new Date(endTime).getTime() - Date.now()
  return diff <= 0 ? 'text-red-500' : diff <= 86400000 ? 'text-orange-500' : 'text-gray-400'
}

const getTimeRemaining = (endTime) => {
  const diff = new Date(endTime).getTime() - Date.now()
  if (diff <= 0) return 'SÜRESİ DOLDU'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  return d > 0 ? `${d} GÜN ${h} SAAT KALDI` : `${h} SAAT KALDI`
}
</script>
