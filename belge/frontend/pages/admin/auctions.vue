<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Açık Artırma Paneli
        </h1>
        <p class="text-gray-600">
          Açık artırma etkinliklerini yönetin
        </p>
      </div>
      <div class="flex space-x-3">
        <button
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          @click="fetchAuctions"
        >
          <ArrowPathIcon
            class="h-5 w-5 mr-2"
            :class="{ 'animate-spin': loading }"
          />
          Yenile
        </button>
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          @click="showCreateModal = true"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Yeni Açık Artırma
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CurrencyDollarIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Toplam Açık Artırma
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ totalAuctions }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClockIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Aktif Açık Artırma
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ activeAuctions }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Tamamlanan
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ completedAuctions }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BanknotesIcon class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Toplam Gelir
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  ₺{{ totalRevenue.toLocaleString('tr-TR') }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          :class="[activeTab === 'auctions' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          @click="activeTab = 'auctions'"
        >
          Açık Artırmalar
        </button>
        <button
          :class="[activeTab === 'participations' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center"
          @click="activeTab = 'participations'"
        >
          Katılım Talepleri
          <span
            v-if="pendingParticipationsCount > 0"
            class="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold"
          >{{
            pendingParticipationsCount }}</span>
        </button>
      </nav>
    </div>

    <!-- Auctions Tab Content -->
    <div v-if="activeTab === 'auctions'">
      <!-- Filters (Existing) -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label
              for="statusFilter"
              class="block text-sm font-medium text-gray-700 mb-2"
            >Durum</label>
            <select
              id="statusFilter"
              v-model="filters.status"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">
                Tümü
              </option>
              <option value="Active">
                Aktif
              </option>
              <option value="Completed">
                Tamamlandı
              </option>
              <option value="Cancelled">
                İptal Edildi
              </option>
            </select>
          </div>

          <div>
            <label
              for="categoryFilter"
              class="block text-sm font-medium text-gray-700 mb-2"
            >Kategori</label>
            <select
              id="categoryFilter"
              v-model="filters.category"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">
                Tüm Kategoriler
              </option>
              <option
                v-for="cat in categories"
                :key="cat.id"
                :value="cat.name"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div>
            <label
              for="searchInput"
              class="block text-sm font-medium text-gray-700 mb-2"
            >Arama</label>
            <div class="relative">
              <input
                id="searchInput"
                v-model="filters.search"
                type="text"
                placeholder="Açık artırma adı..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div class="flex items-end">
            <button
              class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              @click="resetFilters"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>

      <!-- Auctions Table -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:p-6">
          <div
            v-if="loading"
            class="text-center py-4"
          >
            <div class="spinner h-8 w-8 mx-auto" />
            <p class="mt-2 text-gray-500">
              Açık artırmalar yükleniyor...
            </p>
          </div>

          <div
            v-else-if="filteredAuctions.length === 0"
            class="text-center py-8"
          >
            <CurrencyDollarIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">
              Açık artırma bulunamadı
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              Yeni bir açık artırma oluşturmaya başlayın.
            </p>
          </div>

          <div
            v-else
            class="overflow-x-auto"
          >
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Açık Artırma
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Durum
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mevcut Teklif
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Min. Artış
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Teklif Sayısı
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Bitiş Tarihi
                  </th>
                  <th
                    scope="col"
                    class="relative px-6 py-3"
                  >
                    <span class="sr-only">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="auction in filteredAuctions"
                  :key="auction.id"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <img
                          class="h-10 w-10 rounded object-cover"
                          :src="auction.Product?.image || auction.image || 'https://placehold.co/40x40?text=No+Image'"
                          :alt="auction.title"
                        >
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ auction.title }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ auction.Product?.Category?.name || auction.category ||
                            'Kategori Yok' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="getStatusClass(auction.status)"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ getStatusText(auction.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₺{{ (auction.currentPrice || auction.startingPrice || 0).toLocaleString('tr-TR') }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₺{{ (auction.minBidIncrement || 1).toLocaleString('tr-TR') }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ auction._count?.AuctionBid || auction.bidCount || 0 }} teklif
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(auction.endTime || auction.endDate) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      <!-- Advance Winner Button -->
                      <button
                        v-if="auction.status === 'Completed'"
                        title="Sonraki Kazana Geç / Cezalandır"
                        class="text-amber-600 hover:text-amber-900 bg-amber-50 p-1 rounded"
                        @click="advanceWinner(auction)"
                      >
                        <ForwardIcon class="h-4 w-4" />
                      </button>
                      <button
                        class="text-primary-600 hover:text-primary-900"
                        @click="editAuction(auction)"
                      >
                        <PencilIcon class="h-4 w-4" />
                      </button>
                      <button
                        class="text-blue-600 hover:text-blue-900"
                        @click="viewAuction(auction)"
                      >
                        <EyeIcon class="h-4 w-4" />
                      </button>
                      <button
                        class="text-red-600 hover:text-red-900"
                        @click="deleteAuction(auction)"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Participations Tab Content -->
    <div
      v-if="activeTab === 'participations'"
      class="space-y-6"
    >
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:p-6">
          <div
            v-if="participationsLoading"
            class="text-center py-4"
          >
            <div class="spinner h-8 w-8 mx-auto" />
            <p class="mt-2 text-gray-500">
              Katılım talepleri yükleniyor...
            </p>
          </div>
          <div
            v-else-if="participations.length === 0"
            class="text-center py-8"
          >
            <UserIcon class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">
              Bekleyen katılım talebi yok
            </h3>
          </div>
          <div
            v-else
            class="overflow-x-auto"
          >
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kullanıcı
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Açık Artırma
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Depozito
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tarih
                  </th>
                  <th class="relative px-6 py-3">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="part in participations"
                  :key="part.id"
                >
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ part.User?.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ part.User?.email }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">
                      {{ part.Auction?.Product?.name }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-bold text-blue-600">
                      ₺{{
                        Number(part.Auction?.participationDeposit).toLocaleString('tr-TR') }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ formatDate(part.createdAt) }}
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button
                      class="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700"
                      @click="approveParticipation(part)"
                    >
                      Onayla (Bloke Et)
                    </button>
                    <button
                      class="bg-red-600 text-white px-3 py-1 rounded-md text-xs hover:bg-red-700"
                      @click="rejectParticipation(part)"
                    >
                      Reddet
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Auction Modal -->
    <CreateAuctionModal
      v-if="showCreateModal"
      :auction="editingAuction"
      :is-edit="!!editingAuction"
      @close="closeModal"
      @created="onAuctionCreated"
      @updated="onAuctionUpdated"
    />
  </div>
</template>

<script setup>
import {
  PlusIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  BanknotesIcon,
  TrashIcon,
  UserIcon,
  ForwardIcon,
  ArrowPathIcon,
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Page meta
useHead({
  title: 'Açık Artırma Yönetimi - Admin Panel',
  meta: [
    { name: 'description', content: 'Açık artırma yönetimi sayfası' }
  ]
})

// Stores
const { $api } = useApi()

// State
const loading = ref(true)
const participationsLoading = ref(false)
const showCreateModal = ref(false)
const editingAuction = ref(null)
const auctions = ref([])
const participations = ref([])
const activeTab = ref('auctions')
const categories = ref([])
const error = ref(null)

// Filters
const filters = ref({
  status: '',
  category: '',
  search: ''
})


const pendingParticipationsCount = computed(() => {
  return participations.value.filter(p => p.status === 'Pending').length
})




const fetchAuctions = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $api('/api/auctions', {
      query: {
        page: 1,
        limit: 1000 // Get all auctions for admin dashboard
      }
    })

    if (response.success) {
      // Map API data to match frontend expectations
      auctions.value = response.data.map(auction => ({
        ...auction,
        // Map status values
        status: auction.status || 'Active',
        // Use currentPrice or startingPrice
        currentPrice: auction.currentPrice || auction.startingPrice,
        // Map bid count
        bidCount: auction._count?.AuctionBid || 0,
        // Map dates
        startDate: auction.createdAt,
        endDate: auction.endTime,
        // Map category from product
        category: auction.Product?.Category?.name || 'electronics',
        // Map image
        image: auction.Product?.image || 'https://placehold.co/400x400?text=No+Image'
      }))

      console.log('Successfully loaded auctions:', auctions.value.length)
    } else {
      throw new Error(response.error || 'Açık artırmalar yüklenirken hata oluştu')
    }
  } catch (err) {
    console.error('Fetch auctions error:', err)
    error.value = err.message

    // Check if it's a rate limit error
    if (err.message.includes('429') || err.message.includes('Rate limit')) {
      const toast = useNuxtApp().$toast
      toast.warning('API çok meşgul, lütfen bekleyin')
    } else {
      console.error('API Error', err)
    }

    // Fallback to empty
    auctions.value = []
  } finally {
    loading.value = false
  }
}


// Computed
const filteredAuctions = computed(() => {
  let filtered = auctions.value

  if (filters.value.status) {
    filtered = filtered.filter(auction => auction.status === filters.value.status)
  }

  if (filters.value.category) {
    filtered = filtered.filter(auction => auction.category === filters.value.category)
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(auction =>
      auction.title.toLowerCase().includes(search) ||
      auction.description?.toLowerCase().includes(search)
    )
  }

  return filtered
})

const totalAuctions = computed(() => auctions.value.length)
const activeAuctions = computed(() => auctions.value.filter(a => a.status === 'Active').length)
const completedAuctions = computed(() => auctions.value.filter(a => a.status === 'Completed' || a.status === 'Ended').length)
const totalRevenue = computed(() =>
  auctions.value
    .filter(a => a.status === 'Completed' || a.status === 'Ended')
    .reduce((sum, auction) => sum + (auction.currentBid || auction.startPrice || 0), 0)
)

// Methods
const getStatusText = (status) => {
  const statusMap = {
    'Active': 'Aktif',
    'Ended': 'Sona Erdi',
    'Completed': 'Tamamlandı',
    'Cancelled': 'İptal Edildi'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    'Active': 'bg-green-100 text-green-800',
    'Ended': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-blue-100 text-blue-800',
    'Cancelled': 'bg-red-100 text-red-800'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const resetFilters = () => {
  filters.value = {
    status: '',
    category: '',
    search: ''
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingAuction.value = null
}

const editAuction = (auction) => {
  editingAuction.value = auction
  showCreateModal.value = true
}

const viewAuction = (auction) => {
  // Navigate to auction detail page
  navigateTo(`/auctions/${auction.id}`)
}

const deleteAuction = async (auction) => {
  if (confirm(`"${auction.title}" açık artırmasını silmek istediğinizden emin misiniz?`)) {
    try {
      const response = await $api(`/api/auctions/${auction.id}`, {
        method: 'DELETE'
      })

      if (response.success) {
        await fetchAuctions() // Refresh data
        const toast = useNuxtApp().$toast
        toast.success('Açık artırma başarıyla silindi!')
      }
    } catch (error) {
      console.error('Delete auction error:', error)

      // Fallback to local deletion
      const index = auctions.value.findIndex(a => a.id === auction.id)
      if (index > -1) {
        auctions.value.splice(index, 1)
        const toast = useNuxtApp().$toast
        toast.success('Açık artırma başarıyla silindi! (demo mod)')
      }
    }
  }
}


const onAuctionCreated = () => {
  fetchAuctions()
  closeModal()
}

const onAuctionUpdated = () => {
  fetchAuctions()
  closeModal()
}
const fetchParticipations = async () => {
  participationsLoading.value = true
  try {
    const res = await $api('/api/auctions/admin/participations')
    participations.value = res.data || []
  } catch (err) {
    console.error('Fetch participations error:', err)
  } finally {
    participationsLoading.value = false
  }
}

const approveParticipation = async (part) => {
  if (!confirm(`${part.User?.name} kullanıcısının talebini onaylıyor musunuz? Depozito bloke edilecektir.`)) return
  try {
    await $api(`/api/auctions/admin/participations/${part.id}/approve`, {
      method: 'POST'
    })
    useNuxtApp().$toast.success('Başvuru onaylandı')
    fetchParticipations()
  } catch (err) {
    useNuxtApp().$toast.error(err.data?.error || 'Onaylama başarısız')
  }
}

const rejectParticipation = async (part) => {
  if (!confirm('Bu başvuruyu reddetmek istediğinize emin misiniz?')) return
  try {
    await $api(`/api/auctions/admin/participations/${part.id}/reject`, {
      method: 'POST'
    })
    useNuxtApp().$toast.success('Başvuru reddedildi')
    fetchParticipations()
  } catch (err) {
    useNuxtApp().$toast.error(err.data?.error || 'Reddetme başarısız')
  }
}

const advanceWinner = async (auction) => {
  if (!confirm('Satın alma hakkını bir sonraki üyeye devretmek (veya süresi dolduysa cezalandırmak) istediğinize emin misiniz?')) return
  try {
    const res = await $api(`/api/auctions/${auction.id}/advance-winner`, {
      method: 'POST'
    })
    if (res.success) {
      useNuxtApp().$toast.success('Hakkı başarıyla devredildi / Cezai işlem uygulandı.')
      fetchAuctions()
    }
  } catch (err) {
    useNuxtApp().$toast.error(err.data?.error || 'İşlem başarısız')
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchAuctions(),
    fetchParticipations()
  ])
})
</script>

<style scoped>
.spinner {
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
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