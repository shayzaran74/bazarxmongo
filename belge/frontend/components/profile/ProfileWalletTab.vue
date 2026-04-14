<template>
  <div class="space-y-6">
    <!-- Wallet Card Summary -->
    <div
      class="bg-gradient-to-br from-indigo-600 via-purple-600 to-primary-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group"
    >
      <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
        <WalletIcon class="h-24 w-24" />
      </div>
      <div class="relative z-10">
        <p class="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">
          {{
            $t('profile.walletBalance') }}
        </p>
        <div class="text-4xl font-black mb-2">
          {{ formatPrice(wallet.balance) }}
        </div>
        <div
          v-if="wallet.blockedBalance > 0"
          class="text-xs font-bold text-red-200"
        >
          🔒 {{ formatPrice(wallet.blockedBalance) }} {{ $t('profile.blocked') }}
        </div>
      </div>
    </div>

    <WalletTopUpForm
      :user-id="user?.id"
      @success="$emit('topUpSuccess')"
    />

    <!-- Recent Transactions -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest">
          {{
            $t('profile.recentTransactions') }}
        </h4>
        <NuxtLink
          to="/wallet"
          class="text-[10px] font-black text-indigo-600 uppercase tracking-widest"
        >
          {{
            $t('profile.viewAll') }}
        </NuxtLink>
      </div>

      <div
        v-if="loading"
        class="flex justify-center py-4"
      >
        <div class="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
      <div
        v-else-if="transactions.length > 0"
        class="space-y-3"
      >
        <div
          v-for="tx in transactions"
          :key="tx.id"
          class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
        >
          <div class="flex items-center gap-3">
            <div
              :class="tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
              class="p-2 rounded-lg"
            >
              <ArrowTrendingUpIcon
                v-if="tx.type === 'CREDIT'"
                class="h-4 w-4"
              />
              <ArrowTrendingDownIcon
                v-else
                class="h-4 w-4"
              />
            </div>
            <div>
              <p class="text-xs font-bold text-gray-900">
                {{ tx.description || (tx.type === 'CREDIT' ? $t('profile.topUp') : $t('profile.payment')) }}
              </p>
              <p class="text-[10px] text-gray-400 capitalize">
                {{ formatDate(tx.createdAt) }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p
              class="text-xs font-black"
              :class="tx.type === 'DEBIT' ? 'text-red-500' : 'text-green-600'"
            >
              {{ tx.type === 'DEBIT' ? '-' : '+' }}{{ formatPrice(tx.amount) }}
            </p>
            <p class="text-[8px] text-gray-400 uppercase font-black">
              {{ tx.status }}
            </p>
          </div>
        </div>
      </div>
      <div
        v-else
        class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200"
      >
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {{
            $t('profile.noTransactionFound') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { WalletIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/vue/24/outline'
import WalletTopUpForm from '~/components/forms/WalletTopUpForm.vue'

defineProps({
  wallet: {
    type: Object,
    default: () => ({ balance: 0, blockedBalance: 0 })
  },
  user: {
    type: Object,
    default: () => ({})
  },
  transactions: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  formatPrice: {
    type: Function,
    default: (val) => val
  },
  formatDate: {
    type: Function,
    default: (val) => val
  }
})

defineEmits(['topUpSuccess'])
</script>
