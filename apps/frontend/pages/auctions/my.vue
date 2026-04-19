<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header Section -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          📋 Açık Artırma Yönetimi
        </h1>
        <p class="text-lg text-gray-600 mb-6">
          Açtığınız açık artırmaları ve verdiğiniz teklifleri yönetin
        </p>
      </div>

      <!-- Tabs -->
      <div class="mb-8">
        <nav class="flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            @click="activeTab = tab.id"
          >
            <component
              :is="tab.icon"
              class="h-5 w-5 inline mr-2"
            />
            {{ tab.name }}
            <span
              v-if="tab.count !== undefined"
              :class="[
                'ml-2 py-0.5 px-2 rounded-full text-xs',
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ tab.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- My Auctions Tab -->
      <div v-if="activeTab === 'created'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-900">
            Açtığım Açık Artırmalar
          </h2>
          <button
            v-if="authStore.user?.isAdmin"
            class="btn-primary"
            @click="showCreateModal = true"
          >
            + Yeni Açık Artırma Oluştur
          </button>
        </div>

        <!-- Loading State -->
        <div
          v-if="loadingCreated"
          class="flex justify-center items-center h-32"
        >
          <div class="spinner h-8 w-8" />
        </div>

        <!-- Created Auctions -->
        <div
          v-else-if="createdAuctions.length > 0"
          class="space-y-4"
        >
          <div
            v-for="auction in createdAuctions"
            :key="auction.id"
            class="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-4">
                  <img
                    :src="auction.Product?.image"
                    :alt="auction.Product?.name"
                    class="w-16 h-16 object-cover rounded-lg"
                    @error="handleImageError"
                  >
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ auction.title }}
                    </h3>
                    <p class="text-sm text-gray-600">
                      {{ auction.Product?.name }}
                    </p>
                    <div class="flex items-center mt-2 space-x-4">
                      <span
                        :class="[
                          'px-2 py-1 rounded-full text-xs font-medium',
                          getStatusBadgeClass(auction.status)
                        ]"
                      >
                        {{ getStatusText(auction.status) }}
                      </span>
                      <span class="text-sm text-gray-500">
                        {{ getTimeRemaining(auction.endTime) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Auction Stats -->
              <div class="text-right ml-6">
                <div class="text-sm text-gray-500">
                  Başlangıç Fiyatı
                </div>
                <div class="text-lg font-semibold text-gray-900">
                  {{ formatPrice(auction.startingPrice) }}
                </div>
                <div class="text-sm text-gray-500 mt-2">
                  Güncel Teklif
                </div>
                <div class="text-xl font-bold text-primary-600">
                  {{ auction.currentPrice ? formatPrice(auction.currentPrice) : formatPrice(auction.startingPrice) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ auction._count?.AuctionBid || 0 }} teklif
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
              <NuxtLink
                :to="`/auctions/${auction.id}`"
                class="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Detayları Gör
              </NuxtLink>
              <button
                v-if="auction.status === 'Active'"
                class="text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                @click="endAuction(auction.id)"
              >
                Açık Artırmayı Sonlandır
              </button>
              <button
                v-if="auction.status === 'Active'"
                class="text-sm px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200"
                @click="editAuction(auction)"
              >
                Düzenle
              </button>
            </div>
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
            Henüz Açık Artırma Oluşturmadınız
          </h3>
          <p class="text-gray-600 mb-6">
            İlk açık artırmanızı oluşturun ve ürünlerinizi satışa çıkarın!
          </p>
          <button
            v-if="authStore.user?.isAdmin"
            class="btn-primary"
            @click="showCreateModal = true"
          >
            Yeni Açık Artırma Oluştur
          </button>
        </div>
      </div>

      <!-- My Bids Tab -->
      <div v-if="activeTab === 'bids'">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">
          Verdiğim Teklifler
        </h2>

        <!-- Loading State -->
        <div
          v-if="loadingBids"
          class="flex justify-center items-center h-32"
        >
          <div class="spinner h-8 w-8" />
        </div>

        <!-- Bids List -->
        <div
          v-else-if="myBids.length > 0"
          class="space-y-4"
        >
          <div
            v-for="bid in myBids"
            :key="bid.id"
            class="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-4">
                  <img
                    :src="bid.Auction?.Product?.image"
                    :alt="bid.Auction?.Product?.name"
                    class="w-16 h-16 object-cover rounded-lg"
                    @error="handleImageError"
                  >
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">
                      {{ bid.Auction?.title }}
                    </h3>
                    <p class="text-sm text-gray-600">
                      {{ bid.Auction?.Product?.name }}
                    </p>
                    <div class="flex items-center mt-2 space-x-4">
                      <span
                        :class="[
                          'px-2 py-1 rounded-full text-xs font-medium',
                          getStatusBadgeClass(bid.Auction?.status)
                        ]"
                      >
                        {{ getStatusText(bid.Auction?.status) }}
                      </span>
                      <span class="text-sm text-gray-500">
                        {{ formatDateTime(bid.createdAt) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bid Stats -->
              <div class="text-right ml-6">
                <div class="text-sm text-gray-500">
                  Teklifim
                </div>
                <div class="text-xl font-bold text-primary-600">
                  {{ formatPrice(bid.amount) }}
                </div>
                <div class="text-sm text-gray-500 mt-2">
                  Güncel En Yüksek
                </div>
                <div class="text-lg font-semibold text-gray-900">
                  {{ bid.Auction?.currentPrice ? formatPrice(bid.Auction.currentPrice) :
                    formatPrice(bid.Auction?.startingPrice) }}
                </div>
                <div
                  v-if="isWinning(bid)"
                  class="text-xs text-green-600 font-medium mt-1"
                >
                  🏆 Kazanıyorsunuz!
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
              <NuxtLink
                :to="`/auctions/${bid.Auction?.id}`"
                class="text-sm px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Açık Artırmaya Git
              </NuxtLink>
              <button
                v-if="bid.Auction?.status === 'Active' && !isWinning(bid)"
                class="text-sm px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
                @click="increaseBid(bid.Auction)"
              >
                Teklifi Artır
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-12"
        >
          <div class="text-gray-400 text-6xl mb-4">
            💰
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            Henüz Teklif Vermediniz
          </h3>
          <p class="text-gray-600 mb-6">
            Açık artırmalara katılın ve ilginizi çeken ürünler için teklif verin!
          </p>
          <NuxtLink
            to="/auctions"
            class="btn-primary"
          >
            Açık Artırmaları Keşfet
          </NuxtLink>
        </div>
      </div>

      <!-- Won Auctions Tab -->
      <div v-if="activeTab === 'won'">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">
          Kazandığım Açık Artırmalar
        </h2>

        <!-- Won Auctions will be implemented here -->
        <div class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">
            🏆
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">
            Henüz Açık Artırma Kazanmadınız
          </h3>
          <p class="text-gray-600 mb-6">
            Açık artırmalara katılın ve ürünleri kazanmaya çalışın!
          </p>
          <NuxtLink
            to="/auctions"
            class="btn-primary"
          >
            Açık Artırmaları Keşfet
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Create Auction Modal -->
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
import { ClipboardIcon, HandRaisedIcon, TrophyIcon } from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Page meta
useHead({
  title: 'Açık Artırma Yönetimi - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Açtığınız açık artırmaları ve verdiğiniz teklifleri yönetin'
    }
  ]
})

// Stores
const authStore = useAuthStore()
const { $api } = useApi()

// State
const activeTab = ref('created')
const createdAuctions = ref([])
const myBids = ref([])
const loadingCreated = ref(false)
const loadingBids = ref(false)
const showCreateModal = ref(false)
const editingAuction = ref(null)

// Computed
const tabs = computed(() => [
  {
    id: 'created',
    name: 'Açtığım Açık Artırmalar',
    icon: ClipboardIcon,
    count: createdAuctions.value.length
  },
  {
    id: 'bids',
    name: 'Verdiğim Teklifler',
    icon: HandRaisedIcon,
    count: myBids.value.length
  },
  {
    id: 'won',
    name: 'Kazandıklarım',
    icon: TrophyIcon,
    count: 0 // Will be implemented
  }
])

// Methods
const fetchCreatedAuctions = async () => {
  loadingCreated.value = true

  try {
    const { data } = await $api('/api/auctions/my/created')

    createdAuctions.value = data.data || []
  } catch (error) {
    console.error('Fetch created auctions error:', error)
    useNuxtApp().$toast.error('Açık artırmalar yüklenirken bir hata oluştu')
  } finally {
    loadingCreated.value = false
  }
}

const fetchMyBids = async () => {
  loadingBids.value = true

  try {
    const { data } = await $api('/api/auctions/my/bids')

    myBids.value = data.data || []
  } catch (error) {
    console.error('Fetch my bids error:', error)
    useNuxtApp().$toast.error('Teklifler yüklenirken bir hata oluştu')
  } finally {
    loadingBids.value = false
  }
}

const endAuction = async (auctionId) => {
  if (!confirm('Açık artırmayı sonlandırmak istediğinizden emin misiniz?')) {
    return
  }

  try {
    await $api(`/api/auctions/${auctionId}/end`, {
      method: 'PATCH'
    })

    useNuxtApp().$toast.success('Açık artırma sonlandırıldı')
    await fetchCreatedAuctions()
  } catch (error) {
    console.error('End auction error:', error)
    useNuxtApp().$toast.error('Açık artırma sonlandırılırken bir hata oluştu')
  }
}

const editAuction = (auction) => {
  editingAuction.value = auction
  showCreateModal.value = true
}

const increaseBid = (auction) => {
  navigateTo(`/auctions/${auction.id}`)
}

const onAuctionCreated = () => {
  closeModal()
  fetchCreatedAuctions()
}

const onAuctionUpdated = () => {
  closeModal()
  fetchCreatedAuctions()
}

const closeModal = () => {
  showCreateModal.value = false
  editingAuction.value = null
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
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'Active':
      return 'Aktif'
    case 'Completed':
      return 'Tamamlandı'
    case 'Cancelled':
      return 'İptal Edildi'
    default:
      return status
  }
}

const getTimeRemaining = (endTime) => {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) {
    return 'Sona erdi'
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days} gün ${hours} saat kaldı`
  } else if (hours > 0) {
    return `${hours} saat ${minutes} dakika kaldı`
  } else {
    return `${minutes} dakika kaldı`
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const formatDateTime = (dateTime) => {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateTime))
}

const isWinning = (bid) => {
  return Number(bid.amount) === (bid.Auction?.currentPrice ? Number(bid.Auction.currentPrice) : 0)
}

const handleImageError = (event) => {
  if (event?.target) {
    event.target.onerror = null
    event.target.src = 'https://placehold.co/300x300?text=Ürün+Resmi'
  }
}

// Watch for tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'created' && createdAuctions.value.length === 0) {
    fetchCreatedAuctions()
  } else if (newTab === 'bids' && myBids.value.length === 0) {
    fetchMyBids()
  }
})

// Initialize
onMounted(() => {
  fetchCreatedAuctions()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>