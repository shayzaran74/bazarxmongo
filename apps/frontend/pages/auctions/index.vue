<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          🔥 Açık Artırmalar
        </h1>
        <p class="text-lg text-gray-600 mb-6">
          Benzersiz ürünler için teklif verin ve kazanın!
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            v-if="authStore.user?.isAdmin"
            class="btn-primary"
            @click="showCreateModal = true"
          >
            + Yeni Açık Artırma Oluştur
          </button>
          <NuxtLink
            to="/auctions/my"
            class="btn-secondary"
          >
            Açık Artırmalarım
          </NuxtLink>
        </div>

        <!-- Filters and Search -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Arama</label>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Açık artırma ara..."
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                @input="debounceSearch"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                v-model="selectedCategory"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                @change="fetchAuctions"
              >
                <option value="">
                  Tüm Kategoriler
                </option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
              <select
                v-model="statusFilter"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                @change="fetchAuctions"
              >
                <option value="">
                  Tüm Durumlar
                </option>
                <option value="Active">
                  Aktif
                </option>
                <option value="Completed">
                  Tamamlanmış
                </option>
                <option value="Cancelled">
                  İptal Edilmiş
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
              <select
                v-model="sortBy"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                @change="fetchAuctions"
              >
                <option value="endTime_asc">
                  Bitiş Zamanı (Yakın)
                </option>
                <option value="endTime_desc">
                  Bitiş Zamanı (Uzak)
                </option>
                <option value="currentBid_desc">
                  En Yüksek Teklif
                </option>
                <option value="created_desc">
                  En Yeni
                </option>
                <option value="startPrice_asc">
                  Başlangıç Fiyatı (Düşük)
                </option>
                <option value="startPrice_desc">
                  Başlangıç Fiyatı (Yüksek)
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex justify-center items-center h-64"
      >
        <div class="spinner h-12 w-12" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-md p-4 mb-6"
      >
        <div class="flex">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <p class="text-sm text-red-800">
              {{ error }}
            </p>
            <button
              class="text-sm text-red-600 hover:text-red-500 mt-2"
              @click="fetchAuctions"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>

      <!-- Auctions Grid -->
      <div
        v-else-if="auctions.length > 0"
        class="space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="auction in auctions"
            :key="auction.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
          >
            <!-- Auction Image & Status -->
            <div class="relative">
              <img
                :src="auction.Product?.image"
                :alt="auction.Product?.name"
                class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                @error="handleImageError"
              >
              <div
                class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
                :class="getStatusBadgeClass(auction.status)"
              >
                {{ getStatusText(auction.status) }}
              </div>
              <div class="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                <CountdownTimer
                  :end-time="auction.endTime"
                  size="small"
                />
              </div>
            </div>

            <!-- Auction Info -->
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {{ auction.title }}
              </h3>
              <p class="text-sm text-gray-600 mb-3 line-clamp-1">
                {{ auction.Product?.name }}
              </p>

              <!-- Category -->
              <div class="mb-3">
                <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  {{ auction.Product?.category?.name || 'Genel' }}
                </span>
              </div>

              <!-- Bid Info -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-500">Başlangıç:</span>
                  <span class="text-sm font-medium">{{ formatPrice(auction.startingPrice) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500">Güncel Teklif:</span>
                  <span class="text-lg font-bold text-primary-600">
                    {{ auction.currentPrice ? formatPrice(auction.currentPrice) : formatPrice(auction.startingPrice) }}
                  </span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ auction._count?.bids || 0 }} teklif
                </div>
              </div>

              <!-- Action Button -->
              <NuxtLink
                :to="`/auctions/${auction.id}`"
                class="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-primary-700 hover:to-purple-700 transition-colors text-center block"
              >
                {{ auction.status === 'Active' ? 'Teklif Ver' : 'Detayları Gör' }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="flex justify-center items-center space-x-4 mt-8"
        >
          <button
            :disabled="currentPage <= 1"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changePage(currentPage - 1)"
          >
            Önceki
          </button>

          <div class="flex space-x-2">
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium',
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            :disabled="currentPage >= totalPages"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changePage(currentPage + 1)"
          >
            Sonraki
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-12"
      >
        <div class="text-gray-400 text-6xl mb-4">
          🎯
        </div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          Açık Artırma Bulunamadı
        </h3>
        <p class="text-gray-600 mb-6">
          Aradığınız kriterlere uygun açık artırma bulunamadı.
        </p>
        <button
          class="btn-secondary mr-4"
          @click="clearFilters"
        >
          Filtreleri Temizle
        </button>
        <button
          v-if="authStore.user?.isAdmin"
          class="btn-primary"
          @click="showCreateModal = true"
        >
          Yeni Açık Artırma Oluştur
        </button>
      </div>
    </div>

    <!-- Create Auction Modal -->
    <CreateAuctionModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="onAuctionCreated"
    />
  </div>
</template>

<script setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Page meta
useHead({
  title: 'Açık Artırmalar - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Benzersiz ürünler için açık artırmalara katılın. Teklif verin ve kazanın!'
    }
  ]
})

// Stores
const authStore = useAuthStore()
const { $api } = useApi()

// State
const auctions = ref([])
const loading = ref(false)
const error = ref(null)
const categories = ref([])
const searchQuery = ref('')
const selectedCategory = ref('')
const statusFilter = ref('')
const sortBy = ref('endTime_asc')
const showCreateModal = ref(false)

// Pagination
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = ref(12)

// Computed
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const fetchAuctions = async () => {
  loading.value = true
  error.value = null

  try {
    const query = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      sortBy: sortBy.value
    }

    if (searchQuery.value.trim()) {
      query.search = searchQuery.value.trim()
    }

    if (selectedCategory.value) {
      query.categoryId = selectedCategory.value
    }

    if (statusFilter.value) {
      query.status = statusFilter.value
    }

    const data = await $api('/api/auctions', {
      query
    })

    if (data.success) {
      auctions.value = data.data
      totalPages.value = data.pagination?.totalPages || 1
    } else {
      throw new Error(data.error || 'Açık artırmalar yüklenirken bir hata oluştu')
    }
  } catch (err) {
    error.value = err.message || 'Açık artırmalar yüklenirken bir hata oluştu'
    console.error('Fetch auctions error:', err)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const data = await $api('/api/categories', {
      query: { all: true }
    })

    if (data.success) {
      categories.value = data.data
    }
  } catch (err) {
    console.error('Fetch categories error:', err)
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchAuctions()
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  statusFilter.value = ''
  sortBy.value = 'endTime_asc'
  currentPage.value = 1
  fetchAuctions()
}

const onAuctionCreated = () => {
  showCreateModal.value = false
  sortBy.value = 'created_desc'
  currentPage.value = 1
  fetchAuctions()
}

// Debounced search
let searchTimeout = null
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchAuctions()
  }, 500)
}

// Helper methods
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-500 text-white'
    case 'Completed':
      return 'bg-blue-500 text-white'
    case 'Cancelled':
      return 'bg-red-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'Active':
      return '🔥 CANLI'
    case 'Completed':
      return '✅ BİTTİ'
    case 'Cancelled':
      return '❌ İPTAL'
    default:
      return status
  }
}


const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const handleImageError = (event) => {
  if (event?.target) {
    event.target.onerror = null
    event.target.src = 'https://placehold.co/300x300?text=Ürün+Resmi'
  }
}

// Initialize
onMounted(() => {
  fetchCategories()
  fetchAuctions()
})
</script>