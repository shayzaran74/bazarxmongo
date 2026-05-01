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

    <div class="flex gap-2 mb-6">
      <button 
        @click="walletAction = 'deposit'"
        class="flex-1 py-3 rounded-xl font-bold transition-all border-2"
        :class="walletAction === 'deposit' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200'"
      >
        Para Yatır
      </button>
      <button 
        @click="walletAction = 'withdraw'"
        class="flex-1 py-3 rounded-xl font-bold transition-all border-2"
        :class="walletAction === 'withdraw' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200'"
      >
        Para Çek
      </button>
    </div>

    <div v-if="walletAction === 'deposit'">
      <WalletTopUpForm
        :user-id="user?.id"
        @success="$emit('topUpSuccess')"
      />
    </div>

    <div v-else class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 class="text-lg font-black text-gray-900 uppercase tracking-tighter">Para Çekme Talebi</h3>
      <p class="text-xs text-gray-500">Bakiye çekim talepleri onaylandıktan sonra belirttiğiniz banka hesabına aktarılır.</p>
      
      <div class="space-y-4 pt-4">
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Miktar (TL)</label>
          <input 
            v-model="withdrawForm.amount"
            type="number"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none font-bold"
            placeholder="0.00"
          >
        </div>
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Hesap Sahibi</label>
          <input 
            v-model="withdrawForm.accountHolder"
            type="text"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
            placeholder="Ad Soyad"
          >
        </div>
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">IBAN</label>
          <input 
            v-model="withdrawForm.iban"
            type="text"
            maxlength="32"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none font-mono"
            placeholder="TR00 0000 0000 0000 0000 0000 00"
          >
          <p class="text-[9px] text-gray-400 mt-1 font-bold">TR ile başlar, toplam 26 hane olmalıdır.</p>
        </div>
        <div>
          <label class="block text-[10px] font-black text-gray-400 uppercase mb-1">Banka Adı</label>
          <input 
            v-model="withdrawForm.bankName"
            type="text"
            class="w-full border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
            placeholder="Örn: Ziraat Bankası"
          >
        </div>

        <button 
          @click="handleWithdraw"
          :disabled="isWithdrawDisabled"
          class="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          Çekim Talebi Oluştur
        </button>
      </div>
    </div>

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
      </div>
    </div>

    <!-- Gift Cards Section -->
    <div v-if="wallet.giftCards && wallet.giftCards.length > 0" class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest">Hediye Kartlarım</h4>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="card in wallet.giftCards" 
          :key="card.id"
          class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
              <GiftIcon class="h-5 w-5" />
            </div>
            <div>
              <p class="text-xs font-mono font-bold text-gray-900">{{ card.code }}</p>
              <p class="text-[10px] text-gray-400">₺{{ Number(card.currentValue).toFixed(2) }} bakiye</p>
            </div>
          </div>
          <div class="text-right">
            <span 
              class="text-[8px] font-black uppercase px-2 py-1 rounded-full"
              :class="card.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'"
            >
              {{ card.status === 'Active' ? 'Aktif' : card.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { WalletIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, GiftIcon } from '@heroicons/vue/24/outline'
import WalletTopUpForm from '~/components/forms/WalletTopUpForm.vue'
import { useWallet } from '~/composables/useWallet'

const props = defineProps({
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

const emit = defineEmits(['topUpSuccess'])

const walletAction = ref('deposit')
const { requestWithdrawal, submitting } = useWallet()

const withdrawForm = ref({
  amount: 0,
  iban: '',
  accountHolder: '',
  bankName: ''
})

const isWithdrawDisabled = computed(() => {
  return submitting.value || 
         withdrawForm.value.amount <= 0 || 
         withdrawForm.value.amount > props.wallet.balance ||
         !withdrawForm.value.iban || 
         !withdrawForm.value.accountHolder
})

const handleWithdraw = async () => {
  // Remove spaces before sending
  const cleanIban = withdrawForm.value.iban.replace(/\s/g, '')
  const success = await requestWithdrawal({ ...withdrawForm.value, iban: cleanIban })
  if (success) {
    withdrawForm.value = { amount: 0, iban: '', accountHolder: '', bankName: '' }
    emit('topUpSuccess') // Refresh wallet
  }
}

// IBAN Masking
watch(() => withdrawForm.value.iban, (val) => {
  if (!val) return
  
  // Sadece harf ve rakamları tut, boşlukları temizle
  let clean = val.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  
  // TR ile başlamasını zorunlu kıl
  if (clean.length > 0 && !clean.startsWith('TR')) {
    clean = 'TR' + clean
  } else if (clean.length === 0) {
    clean = 'TR'
  }
  
  // Max 26 karakter (TR + 24 rakam)
  clean = clean.substring(0, 26)
  
  // Gruplandır (TRxx xxxx xxxx xxxx xxxx xxxx xx)
  let masked = ''
  for (let i = 0; i < clean.length; i++) {
    if (i > 0 && i % 4 === 0) masked += ' '
    masked += clean[i]
  }
  
  withdrawForm.value.iban = masked
})
</script>
