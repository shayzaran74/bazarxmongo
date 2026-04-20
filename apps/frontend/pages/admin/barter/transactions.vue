<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Barter Hareketleri
        </h1>
        <p class="text-sm text-gray-500">
          Tüm sistemdeki Barter puan ve XP hareketlerini buradan
          izleyebilirsiniz.
        </p>
      </div>
      <button
        class="p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
        @click="fetchTransactions"
      >
        <ArrowPathIcon class="h-5 w-5 text-gray-600" />
      </button>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav
        class="-mb-px flex space-x-8"
        aria-label="Tabs"
      >
        <button
          :class="[activeTab === 'barter' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']"
          @click="activeTab = 'barter'; pagination.page = 1; fetchTransactions()"
        >
          Barter (Ledger)
        </button>
        <button
          :class="[activeTab === 'xp' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']"
          @click="activeTab = 'xp'; pagination.page = 1; fetchTransactions()"
        >
          XP (Puan)
        </button>
      </nav>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr v-if="activeTab === 'barter'">
              <th class="px-6 py-4">
                Tarih
              </th>
              <th class="px-6 py-4">
                İşlem Yapan
              </th>
              <th class="px-6 py-4">
                Tür
              </th>
              <th class="px-6 py-4">
                Borçlu (Debit)
              </th>
              <th class="px-6 py-4">
                Alacaklı (Credit)
              </th>
              <th class="px-6 py-4">
                Miktar
              </th>
              <th class="px-6 py-4">
                Açıklama
              </th>
            </tr>
            <tr v-else>
              <th class="px-6 py-4">
                Tarih
              </th>
              <th class="px-6 py-4">
                Kullanıcı
              </th>
              <th class="px-6 py-4">
                Tür
              </th>
              <th class="px-6 py-4">
                Puan Türü
              </th>
              <th class="px-6 py-4">
                Miktar
              </th>
              <th class="px-6 py-4">
                Açıklama
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <template v-if="activeTab === 'barter'">
              <tr
                v-for="tx in transactions"
                :key="tx.id"
                class="hover:bg-gray-50/50 transition-colors text-sm"
              >
                <td class="px-6 py-4 text-gray-500">
                  {{ formatDate(tx.createdAt) }}
                </td>
                <td class="px-6 py-4">
                  <div class="font-bold text-gray-900">
                    {{ tx.wallet?.User?.name || 'Sistem' }}
                  </div>
                  <div class="text-[10px] text-gray-400">
                    {{ tx.wallet?.User?.email }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="getTypeBadgeClass(tx.type)"
                    class="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"
                  >
                    {{ tx.type }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    v-if="tx.DebitWallet"
                    class="font-medium text-gray-700"
                  >
                    {{ tx.DebitWallet.User?.name || tx.DebitWallet.User?.email }}
                  </span>
                  <span
                    v-else
                    class="text-gray-300"
                  >-</span>
                </td>
                <td class="px-6 py-4">
                  <span
                    v-if="tx.CreditWallet"
                    class="font-medium text-gray-700"
                  >
                    {{ tx.CreditWallet.User?.name || tx.CreditWallet.User?.email }}
                  </span>
                  <span
                    v-else
                    class="text-gray-300"
                  >-</span>
                </td>
                <td
                  class="px-6 py-4 font-black"
                  :class="tx.type === 'DEBIT' ? 'text-red-500' : 'text-green-600'"
                >
                  {{ tx.type === 'DEBIT' ? '-' : '+' }}{{ formatPoints(tx.amount) }}
                </td>
                <td class="px-6 py-4 text-gray-600 italic text-xs">
                  {{ tx.description }}
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="tx in transactions"
                :key="tx.id"
                class="hover:bg-gray-50/50 transition-colors text-sm"
              >
                <td class="px-6 py-4 text-gray-500">
                  {{ formatDate(tx.createdAt) }}
                </td>
                <td class="px-6 py-4">
                  <div class="font-bold text-gray-900">
                    {{ tx.user?.name || 'Bilinmiyor' }}
                  </div>
                  <div class="text-[10px] text-gray-400">
                    {{ tx.user?.email }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="getXPTypeBadgeClass(tx.type)"
                    class="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"
                  >
                    {{ tx.type }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {{ tx.currency }}
                  </span>
                </td>
                <td class="px-6 py-4 font-black text-indigo-600">
                  {{ formatPoints(tx.amount) }} XP
                </td>
                <td class="px-6 py-4 text-gray-600 italic text-xs">
                  {{ tx.description }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div
        v-if="transactions.length === 0 && !loading"
        class="p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs"
      >
        Herhangi bir işlem bulunamadı.
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center px-6"
      >
        <button
          :disabled="pagination.page === 1"
          class="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 disabled:opacity-30"
          @click="changePage(pagination.page - 1)"
        >
          Önceki
        </button>
        <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Sayfa {{ pagination.page }} / {{ pagination.totalPages }}
        </div>
        <button
          :disabled="pagination.page === pagination.totalPages"
          class="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 disabled:opacity-30"
          @click="changePage(pagination.page + 1)"
        >
          Sonraki
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

const { $api } = useApi()
const toast = useNuxtApp().$toast

const transactions = ref([])
const loading = ref(false)
const activeTab = ref('barter')
const pagination = ref({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
})

const fetchTransactions = async () => {
    loading.value = true
    try {
        const endpoint = activeTab.value === 'barter'
            ? '/api/v1/admin/barter/transactions'
            : '/api/v1/admin/barter/xp-transactions'

        const res = await $api(endpoint, {
            params: {
                page: pagination.value.page,
                limit: pagination.value.limit
            }
        })
        if (res.success) {
            transactions.value = res.data
            pagination.value = { ...pagination.value, ...res.pagination }
        }
    } catch (err) {
        toast.error('İşlemler yüklenemedi.')
    } finally {
        loading.value = false
    }
}

const changePage = (newPage) => {
    pagination.value.page = newPage
    fetchTransactions()
}

const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR')
}

const formatPoints = (val) => {
    return new Intl.NumberFormat('tr-TR').format(val)
}

const getTypeBadgeClass = (type) => {
    switch (type) {
        case 'TRANSFER': return 'bg-blue-100 text-blue-700'
        case 'CREDIT': return 'bg-green-100 text-green-700'
        case 'DEBIT': return 'bg-red-100 text-red-700'
        default: return 'bg-gray-100 text-gray-700'
    }
}

const getXPTypeBadgeClass = (type) => {
    switch (type) {
        case 'XP_EARNED': return 'bg-green-100 text-green-700'
        case 'AD_SPEND': return 'bg-purple-100 text-purple-700'
        case 'SERVICE_SPEND': return 'bg-orange-100 text-orange-700'
        case 'REFERRAL_BONUS': return 'bg-indigo-100 text-indigo-700'
        default: return 'bg-gray-100 text-gray-700'
    }
}

onMounted(() => {
    fetchTransactions()
})
</script>
