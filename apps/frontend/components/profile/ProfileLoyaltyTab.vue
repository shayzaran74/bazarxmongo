<template>
  <div class="space-y-6">
    <div class="mb-6">
      <LoyaltyProgressCard :loyalty-data="loyaltyData" />
    </div>

    <!-- Missions Panel -->
    <MissionPanel />

    <!-- XP Transaction History -->
    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <h4 class="text-xs font-black text-gray-900 uppercase tracking-widest">
          {{ $t('profile.xpTransactionHistory') || 'XP İşlem Geçmişi' }}
        </h4>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500" />
          <span class="text-[10px] font-black text-emerald-600 uppercase tracking-tighter italic">{{ $t('common.current') || 'GÜNCEL' }}</span>
        </div>
      </div>

      <div
        v-if="loading"
        class="flex justify-center py-12"
      >
        <div class="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
      <div
        v-else-if="history.length === 0"
        class="text-center py-16 px-6"
      >
        <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ClockIcon class="h-8 w-8 text-gray-300" />
        </div>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {{ $t('profile.noXpTransactionFound') || 'Henüz XP işleminiz bulunmuyor' }}
        </p>
        <p class="text-[9px] text-gray-400 mt-1">
          {{ $t('profile.xpHistoryDescription') || 'Platformdaki etkinliklerinizden XP kazandıkça burada görünecektir.' }}
        </p>
      </div>
      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/20">
              <th class="px-6 py-4">
                {{ $t('profile.transactionDetail') || 'İşlem Detayı' }}
              </th>
              <th class="px-6 py-4">
                {{ $t('profile.amount') || 'Miktar' }}
              </th>
              <th class="px-6 py-4">
                {{ $t('profile.date') || 'Tarih' }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="item in history"
              :key="item.id"
              class="group hover:bg-primary-50/20 transition-all"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    :class="item.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'"
                    class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  >
                    <ArrowTrendingUpIcon
                      v-if="item.amount > 0"
                      class="h-5 w-5"
                    />
                    <ArrowTrendingDownIcon
                      v-else
                      class="h-5 w-5"
                    />
                  </div>
                  <div>
                    <p class="text-xs font-bold text-gray-900">
                      {{ item.description }}
                    </p>
                    <p class="text-[9px] text-gray-400 uppercase tracking-wider font-medium">
                      {{ item.type.replace(/_/g, ' ') }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="item.amount > 0 ? 'text-emerald-500' : 'text-rose-500'"
                  class="text-sm font-black italic tabular-nums"
                >
                  {{ item.amount > 0 ? '+' : '' }}{{ item.amount }} XP
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-[10px] text-gray-500 font-bold tabular-nums">{{ formatDate(item.createdAt) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ClockIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/vue/24/outline'
import LoyaltyProgressCard from '~/components/loyalty/LoyaltyProgressCard.vue'
import MissionPanel from '~/components/User/MissionPanel.vue'

defineProps({
  loyaltyData: {
    type: Object,
    default: () => ({})
  },
  history: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  formatDate: {
    type: Function,
    default: (val) => val
  }
})
</script>
