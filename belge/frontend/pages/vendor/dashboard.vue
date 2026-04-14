<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header with Home Button -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        Vendor Dashboard
      </h1>
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
      >
        <HomeIcon class="h-5 w-5 mr-2" />
        Ana Sayfaya Dön
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Earnings Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
              <CurrencyDollarIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Toplam Kazanç
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.totalSales || '₺0' }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <ShoppingBagIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Toplam Ürün
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.products || 0 }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>


      <!-- Users Card -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <UsersIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Toplam Kullanıcı
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.users || 0 }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Card -->
      <NuxtLink
        to="/vendor/orders"
        class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
      >
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <ShoppingCartIcon class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Bekleyen Siparişler
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.pendingOrders || 0 }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- XP Accounts & Barter Info -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        class="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-5 text-white shadow-lg relative overflow-hidden"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest opacity-70">
              İndirim Paneli
            </p>
            <p class="text-2xl font-black mt-1">
              {{ formatPrice(xpStats.commissionXP) }}
            </p>
          </div>
          <div
            v-if="vendorTierData?.currentTier"
            class="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-sm"
          >
            {{ vendorTierData.currentTier.nametr || vendorTierData.currentTier.name || vendorTierData.currentTier.id }}
            TIER
          </div>
        </div>
        <p class="text-[10px] mt-2 opacity-80 italic">
          Komisyon indirimlerinde kullanılır
        </p>
      </div>
      <div class="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-5 text-white shadow-lg">
        <p class="text-[10px] font-black uppercase tracking-widest opacity-70">
          Reklam Bakiyesi
        </p>
        <p class="text-2xl font-black mt-1">
          {{ formatPrice(xpStats.adXP) }}
        </p>
        <p class="text-[10px] mt-2 opacity-80 italic">
          Ürün öne çıkarma ve reklamlar
        </p>
      </div>
      <div class="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-5 text-white shadow-lg">
        <p class="text-[10px] font-black uppercase tracking-widest opacity-70">
          Sistem Giderleri
        </p>
        <p class="text-2xl font-black mt-1">
          {{ formatPrice(xpStats.serviceXP) }}
        </p>
        <p class="text-[10px] mt-2 opacity-80 italic">
          Kargo ve servis giderleri
        </p>
      </div>
      <div class="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white shadow-lg relative group">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest opacity-70">
              Barter Havuzu
            </p>
            <p class="text-2xl font-black mt-1">
              {{ formatPrice(xpStats.barterBalance) }}
            </p>
          </div>
          <div class="flex gap-1">
            <button
              title="Nakit Cüzdana Çek"
              class="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
              @click="handleBarterWithdraw"
            >
              <ArrowDownTrayIcon class="h-4 w-4" />
            </button>
            <button
              title="Havuza Nakit Aktar"
              class="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg transition-colors"
              @click="handleBarterDeposit"
            >
              <PlusCircleIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
        <p class="text-[10px] mt-2 opacity-80 italic">
          Aktif takas bakiyeniz
        </p>
      </div>
    </div>

    <!-- Vendor Tier Card -->
    <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Satıcı Tier Seviyeniz
        </h2>
        <VendorTierCard
          :tier-data="vendorTierData?.currentTier"
          :progress="vendorTierData?.progress"
          :stats="vendorTierStats"
          :regional="vendorTierData?.regional"
          :current-commission-rate="stats.commissionRate || 10"
        />
      </div>

      <!-- Ecosystem Portal Button for APEX / Members -->
      <div
        v-if="authStore.isApexPlus || myEcosystem"
        class="flex flex-col"
      >
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Eko-Sistem Paneli
        </h2>
        <NuxtLink
          :to="myEcosystem ? `/ecosystem/${myEcosystem.id}` : '#'"
          class="group bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 flex-1 flex flex-col justify-center"
          @click="!myEcosystem && createDefaultEcosystem()"
        >
          <div class="flex items-center mb-4">
            <div class="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:bg-white transition-colors">
              <ShieldCheckIcon class="h-8 w-8 text-white group-hover:text-indigo-600" />
            </div>
          </div>
          <div>
            <span class="block font-black uppercase tracking-widest text-xs text-indigo-100 mb-1">BazarX Private</span>
            <span class="block font-black uppercase tracking-widest text-xl text-white italic">İş Ortağı Portalı</span>
            <p class="text-indigo-100/70 text-[10px] mt-2 font-medium">
              {{ myEcosystem ? 'Bayilerinize özel kataloğu görüntüleyin.' : 'Özel bayi ağınızı hemen aktifleştirin.' }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Brand Insights -->
    <div
      v-if="brandStats && brandStats.distribution.length > 0"
      class="mt-8"
    >
      <h2 class="text-lg font-medium text-gray-900 mb-4">
        Marka Satış Analizi
      </h2>
      <div class="bg-white shadow rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Weekly Performance -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Haftalık Performans (₺)
            </h3>
            <div class="space-y-4">
              <div
                v-for="week in brandStats.weeklyPerformance"
                :key="week.name"
                class="relative pt-1"
              >
                <div class="flex mb-2 items-center justify-between">
                  <div>
                    <span class="text-xs font-semibold inline-block text-primary-600 uppercase">
                      {{ week.name }}
                    </span>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-semibold inline-block text-primary-600">
                      ₺{{ week.value.toLocaleString('tr-TR') }}
                    </span>
                  </div>
                </div>
                <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-100">
                  <div
                    :style="{ width: `${(week.value / brandStats.totalRevenue) * 100}%` }"
                    class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Brand Distribution -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Marka Dağılımı
            </h3>
            <div class="space-y-3">
              <div
                v-for="brand in brandStats.distribution"
                :key="brand.name"
                class="flex items-center"
              >
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700">{{ brand.name }}</span>
                    <span class="text-xs text-gray-500">₺{{ brand.revenue.toLocaleString('tr-TR') }}</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-700">
                    <div
                      class="bg-indigo-600 h-1.5 rounded-full"
                      :style="{ width: `${brand.percentage}%` }"
                    />
                  </div>
                </div>
                <span class="ml-4 text-xs font-bold text-gray-900 w-12 text-right">{{ brand.percentage.toFixed(1)
                }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          Son Aktiviteler
        </h2>
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div
            v-if="loading"
            class="p-4 text-center"
          >
            <div class="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
          </div>
          <ul
            v-else-if="recentActivities.length > 0"
            class="divide-y divide-gray-200"
          >
            <li
              v-for="activity in recentActivities"
              :key="activity.id"
            >
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-primary-600 truncate">
                    {{ activity.title }}
                  </p>
                  <div class="ml-2 flex-shrink-0 flex">
                    <p
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getStatusBadgeClass(activity.statusRaw)"
                    >
                      {{ activity.status }}
                    </p>
                  </div>
                </div>
                <div class="mt-2 sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-500">
                      {{ activity.description }}
                    </p>
                  </div>
                  <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <CalendarIcon class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <p>{{ formatDate(activity.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <div
            v-else
            class="p-4 text-center text-gray-500"
          >
            Henüz aktivite bulunmuyor.
          </div>
        </div>
      </div>

      <!-- Pending Orders List -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">
            Bekleyen Siparişler
          </h2>
          <NuxtLink
            to="/vendor/orders"
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Tümünü Gör
          </NuxtLink>
        </div>
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <div
            v-if="loading"
            class="p-4 text-center"
          >
            <div class="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
          </div>
          <ul
            v-else-if="pendingOrdersList.length > 0"
            class="divide-y divide-gray-200"
          >
            <li
              v-for="order in pendingOrdersList"
              :key="order.id"
            >
              <NuxtLink
                :to="`/vendor/orders`"
                class="block hover:bg-gray-50"
              >
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex flex-col">
                      <p class="text-sm font-bold text-gray-900">
                        #{{ order.orderNumber }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ order.User?.name || 'İsimsiz' }}
                      </p>
                    </div>
                    <div class="flex flex-col items-end">
                      <p class="text-sm font-bold text-primary-600">
                        ₺{{
                          orderTotalForVendor(order).toLocaleString('tr-TR') }}
                      </p>
                      <p class="text-[10px] text-gray-400">
                        {{ formatDate(order.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              </NuxtLink>
            </li>
          </ul>
          <div
            v-else
            class="p-8 text-center"
          >
            <span class="text-3xl mb-2 block">🎉</span>
            <p class="text-sm text-gray-500">
              Bekleyen siparişiniz bulunmuyor.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ShoppingBagIcon,
      UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
    ShoppingCartIcon,
    HomeIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'
import VendorTierCard from '~/components/vendor/VendorTierCard.vue'

// Layout
definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

// Page meta
useHead({
  title: 'Vendor Dashboard - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Vendor dashboard'
    }
  ]
})

// Stores
const authStore = useAuthStore()
const toast = useNuxtApp().$toast

// ... (existing state)

// Actions
const handleBarterDeposit = async () => {
  const amountStr = prompt('Barter havuzuna aktarmak istediğiniz nakit miktarı giriniz (₺):')
  if (!amountStr) return

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    toast.error('Geçerli bir miktar giriniz.')
    return
  }

  try {
    const { $api } = useApi()
    const res = await $api('/api/barter/topup', {
      method: 'POST',
      body: { amount }
    })

    if (res.success) {
      toast.success('Bakiye başarıyla barter havuzuna aktarıldı.')
      await fetchXPStats()
    }
  } catch (e) {
    toast.error(e.data?.error || 'Aktarım başarısız oldu.')
  }
}

const handleBarterWithdraw = async () => {
  const amountStr = prompt('Barter havuzundan nakit cüzdanınıza çekmek istediğiniz miktarı giriniz (₺):')
  if (!amountStr) return

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    toast.error('Geçerli bir miktar giriniz.')
    return
  }

  try {
    const { $api } = useApi()
    const res = await $api('/api/barter/withdraw', {
      method: 'POST',
      body: { amount }
    })

    if (res.success) {
      toast.success('Bakiye başarıyla nakit cüzdanınıza çekildi.')
      await fetchXPStats()
    }
  } catch (e) {
    toast.error(e.data?.error || 'Çekim işlemi başarısız oldu.')
  }
}

// State
const stats = ref({
  products: 0,
  categories: 0,
  users: 0,
  auctions: 0,
  lotteries: 0,
  orders: 0
})
const recentActivities = ref([])
const loading = ref(false)
const vendorTierData = ref(null)
const vendorTierStats = ref(null)
const brandStats = ref(null)
const xpStats = ref({
  barterBalance: 0
})
const myEcosystem = ref(null)

// Methods
const fetchBrandStats = async () => {
  try {
    const { $api } = useApi()
    const res = await $api('/api/vendors/brand-stats')
    if (res.success) {
      brandStats.value = res.data
    }
  } catch (e) {
    console.error('Failed to fetch brand stats:', e)
  }
}

// Methods
const fetchStats = async () => {
  try {
    const { $api } = useApi()
    const [products, orders] = await Promise.all([
      $api('/api/vendors/products', {
        query: { limit: 100 }
      }),
      $api('/api/vendors/orders')
    ])

    stats.value = {
      products: products.success ? products.data.length : 0,
      users: 0,
      orders: orders.success ? orders.data.length : 0,
      pendingOrders: 0,
      totalSales: '₺0'
    }

    // Fetch real stats from dedicated endpoint
    try {
      const { $api } = useApi()
      const stats_res = await $api('/api/vendors/stats')
      if (stats_res.success) {
        stats.value.totalSales = stats_res.data.totalSales
        stats.value.pendingOrders = stats_res.data.pendingOrders
        stats.value.averageRating = stats_res.data.averageRating || '0.0'
      }
    } catch (e) {
      console.error('Stats endpoint failed:', e)
    }

    // Create recent activities from data
    const pActivities = (products?.data || []).map(product => ({
      id: `product-${product.id}`,
      title: product.isActive ? 'Ürün yayında' : 'Ürün beklemede',
      description: product.name,
      status: product.isActive ? 'Aktif' : 'Pasif',
      statusRaw: product.isActive ? 'ACTIVE' : 'PENDING',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }))

    const oActivities = (orders?.data || []).map(order => ({
      id: `order-${order.id}`,
      title: getOrderActivityTitle(order.status),
      description: `#${order.orderNumber} nolu siparişte ürünleriniz var`,
      status: getStatusText(order.status),
      statusRaw: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }))

    recentActivities.value = [...pActivities, ...oActivities]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5)

    // Store raw orders for pending list
    rawOrders.value = orders.data || []

  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

const rawOrders = ref([])
const pendingOrdersList = computed(() => {
  return rawOrders.value
    .filter(o => o.status === 'PENDING' || o.status === 'PROCESSING')
    .slice(0, 5)
})

const orderTotalForVendor = (order) => {
  return order.OrderItem.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
}

const fetchXPStats = async () => {
  try {
    const { $api } = useApi()
    const [walletRes, barterRes] = await Promise.all([
      $api('/api/wallet'),
      $api('/api/barter/info')
    ])

    if (walletRes.success) {
      xpStats.value.commissionXP = walletRes.data.commissionXP || 0
      xpStats.value.adXP = walletRes.data.adXP || 0
      xpStats.value.serviceXP = walletRes.data.serviceXP || 0
    }
    if (barterRes.success) {
      xpStats.value.barterBalance = barterRes.barterBalance || 0
    }
  } catch (e) {
    console.error('Failed to fetch XP stats:', e)
  }
}

const formatPrice = (value) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(value || 0)
}
const fetchVendorTier = async () => {
  try {
    const { $api } = useApi()
    const tierRes = await $api('/api/tiers/vendor')
    if (tierRes.success) {
      vendorTierData.value = tierRes.data
      vendorTierStats.value = {
        totalSales: stats.value.orders || 0,
        totalRevenue: parseFloat(String(stats.value.totalSales || '0').replace(/[^0-9.-]+/g, '')) || 0,
        averageRating: parseFloat(stats.value.averageRating) || 0,
        productCount: stats.value.products || 0
      }
    }
  } catch (error) {
    console.error('Failed to fetch vendor tier:', error)
  }
}

const fetchEcosystemStatus = async () => {
  try {
    const { $api } = useApi()
    const response = await $api('/api/ecosystem/my')
    if (response.success && response.ecosystem) {
      myEcosystem.value = response.ecosystem
    }
  } catch (err) {
    console.warn('Ecosystem status fetch failed:', err)
  }
}

const createDefaultEcosystem = async () => {
  if (confirm('Henüz bir Ekosisteminiz bulunmuyor. Şirket isminizle bir tane oluşturulsun mu?')) {
    try {
      const { $api } = useApi()
      const res = await $api('/api/ecosystem/create', {
        method: 'POST',
        body: {
          name: authStore.user?.vendor?.businessName || 'Marka Ekosistemim',
          description: 'Bayilerimiz için özel ürün ve kampanya kataloğudur.'
        }
      })
      if (res.success) {
        myEcosystem.value = res.data
        useNuxtApp().$toast.success('Ekosisteminiz başarıyla oluşturuldu!')
        navigateTo(`/ecosystem/${res.data.id}`)
      }
    } catch (err) {
      useNuxtApp().$toast.error('Ekosistem oluşturulamadı: ' + (err.data?.error || 'Bilinmeyen hata'))
    }
  }
}


const getOrderActivityTitle = (status) => {
  switch (status) {
    case 'PENDING': return 'Yeni sipariş geldi'
    case 'PROCESSING': return 'Sipariş hazırlanıyor'
    case 'SHIPPED': return 'Sipariş kargolandı'
    case 'DELIVERED': return 'Sipariş teslim edildi'
    case 'CANCELLED': return 'Sipariş iptal edildi'
    default: return 'Sipariş güncellemesi'
  }
}

const getStatusText = (status) => {
  const map = {
    'PENDING': 'Beklemede',
    'PROCESSING': 'Hazırlanıyor',
    'SHIPPED': 'Kargoda',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal',
    'ACTIVE': 'Aktif',
    'PASIF': 'Pasif',
    'TAMAMLANDI': 'Tamamlandı'
  }
  return map[status] || status
}

const getStatusBadgeClass = (status) => {
  const base = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
  switch (status) {
    case 'PENDING': return `${base} bg-orange-100 text-orange-800`
    case 'PROCESSING': return `${base} bg-blue-100 text-blue-800`
    case 'SHIPPED': return `${base} bg-purple-100 text-purple-800`
    case 'DELIVERED': return `${base} bg-green-100 text-green-800`
    case 'CANCELLED': return `${base} bg-red-100 text-red-800`
    case 'ACTIVE': return `${base} bg-green-100 text-green-800`
    default: return `${base} bg-gray-100 text-gray-800`
  }
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

// Initialize
onMounted(async () => {
  await fetchStats()
  await fetchVendorTier()
  await fetchBrandStats()
  await fetchXPStats()
  await fetchEcosystemStatus()
})
</script>