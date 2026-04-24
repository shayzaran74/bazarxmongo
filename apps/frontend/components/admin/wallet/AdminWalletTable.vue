<template>
  <div class="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
    <div v-if="loading" class="flex flex-col items-center justify-center py-24">
      <div class="animate-spin h-10 w-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full mb-4"></div>
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Talepler Analiz Ediliyor...</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50/50">
          <tr>
            <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Kullanıcı / Müşteri</th>
            <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tutar</th>
            <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {{ activeTab === 'topup' ? 'Ödeme Yöntemi' : 'Banka / IBAN' }}
            </th>
            <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Durum</th>
            <th class="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarih</th>
            <th class="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksiyon</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="req in items" :key="req.id" class="hover:bg-indigo-50/20 transition-colors group">
            <td class="px-8 py-6">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <UserIcon class="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <div class="text-sm font-black text-gray-900 leading-none mb-1 italic uppercase">{{ getUserName(req.user) }}</div>
                  <div class="text-[10px] font-bold text-gray-400 leading-none">{{ req.user?.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-8 py-6">
              <span class="text-sm font-black text-gray-900 tabular-nums">{{ formatPrice(req.amount) }}</span>
            </td>
            <td class="px-8 py-6">
              <div v-if="activeTab === 'topup'" class="text-[10px] font-black uppercase bg-gray-100 px-2.5 py-1 rounded-lg inline-block border border-gray-200">
                {{ req.paymentMethod }}
              </div>
              <div v-else class="space-y-1">
                <div class="text-[10px] font-black uppercase text-gray-900 leading-none">{{ req.bankName }}</div>
                <div class="text-[9px] font-mono font-bold text-gray-400 tracking-tighter">{{ req.iban }}</div>
              </div>
            </td>
            <td class="px-8 py-6">
              <span :class="getStatusClass(req.status)" class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic border">
                {{ getStatusLabel(req.status) }}
              </span>
            </td>
            <td class="px-8 py-6">
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{{ formatDate(req.createdAt) }}</div>
            </td>
            <td class="px-8 py-6 text-right">
              <div v-if="req.status?.toLowerCase() === 'pending'" class="flex items-center justify-end gap-2">
                <button 
                  :disabled="processing?.includes(req.id)"
                  class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                  @click="$emit('approve', req)"
                >
                  <CheckIcon class="h-4 w-4" />
                </button>
                <button 
                  :disabled="processing?.includes(req.id)"
                  class="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                  @click="$emit('reject', req)"
                >
                  <XMarkIcon class="h-4 w-4" />
                </button>
              </div>
              <span v-else class="text-[9px] font-black text-gray-300 uppercase italic">GÖRÜLDÜ</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="items.length === 0" class="py-24 text-center">
        <div class="flex justify-center mb-4">
          <div class="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
            <CurrencyDollarIcon class="h-12 w-12 text-gray-200" />
          </div>
        </div>
        <h3 class="text-sm font-black text-gray-400 uppercase italic">Henüz Talep Bulunmuyor</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserIcon, CheckIcon, XMarkIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  items: Array,
  activeTab: String,
  loading: Boolean,
  processing: Object,
  formatPrice: Function,
  formatDate: Function
})

defineEmits(['approve', 'reject'])

const getUserName = (user) => {
  if (!user) return 'Bilinmiyor'
  if (user.profile) return `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || user.name
  return user.name || user.email
}

const getStatusLabel = (status) => {
  if (!status) return 'Bilinmiyor'
  const map = { pending: 'Bekliyor', approved: 'Onaylandı', completed: 'Onaylandı', processed: 'Onaylandı', rejected: 'Reddedildi' }
  return map[status.toLowerCase()] || status
}

const getStatusClass = (status) => {
  if (!status) return 'bg-gray-50 text-gray-400 border-gray-100'
  const s = status.toLowerCase()
  if (s === 'pending') return 'bg-amber-50 text-amber-600 border-amber-100'
  if (['approved', 'completed', 'processed'].includes(s)) return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  return 'bg-red-50 text-red-600 border-red-100'
}
</script>
