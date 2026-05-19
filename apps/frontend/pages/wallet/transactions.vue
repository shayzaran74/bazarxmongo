<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">
            Cüzdan Hareketleri
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            Nakit, Barter ve XP işlemlerinizin detaylı dökümü
          </p>
        </div>
        <NuxtLink
          to="/wallet"
          class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
        >
          ← Cüzdana Dön
        </NuxtLink>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 flex space-x-2">
        <button
          class="flex-1 py-3 px-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
          :class="activeTab === 'transactions' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
          @click="activeTab = 'transactions'"
        >
          Nakit & Barter İşlemleri
        </button>
        <button
          class="flex-1 py-3 px-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
          :class="activeTab === 'ledger' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
          @click="activeTab = 'ledger'"
        >
          BazarX XP & Ledger Akışı
        </button>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex justify-center items-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100"
      >
        <div class="spinner h-12 w-12 text-indigo-600" />
      </div>

      <!-- Content Area -->
      <div
        v-else
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <!-- Tab: Transactions (Account Transactions) -->
        <div v-if="activeTab === 'transactions'">
          <div
            v-if="transactions.length > 0"
            class="overflow-x-auto"
          >
            <table class="w-full text-left border-collapse">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th
                    class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    Tarih
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    Açıklama
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    Hesap Türü
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right"
                  >
                    Tutar
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="tx in transactions"
                  :key="tx.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {{ new Date(tx.createdAt).toLocaleString('tr-TR', {
                      dateStyle: 'medium',
                      timeStyle: 'short' }) }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-bold text-gray-900">
                      {{ tx.description || 'İşlem' }}
                    </div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                      {{
                        tx.type }} | REF: {{ tx.referenceId || '-' }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest"
                      :class="{
                        'bg-blue-100 text-blue-700': (tx.account?.type || tx.accountType) === 'MAIN',
                        'bg-orange-100 text-orange-700': (tx.account?.type || tx.accountType) === 'BARTER',
                        'bg-purple-100 text-purple-700': (tx.account?.type || tx.accountType)?.includes('XP'),
                        'bg-gray-100 text-gray-700': (tx.account?.type || tx.accountType) === 'SYSTEM'
                      }"
                    >
                      {{ (tx.account?.type || tx.accountType) === 'MAIN' ? 'Nakit' : (tx.account?.type || tx.accountType) === 'BARTER' ? 'Barter' : (tx.account?.type || tx.accountType) === 'SYSTEM' ? 'Sistem' : (tx.account?.type || tx.accountType) || 'Bilinmiyor' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right whitespace-nowrap">
                    <span
                      class="text-sm font-black"
                      :class="tx.direction === 'DEBIT' ? 'text-red-600' : 'text-green-600'"
                    >
                      {{ tx.direction === 'DEBIT' ? '-' : '+' }}{{ formatPrice(tx.amount) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-else
            class="text-center py-20 px-6"
          >
            <div class="text-5xl mb-4">
              💳
            </div>
            <h3 class="text-lg font-bold text-gray-900">
              İşlem Bulunamadı
            </h3>
            <p class="text-gray-500 mt-1">
              Bu hesap türleri için herhangi bir cüzdan hareketiniz yok.
            </p>
          </div>
        </div>

        <!-- Tab: Ledger (User Ledger Entries) -->
        <div v-if="activeTab === 'ledger'">
          <div
            v-if="ledgerEntries.length > 0"
            class="overflow-x-auto"
          >
            <table class="w-full text-left border-collapse">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th
                    class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    Tarih
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    Ledger Açıklaması
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    Para Birimi / XP Türü
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right"
                  >
                    Miktar (XP/TRY)
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="entry in ledgerEntries"
                  :key="entry.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {{ new Date(entry.createdAt).toLocaleString('tr-TR', {
                      dateStyle: 'medium',
                      timeStyle: 'short' }) }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-bold text-gray-900">
                      {{ entry.description || 'Sistem Kaydı' }}
                    </div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                      TİP: {{
                        entry.type }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-700 border border-gray-200"
                      :class="{ '!bg-purple-100 !text-purple-700 !border-purple-200': entry.currency.includes('XP') }"
                    >
                      {{ entry.currency }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right whitespace-nowrap text-sm font-black text-gray-900">
                    {{ formatPrice(entry.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-else
            class="text-center py-20 px-6"
          >
            <div class="text-5xl mb-4">
              🧾
            </div>
            <h3 class="text-lg font-bold text-gray-900">
              Ledger Kaydı Bulunamadı
            </h3>
            <p class="text-gray-500 mt-1">
              Sistem üzerinde oluşturulmuş finansal/barter XP hareketiniz
              bulunmamaktadır.
            </p>
          </div>
        </div>
      </div>

      <!-- Pagination Support (Simplified representation, you can plug real pagination logically here) -->
      <div
        v-if="!loading"
        class="mt-4 flex justify-between items-center text-sm text-gray-500 font-bold uppercase tracking-widest px-2"
      >
        <span>Kayıtlar listelendi.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

definePageMeta({
    layout: 'default',
    middleware: 'auth'
})

useHead({
    title: 'Cüzdan Hareketleri - TicariTakas',
})

const { fetchTransactions, fetchLedger, formatPrice } = useWallet()

const activeTab = ref('transactions')
const loading = ref(true)

const transactions = ref([])
const ledgerEntries = ref([])

const loadData = async () => {
    loading.value = true
    try {
        if (activeTab.value === 'transactions') {
            if (transactions.value.length === 0) {
                const res = await fetchTransactions({ limit: 100 })
                if (res.success) {
                    const rawData = (res).data
                    const items = Array.isArray(rawData) 
                        ? rawData 
                        : (rawData?.items || [])
                    transactions.value = items.filter(tx => (tx.account?.type || tx.accountType) !== 'SYSTEM')
                }
            }
        } else {
            if (ledgerEntries.value.length === 0) {
                const res = await fetchLedger({ limit: 100 })
                if (res.success) {
                    const rawData = (res).data
                    const items = Array.isArray(rawData) 
                        ? rawData 
                        : (rawData?.items || [])
                    ledgerEntries.value = items.filter(tx => (tx.account?.type || tx.accountType) === 'SYSTEM')
                }
            }
        }
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

watch(activeTab, () => {
    loadData()
})

onMounted(() => {
    loadData()
})
</script>

<style scoped>
.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
