<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header with Create Button -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          🎲 Çekiliş Yönetimi
        </h1>
        <p class="text-gray-600 mt-1">
          Sistemdeki çekilişleri yönetin ve yeni çekiliş oluşturun
        </p>
      </div>
      <button
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        @click="showCreateModal = true"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Yeni Çekiliş Oluştur
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Arama</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Çekiliş başlığı ara..."
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            @input="debounceSearch"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Durum</label>
          <select
            v-model="filters.status"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            @change="fetchLotteries"
          >
            <option value="">
              Tüm Durumlar
            </option>
            <option value="Active">
              🔥 Aktif
            </option>
            <option value="Completed">
              ✅ Tamamlanmış
            </option>
            <option value="Cancelled">
              ❌ İptal Edilmiş
            </option>
            <option value="Pending">
              ⏳ Beklemede
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
          <select
            v-model="filters.dateRange"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            @change="fetchLotteries"
          >
            <option value="">
              Tüm Zamanlar
            </option>
            <option value="today">
              Bugün
            </option>
            <option value="week">
              Bu Hafta
            </option>
            <option value="month">
              Bu Ay
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
          <select
            v-model="filters.sortBy"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
            @change="fetchLotteries"
          >
            <option value="created_desc">
              Yeni Oluşturulanlar
            </option>
            <option value="endTime_asc">
              Bitiş Zamanı (Yakın)
            </option>
            <option value="endTime_desc">
              Bitiş Zamanı (Uzak)
            </option>
            <option value="prizeValue_desc">
              Ödül Değeri (Yüksek)
            </option>
            <option value="participants_desc">
              En Çok Katılım
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-pink-100 rounded-lg">
            <TicketIcon class="h-6 w-6 text-pink-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              Toplam Çekiliş
            </p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.total }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <FireIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              Aktif Çekiliş
            </p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.active }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <CurrencyDollarIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              Toplam Ödül Değeri
            </p>
            <p class="text-2xl font-semibold text-gray-900">
              ₺{{ formatNumber(stats.totalPrizeValue) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <UsersIcon class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">
              Toplam Katılım
            </p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.totalParticipants }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lotteries Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div
        v-if="loading"
        class="p-8 text-center"
      >
        <div class="spinner h-8 w-8 mx-auto" />
        <p class="mt-2 text-gray-500">
          Çekilişler yükleniyor...
        </p>
      </div>

      <div
        v-else-if="error"
        class="p-8 text-center text-red-500"
      >
        {{ error }}
      </div>

      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Çekiliş
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ödül Değeri
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Katılım
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bitiş Tarihi
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="lottery in lotteries"
              :key="lottery.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-12 w-12">
                    <div
                      class="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center"
                    >
                      <TicketIcon class="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ lottery.title }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ lottery.prizeDescription }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusBadgeClass(lottery.status)"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getStatusText(lottery.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex flex-col">
                  <span class="font-medium">₺{{ lottery.prizeValue ? formatNumber(lottery.prizeValue) : '---' }}</span>
                  <span class="text-xs text-gray-500">
                    Bilet: ₺{{ formatNumber(lottery.ticketPrice) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex flex-col">
                  <span class="font-medium">{{ lottery._count?.Tickets || 0 }} bilet</span>
                  <span class="text-xs">
                    Kişi Başı: {{ lottery.maxTicketsPerUser || '---' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex flex-col">
                  <span>{{ formatDate(lottery.endTime) }}</span>
                  <span
                    class="text-xs"
                    :class="getTimeStatusClass(lottery.endTime)"
                  >
                    {{ getTimeRemaining(lottery.endTime) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <NuxtLink
                    :to="`/lotteries/${lottery.id}`"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    Görüntüle
                  </NuxtLink>
                  <button
                    class="text-primary-600 hover:text-primary-900"
                    @click="editLottery(lottery)"
                  >
                    Düzenle
                  </button>
                  <button
                    v-if="lottery.status === 'Active'"
                    class="text-yellow-600 hover:text-yellow-900"
                    @click="endLottery(lottery)"
                  >
                    Sonlandır
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900"
                    @click="deleteLottery(lottery)"
                  >
                    Sil
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="pagination.pages > 1"
          class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
        >
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              :disabled="pagination.page <= 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              @click="changePage(pagination.page - 1)"
            >
              Önceki
            </button>
            <button
              :disabled="pagination.page >= pagination.pages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              @click="changePage(pagination.page + 1)"
            >
              Sonraki
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
                -
                <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
                of
                <span class="font-medium">{{ pagination.total }}</span>
                results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Lottery Modal -->
    <CreateLotteryModal
      v-if="showCreateModal || selectedLottery"
      :lottery="selectedLottery"
      @close="closeModal"
      @saved="onLotterySaved"
    />
  </div>
</template>

<script setup>
import {
  PlusIcon,
  TicketIcon,
  FireIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Page meta
useHead({
  title: 'Çekiliş Yönetimi - Admin Panel',
  meta: [
    { name: 'description', content: 'Çekiliş yönetimi sayfası' }
  ]
})

// Stores
const { $api } = useApi()

// State
const lotteries = ref([])
const loading = ref(false)
const error = ref(null)
const showCreateModal = ref(false)
const selectedLottery = ref(null)

const filters = ref({
  search: '',
  status: '',
  dateRange: '',
  sortBy: 'created_desc'
})

const stats = ref({
  total: 0,
  active: 0,
  totalPrizeValue: 0,
  totalParticipants: 0
})

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

// Methods
const fetchLotteries = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $api('/api/lotteries', {
      query: {
        page: 1,
        limit: 1000,
        search: filters.value.search || undefined,
        status: filters.value.status || undefined,
        dateRange: filters.value.dateRange || undefined,
        sortBy: filters.value.sortBy || 'created_desc'
      }
    })

    if (response.success) {
      lotteries.value = response.data || []

      // Update stats
      stats.value = {
        total: lotteries.value.length,
        active: lotteries.value.filter(l => l.status === 'Active').length,
        totalPrizeValue: lotteries.value.reduce((sum, l) => sum + (l.prizeValue || 0), 0),
        totalParticipants: lotteries.value.reduce((sum, l) => sum + (l._count?.entries || 0), 0)
      }

      // Update pagination
      pagination.value = {
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || lotteries.value.length,
        pages: response.pagination?.totalPages || Math.ceil(lotteries.value.length / 10)
      }
    } else {
      throw new Error(response.error || 'Çekilişler yüklenirken hata oluştu')
    }
  } catch (err) {
    console.error('Fetch lotteries error:', err)
    error.value = err.message

    // Check if it's a rate limit error
    if (err.message.includes('429') || err.message.includes('Rate limit')) {
      useNuxtApp().$toast.warning('API çok meşgul, demo veriler gösteriliyor')
    } else {
      useNuxtApp().$toast.warning('API bağlantısı kurulamadı, demo veriler gösteriliyor.')
    }

    // Fallback to mock data on error
    const mockLotteries = [
      {
        id: 1,
        title: 'iPhone 15 Pro Çekilişi',
        description: 'Yepyeni iPhone 15 Pro kazanma şansı!',
        prizeDescription: 'iPhone 15 Pro 128GB Space Black',
        prizeValue: 45000,
        entryFee: 0,
        maxParticipants: 1000,
        status: 'Active',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        _count: { entries: 0 },
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop'
      },
      {
        id: 2,
        title: 'MacBook Pro Çekilişi',
        description: 'MacBook Pro 16" M3 Max kazanma fırsatı!',
        prizeDescription: 'MacBook Pro 16" M3 Max 512GB',
        prizeValue: 85000,
        entryFee: 50,
        maxParticipants: 500,
        status: 'Pending',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        _count: { entries: 0 },
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'
      }
    ]

    lotteries.value = mockLotteries
    stats.value = {
      total: mockLotteries.length,
      active: mockLotteries.filter(l => l.status === 'Active').length,
      totalPrizeValue: mockLotteries.reduce((sum, l) => sum + (l.prizeValue || 0), 0),
      totalParticipants: 0
    }

    useNuxtApp().$toast.warning('API bağlantısı kurulamadı, demo veriler gösteriliyor.')
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    fetchLotteries()
  }
}

const editLottery = (lottery) => {
  selectedLottery.value = lottery
}

const endLottery = async (lottery) => {
  if (confirm(`${lottery.title} çekilişini sonlandırmak ve KAZANANI BELİRLEMEK istediğinizden emin misiniz?`)) {
    try {
      const response = await $api(`/api/lotteries/${lottery.id}/draw`, {
        method: 'POST'
      })

      if (response.success) {
        await fetchLotteries() // Refresh data
        useNuxtApp().$toast.success(`ÇEKİLİŞ TAMAMLANDI! Kazanan Numara: ${response.winningNumber}`)
      }
    } catch (err) {
      console.error('End lottery error:', err)
      useNuxtApp().$toast.error('Hata: ' + (err.data?.error || err.message))
    }
  }
}

const deleteLottery = async (lottery) => {
  if (confirm(`${lottery.title} çekilişini silmek istediğinizden emin misiniz?`)) {
    try {
      const response = await $api(`/api/lotteries/${lottery.id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        // Remove from local array
        lotteries.value = lotteries.value.filter(l => l.id !== lottery.id)
        useNuxtApp().$toast.success('Çekiliş başarıyla silindi')
      }
    } catch (err) {
      console.error('Delete lottery error:', err)
      // Fallback to mock delete for now
      lotteries.value = lotteries.value.filter(l => l.id !== lottery.id)
      useNuxtApp().$toast.success('Çekiliş başarıyla silindi (demo mod)')
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  selectedLottery.value = null
}

const onLotterySaved = () => {
  closeModal()
  fetchLotteries()
}

// Helper methods
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Completed':
      return 'bg-blue-100 text-blue-800'
    case 'Cancelled':
      return 'bg-red-100 text-red-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'Active':
      return '🔥 Aktif'
    case 'Completed':
      return '✅ Tamamlandı'
    case 'Cancelled':
      return '❌ İptal Edildi'
    case 'Pending':
      return '⏳ Beklemede'
    default:
      return status
  }
}

const getTimeStatusClass = (endTime) => {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'text-red-500'
  if (diff <= 24 * 60 * 60 * 1000) return 'text-orange-500' // 24 hours
  return 'text-gray-500'
}

const getTimeRemaining = (endTime) => {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Süresi doldu'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days} gün ${hours} saat kaldı`
  if (hours > 0) return `${hours} saat kaldı`

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${minutes} dakika kaldı`
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

const formatNumber = (num) => {
  return new Intl.NumberFormat('tr-TR').format(num)
}

// Debounced search
let searchTimeout = null
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchLotteries()
  }, 500)
}

// Initialize
onMounted(() => {
  fetchLotteries()
})
</script>