<template>
  <div class="py-10 px-6 max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-end gap-6">
      <div>
        <h1 class="text-4xl font-black text-gray-900 italic tracking-tight uppercase leading-none mb-3">
          💰 Cüzdan <span class="text-indigo-600 underline decoration-indigo-100">Yönetimi</span>
        </h1>
        <p class="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] opacity-70">
          {{ activeTab === 'topup' ? 'Bakiye yükleme taleplerini onaylayın' : 'Para çekme taleplerini işleme alın' }}
        </p>
      </div>

      <!-- Tab Switcher -->
      <div class="flex bg-gray-900 p-1.5 rounded-[24px] shadow-2xl">
        <button 
          v-for="tab in [{ id: 'topup', label: 'Yükleme Talepleri' }, { id: 'withdrawal', label: 'Çekme Talepleri' }]"
          :key="tab.id"
          class="px-8 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all italic"
          :class="activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'"
          @click="changeTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Stats -->
    <AdminWalletStats :stats="stats" :format-price="formatPrice" />

    <!-- Filters -->
    <AdminWalletFilters v-model="filters" @search="fetchRequests" @clear="resetFilters" />

    <!-- Main Table -->
    <AdminWalletTable 
      :items="requests" 
      :active-tab="activeTab"
      :loading="loading"
      :processing="processingRequests"
      :format-price="formatPrice"
      :format-date="formatDate"
      @approve="handleApprove"
      @reject="handleReject"
    />

    <!-- Minimal Pagination -->
    <div v-if="pagination.pages > 1" class="flex justify-center gap-2">
      <button 
        v-for="p in pagination.pages" :key="p"
        class="w-10 h-10 rounded-xl font-black text-xs transition-all border"
        :class="pagination.page === p ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'"
        @click="pagination.page = p; fetchRequests()"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAdminWallet } from '~/composables/useAdminWallet'
import AdminWalletStats from '~/components/admin/wallet/AdminWalletStats.vue'
import AdminWalletFilters from '~/components/admin/wallet/AdminWalletFilters.vue'
import AdminWalletTable from '~/components/admin/wallet/AdminWalletTable.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Cüzdan Yönetimi - Admin' })

const { 
  activeTab, loading, requests, stats, filters, pagination, processingRequests,
  changeTab, fetchRequests, processRequest 
} = useAdminWallet()

// Formatter Helpers
const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p)
const formatDate = (d) => new Date(d).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const resetFilters = () => {
  filters.value = { status: '', user: '', minAmount: '' }
  fetchRequests()
}

const handleApprove = async (req) => {
  if (confirm(`${req.user?.email} kullanıcısının ${formatPrice(req.amount)} tutarlı talebini onaylıyor musunuz?`)) {
    await processRequest(req.id, 'approve')
  }
}

const handleReject = async (req) => {
  const reason = prompt('Reddetme nedeni (opsiyonel):')
  if (reason !== null) await processRequest(req.id, 'reject', reason)
}

onMounted(fetchRequests)
</script>