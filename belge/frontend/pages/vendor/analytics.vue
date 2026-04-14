<template>
  <div class="p-4 md:p-8 space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">
          Satış Analizi
        </h1>
        <p class="text-gray-500 mt-1">
          İşletmenizin performansını ve satış trendlerini takip edin.
        </p>
      </div>
      <div class="flex items-center space-x-2 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
        <button
          v-for="p in periods"
          :key="p.id"
          :class="[
            'px-4 py-2 text-sm font-bold rounded-xl transition-all',
            selectedPeriod === p.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'
          ]"
          @click="selectedPeriod = p.id"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in quickStats"
        :key="stat.label"
        class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div :class="[stat.bg, 'w-12 h-12 rounded-2xl flex items-center justify-center mb-4']">
          <component
            :is="stat.icon"
            :class="[stat.color, 'h-6 w-6']"
          />
        </div>
        <div class="text-sm font-bold text-gray-400 uppercase tracking-wider">
          {{ stat.label }}
        </div>
        <div class="text-2xl font-black text-gray-900 mt-1">
          {{ stat.prefix }}{{ stat.value.toLocaleString('tr-TR') }}{{ stat.suffix }}
        </div>
        <div
          class="mt-2 flex items-center text-xs font-bold"
          :class="stat.value > 0 ? 'text-green-500' : 'text-gray-400'"
        >
          <ArrowUpIcon
            v-if="stat.value > 0"
            class="h-3 w-3 mr-1"
          />
          <span>{{ stat.value > 0 ? 'Bu dönem artışta' : 'Veri bekleniyor' }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Chart Card -->
      <div class="lg:col-span-2 space-y-8">
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-xl font-black text-gray-900">
              Gelir Trendi
            </h3>
            <span class="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">Son 30 Gün</span>
          </div>
          <div class="h-[350px] w-full">
            <ClientOnly>
              <apexchart
                v-if="chartData.length"
                type="area"
                height="100%"
                :options="chartOptions"
                :series="chartSeries"
              />
              <div
                v-else
                class="h-full flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100"
              >
                <span class="text-gray-400 font-medium">Gelir verisi yükleniyor...</span>
              </div>
            </ClientOnly>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Category Distribution -->
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-black text-gray-900 mb-6">
              Kategori Dağılımı
            </h3>
            <div class="h-[300px]">
              <ClientOnly>
                <apexchart
                  v-if="distributionData.length"
                  type="donut"
                  height="100%"
                  :options="donutOptions"
                  :series="donutSeries"
                />
                <div
                  v-else
                  class="h-full flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100"
                >
                  <span class="text-gray-400 text-sm font-medium">Kategori verisi yok</span>
                </div>
              </ClientOnly>
            </div>
          </div>

          <!-- Return Stats -->
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-black text-gray-900 mb-6">
              İade ve İptal Analizi
            </h3>
            <div class="space-y-4">
              <div
                v-for="ret in returnStats"
                :key="ret.status"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
              >
                <div class="flex items-center gap-3">
                  <div :class="[getStatusBg(ret.status), 'p-2 rounded-xl']">
                    <ArrowPathIcon class="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div class="text-sm font-bold text-gray-900">
                      {{ formatStatus(ret.status) }}
                    </div>
                    <div class="text-xs text-gray-400">
                      {{ ret.count }} işlem
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-black text-gray-900">
                    ₺{{ ret.revenue.toLocaleString('tr-TR') }}
                  </div>
                  <div class="text-[10px] font-bold text-gray-400">
                    Toplam Tutarı
                  </div>
                </div>
              </div>
              <div
                v-if="!returnStats.length"
                class="text-center py-12 text-gray-400 text-sm italic"
              >
                Henüz iade veya iptal kaydı bulunamadı.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
        <h3 class="text-xl font-black text-gray-900 mb-8">
          En Çok Satanlar
        </h3>
        <div
          v-if="loadingTopProducts"
          class="space-y-4"
        >
          <div
            v-for="i in 5"
            :key="i"
            class="h-16 bg-gray-50 animate-pulse rounded-2xl"
          />
        </div>
        <div
          v-else-if="topProducts.length"
          class="space-y-6"
        >
          <div
            v-for="(product, index) in topProducts"
            :key="product.productId"
            class="flex items-center gap-4"
          >
            <div class="relative">
              <img
                v-if="product.image"
                :src="resolveImageUrl(product.image)"
                class="w-12 h-12 rounded-xl object-cover"
              >
              <div
                v-else
                class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300"
              >
                <ShoppingBagIcon class="h-6 w-6" />
              </div>
              <div
                class="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm"
              >
                {{ index + 1 }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold text-gray-900 truncate">
                {{ product.name }}
              </div>
              <div class="text-xs text-gray-400">
                {{ product.quantity }} satış
              </div>
            </div>
            <div class="text-sm font-black text-gray-900">
              ₺{{ product.revenue.toLocaleString('tr-TR') }}
            </div>
          </div>
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center text-center py-12"
        >
          <ShoppingBagIcon class="h-12 w-12 text-gray-200 mb-4" />
          <p class="text-gray-400 text-sm font-medium">
            Henüz satış verisi yok.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  BanknotesIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ShoppingBagIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

const { resolveImageUrl } = useAppImage()

const periods = [
  { id: '7d', label: '7 Gün' },
  { id: '30d', label: '30 Gün' },
  { id: '90d', label: '90 Gün' }
]

const selectedPeriod = ref('30d')
const stats = ref({
  totalRevenue: 0,
  totalSalesCount: 0,
  uniqueOrders: 0,
  averageOrderValue: 0
})
const topProducts = ref([])
const chartData = ref([])
const distributionData = ref([])
const returnStats = ref([])
const loadingTopProducts = ref(true)

const quickStats = computed(() => [
  { label: 'Toplam Gelir', value: stats.value.totalRevenue, prefix: '₺', suffix: '', icon: BanknotesIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Sipariş Sayısı', value: stats.value.uniqueOrders, prefix: '', suffix: '', icon: ShoppingCartIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Satılan Ürün', value: stats.value.totalSalesCount, prefix: '', suffix: '', icon: ShoppingBagIcon, color: 'text-pink-600', bg: 'bg-pink-50' },
  { label: 'Ort. Sepet', value: stats.value.averageOrderValue, prefix: '₺', suffix: '', icon: ChartBarIcon, color: 'text-orange-600', bg: 'bg-orange-50' }
])

const chartSeries = computed(() => [{
  name: 'Günlük Gelir',
  data: chartData.value.map(d => d.amount)
}])

const donutSeries = computed(() => distributionData.value.map(d => d.value))

const donutOptions = computed(() => ({
  labels: distributionData.value.map(d => d.name),
  legend: { position: 'bottom', fontFamily: 'Inter' },
  colors: ['#2563eb', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
  stroke: { show: false },
  dataLabels: { enabled: true, formatter: (val) => '%' + Math.round(val) }
}))

const chartOptions = computed(() => ({
  chart: {
    fontFamily: 'Inter, sans-serif',
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  colors: ['#2563eb'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100]
    }
  },
  xaxis: {
    categories: chartData.value.map(d => d.date),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: '#94a3b8', fontWeight: 600 }
    }
  },
  yaxis: {
    labels: {
      formatter: (val) => '₺' + val.toLocaleString('tr-TR'),
      style: { colors: '#94a3b8', fontWeight: 600 }
    }
  },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4
  },
  tooltip: {
    theme: 'light',
    y: {
      formatter: (val) => '₺' + val.toLocaleString('tr-TR')
    }
  }
}))

const formatStatus = (status) => {
  const maps = {
    'Cancelled': 'İptal Edilen',
    'Returned': 'İade Edilen',
    'Failed': 'Başarısız'
  }
  return maps[status] || status
}

const getStatusBg = (status) => {
  if (status === 'Cancelled') return 'bg-red-500'
  return 'bg-amber-500'
}

const fetchData = async () => {
  try {
    const { $api } = useApi()

    // Stats
    const statsRes = await $api('/api/vendors/sales/stats')
    stats.value = statsRes.data

    // Top Products
    loadingTopProducts.value = true
    const topRes = await $api('/api/vendors/sales/top-products')
    topProducts.value = topRes.data
    loadingTopProducts.value = false

    // Chart
    const chartRes = await $api('/api/vendors/sales/chart')
    chartData.value = chartRes.data

    // Distribution
    const distRes = await $api('/api/vendors/sales/distribution')
    distributionData.value = distRes.data

    // Returns
    const retRes = await $api('/api/vendors/sales/returns')
    // Filter only problematic ones for this specific UI section
    returnStats.value = retRes.data.filter(s => ['Cancelled', 'Returned', 'Failed'].includes(s.status))

  } catch (error) {
    console.error('Fetch analytics error:', error)
  }
}

onMounted(async () => {
  console.log('📊 Analytics page mounted')
  await fetchData()
})

watch(selectedPeriod, () => {
  fetchData()
})
</script>
