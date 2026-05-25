<template>
  <div class="min-h-screen bg-gray-50/50">
    <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-10">
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">
          💰 Cüzdanım
        </h1>
        <p class="text-sm text-gray-500 font-medium mt-2">
          Bakiyenizi yönetin, barter havuzuna katılın ve finansal hareketlerinizi takip edin.
        </p>
      </div>

      <!-- Main Loading state -->
      <div v-if="loading && !wallet.accounts.length" class="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
        <div class="animate-spin h-12 w-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full mb-4" />
        <p class="text-gray-400 font-black uppercase tracking-widest text-xs">Cüzdan Verileri Yükleniyor...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-3xl p-6 mb-8 flex items-center gap-4 text-red-700">
        <ExclamationTriangleIcon class="h-6 w-6 shrink-0" />
        <p class="font-bold">{{ error }}</p>
      </div>

      <!-- Wallet Content -->
      <div v-else class="space-y-10">
        <!-- 1. Balance Card Section -->
        <WalletBalanceCard 
          :account="mainAccount" 
          :is-vendor="authStore.isVendor"
          :format-price="formatPrice"
        />

        <!-- 2. Vendor Specific: XP & Barter Pool -->
        <div v-if="authStore.isVendor" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WalletXPAccounts 
            :commission="commissionAccount"
            :ad="adAccount"
            :service="serviceAccount"
            :tier-config="tierConfig"
            :format-price="formatPrice"
          />
          <WalletBarterPool 
            :account="barterAccount"
            :format-price="formatPrice"
            @register="registerForBarter"
            @show-topup="showBarterTopup = true"
            @show-withdraw="showBarterWithdraw = true"
          />
        </div>

        <!-- 3. Action Tabs (Top Up / Withdraw) -->
        <div class="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div class="flex bg-gray-50/50 p-2 border-b border-gray-100">
            <button
              class="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              :class="activeActionTab === 'topup' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'"
              @click="activeActionTab = 'topup'"
            >
              Bakiye Yükle
            </button>
            <button
              v-if="authStore.isVendor"
              class="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              :class="activeActionTab === 'withdraw' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-400 hover:text-gray-600'"
              @click="activeActionTab = 'withdraw'"
            >
              Para Çek
            </button>
          </div>
          <div class="p-8">
            <WalletTopUpForm v-if="activeActionTab === 'topup'" @success="handleSuccess" />
            <WalletWithdrawForm 
              v-else-if="activeActionTab === 'withdraw'" 
              :available-balance="mainAccount?.availableBalance || 0" 
              @success="handleSuccess" 
            />
          </div>
        </div>

        <!-- 4. Gift Cards & Rewards -->
        <div class="grid grid-cols-1 gap-10">
          <WalletGiftCards 
            :gift-cards="wallet.giftCards" 
            :format-price="formatPrice" 
            @redeem="redeemGiftCard"
          />
          <WalletLotteryCards 
            :cards="wallet.cards" 
            :is-card-winner="isCardWinner" 
          />
          <WalletAuctionBids 
            v-if="authStore.isVendor"
            :auctions="wallet.auctions" 
            :format-price="formatPrice" 
          />
        </div>

        <!-- 5. Transactions & Requests -->
        <div class="space-y-10">
          <WalletTransactions 
            :transactions="transactions"
            :accounts="accounts"
            :is-vendor="authStore.isVendor"
            :loading="txLoading"
            :selected-account-id="selectedAccountId"
            :format-price="formatPrice"
            @switch-account="handleAccountSwitch"
            @refresh="loadTransactions"
          />
          <WalletRequests 
            :requests="wallet.requests"
            :withdrawal-requests="wallet.withdrawalRequests"
            :is-vendor="authStore.isVendor"
            :format-price="formatPrice"
          />
        </div>
      </div>
    </div>

    <!-- Modals Section -->
    <WalletBarterModals 
      :show-topup="showBarterTopup"
      :show-withdraw="showBarterWithdraw"
      :main-account="mainAccount"
      :barter-account="barterAccount"
      :format-price="formatPrice"
      :loading="submitting"
      @close-topup="showBarterTopup = false"
      @close-withdraw="showBarterWithdraw = false"
      @submit-topup="amount => topUpBarter(amount).then(res => res && (showBarterTopup = false))"
      @submit-withdraw="amount => withdrawBarter(amount).then(res => res && (showBarterWithdraw = false))"
    />
  </div>
</template>

<script setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import WalletTopUpForm from '~/components/forms/WalletTopUpForm.vue'
import WalletWithdrawForm from '~/components/forms/WalletWithdrawForm.vue'

// Custom Components
import WalletBalanceCard from '~/components/wallet/WalletBalanceCard.vue'
import WalletXPAccounts from '~/components/wallet/WalletXPAccounts.vue'
import WalletBarterPool from '~/components/wallet/WalletBarterPool.vue'
import WalletBarterModals from '~/components/wallet/WalletBarterModals.vue'
import WalletGiftCards from '~/components/wallet/WalletGiftCards.vue'
import WalletLotteryCards from '~/components/wallet/WalletLotteryCards.vue'
import WalletAuctionBids from '~/components/wallet/WalletAuctionBids.vue'
import WalletTransactions from '~/components/wallet/WalletTransactions.vue'
import WalletRequests from '~/components/wallet/WalletRequests.vue'

definePageMeta({ layout: 'default', middleware: 'auth', hideSideAds: true })
useHead({ 
  title: 'Cüzdanım - TicariTakas', 
  meta: [{ name: 'description', content: 'Cüzdan bakiyenizi yönetin ve işlemlerinizi takip edin.' }] 
})

const {
  wallet, loading, submitting, error,
  accounts, mainAccount, barterAccount, commissionAccount, adAccount, serviceAccount,
  tierConfig, formatPrice, fetchWallet,
  registerForBarter, topUpBarter, withdrawBarter, redeemGiftCard, isCardWinner,
  fetchTransactions, fetchAccountTransactions
} = useWallet()

const authStore = useAuthStore()

// Local UI State
const transactions = ref([])
const txLoading = ref(false)
const selectedAccountId = ref('all')
const showBarterTopup = ref(false)
const showBarterWithdraw = ref(false)
const activeActionTab = ref('topup')

// Lifecycle
onMounted(async () => {
  await authStore.init()
  if (!authStore.isLoggedIn) return navigateTo('/login')
  
  await fetchWallet()
  if (!authStore.isVendor && mainAccount.value) {
    selectedAccountId.value = mainAccount.value.id
  }
  await loadTransactions()
})

const loadTransactions = async () => {
  txLoading.value = true
  try {
    const res = selectedAccountId.value === 'all' 
      ? await fetchTransactions({ limit: 15 })
      : await fetchAccountTransactions(selectedAccountId.value, { limit: 15 })
    
    if (res.success) {
      const rawData = res.data
      const items = Array.isArray(rawData) ? rawData : (rawData?.items || [])
      transactions.value = items.filter(tx => (tx.account?.type || tx.accountType) !== 'SYSTEM')
    }
  } finally {
    txLoading.value = false
  }
}

const handleAccountSwitch = (id) => {
  selectedAccountId.value = id
  loadTransactions()
}

const handleSuccess = async () => {
  await fetchWallet()
  await authStore.fetchUser()
  await loadTransactions()
}
</script>