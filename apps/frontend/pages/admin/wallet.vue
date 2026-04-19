<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Cüzdan Yönetimi
        </h1>
        <p class="text-gray-600">
          {{ activeTab === 'topup' ? 'Kullanıcı bakiye yükleme taleplerini yönetin' : 'Kullanıcı para çekme taleplerini yönetin' }}
        </p>
      </div>
      <div class="flex bg-gray-100 p-1 rounded-xl">
        <button 
          class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
          :class="activeTab === 'topup' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          @click="changeTab('topup')"
        >
          Yükleme Talepleri
        </button>
        <button 
          class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
          :class="activeTab === 'withdrawal' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          @click="changeTab('withdrawal')"
        >
          Çekme Talepleri
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <ClockIcon class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">
              Bekleyen Talepler
            </h3>
            <p class="text-2xl font-bold text-gray-900">
              {{ stats.pending }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">
              Onaylanan
            </h3>
            <p class="text-2xl font-bold text-gray-900">
              {{ stats.approved }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <XCircleIcon class="h-6 w-6 text-red-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">
              Reddedilen
            </h3>
            <p class="text-2xl font-bold text-gray-900">
              {{ stats.rejected }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <CurrencyDollarIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-gray-500">
              Toplam Tutar
            </h3>
            <p class="text-2xl font-bold text-gray-900">
              {{ formatPrice(stats.totalAmount) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Durum</label>
          <select
            v-model="filters.status"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            @change="fetchRequests"
          >
            <option value="">
              Tümü
            </option>
            <option value="pending">
              Bekleyen
            </option>
            <option value="approved">
              Onaylanan
            </option>
            <option value="rejected">
              Reddedilen
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Ara</label>
          <input
            v-model="filters.user"
            type="text"
            placeholder="İsim veya email"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            @input="searchRequests"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Min. Tutar</label>
          <input
            v-model="filters.minAmount"
            type="number"
            min="0"
            placeholder="0"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            @input="searchRequests"
          >
        </div>

        <div class="flex items-end">
          <button
            class="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            @click="clearFilters"
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>
    </div>

    <!-- Requests Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div
        v-if="loading"
        class="flex justify-center items-center h-64"
      >
        <div class="spinner h-12 w-12" />
      </div>

      <div
        v-else-if="error"
        class="p-6"
      >
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <p class="text-sm text-red-800">
                {{ error }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutar
              </th>
              <th
                v-if="activeTab === 'topup'"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Yöntem
              </th>
              <th
                v-else
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Banka Bilgileri
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarih
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="request in filteredRequests"
              :key="request.id"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserIcon class="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getUserFullName(request.user) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ request.user?.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatPrice(request.amount) }}
                </div>
              </td>
              <td
                v-if="activeTab === 'topup'"
                class="px-6 py-4 whitespace-nowrap"
              >
                <div
                  class="text-sm text-gray-900 border px-2 py-0.5 rounded inline-block bg-gray-50 uppercase text-[10px] font-bold"
                >
                  {{ request.paymentMethod }}
                </div>
              </td>
              <td
                v-else
                class="px-6 py-4 whitespace-nowrap"
              >
                <div class="text-sm text-gray-900 font-bold">
                  {{ request.bankName }}
                </div>
                <div class="text-[10px] text-gray-500 font-mono">
                  {{ request.iban }}
                </div>
                <div class="text-[10px] text-gray-400 italic">
                  {{ request.accountHolder }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', STATUS_CONFIG[request.status.toUpperCase()]?.class || 'bg-gray-100 text-gray-800']">
                  {{ STATUS_CONFIG[request.status.toUpperCase()]?.label || request.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(request.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div
                  v-if="String(request.status).toUpperCase() === 'PENDING'"
                  class="space-x-2"
                >
                  <button
                    :disabled="processingRequests.has(request.id)"
                    class="text-green-600 hover:text-green-900 disabled:opacity-50"
                    @click="approveRequest(request)"
                  >
                    <CheckIcon class="h-5 w-5" />
                  </button>
                  <button
                    :disabled="processingRequests.has(request.id)"
                    class="text-red-600 hover:text-red-900 disabled:opacity-50"
                    @click="rejectRequest(request)"
                  >
                    <XMarkIcon class="h-5 w-5" />
                  </button>
                </div>
                <span
                  v-else
                  class="text-gray-400 text-sm"
                >
                  {{ STATUS_CONFIG[request.status.toUpperCase()]?.label || 'Reddedildi' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div
          v-if="filteredRequests.length === 0"
          class="text-center py-12"
        >
          <CurrencyDollarIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            Talep bulunamadı
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Filtrelere uygun cüzdan yükleme talebi bulunamadı.
          </p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.total > pagination.limit"
      class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
    >
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          :disabled="pagination.page <= 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          @click="changePage(pagination.page - 1)"
        >
          Önceki
        </button>
        <button
          :disabled="pagination.page >= pagination.pages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          @click="changePage(pagination.page + 1)"
        >
          Sonraki
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Page meta
useHead({
  title: 'Cüzdan Yönetimi - Admin Panel',
  meta: [
    { name: 'description', content: 'Cüzdan yükleme taleplerini yönetme sayfası' }
  ]
})

// Stores
const { $api } = useApi()

// State
const requests = ref([])
const filteredRequests = ref([])
const loading = ref(false)
const error = ref(null)
const processingRequests = ref(new Set())
const activeTab = ref('topup')

// Watch for route changes to update tab
const route = useRoute()
watch(() => route.query.tab, (newTab) => {
  if (newTab && ['topup', 'withdrawal'].includes(newTab)) {
    activeTab.value = newTab
    fetchRequests()
  }
})

const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  totalAmount: 0
})

const filters = ref({
  status: '',
  user: '',
  minAmount: ''
})

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

// Methods
onMounted(() => {
  if (route.query.tab && ['topup', 'withdrawal'].includes(route.query.tab)) {
    activeTab.value = route.query.tab
  }
  fetchRequests()
})

const fetchRequests = async () => {
  loading.value = true
  error.value = null

  const endpoint = activeTab.value === 'topup' 
    ? '/api/admin/wallet/requests' 
    : '/api/admin/wallet/withdrawals'

  try {
    const response = await $api(endpoint, {
      query: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...filters.value
      }
    })

    if (response.success) {
      requests.value = response.items || (Array.isArray(response.data) ? response.data : (response.data?.items || []))
      stats.value = response.stats || response.data?.stats || stats.value
      pagination.value = { ...pagination.value, ...(response.pagination || response.data?.pagination) }
      applyFilters()
    } else {
      throw new Error(response.error || 'Talepler yüklenirken hata oluştu')
    }
  } catch (err) {
    error.value = err.message || 'Talepler yüklenirken hata oluştu'
    console.error('Fetch requests error:', err)
  } finally {
    loading.value = false
  }
}

const changeTab = (tab) => {
  navigateTo({ query: { ...route.query, tab } })
}

const approveRequest = async (request) => {
  if (!confirm(`${getUserFullName(request.user)} kullanıcısının ${formatPrice(request.amount)} tutarındaki talebini onaylamak istediğinizden emin misiniz?`)) {
    return
  }

  processingRequests.value.add(request.id)

  const endpoint = activeTab.value === 'topup'
    ? `/api/admin/wallet/requests/${request.id}/approve`
    : `/api/admin/wallet/withdrawals/${request.id}/approve`

  try {
    const response = await $api(endpoint, {
      method: 'POST',
      body: {}
    })

    if (response.success) {
      useNuxtApp().$toast.success('Talep başarıyla onaylandı!')
      await fetchRequests()
    } else {
      throw new Error(response.error || 'Talep onaylanırken hata oluştu')
    }
  } catch (err) {
    useNuxtApp().$toast.error(err.message || 'Talep onaylanırken hata oluştu')
    console.error('Approve request error:', err)
  } finally {
    processingRequests.value.delete(request.id)
  }
}

const rejectRequest = async (request) => {
  const reason = prompt('Reddetme nedeni (opsiyonel):')
  if (reason === null) return // Cancelled

  processingRequests.value.add(request.id)

  const endpoint = activeTab.value === 'topup'
    ? `/api/admin/wallet/requests/${request.id}/reject`
    : `/api/admin/wallet/withdrawals/${request.id}/reject`

  try {
    const response = await $api(endpoint, {
      method: 'POST',
      body: { reason }
    })

    if (response.success) {
      useNuxtApp().$toast.success('Talep reddedildi')
      await fetchRequests()
    } else {
      throw new Error(response.error || 'Talep reddedilirken hata oluştu')
    }
  } catch (err) {
    useNuxtApp().$toast.error(err.message || 'Talep reddedilirken hata oluştu')
    console.error('Reject request error:', err)
  } finally {
    processingRequests.value.delete(request.id)
  }
}

const searchRequests = () => {
  applyFilters()
}

const applyFilters = () => {
  let filtered = [...(requests.value || [])]

  if (filters.value.status) {
    const fStatus = filters.value.status.toLowerCase()
    filtered = filtered.filter(req => {
      const rStatus = req.status.toLowerCase()
      if (fStatus === 'approved') return rStatus === 'approved' || rStatus === 'completed'
      return rStatus === fStatus
    })
  }

  if (filters.value.user) {
    const searchTerm = filters.value.user.toLowerCase()
    filtered = filtered.filter(req =>
      req.user?.name?.toLowerCase().includes(searchTerm) ||
      req.user?.email?.toLowerCase().includes(searchTerm)
    )
  }

  if (filters.value.minAmount) {
    filtered = filtered.filter(req => req.amount >= parseFloat(filters.value.minAmount))
  }

  filteredRequests.value = filtered
}

const clearFilters = () => {
  filters.value = {
    status: '',
    user: '',
    minAmount: ''
  }
  fetchRequests()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    fetchRequests()
  }
}

// Helper methods
// UI Configuration Maps
const STATUS_CONFIG = {
  PENDING: { label: 'Bekliyor', class: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Onaylandı', class: 'bg-green-100 text-green-800' },
  COMPLETED: { label: 'Onaylandı', class: 'bg-green-100 text-green-800' },
  PROCESSED: { label: 'Onaylandı', class: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Reddedildi', class: 'bg-red-100 text-red-800' }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getUserFullName = (user) => {
  if (!user) return 'İsimsiz'
  if (user.profile && (user.profile.firstName || user.profile.lastName)) {
    return `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
  }
  return user.name || user.email || 'İsimsiz'
}

// Initialize
onMounted(() => {
  fetchRequests()
})
</script>

<style scoped>
.spinner {
  @apply border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin;
}
</style>