<script setup lang="ts">
import { PencilIcon, EyeIcon, TrashIcon, ForwardIcon } from '@heroicons/vue/24/outline'

defineProps<{
  auctions: any[]
  loading: boolean
}>()

const emit = defineEmits(['edit', 'view', 'delete', 'advance'])

const STATUS_TEXT: Record<string, string> = {
  SCHEDULED: 'Planlandı',
  ACTIVE: 'Aktif',
  ENDED: 'Bitti',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
}

const STATUS_CLASS: Record<string, string> = {
  SCHEDULED: 'bg-indigo-50 text-indigo-600',
  ACTIVE: 'bg-green-50 text-green-600',
  ENDED: 'bg-amber-50 text-amber-600',
  COMPLETED: 'bg-blue-50 text-blue-600',
  CANCELLED: 'bg-red-50 text-red-600',
}

const getStatusText = (status: string) => STATUS_TEXT[status] ?? status
const getStatusClass = (status: string) => STATUS_CLASS[status] ?? 'bg-gray-50 text-gray-600'

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="bg-white shadow-sm border border-gray-100 rounded-[2.5rem] overflow-hidden">
    <div v-if="loading" class="flex flex-col items-center justify-center p-20 space-y-4">
      <div class="w-12 h-12 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin"></div>
      <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Veriler Hazırlanıyor...</p>
    </div>

    <div v-else-if="auctions.length === 0" class="p-20 text-center">
       <div class="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-200">
         <EyeIcon class="w-10 h-10" />
       </div>
       <h3 class="text-lg font-black text-gray-900 italic tracking-tighter">İlan Bulunamadı</h3>
       <p class="text-xs text-gray-400 font-medium mt-2">Kriterlerinize uygun açık artırma mevcut değil.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-50">
        <thead class="bg-gray-50/50">
          <tr>
            <th class="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Açık Artırma</th>
            <th class="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Durum</th>
            <th class="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Teklif</th>
            <th class="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Bitiş</th>
            <th class="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksiyon</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="auction in auctions" :key="auction.id" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-8 py-5">
              <div class="flex items-center gap-4">
                <img :src="auction.Product?.image || '/placeholder.png'" class="w-12 h-12 rounded-2xl object-cover bg-gray-100">
                <div>
                  <div class="text-sm font-black text-gray-900 leading-tight mb-1">{{ auction.title }}</div>
                  <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ auction.Product?.category?.name || 'Genel' }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-5">
              <span :class="getStatusClass(auction.status)" class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {{ getStatusText(auction.status) }}
              </span>
            </td>
            <td class="px-6 py-5">
              <div class="text-sm font-black text-gray-900">₺{{ (auction.currentPrice || 0).toLocaleString('tr-TR') }}</div>
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ auction._count?.bids || 0 }} Teklif</div>
            </td>
            <td class="px-6 py-5">
              <div class="text-sm font-black text-gray-900">{{ formatDate(auction.endTime) }}</div>
            </td>
            <td class="px-8 py-5 text-right">
              <div class="flex items-center justify-end gap-2">
                <button v-if="auction.status === 'ENDED' || auction.status === 'COMPLETED'" class="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:scale-110 transition-transform" title="Sıradaki Kazana Geç" @click="$emit('advance', auction.id)">
                  <ForwardIcon class="w-4 h-4" />
                </button>
                <button class="p-2.5 bg-gray-50 text-gray-400 hover:text-primary-600 rounded-xl hover:scale-110 transition-transform" @click="$emit('edit', auction)">
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button class="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:scale-110 transition-transform" @click="$emit('view', auction.id)">
                  <EyeIcon class="w-4 h-4" />
                </button>
                <button class="p-2.5 bg-red-50 text-red-600 rounded-xl hover:scale-110 transition-transform" @click="$emit('delete', auction.id)">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
