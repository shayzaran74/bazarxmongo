<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Cüzdan Hareketleri
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Tüm sistemdeki nakit cüzdan işlem kayıtları
        </p>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/admin/ledger-dashboard"
          class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-sm"
        >
          📒 Genel Mizan
        </NuxtLink>
        <button
          class="p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
          @click="fetchTransactions"
        >
          <ArrowPathIcon
            class="h-5 w-5 text-gray-600"
            :class="{ 'animate-spin': loading }"
          />
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
      <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filtrele:</span>

      <!-- Type Filter -->
      <div class="flex gap-1 flex-wrap">
        <button
          v-for="t in typeFilters"
          :key="t.value"
          class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
          :class="selectedTypes.includes(t.value)
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
          @click="toggleTypeFilter(t.value)"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="flex-1" />

      <!-- Search -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Kullanıcı ara…"
          class="pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 w-48"
        >
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
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
                Miktar
              </th>
              <th class="px-6 py-4">
                Açıklama
              </th>
              <th class="px-6 py-4">
                Durum
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <!-- Loading Skeleton -->
            <template v-if="loading">
              <tr
                v-for="i in 8"
                :key="'skel-' + i"
              >
                <td
                  colspan="6"
                  class="px-6 py-4"
                >
                  <div class="h-4 bg-gray-100 rounded animate-pulse w-full" />
                </td>
              </tr>
            </template>

            <!-- Data Rows -->
            <tr
              v-for="tx in filteredTransactions"
              :key="tx.id"
              class="hover:bg-gray-50/50 transition-colors text-sm"
            >
              <td class="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                {{ formatDate(tx.createdAt) }}
              </td>
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900 text-sm">
                  {{ tx.userName || 'İsimsiz' }}
                </div>
                <div class="text-[10px] text-gray-400">
                  {{ tx.userEmail }}
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
              <td
                class="px-6 py-4 font-black text-sm"
                :class="tx.type === 'DEBIT' ? 'text-red-500' : 'text-green-600'"
              >
                {{ tx.type === 'DEBIT' ? '−' : '+' }}{{ formatPrice(tx.amount) }}
              </td>
              <td class="px-6 py-4 text-gray-500 text-xs italic max-w-xs truncate">
                {{ tx.description || '—' }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="getStatusBadgeClass(tx.status)"
                  class="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest"
                >
                  {{ tx.status }}
                </span>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="!loading && filteredTransactions.length === 0">
              <td
                colspan="6"
                class="px-6 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs"
              >
                Herhangi bir işlem bulunamadı.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center px-6"
      >
        <button
          :disabled="pagination.page === 1"
          class="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
          @click="changePage(pagination.page - 1)"
        >
          ← Önceki
        </button>
        <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Sayfa {{ pagination.page }} / {{ pagination.totalPages }}
          <span class="text-gray-300 mx-2">|</span>
          Toplam {{ formatNumber(pagination.total) }} kayıt
        </div>
        <button
          :disabled="pagination.page === pagination.totalPages"
          class="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
          @click="changePage(pagination.page + 1)"
        >
          Sonraki →
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

const transactions = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedTypes = ref([])

const pagination = ref({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
})

const typeFilters = [
    { label: 'Tümü', value: '' },
    { label: 'Kredi', value: 'CREDIT' },
    { label: 'Borç', value: 'DEBIT' }
]

const toggleTypeFilter = (value) => {
    if (value === '') {
        selectedTypes.value = []
        return
    }
    if (selectedTypes.value.includes(value)) {
        selectedTypes.value = selectedTypes.value.filter(t => t !== value)
    } else {
        selectedTypes.value = [...selectedTypes.value, value]
    }
}

const filteredTransactions = computed(() => {
    let list = transactions.value
    if (selectedTypes.value.length) {
        list = list.filter(tx => selectedTypes.value.includes(tx.type))
    }
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        list = list.filter(tx =>
            tx.userName?.toLowerCase().includes(q) ||
            tx.userEmail?.toLowerCase().includes(q)
        )
    }
    return list
})

const fetchTransactions = async () => {
    loading.value = true
    try {
        const res = await $api('/api/admin/wallet/transactions', {
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
        console.error('Wallet transactions fetch error:', err)
    } finally {
        loading.value = false
    }
}

const changePage = (newPage) => {
    pagination.value.page = newPage
    fetchTransactions()
}

const formatDate = (date) =>
    new Date(date).toLocaleString('tr-TR', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    })

const formatPrice = (val) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)

const formatNumber = (val) => new Intl.NumberFormat('tr-TR').format(val || 0)

const getTypeBadgeClass = (type) => {
    switch (type) {
        case 'CREDIT': return 'bg-green-100 text-green-700'
        case 'DEBIT': return 'bg-red-100 text-red-700'
        default: return 'bg-gray-100 text-gray-700'
    }
}

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'COMPLETED': return 'bg-green-100 text-green-700'
        case 'PENDING': return 'bg-yellow-100 text-yellow-700'
        case 'FAILED': return 'bg-red-100 text-red-700'
        default: return 'bg-gray-100 text-gray-700'
    }
}

onMounted(() => fetchTransactions())
</script>
