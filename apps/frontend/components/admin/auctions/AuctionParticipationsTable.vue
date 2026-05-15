<script setup lang="ts">
import { UserIcon } from '@heroicons/vue/24/outline'

interface Participation {
  id: string
  status: string
  createdAt: string
  user?: {
    id: string
    email?: string
    profile?: { firstName?: string; lastName?: string }
  }
  auction?: {
    id: string
    participationDeposit?: number | string
    listing?: { title?: string }
  }
}

defineProps<{
  participations: Participation[]
  loading: boolean
}>()

defineEmits<{
  (e: 'approve', id: string): void
  (e: 'reject', id: string): void
}>()

const fullName = (p: Participation): string => {
  const profile = p.user?.profile
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
  return name || p.user?.email || '—'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="bg-white shadow-sm border border-gray-100 rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div v-if="loading" class="flex flex-col items-center justify-center p-20 space-y-4">
      <div class="w-12 h-12 border-4 border-gray-100 border-t-orange-500 rounded-full animate-spin" />
      <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Talepler İnceleniyor...</p>
    </div>

    <div v-else-if="participations.length === 0" class="p-20 text-center">
      <div class="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-200">
        <UserIcon class="w-10 h-10" />
      </div>
      <h3 class="text-lg font-black text-gray-900 italic tracking-tighter">Talep Bulunmuyor</h3>
      <p class="text-xs text-gray-400 font-medium mt-2">Şu anda onay bekleyen katılım talebi mevcut değil.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-50">
        <thead class="bg-gray-50/50">
          <tr>
            <th class="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Kullanıcı</th>
            <th class="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Açık Artırma</th>
            <th class="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Depozito</th>
            <th class="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarih</th>
            <th class="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Karar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="part in participations" :key="part.id" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-8 py-5">
              <div class="text-sm font-black text-gray-900 leading-tight mb-1">{{ fullName(part) }}</div>
              <div class="text-[10px] font-bold text-gray-400 lowercase tracking-widest">{{ part.user?.email || '—' }}</div>
            </td>
            <td class="px-6 py-5">
              <div class="text-sm font-black text-gray-900">{{ part.auction?.listing?.title || '—' }}</div>
            </td>
            <td class="px-6 py-5">
              <div class="text-sm font-black text-primary-600 italic tracking-tighter">₺{{ Number(part.auction?.participationDeposit || 0).toLocaleString('tr-TR') }}</div>
            </td>
            <td class="px-6 py-5">
              <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ formatDate(part.createdAt) }}</div>
            </td>
            <td class="px-8 py-5 text-right">
              <div class="flex items-center justify-end gap-3">
                <button class="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-100" @click="$emit('approve', part.id)">Onayla</button>
                <button class="px-4 py-2 bg-white border border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors" @click="$emit('reject', part.id)">Reddet</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
