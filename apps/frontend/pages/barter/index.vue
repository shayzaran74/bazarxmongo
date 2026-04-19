<template>
  <div class="min-h-screen bg-[#0f172a] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div
        class="absolute top-1/2 -right-24 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-700"
      />
      <div
        class="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full h-64 bg-primary-600/10 rounded-full blur-[120px]"
      />
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1
            class="text-4xl md:text-6xl font-black tracking-tightest italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-primary-400"
          >
            Barter Havuzu
          </h1>
          <p class="mt-4 text-indigo-200/60 font-medium tracking-widest uppercase text-xs">
            Ticari Takas Ağında Sınırsız Güç
          </p>
        </div>
        <div class="flex items-center gap-4">
          <button
            class="group bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2"
            @click="fetchInfo"
          >
            <ArrowPathIcon
              :class="['h-5 w-5 text-indigo-400 group-hover:rotate-180 transition-transform duration-500', loading ? 'animate-spin' : '']"
            />
            <span class="text-sm font-black uppercase tracking-widest">Güncelle</span>
          </button>
        </div>
      </div>

      <!-- Main Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div class="lg:col-span-1 group">
          <div
            class="h-full bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] hover:border-white/20 transition-all"
          >
            <div class="flex items-center gap-4 mb-6">
              <div
                class="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400"
              >
                <span class="text-xl">💰</span>
              </div>
              <div>
                <p class="text-[10px] font-black text-indigo-200/40 uppercase tracking-widest">
                  Nakit Hesap
                </p>
                <h3 class="text-xl font-black text-white">
                  Nakit Bakiye
                </h3>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-black tracking-tighter text-white">{{
                  formatNumber(auth.balance) }}</span>
                <span class="text-sm font-black text-indigo-200 uppercase italic text-opacity-40">TL</span>
              </div>
              <p class="text-xs text-indigo-200/50 font-medium">
                BazarX ana cüzdan bakiyeniz.
              </p>
                            
              <NuxtLink
                to="/wallet"
                class="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all mt-4"
              >
                Cüzdana Git
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Balance Card -->
        <div class="lg:col-span-2 group">
          <div
            class="h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-primary-600 p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-indigo-500/20 relative overflow-hidden"
          >
            <div class="absolute top-0 right-0 p-8">
              <BanknotesIcon
                class="h-24 w-24 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700"
              />
            </div>

            <div class="relative">
              <p class="text-indigo-100/80 font-black uppercase tracking-[0.3em] text-sm mb-4">
                Barter
                Bakiyeniz
              </p>
              <div class="flex items-baseline gap-4">
                <span class="text-6xl md:text-8xl font-black tracking-tighter">{{
                  formatNumber(auth.barterBalance) }}</span>
                <span
                  class="text-2xl md:text-4xl font-black text-indigo-200 uppercase italic"
                >Puan</span>
              </div>

              <div class="mt-12 flex flex-wrap gap-6">
                <div class="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                  <p class="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">
                    Kredi Limitiniz
                  </p>
                  <p class="text-xl font-black">
                    {{ formatNumber(auth.barterCreditLimit) }} Puan
                  </p>
                </div>
                <div class="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                  <p class="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">
                    Kullanılabilir
                  </p>
                  <p class="text-xl font-black">
                    {{ formatNumber(Number(auth.barterBalance) +
                      Number(auth.barterCreditLimit)) }} Puan
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Card -->
        <div
          class="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] flex flex-col justify-between group hover:border-white/20 transition-colors"
        >
          <div>
            <div
              class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/20"
            >
              <BoltIcon class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-2xl font-black italic uppercase tracking-tighter mb-2">
              Hızlı Özet
            </h3>
            <p class="text-indigo-200/50 text-sm font-medium leading-relaxed">
              Barter havuzundaki son
              aktiviteleriniz ve sistem sağlığı.
            </p>
          </div>

          <div class="space-y-6 mt-8">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-indigo-200/70">Toplam İşlem</span>
              <span class="text-lg font-black">{{ transactions.length }}</span>
            </div>
            <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div class="bg-gradient-to-r from-indigo-400 to-primary-400 h-full w-2/3 rounded-full" />
            </div>
            <div
              class="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-400"
            >
              <span>Aktif Ticari Takas Ağı</span>
              <span>%82 Doluluk</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Cards: Advertising & System Expenses -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <!-- Advertising Balance Card -->
        <div
          class="group relative overflow-hidden bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] hover:border-white/20 transition-all"
        >
          <div class="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
            <MegaphoneIcon
              class="h-24 w-24 text-indigo-400 rotate-12 group-hover:rotate-0 transition-transform duration-700"
            />
          </div>

          <div class="relative z-10">
            <div
              class="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mb-6"
            >
              <MegaphoneIcon class="h-7 w-7 text-purple-400" />
            </div>

            <h3 class="text-indigo-200/60 font-black uppercase tracking-widest text-xs mb-2">
              Reklam Bakiyesi
            </h3>
            <div class="flex items-baseline gap-2 mb-4">
              <span class="text-4xl font-black tracking-tighter text-white">{{ formatNumber(auth.adXP)
              }}</span>
              <span class="text-lg font-black text-indigo-200 uppercase italic">XP</span>
            </div>

            <p
              class="text-rose-400/80 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              1 hafta içinde kullanılmazsa sıfırlanacak
            </p>

            <button
              class="w-full bg-white/10 hover:bg-indigo-500 hover:text-white border border-white/10 text-indigo-200 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300"
            >
              Kullan
            </button>
          </div>
        </div>

        <!-- System Expenses (Stationery) Card -->
        <div
          class="group relative overflow-hidden bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[3rem] hover:border-white/20 transition-all"
        >
          <div class="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
            <ShoppingBagIcon
              class="h-24 w-24 text-emerald-400 rotate-12 group-hover:rotate-0 transition-transform duration-700"
            />
          </div>

          <div class="relative z-10">
            <div
              class="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-6"
            >
              <ShoppingBagIcon class="h-7 w-7 text-emerald-400" />
            </div>

            <h3 class="text-indigo-200/60 font-black uppercase tracking-widest text-xs mb-2">
              Kırtasiye
              Malzemesi Satın Alma
            </h3>
            <div class="flex items-baseline gap-2 mb-4">
              <span class="text-4xl font-black tracking-tighter text-white">{{
                formatNumber(auth.serviceXP) }}</span>
              <span class="text-lg font-black text-indigo-200 uppercase italic">XP</span>
            </div>

            <p
              class="text-emerald-400/80 text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Hizmet ve Gider Ödemeleri
            </p>

            <button
              class="w-full bg-white/10 hover:bg-emerald-500 hover:text-white border border-white/10 text-emerald-200 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300"
            >
              Satın Al
            </button>
          </div>
        </div>
      </div>

      <!-- Transactions Section -->
      <div class="space-y-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4 bg-white/5 p-1 rounded-2xl w-fit flex-wrap">
            <button
              :class="[
                'px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300',
                activeTab === 'financial'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-indigo-200/40 hover:text-white'
              ]"
              @click="activeTab = 'financial'"
            >
              Finansal İşlemler
            </button>
            <button
              :class="[
                'px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300',
                activeTab === 'trade'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-indigo-200/40 hover:text-white'
              ]"
              @click="activeTab = 'trade'"
            >
              Ticaret Hacmi
            </button>
            <button
              :class="[
                'px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300',
                activeTab === 'xp'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'text-purple-200/40 hover:text-white'
              ]"
              @click="activeTab = 'xp'"
            >
              Puan/XP Geçmişi
            </button>
          </div>
        </div>

        <div
          v-if="loading"
          class="flex justify-center items-center py-24 bg-white/5 rounded-[3rem] border border-white/5 transition-all"
        >
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
            <div
              class="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"
            />
          </div>
        </div>

        <div
          v-else-if="currentTransactions.length === 0"
          class="py-24 text-center bg-white/5 rounded-[3rem] border border-white/5"
        >
          <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <InboxIcon class="h-10 w-10 text-indigo-200/20" />
          </div>
          <p class="text-indigo-200/40 font-black uppercase tracking-widest text-sm">
            Kayıt bulunamadı.
          </p>
        </div>

        <div
          v-else
          class="grid grid-cols-1 gap-4"
        >
          <div
            v-for="tx in currentTransactions"
            :key="tx.id"
            class="group bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/5 hover:border-white/10 p-6 rounded-3xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div class="flex items-center gap-6">
              <div
                :class="[
                  'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg',
                  (tx.type === 'CREDIT' || tx.type === 'XP_EARNED' || tx.type.includes('BONUS')) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                ]"
              >
                <ArrowUpRightIcon
                  v-if="tx.type === 'DEBIT' || tx.type.includes('SPEND')"
                  class="h-6 w-6"
                />
                <ArrowDownLeftIcon
                  v-else
                  class="h-6 w-6"
                />
              </div>
              <div>
                <p
                  class="text-sm font-black uppercase tracking-tight text-white group-hover:text-indigo-400 transition-colors"
                >
                  {{ tx.description }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-[10px] font-bold text-indigo-200/40 uppercase tracking-widest">
                    {{ formatDate(tx.createdAt) }}
                  </p>
                  <template v-if="tx.type === 'TRANSFER'">
                    <span class="text-[10px] text-indigo-200/20">•</span>
                    <p class="text-[10px] font-black text-indigo-400/80 uppercase tracking-widest">
                      {{ tx.amount > 0 ? `GÖNDEREN: ${tx.fromUser || 'Sistem'}` : `ALICI:
                                            ${tx.toUser || 'Sistem'}` }}
                    </p>
                  </template>
                  <template v-else-if="activeTab === 'xp'">
                    <span class="text-[10px] text-indigo-200/20">•</span>
                    <span
                      class="text-[10px] font-black text-purple-400/80 uppercase tracking-widest"
                    >{{
                      tx.type }}</span>
                  </template>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between md:justify-end gap-8">
              <div class="text-right">
                <span
                  :class="[
                    'text-2xl font-black italic',
                    (tx.type === 'CREDIT' || tx.type === 'XP_EARNED' || tx.type.includes('BONUS')) ? 'text-emerald-400' : 'text-rose-400'
                  ]"
                >
                  {{ (tx.type === 'CREDIT' || tx.type === 'XP_EARNED' || tx.type.includes('BONUS')) ?
                    '+' : '-' }}{{
                    formatNumber(tx.amount) }}
                </span>
                <span
                  class="ml-2 text-[10px] font-black text-indigo-200/30 uppercase tracking-widest"
                >{{
                  getTransactionUnit(tx)
                }}</span>

                <!-- Running Balance Display -->
                <div
                  v-if="tx.balanceAfter !== undefined"
                  class="mt-1 text-right"
                >
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Bakiye: <span class="text-white">{{ formatNumber(tx.balanceAfter) }}</span>
                  </p>
                  <p class="text-[8px] font-medium text-gray-500 uppercase tracking-widest">
                    Kullanılabilir: {{ formatNumber(tx.balanceAfter +
                      Number(auth.barterCreditLimit)) }}
                  </p>
                </div>
              </div>
              <div class="bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
                <span
                  class="text-[10px] font-black text-indigo-400 uppercase tracking-widest"
                >TAMAMLANDI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBarterService } from '~/services/api/BarterService'
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import {
    BanknotesIcon,
    ArrowPathIcon,
    BoltIcon,
        InboxIcon,
    ArrowUpRightIcon,
    ArrowDownLeftIcon,
    MegaphoneIcon,
    ShoppingBagIcon
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const barterService = useBarterService()
const transactions = ref([])
const xpTransactions = ref([])
const loading = ref(true)

const formatNumber = (num) => {
    return new Intl.NumberFormat('tr-TR').format(num || 0)
}

const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const fetchInfo = async () => {
    loading.value = true
    try {
        const res = await barterService.getBarterInfo()
                if (res.success) {
                    // Update auth store with fresh data
                    if (auth.user) {
                        if (!auth.user.Wallet) auth.user.Wallet = {}
                        auth.user.Wallet.balance = res.balance
                        auth.user.Wallet.barterBalance = res.barterBalance
                        auth.user.Wallet.barterCreditLimit = res.barterCreditLimit
                        auth.user.Wallet.commissionXP = res.commissionXP
                        auth.user.Wallet.adXP = res.adXP
                        auth.user.Wallet.serviceXP = res.serviceXP
                    }

            // Calculate running balance for Barter Transactions
            const currentBalance = Number(res.barterBalance)

            // Ensure transactions are sorted DESC (Newest first)
            const transactionsList = Array.isArray(res.transactions) ? res.transactions : []
            const sortedTransactions = [...transactionsList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

            // Determine impact based on type and description
            // CREDIT = bakiye artar (+)
            // DEBIT = bakiye azalır (-)
            // TRANSFER: description'da "Gelen" varsa +, "Giden" varsa -
            const processedTransactions = sortedTransactions.map(tx => {
                const amount = Number(tx.amount)
                let impact = 0

                if (tx.type === 'CREDIT') {
                    impact = amount
                } else if (tx.type === 'DEBIT') {
                    impact = -amount
                } else if (tx.type === 'TRANSFER') {
                    // Transfer: check description to determine direction
                    const desc = (tx.description || '').toLowerCase()
                    if (desc.includes('gelen') || desc.includes('giren')) {
                        impact = amount
                    } else {
                        impact = -amount
                    }
                }

                return { ...tx, impact }
            })

            // Walk from newest to oldest, computing balance snapshot after each tx
            let runningVal = currentBalance

            transactions.value = processedTransactions.map(tx => {
                const balanceSnapshot = runningVal
                // Reverse the impact to get previous balance
                runningVal = runningVal - tx.impact

                return {
                    ...tx,
                    balanceAfter: balanceSnapshot
                }
            })

            xpTransactions.value = res.xpTransactions || []
        }
    } catch (err) {
        console.error('Barter info fetch error:', err)
    } finally {
        loading.value = false
    }
}

const activeTab = ref('financial')

const financialTransactions = computed(() => {
    return transactions.value.filter(tx =>
        !tx.description.toLowerCase().includes('takas') &&
        !tx.description.toLowerCase().includes('offer')
    )
})

const tradeTransactions = computed(() => {
    return transactions.value.filter(tx =>
        tx.description.toLowerCase().includes('takas') ||
        tx.description.toLowerCase().includes('offer')
    )
})

const currentTransactions = computed(() => {
    if (activeTab.value === 'financial') return financialTransactions.value
    if (activeTab.value === 'trade') return tradeTransactions.value
    return xpTransactions.value
})

const getTransactionUnit = (tx) => {
    if (tx.currency) {
        // XP Transaction currencies: XP_COMMISSION, XP_AD, XP_SERVICE
        if (tx.currency === 'XP_COMMISSION') return 'Komisyon Puanı'
        if (tx.currency === 'XP_AD') return 'Reklam Puanı'
        if (tx.currency === 'XP_SERVICE') return 'Hizmet Puanı'
        return 'Puan'
    }
    // Barter Transactions
    if (tx.description.includes('Nakit')) return 'TL'
    return 'Puan'
}

onMounted(() => {
    fetchInfo()
})
</script>

<style scoped>
.tracking-tightest {
    letter-spacing: -0.05em;
}

@keyframes slide-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-slide-up {
    animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
